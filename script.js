// 1. Find the page elements and define the small amount of app state.
const byId = (id) => document.getElementById(id);
const searchForm = byId("search-form");
const cveInput = byId("cve-input");
const searchButton = byId("search-button");
const saveButton = byId("save-button");
const statusMessage = byId("status");
const watchlistMessage = byId("watchlist-message");
const cvePattern = /^CVE-\d{4}-\d{4,19}$/;
let currentCve = null;
let watchlist = [];
let loading = false;
let kevCache = null;
let kevFetchedAt = 0;

// 2. Restore only valid CVE IDs. Old watchlists still work after this redesign.
try {
  const saved = JSON.parse(localStorage.getItem("cyberwatch-watchlist") || "[]");
  if (Array.isArray(saved)) {
    watchlist = [...new Set(saved.filter((id) => typeof id === "string" && cvePattern.test(id)))];
  }
} catch (error) {
  watchlistMessage.textContent = "Saved items could not be read. New items will appear here.";
}

function setStatus(message, state = "ready") {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
}

function syncSaveButton() {
  saveButton.disabled = loading || !currentCve || watchlist.includes(currentCve);
  saveButton.textContent = currentCve && watchlist.includes(currentCve) ? "✓ Saved to watchlist" : "☆ Save to watchlist";
}

// Rebuild the watchlist using safe textContent, not HTML from external data.
function renderWatchlist() {
  const list = byId("watchlist");
  list.replaceChildren();
  byId("watchlist-empty").hidden = watchlist.length > 0;
  byId("watchlist-count").textContent = watchlist.length;
  byId("nav-count").textContent = watchlist.length;
  byId("export-button").disabled = watchlist.length === 0;
  for (const id of watchlist) {
    const item = document.createElement("li");
    const icon = document.createElement("span");
    icon.className = "saved-icon";
    icon.textContent = "☆";
    icon.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "saved-id";
    label.textContent = id;
    const actions = document.createElement("div");
    actions.className = "saved-actions";
    const recheck = document.createElement("button");
    recheck.type = "button";
    recheck.className = "secondary";
    recheck.textContent = "Recheck ↗";
    recheck.setAttribute("aria-label", "Recheck " + id);
    recheck.disabled = loading;
    recheck.addEventListener("click", () => {
      cveInput.value = id;
      searchForm.requestSubmit();
      byId("search-heading").scrollIntoView({ block: "start" });
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Remove";
    remove.setAttribute("aria-label", "Remove " + id);
    remove.addEventListener("click", () => {
      watchlist = watchlist.filter((savedId) => savedId !== id);
      updateWatchlist();
      byId("watchlist-heading").setAttribute("tabindex", "-1");
      byId("watchlist-heading").focus();
    });
    actions.append(recheck, remove);
    item.append(icon, label, actions);
    list.append(item);
  }
  syncSaveButton();
}

function updateWatchlist() {
  byId("export-preview").hidden = true;
  try {
    localStorage.setItem("cyberwatch-watchlist", JSON.stringify(watchlist));
    watchlistMessage.textContent = "Watchlist saved in this browser.";
  } catch (error) {
    watchlistMessage.textContent = "Browser storage is unavailable. Changes will last until refresh only.";
  }
  renderWatchlist();
}

saveButton.addEventListener("click", () => {
  if (currentCve && !watchlist.includes(currentCve)) {
    watchlist.push(currentCve);
    updateWatchlist();
  }
});

// 3. Extra feature: export the IDs, without pretending saved scores stay current.
byId("export-button").addEventListener("click", () => {
  const csv = "CVE ID\r\n" + watchlist.join("\r\n") + "\r\n";
  byId("csv-content").value = csv;
  byId("csv-download").href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  byId("export-preview").hidden = false;
  byId("export-preview").open = true;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "cyberwatch-watchlist.csv";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  watchlistMessage.textContent = "CSV ready. Download or copy your saved IDs below.";
});

// 4. A reusable request function handles HTTP errors and limits waiting to 15 seconds.
async function fetchJSON(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error("HTTP " + response.status);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function getEPSS(cve) {
  const result = await fetchJSON("https://api.first.org/data/v1/epss?cve=" + encodeURIComponent(cve));
  if (!Array.isArray(result.data)) throw new Error("Unexpected EPSS response");
  if (result.data.length === 0) return null;
  const record = result.data[0];
  const score = Number(record.epss);
  const percentile = Number(record.percentile);
  if (record.cve !== cve || !Number.isFinite(score) || score < 0 || score > 1 || !Number.isFinite(percentile) || percentile < 0 || percentile > 1 || typeof record.date !== "string") {
    throw new Error("Invalid EPSS record");
  }
  return { score, percentile, date: record.date };
}

// Cache only in memory for five minutes, so rechecks avoid repeated large downloads.
async function getKEV() {
  if (kevCache && Date.now() - kevFetchedAt < 300000) return kevCache;
  const result = await fetchJSON("https://raw.githubusercontent.com/cisagov/kev-data/main/known_exploited_vulnerabilities.json");
  if (!Array.isArray(result.vulnerabilities)) throw new Error("Unexpected CISA response");
  kevCache = result;
  kevFetchedAt = Date.now();
  return result;
}

// 5. Our independent decision feature. Unknown data is never treated as a low score.
function choosePriority(score, knownExploited, kevAvailable) {
  if (knownExploited) return { level: "high", title: "High review priority", reason: "CISA lists this vulnerability as known to be exploited. Review affected systems and CISA’s required action." };
  if (score !== null && score >= 0.1) return { level: "high", title: "High review priority", reason: "The EPSS estimate meets our 10% review threshold. Check whether your software is affected and review vendor guidance." };
  if (score === null) return { level: "unknown", title: "Insufficient data", reason: "No usable EPSS score is available and known exploitation has not been confirmed here. Missing data does not mean low risk." };
  if (!kevAvailable) return { level: "unknown", title: "Incomplete assessment", reason: "EPSS is available, but CISA could not be checked. A lower priority cannot be assigned without both sources." };
  if (score >= 0.01) return { level: "medium", title: "Medium review priority", reason: "Not listed in the retrieved KEV catalog, with EPSS between 1% and 10%. Review affected software in your normal triage process." };
  return { level: "lower", title: "Lower review priority", reason: "Not listed in the retrieved KEV catalog, with EPSS below 1%. Keep it under review; lower probability does not establish safety." };
}

function formatPercent(value) {
  const rounded = (value * 100).toFixed(3);
  if (value > 0 && rounded === "0.000") return "<0.001%";
  if (value < 1 && rounded === "100.000") return "<100%";
  return rounded + "%";
}

// 6. Fill real values into the cards. The radar is decorative; the ring uses the score.
function displayResult(cve, epss, catalog, kevAvailable) {
  const match = catalog ? catalog.vulnerabilities.find((item) => item.cveID === cve) : null;
  const priority = choosePriority(epss ? epss.score : null, Boolean(match), kevAvailable);
  byId("result-cve").textContent = cve;
  byId("result-name").textContent = match ? match.vulnerabilityName : "Public vulnerability intelligence · FIRST EPSS + CISA KEV";
  byId("result-probability").textContent = epss ? formatPercent(epss.score) : "Unavailable";
  byId("result-date").textContent = epss ? epss.date : "Unavailable";
  byId("result-percentile").textContent = epss ? formatPercent(epss.percentile) : "Unavailable";
  byId("score-ring").style.setProperty("--score", epss ? epss.score * 100 + "%" : "0%");
  byId("percentile-fill").style.width = "0%";
  byId("result-kev").textContent = !kevAvailable ? "Unavailable" : match ? "Known exploited" : "Not listed";
  byId("kev-explanation").textContent = !kevAvailable ? "CISA could not be checked. Try again." : match ? "Listed in CISA’s Known Exploited Vulnerabilities catalog." : "No match in the retrieved catalog. This does not mean safe.";
  byId("catalog-date").textContent = catalog ? "Catalog: " + (catalog.dateReleased ? catalog.dateReleased.split("T")[0] : "date unavailable") : "Source unavailable";
  byId("result-priority").textContent = priority.title;
  byId("priority-reason").textContent = priority.reason;
  byId("priority-panel").dataset.level = priority.level;
  byId("kev-details").hidden = !match;
  if (match) {
    byId("kev-description").textContent = match.shortDescription || "No description provided.";
    byId("kev-product").textContent = match.vendorProject + " / " + match.product;
    byId("kev-added").textContent = match.dateAdded || "Not provided";
    byId("kev-action").textContent = match.requiredAction || "Review CISA and vendor guidance.";
  }
  byId("results").hidden = false;
  byId("empty-state").hidden = true;
  requestAnimationFrame(() => {
    byId("percentile-fill").style.width = epss ? epss.percentile * 100 + "%" : "0%";
  });
  currentCve = epss || match ? cve : null;
}

// Example chips use the same form and validation as a typed search.
for (const button of document.querySelectorAll("[data-cve]")) {
  button.addEventListener("click", () => {
    if (loading) return;
    cveInput.value = button.dataset.cve;
    searchForm.requestSubmit();
  });
}

// 7. Main flow: validate, request both sources, display, and always reset loading.
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (loading) return;
  const cve = cveInput.value.trim().toUpperCase();
  cveInput.value = cve;
  currentCve = null;
  byId("results").hidden = true;
  byId("empty-state").hidden = false;
  syncSaveButton();
  if (!cvePattern.test(cve)) {
    cveInput.setAttribute("aria-invalid", "true");
    setStatus("Enter a CVE ID like CVE-2021-44228.", "error");
    cveInput.focus();
    return;
  }
  cveInput.removeAttribute("aria-invalid");
  loading = true;
  searchButton.disabled = true;
  searchButton.textContent = "Analyzing…";
  searchForm.closest("section").setAttribute("aria-busy", "true");
  for (const button of document.querySelectorAll("[data-cve]")) button.disabled = true;
  renderWatchlist();
  setStatus("Retrieving FIRST EPSS and checking CISA KEV…", "loading");
  try {
    // allSettled lets one source still work when the other source fails.
    const [epssResult, kevResult] = await Promise.allSettled([getEPSS(cve), getKEV()]);
    if (epssResult.status === "rejected" && kevResult.status === "rejected") {
      throw new Error("Both sources unavailable");
    }
    const epss = epssResult.status === "fulfilled" ? epssResult.value : null;
    const catalog = kevResult.status === "fulfilled" ? kevResult.value : null;
    displayResult(cve, epss, catalog, kevResult.status === "fulfilled");
    if (epssResult.status === "rejected" || kevResult.status === "rejected") {
      setStatus("Partial results: one source could not load. Unavailable data is marked; try again to complete the lookup.", "warning");
    } else if (!epss) {
      setStatus("No EPSS record found for this ID. CISA catalog results are shown below; the ID may lack coverage or may not exist.", "warning");
    } else {
      setStatus("Lookup complete for " + cve + ". Both sources checked.", "success");
    }
  } catch (error) {
    setStatus("Sources could not be reached. Check your connection and try again. Requests time out after 15 seconds.", "error");
  } finally {
    loading = false;
    searchButton.disabled = false;
    searchButton.textContent = "Analyze CVE ↗";
    searchForm.closest("section").setAttribute("aria-busy", "false");
    for (const button of document.querySelectorAll("[data-cve]")) button.disabled = false;
    renderWatchlist();
  }
});
renderWatchlist();

// Open the on-page guide before its navigation link scrolls into view.
for (const link of document.querySelectorAll('a[href="#usage"], a[href="#method"]')) {
  link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    target.open = true;
  });
}

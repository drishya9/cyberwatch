# CyberWatch code guide

Read this alongside the three application files. Line numbers match the packaged version. Blank lines only separate sections for readability.

## Start with this connection
HTML gives elements IDs and classes. JavaScript finds IDs and changes content or state. CSS selects classes, tags, and state attributes to control appearance. Neither CSS nor the decorative radar fetches vulnerability data.

The search form triggers a submit event. JavaScript cleans and validates input, calls fetchJSON, reads each response with response.json(), combines evidence, and fills result fields. localStorage saves the watchlist between visits to the same browser origin.

## New JavaScript notation
- `const`: a variable that cannot be reassigned. An array stored in const can still be changed.
- `let`: a variable that can be reassigned.
- `(id) => ...`: an arrow function; another way to write a function.
- `null`: deliberately no value yet. It differs from a genuine numeric score of zero.
- `===` / `!==`: strict equality / inequality checks.
- `&&` / `||` / `!`: AND / OR / NOT.
- `condition ? first : second`: choose first when true and second when false.
- `[...new Set(items)]`: remove duplicates with Set, then spread its contents into an array.
- `[first, second] = values`: give names to two array entries (destructuring).
- `async` / `await`: let the function wait for an asynchronous operation without freezing the page.
- `try` / `catch` / `finally`: attempt work, handle errors, then clean up whether the work succeeded or failed.
- `Promise.allSettled`: wait for each request and retain each success/failure separately.
- `JSON.parse` / `JSON.stringify`: text to JavaScript data / JavaScript data to text.
- `dataset`: reads or changes HTML data-* attributes; CSS can select those states.
- `textContent`: writes plain text instead of interpreting it as HTML.

## JavaScript, every nonblank line

Repeated closing lines end the nearest currently open function, condition, loop, or object. Indentation shows that nesting.

| Line | Code | What it does |
|---|---|---|
| 1 | <code>// 1. Find the page elements and define the small amount of app state.</code> | Comment for the reader; the browser does not execute it. |
| 2 | <code>const byId = (id) =&gt; document.getElementById(id);</code> | Creates a short helper that finds an HTML element by its unique ID. |
| 3 | <code>const searchForm = byId("search-form");</code> | Finds this named HTML element once and remembers the reference. |
| 4 | <code>const cveInput = byId("cve-input");</code> | Finds this named HTML element once and remembers the reference. |
| 5 | <code>const searchButton = byId("search-button");</code> | Finds this named HTML element once and remembers the reference. |
| 6 | <code>const saveButton = byId("save-button");</code> | Finds this named HTML element once and remembers the reference. |
| 7 | <code>const statusMessage = byId("status");</code> | Finds this named HTML element once and remembers the reference. |
| 8 | <code>const watchlistMessage = byId("watchlist-message");</code> | Finds this named HTML element once and remembers the reference. |
| 9 | <code>const cvePattern = /^CVE-\d{4}-\d{4,19}$/;</code> | Defines the CVE format: prefix, four-digit year, and 4–19 sequence digits, with no extra text. |
| 10 | <code>let currentCve = null;</code> | Starts with no successfully retrieved CVE available to save. |
| 11 | <code>let watchlist = [];</code> | Starts an empty array of saved CVE IDs. |
| 12 | <code>let loading = false;</code> | Records whether a search is in progress; initially none is. |
| 13 | <code>let kevCache = null;</code> | Starts with no CISA response cached in memory. |
| 14 | <code>let kevFetchedAt = 0;</code> | Initializes the time of the last successful CISA download. |
| 16 | <code>// 2. Restore only valid CVE IDs. Old watchlists still work after this redesign.</code> | Comment for the reader; the browser does not execute it. |
| 17 | <code>try {</code> | Starts an operation whose errors or cleanup are handled below. |
| 18 | <code>const saved = JSON.parse(localStorage.getItem("cyberwatch-watchlist") &#124;&#124; "[]");</code> | Reads saved JSON text, falls back to an empty JSON array, and parses it. |
| 19 | <code>if (Array.isArray(saved)) {</code> | Checks that the restored value is an array before using array operations. |
| 20 | <code>watchlist = [...new Set(saved.filter((id) =&gt; typeof id === "string" &amp;&amp; cvePattern.test(id)))];</code> | Keeps only valid CVE strings, removes duplicates with Set, and creates an array. |
| 21 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 22 | <code>} catch (error) {</code> | Runs the following recovery block if the preceding try block throws an error. |
| 23 | <code>watchlistMessage.textContent = "Saved items could not be read. New items will appear here.";</code> | Shows this feedback message next to the watchlist. |
| 24 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 26 | <code>function setStatus(message, state = "ready") {</code> | Defines a reusable function. Values in parentheses are its parameters; its body runs when called. |
| 27 | <code>statusMessage.textContent = message;</code> | Displays the feedback text supplied to setStatus. |
| 28 | <code>statusMessage.dataset.state = state;</code> | Sets the data-state attribute so CSS can color error or warning feedback. |
| 29 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 31 | <code>function syncSaveButton() {</code> | Defines a reusable function. Values in parentheses are its parameters; its body runs when called. |
| 32 | <code>saveButton.disabled = loading &#124;&#124; !currentCve &#124;&#124; watchlist.includes(currentCve);</code> | Disables Save while busy, without a current CVE, or when that CVE is already saved. |
| 33 | <code>saveButton.textContent = currentCve &amp;&amp; watchlist.includes(currentCve) ? "✓ Saved to watchlist" : "☆ Save to watchlist";</code> | Shows whether the current CVE is already saved. |
| 34 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 36 | <code>// Rebuild the watchlist using safe textContent, not HTML from external data.</code> | Comment for the reader; the browser does not execute it. |
| 37 | <code>function renderWatchlist() {</code> | Defines a reusable function. Values in parentheses are its parameters; its body runs when called. |
| 38 | <code>const list = byId("watchlist");</code> | Finds this named HTML element once and remembers the reference. |
| 39 | <code>list.replaceChildren();</code> | Clears the previous watchlist display before rebuilding it. |
| 40 | <code>byId("watchlist-empty").hidden = watchlist.length &gt; 0;</code> | Hides the empty-list message whenever saved IDs exist. |
| 41 | <code>byId("watchlist-count").textContent = watchlist.length;</code> | Displays the number of saved IDs in this count badge. |
| 42 | <code>byId("nav-count").textContent = watchlist.length;</code> | Displays the number of saved IDs in this count badge. |
| 43 | <code>byId("export-button").disabled = watchlist.length === 0;</code> | Disables export when the watchlist is empty. |
| 44 | <code>for (const id of watchlist) {</code> | Repeats the following display code for each saved CVE ID. |
| 45 | <code>const item = document.createElement("li");</code> | Creates the named HTML element in memory; append will place it on the page. |
| 46 | <code>const icon = document.createElement("span");</code> | Creates the named HTML element in memory; append will place it on the page. |
| 47 | <code>icon.className = "saved-icon";</code> | Assigns a CSS class so this new element receives the matching styling. |
| 48 | <code>icon.textContent = "☆";</code> | Adds a decorative star next to the saved ID. |
| 49 | <code>icon.setAttribute("aria-hidden", "true");</code> | Keeps a decorative icon out of the accessibility reading order. |
| 50 | <code>const label = document.createElement("span");</code> | Creates the named HTML element in memory; append will place it on the page. |
| 51 | <code>label.className = "saved-id";</code> | Assigns a CSS class so this new element receives the matching styling. |
| 52 | <code>label.textContent = id;</code> | Writes the saved CVE ID as safe plain text. |
| 53 | <code>const actions = document.createElement("div");</code> | Creates the named HTML element in memory; append will place it on the page. |
| 54 | <code>actions.className = "saved-actions";</code> | Assigns a CSS class so this new element receives the matching styling. |
| 55 | <code>const recheck = document.createElement("button");</code> | Creates the named HTML element in memory; append will place it on the page. |
| 56 | <code>recheck.type = "button";</code> | Makes this button a normal action rather than a form-submit button. |
| 57 | <code>recheck.className = "secondary";</code> | Assigns a CSS class so this new element receives the matching styling. |
| 58 | <code>recheck.textContent = "Recheck ↗";</code> | Labels the button that repeats a lookup. |
| 59 | <code>recheck.setAttribute("aria-label", "Recheck " + id);</code> | Gives the button an accessible name that includes the affected CVE ID. |
| 60 | <code>recheck.disabled = loading;</code> | Prevents starting another lookup while one is loading. |
| 61 | <code>recheck.addEventListener("click", () =&gt; {</code> | Registers a function to run when this element receives the named event. |
| 62 | <code>cveInput.value = id;</code> | Copies the saved CVE ID into the existing search box. |
| 63 | <code>searchForm.requestSubmit();</code> | Submits the same form so validation and request logic are reused. |
| 64 | <code>byId("search-heading").scrollIntoView({ block: "start" });</code> | Scrolls the search heading into view for the recheck action. |
| 65 | <code>});</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 66 | <code>const remove = document.createElement("button");</code> | Creates the named HTML element in memory; append will place it on the page. |
| 67 | <code>remove.type = "button";</code> | Makes this button a normal action rather than a form-submit button. |
| 68 | <code>remove.className = "remove-button";</code> | Assigns a CSS class so this new element receives the matching styling. |
| 69 | <code>remove.textContent = "Remove";</code> | Labels the removal button. |
| 70 | <code>remove.setAttribute("aria-label", "Remove " + id);</code> | Gives the button an accessible name that includes the affected CVE ID. |
| 71 | <code>remove.addEventListener("click", () =&gt; {</code> | Registers a function to run when this element receives the named event. |
| 72 | <code>watchlist = watchlist.filter((savedId) =&gt; savedId !== id);</code> | Builds a replacement list containing every ID except the one removed. |
| 73 | <code>updateWatchlist();</code> | Persists the current array, updates feedback, and rebuilds its display. |
| 74 | <code>byId("watchlist-heading").setAttribute("tabindex", "-1");</code> | Makes the watchlist heading programmatically focusable without adding it to the normal Tab order. |
| 75 | <code>byId("watchlist-heading").focus();</code> | Moves keyboard focus to the named element so the user is not left on a removed button. |
| 76 | <code>});</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 77 | <code>actions.append(recheck, remove);</code> | Places the supplied child elements inside this parent, in the supplied order. |
| 78 | <code>item.append(icon, label, actions);</code> | Places the supplied child elements inside this parent, in the supplied order. |
| 79 | <code>list.append(item);</code> | Places the supplied child elements inside this parent, in the supplied order. |
| 80 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 81 | <code>syncSaveButton();</code> | Updates the Save button to match the current loading, result, and watchlist state. |
| 82 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 84 | <code>function updateWatchlist() {</code> | Defines a reusable function. Values in parentheses are its parameters; its body runs when called. |
| 85 | <code>byId("export-preview").hidden = true;</code> | Hides an old export preview after the watchlist changes. |
| 86 | <code>try {</code> | Starts an operation whose errors or cleanup are handled below. |
| 87 | <code>localStorage.setItem("cyberwatch-watchlist", JSON.stringify(watchlist));</code> | Converts the watchlist array to JSON text and saves it under our stable storage key. |
| 88 | <code>watchlistMessage.textContent = "Watchlist saved in this browser.";</code> | Shows this feedback message next to the watchlist. |
| 89 | <code>} catch (error) {</code> | Runs the following recovery block if the preceding try block throws an error. |
| 90 | <code>watchlistMessage.textContent = "Browser storage is unavailable. Changes will last until refresh only.";</code> | Shows this feedback message next to the watchlist. |
| 91 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 92 | <code>renderWatchlist();</code> | Rebuilds saved-ID rows and updates counts and button states. |
| 93 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 95 | <code>saveButton.addEventListener("click", () =&gt; {</code> | Registers a function to run when this element receives the named event. |
| 96 | <code>if (currentCve &amp;&amp; !watchlist.includes(currentCve)) {</code> | Requires a current result and prevents adding an ID already present. |
| 97 | <code>watchlist.push(currentCve);</code> | Adds the current CVE ID to the end of the saved array. |
| 98 | <code>updateWatchlist();</code> | Persists the current array, updates feedback, and rebuilds its display. |
| 99 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 100 | <code>});</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 102 | <code>// 3. Extra feature: export the IDs, without pretending saved scores stay current.</code> | Comment for the reader; the browser does not execute it. |
| 103 | <code>byId("export-button").addEventListener("click", () =&gt; {</code> | Registers a function to run when this element receives the named event. |
| 104 | <code>const csv = "CVE ID\r\n" + watchlist.join("\r\n") + "\r\n";</code> | Builds CSV text: a header, then one saved ID per row with carriage-return/newline separators. |
| 105 | <code>byId("csv-content").value = csv;</code> | Places the generated CSV into the read-only preview field. |
| 106 | <code>byId("csv-download").href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);</code> | Encodes the CSV into a data URL for the visible download link. |
| 107 | <code>byId("export-preview").hidden = false;</code> | Reveals and expands the CSV preview so copying remains available. |
| 108 | <code>byId("export-preview").open = true;</code> | Reveals and expands the CSV preview so copying remains available. |
| 109 | <code>const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));</code> | Creates a temporary browser URL for a Blob containing the CSV text. |
| 110 | <code>const link = document.createElement("a");</code> | Creates the named HTML element in memory; append will place it on the page. |
| 111 | <code>link.href = url;</code> | Points the temporary download link at the CSV Blob. |
| 112 | <code>link.download = "cyberwatch-watchlist.csv";</code> | Suggests the filename the browser should use for the download. |
| 113 | <code>document.body.append(link);</code> | Places the supplied child elements inside this parent, in the supplied order. |
| 114 | <code>link.click();</code> | Starts the browser download through the temporary link. |
| 115 | <code>link.remove();</code> | Removes the temporary link after the download is triggered. |
| 116 | <code>setTimeout(() =&gt; URL.revokeObjectURL(url), 1000);</code> | Releases the temporary Blob URL after a brief delay. |
| 117 | <code>watchlistMessage.textContent = "CSV ready. Download or copy your saved IDs below.";</code> | Shows this feedback message next to the watchlist. |
| 118 | <code>});</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 120 | <code>// 4. A reusable request function handles HTTP errors and limits waiting to 15 seconds.</code> | Comment for the reader; the browser does not execute it. |
| 121 | <code>async function fetchJSON(url) {</code> | Defines an asynchronous function so its body can await requests. |
| 122 | <code>const controller = new AbortController();</code> | Creates a controller that can cancel a slow request. |
| 123 | <code>const timeout = setTimeout(() =&gt; controller.abort(), 15000);</code> | Schedules request cancellation after 15,000 milliseconds (15 seconds). |
| 124 | <code>try {</code> | Starts an operation whose errors or cleanup are handled below. |
| 125 | <code>const response = await fetch(url, { signal: controller.signal });</code> | Sends the web request and waits for the response, with cancellation attached. |
| 126 | <code>if (!response.ok) throw new Error("HTTP " + response.status);</code> | Throws on unsuccessful HTTP status codes; fetch alone does not throw for these. |
| 127 | <code>return await response.json();</code> | Parses and returns the response JSON, keeping the timeout active during body reading. |
| 128 | <code>} finally {</code> | Starts cleanup that runs after either success or failure. |
| 129 | <code>clearTimeout(timeout);</code> | Cancels the pending timeout because the request has finished or failed. |
| 130 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 131 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 133 | <code>async function getEPSS(cve) {</code> | Defines an asynchronous function so its body can await requests. |
| 134 | <code>const result = await fetchJSON("https://api.first.org/data/v1/epss?cve=" + encodeURIComponent(cve));</code> | Requests and parses JSON from this source; the CVE query value is URL-encoded where supplied. |
| 135 | <code>if (!Array.isArray(result.data)) throw new Error("Unexpected EPSS response");</code> | Rejects an unexpected EPSS response shape. |
| 136 | <code>if (result.data.length === 0) return null;</code> | Returns null for a valid response with no EPSS record; this differs from a score of zero. |
| 137 | <code>const record = result.data[0];</code> | Selects the first returned EPSS record; array indexes start at zero. |
| 138 | <code>const score = Number(record.epss);</code> | Converts the returned EPSS score from text to a number. |
| 139 | <code>const percentile = Number(record.percentile);</code> | Converts the returned percentile into a number. |
| 140 | <code>if (record.cve !== cve &#124;&#124; !Number.isFinite(score) &#124;&#124; score &lt; 0 &#124;&#124; score &gt; 1 &#124;&#124; !Number.isFinite(percentile) &#124;&#124; percentile &lt; 0 &#124;&#124; percentile &gt; 1 &#124;&#124; typeof record.date !== "string") {</code> | Validates the returned CVE, finite scores within 0–1, and the score date before display. |
| 141 | <code>throw new Error("Invalid EPSS record");</code> | Raises an error instead of continuing with a failed or invalid response. |
| 142 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 143 | <code>return { score, percentile, date: record.date };</code> | Returns a small object with just the EPSS values the app needs. |
| 144 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 146 | <code>// Cache only in memory for five minutes, so rechecks avoid repeated large downloads.</code> | Comment for the reader; the browser does not execute it. |
| 147 | <code>async function getKEV() {</code> | Defines an asynchronous function so its body can await requests. |
| 148 | <code>if (kevCache &amp;&amp; Date.now() - kevFetchedAt &lt; 300000) return kevCache;</code> | Reuses cached CISA data only while it is less than five minutes old. |
| 149 | <code>const result = await fetchJSON("https://raw.githubusercontent.com/cisagov/kev-data/main/known_exploited_vulnerabilities.json");</code> | Requests and parses JSON from this source; the CVE query value is URL-encoded where supplied. |
| 150 | <code>if (!Array.isArray(result.vulnerabilities)) throw new Error("Unexpected CISA response");</code> | Raises an error instead of continuing with a failed or invalid response. |
| 151 | <code>kevCache = result;</code> | Remembers this successful catalog response in memory. |
| 152 | <code>kevFetchedAt = Date.now();</code> | Records when the catalog was downloaded, in milliseconds. |
| 153 | <code>return result;</code> | Returns the validated catalog to the caller. |
| 154 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 156 | <code>// 5. Our independent decision feature. Unknown data is never treated as a low score.</code> | Comment for the reader; the browser does not execute it. |
| 157 | <code>function choosePriority(score, knownExploited, kevAvailable) {</code> | Defines a reusable function. Values in parentheses are its parameters; its body runs when called. |
| 158 | <code>if (knownExploited) return { level: "high", title: "High review priority", reason: "CISA lists this vulnerability as known to be exploited. Review affected systems and CISA’s required action." };</code> | CISA-confirmed exploitation takes High priority regardless of EPSS. |
| 159 | <code>if (score !== null &amp;&amp; score &gt;= 0.1) return { level: "high", title: "High review priority", reason: "The EPSS estimate meets our 10% review threshold. Check whether your software is affected and review vendor guidance." };</code> | An available score at least 10% also takes High priority. |
| 160 | <code>if (score === null) return { level: "unknown", title: "Insufficient data", reason: "No usable EPSS score is available and known exploitation has not been confirmed here. Missing data does not mean low risk." };</code> | Missing EPSS without confirmed exploitation produces Insufficient data. |
| 161 | <code>if (!kevAvailable) return { level: "unknown", title: "Incomplete assessment", reason: "EPSS is available, but CISA could not be checked. A lower priority cannot be assigned without both sources." };</code> | A lower EPSS estimate with unavailable CISA produces Incomplete assessment, not Lower. |
| 162 | <code>if (score &gt;= 0.01) return { level: "medium", title: "Medium review priority", reason: "Not listed in the retrieved KEV catalog, with EPSS between 1% and 10%. Review affected software in your normal triage process." };</code> | With CISA checked, a score at least 1% but below 10% produces Medium. |
| 163 | <code>return { level: "lower", title: "Lower review priority", reason: "Not listed in the retrieved KEV catalog, with EPSS below 1%. Keep it under review; lower probability does not establish safety." };</code> | With both sources checked and neither higher threshold matched, returns Lower review priority. |
| 164 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 166 | <code>function formatPercent(value) {</code> | Defines a reusable function. Values in parentheses are its parameters; its body runs when called. |
| 167 | <code>const rounded = (value * 100).toFixed(3);</code> | Converts a 0–1 fraction to percentage text rounded to three decimal places. |
| 168 | <code>if (value &gt; 0 &amp;&amp; rounded === "0.000") return "&lt;0.001%";</code> | Avoids displaying a tiny positive probability as exactly zero. |
| 169 | <code>if (value &lt; 1 &amp;&amp; rounded === "100.000") return "&lt;100%";</code> | Avoids displaying a sub-100% probability as exactly 100%. |
| 170 | <code>return rounded + "%";</code> | Adds the percent sign to the formatted number. |
| 171 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 173 | <code>// 6. Fill real values into the cards. The radar is decorative; the ring uses the score.</code> | Comment for the reader; the browser does not execute it. |
| 174 | <code>function displayResult(cve, epss, catalog, kevAvailable) {</code> | Defines a reusable function. Values in parentheses are its parameters; its body runs when called. |
| 175 | <code>const match = catalog ? catalog.vulnerabilities.find((item) =&gt; item.cveID === cve) : null;</code> | Finds the matching CVE in CISA’s array, or uses null when no catalog is available. |
| 176 | <code>const priority = choosePriority(epss ? epss.score : null, Boolean(match), kevAvailable);</code> | Combines score, CISA membership, and source availability into a decision object. |
| 177 | <code>byId("result-cve").textContent = cve;</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 178 | <code>byId("result-name").textContent = match ? match.vulnerabilityName : "Public vulnerability intelligence · FIRST EPSS + CISA KEV";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 179 | <code>byId("result-probability").textContent = epss ? formatPercent(epss.score) : "Unavailable";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 180 | <code>byId("result-date").textContent = epss ? epss.date : "Unavailable";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 181 | <code>byId("result-percentile").textContent = epss ? formatPercent(epss.percentile) : "Unavailable";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 182 | <code>byId("score-ring").style.setProperty("--score", epss ? epss.score * 100 + "%" : "0%");</code> | Sets the score percentage custom property that drives the CSS probability ring. |
| 183 | <code>byId("percentile-fill").style.width = "0%";</code> | Resets the percentile bar before animating the new value. |
| 184 | <code>byId("result-kev").textContent = !kevAvailable ? "Unavailable" : match ? "Known exploited" : "Not listed";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 185 | <code>byId("kev-explanation").textContent = !kevAvailable ? "CISA could not be checked. Try again." : match ? "Listed in CISA’s Known Exploited Vulnerabilities catalog." : "No match in the retrieved catalog. This does not mean safe.";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 186 | <code>byId("catalog-date").textContent = catalog ? "Catalog: " + (catalog.dateReleased ? catalog.dateReleased.split("T")[0] : "date unavailable") : "Source unavailable";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 187 | <code>byId("result-priority").textContent = priority.title;</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 188 | <code>byId("priority-reason").textContent = priority.reason;</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 189 | <code>byId("priority-panel").dataset.level = priority.level;</code> | Sets the recommendation state so CSS chooses its border and accent colors. |
| 190 | <code>byId("kev-details").hidden = !match;</code> | Shows CISA details only when the catalog contains a matching CVE. |
| 191 | <code>if (match) {</code> | Fills CISA context fields only when a matching record exists. |
| 192 | <code>byId("kev-description").textContent = match.shortDescription &#124;&#124; "No description provided.";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 193 | <code>byId("kev-product").textContent = match.vendorProject + " / " + match.product;</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 194 | <code>byId("kev-added").textContent = match.dateAdded &#124;&#124; "Not provided";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 195 | <code>byId("kev-action").textContent = match.requiredAction &#124;&#124; "Review CISA and vendor guidance.";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 196 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 197 | <code>byId("results").hidden = false;</code> | Reveals completed results or hides them before a new search, according to this Boolean. |
| 198 | <code>byId("empty-state").hidden = true;</code> | Shows or hides the no-selection placeholder according to this Boolean. |
| 199 | <code>requestAnimationFrame(() =&gt; {</code> | Schedules the bar update for a browser rendering frame. |
| 200 | <code>byId("percentile-fill").style.width = epss ? epss.percentile * 100 + "%" : "0%";</code> | Sets bar width to the actual percentile times 100; CSS transitions the visual change. |
| 201 | <code>});</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 202 | <code>currentCve = epss &#124;&#124; match ? cve : null;</code> | Allows saving only if at least one source supplied a matching record. |
| 203 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 205 | <code>// Example chips use the same form and validation as a typed search.</code> | Comment for the reader; the browser does not execute it. |
| 206 | <code>for (const button of document.querySelectorAll("[data-cve]")) {</code> | Selects example buttons; this loop registers clicks or updates their disabled state. |
| 207 | <code>button.addEventListener("click", () =&gt; {</code> | Registers a function to run when this element receives the named event. |
| 208 | <code>if (loading) return;</code> | Ignores another request while a lookup is already running. |
| 209 | <code>cveInput.value = button.dataset.cve;</code> | Copies the example button’s data-cve value into the input. |
| 210 | <code>searchForm.requestSubmit();</code> | Submits the same form so validation and request logic are reused. |
| 211 | <code>});</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 212 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 214 | <code>// 7. Main flow: validate, request both sources, display, and always reset loading.</code> | Comment for the reader; the browser does not execute it. |
| 215 | <code>searchForm.addEventListener("submit", async (event) =&gt; {</code> | Registers a function to run when this element receives the named event. |
| 216 | <code>event.preventDefault();</code> | Stops normal form navigation so JavaScript can manage the search. |
| 217 | <code>if (loading) return;</code> | Ignores another request while a lookup is already running. |
| 218 | <code>const cve = cveInput.value.trim().toUpperCase();</code> | Reads the text, removes surrounding spaces, and normalizes letters to uppercase. |
| 219 | <code>cveInput.value = cve;</code> | Shows the cleaned identifier back in the input. |
| 220 | <code>currentCve = null;</code> | Clears the previous successful selection before a new search. |
| 221 | <code>byId("results").hidden = true;</code> | Reveals completed results or hides them before a new search, according to this Boolean. |
| 222 | <code>byId("empty-state").hidden = false;</code> | Shows or hides the no-selection placeholder according to this Boolean. |
| 223 | <code>syncSaveButton();</code> | Updates the Save button to match the current loading, result, and watchlist state. |
| 224 | <code>if (!cvePattern.test(cve)) {</code> | Checks for invalid CVE syntax before making any API request. |
| 225 | <code>cveInput.setAttribute("aria-invalid", "true");</code> | Marks the input as invalid for assistive technology. |
| 226 | <code>setStatus("Enter a CVE ID like CVE-2021-44228.", "error");</code> | Displays this feedback and sets its state for styling and live announcements. |
| 227 | <code>cveInput.focus();</code> | Moves keyboard focus to the named element so the user is not left on a removed button. |
| 228 | <code>return;</code> | Stops the current function here so later code does not execute. |
| 229 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 230 | <code>cveInput.removeAttribute("aria-invalid");</code> | Clears the invalid state once the input passes validation. |
| 231 | <code>loading = true;</code> | Records whether the current request is now starting or ending. |
| 232 | <code>searchButton.disabled = true;</code> | Disables Search during retrieval and restores it during cleanup. |
| 233 | <code>searchButton.textContent = "Analyzing…";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 234 | <code>searchForm.closest("section").setAttribute("aria-busy", "true");</code> | Marks the search panel busy/ready for assistive technology and the loading visual. |
| 235 | <code>for (const button of document.querySelectorAll("[data-cve]")) button.disabled = true;</code> | Selects example buttons; this loop registers clicks or updates their disabled state. |
| 236 | <code>renderWatchlist();</code> | Rebuilds saved-ID rows and updates counts and button states. |
| 237 | <code>setStatus("Retrieving FIRST EPSS and checking CISA KEV…", "loading");</code> | Displays this feedback and sets its state for styling and live announcements. |
| 238 | <code>try {</code> | Starts an operation whose errors or cleanup are handled below. |
| 239 | <code>// allSettled lets one source still work when the other source fails.</code> | Comment for the reader; the browser does not execute it. |
| 240 | <code>const [epssResult, kevResult] = await Promise.allSettled([getEPSS(cve), getKEV()]);</code> | Starts both requests together and waits for separate success/failure outcomes. |
| 241 | <code>if (epssResult.status === "rejected" &amp;&amp; kevResult.status === "rejected") {</code> | Treats both failed sources as a total lookup failure. |
| 242 | <code>throw new Error("Both sources unavailable");</code> | Raises an error instead of continuing with a failed or invalid response. |
| 243 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 244 | <code>const epss = epssResult.status === "fulfilled" ? epssResult.value : null;</code> | Uses EPSS data only on success; otherwise passes null as unavailable. |
| 245 | <code>const catalog = kevResult.status === "fulfilled" ? kevResult.value : null;</code> | Uses the CISA catalog only on success; otherwise passes null. |
| 246 | <code>displayResult(cve, epss, catalog, kevResult.status === "fulfilled");</code> | Fills the result cards from the two source outcomes. |
| 247 | <code>if (epssResult.status === "rejected" &#124;&#124; kevResult.status === "rejected") {</code> | Detects a partial failure where one source still worked. |
| 248 | <code>setStatus("Partial results: one source could not load. Unavailable data is marked; try again to complete the lookup.", "warning");</code> | Displays this feedback and sets its state for styling and live announcements. |
| 249 | <code>} else if (!epss) {</code> | Handles a successful EPSS response that contains no matching record. |
| 250 | <code>setStatus("No EPSS record found for this ID. CISA catalog results are shown below; the ID may lack coverage or may not exist.", "warning");</code> | Displays this feedback and sets its state for styling and live announcements. |
| 251 | <code>} else {</code> | Runs the alternate branch when the preceding condition did not match. |
| 252 | <code>setStatus("Lookup complete for " + cve + ". Both sources checked.", "success");</code> | Displays this feedback and sets its state for styling and live announcements. |
| 253 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 254 | <code>} catch (error) {</code> | Runs the following recovery block if the preceding try block throws an error. |
| 255 | <code>setStatus("Sources could not be reached. Check your connection and try again. Requests time out after 15 seconds.", "error");</code> | Displays this feedback and sets its state for styling and live announcements. |
| 256 | <code>} finally {</code> | Starts cleanup that runs after either success or failure. |
| 257 | <code>loading = false;</code> | Records whether the current request is now starting or ending. |
| 258 | <code>searchButton.disabled = false;</code> | Disables Search during retrieval and restores it during cleanup. |
| 259 | <code>searchButton.textContent = "Analyze CVE ↗";</code> | Fills the named HTML element with the selected real value or its explicit unavailable/default label. |
| 260 | <code>searchForm.closest("section").setAttribute("aria-busy", "false");</code> | Marks the search panel busy/ready for assistive technology and the loading visual. |
| 261 | <code>for (const button of document.querySelectorAll("[data-cve]")) button.disabled = false;</code> | Selects example buttons; this loop registers clicks or updates their disabled state. |
| 262 | <code>renderWatchlist();</code> | Rebuilds saved-ID rows and updates counts and button states. |
| 263 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 264 | <code>});</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 265 | <code>renderWatchlist();</code> | Rebuilds saved-ID rows and updates counts and button states. |
| 267 | <code>// Open the on-page guide before its navigation link scrolls into view.</code> | Comment for the reader; the browser does not execute it. |
| 268 | <code>for (const link of document.querySelectorAll('a[href="#usage"], a[href="#method"]')) {</code> | Finds links to the guide and rule explanation so their panels open when followed. |
| 269 | <code>link.addEventListener("click", () =&gt; {</code> | Registers a function to run when this element receives the named event. |
| 270 | <code>const target = document.querySelector(link.getAttribute("href"));</code> | Reads the clicked anchor target and finds its matching details panel. |
| 271 | <code>target.open = true;</code> | Expands the native details panel before the browser scrolls to its anchor. |
| 272 | <code>});</code> | Closes the current block; `);` also finishes the surrounding function call when present. |
| 273 | <code>}</code> | Closes the current block; `);` also finishes the surrounding function call when present. |

## HTML reference

Every closing tag ends its matching open element. Indentation shows which elements are inside others. The visible words between tags are page content, not JavaScript commands.

| Element / attribute | Role in this project |
|---|---|
| `<!DOCTYPE html>` | Selects modern HTML rendering. |
| `html lang="en"` | Starts the document and declares English. |
| `head` | Holds metadata and resource connections. |
| `meta charset` | Supports Unicode characters. |
| `meta viewport` | Makes the page width follow the device screen. |
| `meta description` | Summarizes the page. |
| `title` | Sets the browser tab title. |
| `link rel="stylesheet"` | Loads style.css. |
| `script src="script.js" defer` | Loads JavaScript and waits for HTML parsing before executing it. |
| `body` | Holds the visible application. |
| `a href` | Links to a section, source, or CSV download. A # target refers to an element ID on this page. |
| `aside`, `nav` | Define the sidebar and its navigation. |
| `main`, `header`, `footer` | Identify the main workspace, top bar, and attribution footer. |
| `section`, `article` | Group related content; articles represent standalone metric/context cards. |
| `h1`, `h2`, `h3` | Provide the heading hierarchy. |
| `p`, `small`, `strong` | Paragraphs, supporting text, and emphasized text. |
| `div`, `span` | Generic layout containers; div is a block and span is inline by default. CSS may change display. |
| `form` | Groups the input and submit action. |
| `label for` | Names the input whose ID matches for. |
| `input type="text"` | Accepts the CVE identifier. required prevents blank submissions. |
| `placeholder`, `autocomplete`, `spellcheck` | Show an example, avoid autocomplete suggestions, and turn off inappropriate spelling correction. |
| `button type="submit"` | Triggers form submission. |
| `button type="button"` | Runs a click action without submitting a form. |
| `disabled` | Prevents interaction until the relevant data or state is ready. |
| `id` | Unique target for JavaScript and section links. |
| `class` | Shared styling name used by CSS. |
| `data-cve` | Stores an example CVE for JavaScript to read. |
| `data-level` | Stores the recommendation category for CSS. |
| `hidden` | Hides unneeded results, source details, or export preview. JavaScript toggles it. |
| `aria-label`, `aria-labelledby` | Supply accessible names directly or through a heading ID. |
| `aria-describedby` | Connects the CVE input to its format hint. |
| `aria-hidden="true"` | Excludes decorative radar/icons from the reading order. |
| `role="status"`, `aria-live="polite"` | Announce updated feedback without interrupting the user. |
| `ul`, dynamically created `li` | Represent the saved-ID list. |
| `dl`, `dt`, `dd` | Pair source detail labels with their values. |
| `details`, `summary` | Create a native expandable explanation or export preview without extra JavaScript. |
| `textarea readonly` | Displays selectable CSV text without letting users edit the exported preview. |
| `download` | Suggests a filename and download action for the CSV link. |

## CSS reading guide

A selector chooses elements; braces contain declarations. Each declaration is `property: value;`. Comma-separated selectors share a rule. A space between selectors means a descendant, `>` means a direct child, and `:hover`, `:disabled`, and `:focus-visible` select interaction states. IDs start with # and classes start with a dot.

| Property or construct | What it controls |
|---|---|
| `:root`, `--name`, `var(--name)` | Define and reuse design values such as colors. JavaScript sets --score for the ring. |
| `color-scheme: dark` | Lets browser-native controls use a dark appearance. |
| `box-sizing: border-box` | Includes borders and padding inside specified sizes. |
| `display: none` with `[hidden]` | Ensures hidden result panels remain hidden. |
| `display: flex` / `grid` | Arranges children in flexible rows or a column grid. |
| `flex-direction`, `flex-wrap`, `flex-shrink` | Control direction, wrapping, and whether children may shrink. |
| `grid-template-columns`, `grid-column` | Define card columns and spans. |
| `gap`, `align-items`, `justify-content`, `place-content` | Space and align children. |
| `width`, `height`, `min-width`, `max-width`, `min-height` | Size components and constrain layout. |
| `margin`, `padding`, their directional variants | Add outside and inside space. |
| `position`, `inset`, `top`, `right`, `bottom`, `left`, `z-index` | Place the sidebar, icons, radar layers, and skip link. |
| `background`, `background-color`, `color` | Set surfaces and text colors. |
| `border`, directional borders, `border-radius` | Define panel edges and rounded corners. |
| `font`, `font-family`, `font-size`, `font-weight` | Set typography; system fonts avoid a remote font dependency. |
| `font-variant-numeric: tabular-nums` | Keeps digits evenly spaced in metrics. |
| `line-height`, `letter-spacing` | Control text spacing. |
| `text-align`, `text-decoration` | Align labels and style links. |
| `white-space`, `overflow-wrap`, `overflow` | Handle wrapping and clip decorative graphics. |
| `cursor`, `pointer-events` | Communicate interaction and let clicks pass through the decorative input icon. |
| `opacity` | Fades disabled controls and animated radar points. |
| `outline`, `outline-offset` | Provide visible keyboard focus. |
| `transform: translateY`, `rotate` | Move buttons/results slightly and rotate the radar sweep. |
| `transition` | Smooth changes in bar width, color, and button position. |
| `animation`, `animation-delay`, `@keyframes` | Define and run sweep, glow, reveal, and loading motion. |
| `conic-gradient` | Creates the decorative radar sweep and the real score’s circular fill. |
| `repeating-radial-gradient`, `linear-gradient` | Draw radar rings and axes without image files. |
| `box-shadow` | Gives tiny radar points a soft glow. |
| `content`, `::after` | Create the loading strip without another HTML element. |
| `clamp`, `repeat`, `minmax`, `fr` | Size text responsively and divide grid space. Only functions actually present in style.css affect the app. |
| `scroll-behavior`, `scroll-padding-top` | Make section navigation smooth with breathing room. |
| `list-style` | Removes default bullets from custom watchlist rows. |
| `vertical-align` | Aligns count badges with heading text. |
| `resize: vertical` | Lets the CSV preview change height but not width. |
| `@media (max-width: ...)` | Changes layouts for smaller screens: compact navigation, stacked search controls and cards. |
| `@media (prefers-reduced-motion: reduce)` | Turns off animation and smooth scrolling for users who request less motion. |
| `!important` | Gives hidden/reduced-motion rules precedence over ordinary declarations. |

## Why the visuals do not change the data

The radar uses CSS animation and is explicitly decorative. The score ring receives `score * 100` as --score. The percentile bar receives `percentile * 100` as its width. The recommendation receives a data-level state to choose a color. None of these effects invents a value, changes the API record, or changes the unrounded comparison used by choosePriority.

## Explain and test the step

Say: “I improved presentation with CSS layout, responsive media queries, and small animations. The real API values drive the probability ring and ranking bar. I kept the request, decision, display, and saved-list responsibilities in separate functions so I can explain each part.”

Search a known CVE, compare the ring and text, save and refresh, recheck, and export. Try invalid input and unavailable internet. On a phone-width screen, the sidebar becomes a top navigation bar and cards stack. In reduced-motion mode, the radar and entrance animation stop.

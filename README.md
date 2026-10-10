# CyberWatch
A browser-based CVE research dashboard for Web Systems Project #3.

## Open it
Extract the ZIP and keep index.html, style.css, and script.js in the same folder.
Open index.html in a modern browser with internet access. No API key, installation, build step, or framework is required.
For consistent localStorage behavior, use your editor’s local preview server and keep its address and port the same.
The current development preview is http://127.0.0.1:8765/ while that local server is running.
A directly opened file and a localhost page can have separate watchlists. Saved IDs belong to your browser and are not shipped in the ZIP.

## What changed in this version
- Responsive dashboard with a sidebar that becomes a compact navigation bar on phones.
- Dark neutral panels, lime accents, system fonts, and plain project-specific copy.
- Decorative radar, result entrance animation, hover feedback, loading indicator, and animated percentile bar.
- A probability ring driven by the real EPSS score; a separate percentile ranking bar.
- CISA vulnerability name, description, vendor/product, catalog date, and required action when listed.
- Expandable library of 16 verified example CVEs with product labels, plus quick example chips, watchlist count, one-click recheck, and CSV export with a copyable fallback.
- Partial results when only one source works; unknown data is never treated as a low score.
- Fifteen-second request timeout, response checks, and a five-minute CISA cache held only in memory.
- Built-in How to use guide, reachable from the sidebar and top bar, covering six workflows and storage tips.
- Keyboard focus indicators, labeled controls, status announcements, and reduced-motion support.

## All nine rubric requirements
| Requirement | Implementation | How to demonstrate |
|---|---|---|
| HTML & CSS interface | Styled form, cards, recommendations, source details, watchlist, responsive layout | Open desktop and phone views |
| User interaction | Typed CVE or example chip chooses the EPSS request’s cve parameter | Search two different IDs |
| JavaScript fetch() | fetchJSON requests FIRST EPSS and CISA JSON | Explain fetchJSON and the endpoints |
| JSON data | response.json parses each body; code reads records and searches CISA’s array | Explain result.data and catalog.vulnerabilities |
| At least 3 real API values | CVE ID, score, score date, percentile, and CISA context | Point to the result cards |
| JavaScript decision/interaction | Percentage calculation and custom two-source priority decision | Explain choosePriority and boundary values |
| localStorage | Saves CVE IDs, restores on reload, avoids duplicates, supports removal | Save, refresh, remove, refresh |
| Loading/error feedback | Loading state, invalid input, no EPSS record, partial failure, total failure, storage error | Try hello, missing data, or network failure |
| Independent feature | Two-source priority recommendation; additional CSV export and one-click recheck | Explain the feature you did not build in class; CSV is an alternate choice |

Independent-feature acceptance depends on what your class already built. Choose a feature that was not covered there and be ready to explain it.

## Program flow
HTML defines the elements. CSS styles them. The deferred script runs after HTML is parsed.
JavaScript restores the watchlist and registers listeners. A search cleans and validates the CVE ID, shows loading, and starts both requests.
Promise.allSettled waits for both sources without discarding one result if the other fails.
EPSS supplies score, percentile, and date. CISA’s catalog is searched for the CVE; absence from the catalog is not proof of safety.
choosePriority combines the evidence. displayResult fills the HTML fields and changes the score visuals. finally always resets loading.
Save updates the JavaScript array. JSON.stringify turns it into text for localStorage. JSON.parse restores it on reload.
CSS animations add visual feedback without changing the API data or decision logic.

## Priority rules
- High: CISA-listed OR EPSS score at least 0.1 (10%).
- Medium: CISA was checked, no match was found, and EPSS is at least 0.01 (1%) but below 0.1.
- Lower: CISA was checked, no match was found, and EPSS is below 0.01.
- Insufficient: no usable EPSS score and no confirmed CISA match.
- Incomplete: EPSS below the High threshold but CISA could not be checked.
These are custom student-project rules, not official severity ratings or a full operational risk model.
EPSS estimates exploitation likelihood over the next 30 days; it does not describe impact or guarantee exploitation.
Probability and percentile are different. Percentile is a relative ranking and may be 100% even when the probability is below 100%.
Decisions use unrounded numbers. Displays use three decimals, with special labels to avoid rounding nonzero values to zero or sub-100% values to 100%.

## Demonstration checklist
1. Click Log4Shell: show live EPSS, percentile, CISA status, and source details.
2. Explain the High recommendation: a CISA match overrides a low EPSS score.
3. Choose another example to show the request changes with input.
4. Save a CVE, refresh, and use Recheck. Try saving it again: the Save button shows it is already saved.
5. Export the watchlist. If the preview browser blocks automatic downloads, use Download CSV or copy the preview text.
6. Remove an item and refresh: it should stay removed.
7. Enter hello to show validation; enter CVE-1900-0000 as a missing-data example (source coverage can change).
8. Disconnect with the page open and search to demonstrate failure feedback. The in-memory CISA cache can still supply partial results for up to five minutes. Reconnect afterward.
9. Resize to phone width. Verify stacked cards and the compact navigation.
10. Use How to use in the navigation to open the six-step on-page guide.
11. Open Behind the recommendation to explain the exact rules.

## Two-minute presentation
“CyberWatch helps a user investigate a vulnerability by its CVE identifier. I use two public sources: FIRST EPSS for exploitation estimates and CISA KEV for known-exploitation information.

HTML defines the search form, result cards, and watchlist. CSS handles layout, colors, and animations. JavaScript validates the entered ID, sends requests with fetch, and parses JSON responses.

My page displays the returned score, score date, percentile, and CISA details. My custom priority rules use the data to make a decision instead of just showing raw JSON. A CISA match or a score of at least ten percent gives High review priority. These rules are my app’s categories, not official severity ratings.

I save CVE IDs with localStorage. Because it stores text, I use JSON.stringify when saving and JSON.parse when loading. Users can remove IDs, recheck them, and export a CSV.

I also handle loading, missing records, unavailable sources, and blocked browser storage. The design adapts to phone screens and respects reduced-motion preferences.”

## How to explain the extras
- Radar: decorative CSS rings with a rotating conic gradient. It does not represent a live scan.
- Probability ring: a conic gradient whose fill is set from the API score using a CSS custom property.
- Percentile bar: width equals percentile times 100; a CSS transition animates the width.
- Recheck: fills the existing input and submits the same form, reusing validation and API logic.
- CSV: joins saved IDs with line breaks, creates a text Blob for download, and offers a read-only preview as a fallback.
- Cache: remembers the CISA response and download time in variables; reuses it for five minutes.
- Partial results: Promise.allSettled reports success/failure separately for both sources.
- Reduced motion: a CSS media query disables animation and transitions for users who request less motion.

## Validation performed
Browser: expanded example library and a live OpenSSL lookup, on-page guide navigation and expansion, live two-source lookup, example chip, one-click recheck, saved list after refresh, invalid-input feedback, CSV preview, desktop and 390px phone layout with no horizontal overflow.
JavaScript checks: High/Medium/Lower boundaries, CISA override, missing records, invalid data, partial and total failures, cleaned input, percentage rounding, saves/duplicates, reload, removal, CSV contents, and blocked storage.
Syntax and HTML ID/reference checks passed. Download generation is tested; the in-app browser did not report a completed automatic file download, so the app provides a visible copy/download fallback.

## Limits
This is a student project, not a production vulnerability management system. No asset inventory, user accounts, automatic monitoring, server database, or live network scan is present.
CISA is cached in memory for up to five minutes. The watchlist stores only IDs; recheck to retrieve current intelligence.
Data can change. Screenshots record one lookup rather than permanent scores.

## Included files
- index.html, style.css, script.js: the application.
- CODE-GUIDE.md: code reference and learning guide.
- screenshots/: results, persistence, validation, phone layout, CSV export preview, the built-in user guide, and the expanded example library.

## Sources
- FIRST EPSS: https://www.first.org/epss/
- FIRST API: https://api.first.org/
- CISA official mirror: https://github.com/cisagov/kev-data
- CISA JSON: https://raw.githubusercontent.com/cisagov/kev-data/main/known_exploited_vulnerabilities.json

# AUDIT — Education Leadership Dashboard (pre-refactor)

Audit of the previous build: one 726-line `index.html` (markup, CSS and
a 190-line inline script) plus `docs/user-guide.md`, which documented
it. There was no data file, no test, no CI. Every number on the page
was typed into the markup or the script. Line numbers refer to the old
`index.html`.

---

## A. Honesty of the copy

### A1 — "12,450 students", "87.3 % graduation rate", "$1.2B endowment"
Lines 358–381 and 418–447: four stat cards and seven "quick insights",
each a literal with a green "▲ from last year" beside it. No institution
was named; nothing was sourced. **Fix:** the page is built on the IPEDS
2023 collection for the 84 Illinois public and private not-for-profit
four-year institutions, downloaded by `scripts/build-ipeds.mjs` from the
NCES Data Center, with the file names and build date printed on the
page. Every tile is a ratio of published counts, and a tile with no
report says "not reported".

### A2 — "Graduation Rate Trends (2021–2025)" from typed arrays
Line 540 onward: `[81.2, 83.1, 84.8, 86.0, 87.3]` and three department
series, all invented. **Fix:** the graduation chart is the cumulative
4-, 5- and 6-year rate of the fall-2017 bachelor's cohort against the
peer-group median, from GR2023.

### A3 — "Top Performing Departments" ranked by a star rating
Lines 448–520: seven departments with students, graduation rate, GPA,
satisfaction and stars, none of which IPEDS or any institution
publishes at that grain in public. **Fix:** the ranking table ranks
real institutions in the chosen peer group on a chosen measure, in the
right direction, with the count of peers that report it.

### A4 — Sidebar navigation to nowhere
Lines 331–343: ten `href="#"` links (Enrollment, Faculty, Budget,
Reports, Settings…) and a "Dashboard v2.1" version stamp. **Fix:**
removed. What the page can do is on the page.

### A5 — A user guide for a page that did nothing
`docs/user-guide.md` explained how to read the invented numbers.
**Fix:** deleted; the method panel and the case study describe the real
one.

## B. Correctness of the analysis

### B1 — No comparison group
Rates without a reference are decoration. **Fix:** seven peer groups
(Carnegie class, control, size, all Illinois) with the median and the
institution's percentile rank on every measure.

### B2 — No small-cell suppression
The old page had no cells, but a real one must. **Fix:** rates with a
denominator under 10 are suppressed in the equity table and the tiles,
and the suppression count is stated.

### B3 — Completions could not be reconciled
**Fix:** the build script asserts that the sum of bachelor's degrees
across CIP families equals the reported grand total for every
institution, and refuses to write the file otherwise; the test suite
repeats the check, and adds that 4-, 5- and 6-year completers sum to
the 150 % figure and that men plus women equal the enrollment total.

## C. Security and structure

### C1 — No CSP; 23 `style=` attributes; unpinned Chart.js
Line 7 loaded `chart.js` with no version and no `integrity`. **Fix:**
`default-src 'none'` policy, classes instead of inline styles, Chart.js
3.9.1 with an SRI hash and a vendored fallback, all DOM writes via
`textContent`.

### C2 — Unsplash image in structured data
Line 321 pointed the JSON-LD `image` at a stock photo unrelated to the
project. **Fix:** removed.

## D. Engineering

### D1 — No data pipeline, no tests, no CI
**Fix:** `scripts/build-ipeds.mjs` (fetch, filter, reconcile, write),
11 Vitest tests including hand-checked values for one institution,
ESLint and html-validate in the lint job, security scan, Pages
deployment from a green build.

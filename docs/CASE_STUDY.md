# Case Study — Education Leadership Dashboard

**Repository:** [Education-Leadership-Dashboard](https://github.com/Freddricklogan/Education-Leadership-Dashboard) · **Live demo:** [freddricklogan.github.io/Education-Leadership-Dashboard](https://freddricklogan.github.io/Education-Leadership-Dashboard/) · **Author:** Freddrick Logan

---

## 1. Who has this problem

Provosts, deans and trustees who are shown a graduation rate and asked to act on it; institutional research offices that spend their weeks producing the same peer comparisons by hand; and students in education leadership programmes who are taught to make data-informed decisions on dashboards that were never connected to data. I have sat in rooms where a number on a slide could not be traced to a file.

## 2. The problem, as a scenario

A board meeting opens with a slide: 87.3 % graduation rate, up 2.1 points, four departments with five-star ratings. A trustee asks which cohort, which definition, and how that compares with similar institutions. Nobody in the room can say. The earlier version of this page was that slide in a browser — every figure a literal in the markup, a trend from a typed array, a sidebar of ten links to nowhere, and a user guide explaining how to read it.

## 3. What it costs to leave it alone

A leadership decision anchored on an untraceable number is the direct cost. The second cost is credibility with the people who do know the definitions — the institutional research office, the accreditor — who will discount everything else the dashboard says once they find one number without a cohort. For students, a dashboard that cannot be reproduced teaches that evidence is a presentation style.

## 4. The approach, and the alternative I rejected

I rejected dressing the mock-up with plausible numbers for a fictional university; it would have taught nothing about definitions. Instead the page is built on IPEDS, the federal data every Title IV institution reports. `scripts/build-ipeds.mjs` downloads six 2023-collection files from the NCES Data Center, filters to the 84 Illinois public and private not-for-profit four-year degree-granting institutions, joins them by UNITID, labels Carnegie classes and CIP families, and refuses to write the dataset unless bachelor's completions by family reconcile to the reported total for every institution. `src/metrics.js` turns counts into rates — graduation as completers over the adjusted fall-2017 bachelor's cohort, retention and student-faculty ratio as reported, admit and yield from the admissions file — and suppresses any rate whose denominator is under ten. Peer groups, medians, percentile ranks and rankings are computed over institutions that report each measure, and the count is shown.

## 5. What the code does today

Choose an institution and a peer group — Carnegie class, control, size, or all 84. Eight tiles show 12-month enrollment, 4- and 6-year graduation, full-time retention, students per faculty, admit rate, yield and bachelor's conferred, each with the peer median, the institution's percentile and the number of reporting peers. Charts show cumulative graduation within four, five and six years against the peer median, peers plotted by retention and six-year graduation with the selected institution marked, bachelor's degrees by CIP family, and enrollment by race and ethnicity. The equity table gives six-year completion by group with the gap to the overall rate and suppressed cells labelled. A ranking table orders the peer group on any measure in the correct direction, and the peer table exports as CSV. The source files and build date are printed at the foot of the page.

## 6. Evidence

Eleven Vitest tests check the dataset's shape and three reconciliation identities across all 84 institutions, hand-checked values for Illinois Institute of Technology — enrollment 8,193, cohort 468 with 339 completers within six years and 166 within four, retention 87 %, 8,912 applicants, 630 bachelor's degrees of which 273 in engineering — verified independently against the raw CSVs, the rate formulas, suppression under ten, peer filters, median and percentile rank on small arrays, directional ranking, equity gaps, program-mix folding and composition shares. Statement coverage of the metrics module is 100 %. In headless Chrome the doctoral peer group has 17 institutions with a 6-year median of 64.6 % and the all-Illinois group 84 with a median of 59.0 % from 57 reporting; the equity table shows eight groups with one suppressed; a seminary with no cohort reads "not reported"; there were zero console errors and no horizontal scroll at 1280 or 400 pixels. `AUDIT.md` records eleven findings against the earlier build.

## 7. What it would take to run this in production

Extend the build script's scope filter to any state or a custom UNITID list, add prior collection years so the graduation chart becomes a trend across cohorts, and schedule the build when NCES releases provisional and final files. Finance and staff surveys would add cost per completion and faculty composition. For an institution's internal use, the same metrics module would accept the institution's own cohort files, which are more current than the federal release.

## 8. Limits and next steps

One collection year, one state, and only public and private not-for-profit four-year institutions. Graduation rates cover first-time full-time bachelor's-seeking students only, which is IPEDS's definition and excludes transfers and part-time entrants. Peer groups are structural, not selected by mission. Next, in order: multi-year cohorts, a Pell and first-generation view from the outcome-measures survey, and a user-defined peer list saved in the browser.

## 9. Who should look at this

**Hiring manager:** evidence that I build institutional analytics on the federal data itself, with definitions, suppression and reconciliation a research office would accept.
**Consulting client:** a peer benchmarking tool for board and accreditation reporting that can be regenerated from NCES in one command and extended to your state or peer list.
**Engineer:** read `scripts/build-ipeds.mjs` for the join and reconciliation, and `src/metrics.js` with `tests/metrics.test.js` for the rate and suppression rules.

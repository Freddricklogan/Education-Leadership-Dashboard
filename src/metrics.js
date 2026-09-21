/** Derived metrics over the IPEDS institution records. Every rate is a ratio of reported counts; nothing is estimated. */

export const MIN_CELL = 10; // rates are suppressed when the denominator is below this

const ratio = (n, d) => (n === null || d === null || !(d > 0) ? null : n / d);
export const pct = (n, d) => (ratio(n, d) === null ? null : ratio(n, d) * 100);

/** Headline rates for one institution; null where IPEDS has no report or the cell is too small. */
export function rates(inst) {
  const g = inst.graduation;
  const a = inst.admissions;
  const r = inst.retention;
  const gradOk = g && g.cohort >= MIN_CELL;
  return {
    grad4: gradOk ? pct(g.within4, g.cohort) : null,
    grad5: gradOk ? pct(g.within4 + g.within5, g.cohort) : null,
    grad6: gradOk ? pct(g.completers150, g.cohort) : null,
    transferOut: gradOk ? pct(g.transferOut, g.cohort) : null,
    retentionFt: r?.fullTimePct ?? null,
    studentFaculty: r?.studentFacultyRatio ?? null,
    admit: a ? pct(a.admitted, a.applicants) : null,
    yield: a ? pct(a.enrolled, a.admitted) : null,
    enrollment: inst.enrollment?.total ?? null,
    undergraduate: inst.enrollment?.undergraduate ?? null,
    graduateShare: inst.enrollment ? pct(inst.enrollment.graduate, inst.enrollment.total) : null,
    bachelors: inst.completions.bachelorsTotal
  };
}

export const METRICS = [
  { key: 'enrollment', label: '12-month enrollment', unit: '', higherIsBetter: null },
  { key: 'grad4', label: '4-year graduation rate', unit: '%', higherIsBetter: true },
  { key: 'grad6', label: '6-year graduation rate', unit: '%', higherIsBetter: true },
  { key: 'retentionFt', label: 'Full-time retention', unit: '%', higherIsBetter: true },
  { key: 'studentFaculty', label: 'Students per faculty', unit: ':1', higherIsBetter: false },
  { key: 'admit', label: 'Admit rate', unit: '%', higherIsBetter: null },
  { key: 'yield', label: 'Yield', unit: '%', higherIsBetter: true },
  { key: 'graduateShare', label: 'Graduate share of enrollment', unit: '%', higherIsBetter: null },
  { key: 'bachelors', label: "Bachelor's conferred", unit: '', higherIsBetter: null }
];

/** Peer group: institutions matching the given filters, excluding nothing (the focus institution is included). */
export function peerGroup(institutions, { carnegieCodes = null, control = null, minEnrollment = 0 } = {}) {
  return institutions.filter((i) => (carnegieCodes === null || carnegieCodes.includes(i.carnegieCode)) && (control === null || i.control === control) && (i.enrollment?.total ?? 0) >= minEnrollment);
}

export function median(values) {
  const s = values.filter((v) => v !== null && Number.isFinite(v)).sort((a, b) => a - b);
  if (s.length === 0) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Percentile rank of `value` within `values` (share strictly below plus half the ties), 0–100. */
export function percentileRank(values, value) {
  const s = values.filter((v) => v !== null && Number.isFinite(v));
  if (value === null || s.length === 0) return null;
  const below = s.filter((v) => v < value).length;
  const ties = s.filter((v) => v === value).length;
  return ((below + ties / 2) / s.length) * 100;
}

/** Benchmarks one institution against a peer group on every metric. */
export function benchmark(inst, peers) {
  const mine = rates(inst);
  const table = peers.map((p) => ({ inst: p, r: rates(p) }));
  return METRICS.map((m) => {
    const values = table.map((t) => t.r[m.key]);
    const n = values.filter((v) => v !== null).length;
    return { ...m, value: mine[m.key], peerMedian: median(values), percentile: percentileRank(values, mine[m.key]), n };
  });
}

/** Cumulative graduation curve (years 4, 5, 6) for an institution and the peer median curve. */
export function graduationCurve(inst, peers) {
  const own = rates(inst);
  const curve = (r) => [r.grad4, r.grad5, r.grad6];
  const peerCurves = peers.map((p) => curve(rates(p)));
  return { years: [4, 5, 6], own: curve(own), peerMedian: [0, 1, 2].map((i) => median(peerCurves.map((c) => c[i]))) };
}

/** Six-year completion rate by race/ethnicity with small cells suppressed, plus the gap to the institution rate. */
export function equity(inst) {
  const g = inst.graduation;
  if (!g || g.cohort < MIN_CELL) return null;
  const overall = pct(g.completers150, g.cohort);
  const groups = Object.entries(g.byRace).map(([group, v]) => ({ group, cohort: v.cohort, completers: v.completers, rate: v.cohort >= MIN_CELL ? pct(v.completers, v.cohort) : null, suppressed: v.cohort < MIN_CELL && v.cohort > 0 }))
    .filter((x) => x.cohort > 0)
    .map((x) => ({ ...x, gap: x.rate === null ? null : x.rate - overall }))
    .sort((a, b) => b.cohort - a.cohort);
  const reported = groups.filter((x) => x.rate !== null);
  const widest = reported.length >= 2 ? Math.max(...reported.map((x) => x.rate)) - Math.min(...reported.map((x) => x.rate)) : null;
  return { overall, groups, widestGap: widest, suppressedGroups: groups.filter((x) => x.suppressed).length };
}

/** Bachelor's completions by CIP family, sorted, with share of the institution total. */
export function programMix(inst, top = 8) {
  const total = inst.completions.bachelorsTotal;
  if (!total) return [];
  const all = Object.entries(inst.completions.bachelorsByFamily).map(([family, count]) => ({ family, count, share: (count / total) * 100 })).sort((a, b) => b.count - a.count);
  if (all.length <= top) return all;
  const head = all.slice(0, top);
  const rest = all.slice(top).reduce((s, x) => s + x.count, 0);
  return [...head, { family: `Other (${all.length - top} families)`, count: rest, share: (rest / total) * 100 }];
}

/** Enrollment composition by race/ethnicity as shares of the 12-month total. */
export function composition(inst) {
  const e = inst.enrollment;
  if (!e || !e.total) return [];
  return Object.entries(e.race).filter(([, v]) => v > 0).map(([group, count]) => ({ group, count, share: (count / e.total) * 100 })).sort((a, b) => b.count - a.count);
}

/** Peer table rows for a metric, ranked; the focus institution is flagged. */
export function ranking(peers, metricKey, focusId) {
  const m = METRICS.find((x) => x.key === metricKey);
  const rows = peers.map((p) => ({ inst: p, value: rates(p)[metricKey] })).filter((r) => r.value !== null);
  const dir = m.higherIsBetter === false ? 1 : -1;
  rows.sort((a, b) => dir * (a.value - b.value) || a.inst.name.localeCompare(b.inst.name));
  return rows.map((r, i) => ({ rank: i + 1, name: r.inst.name, control: r.inst.control, carnegie: r.inst.carnegie, value: r.value, isFocus: r.inst.unitid === focusId }));
}

export function peerCsv(peers, focusId) {
  const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const head = ['unitid', 'name', 'control', 'carnegie', ...METRICS.map((m) => m.key), 'focus'];
  const lines = peers.map((p) => { const r = rates(p); return [p.unitid, p.name, p.control, p.carnegie, ...METRICS.map((m) => (r[m.key] === null ? '' : Number(r[m.key].toFixed(2)))), p.unitid === focusId ? 'yes' : ''].map(esc).join(','); });
  return [head.join(','), ...lines].join('\n') + '\n';
}

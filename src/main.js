/** Binds the IPEDS dataset and the metrics to the page and the Executive Shell. */
import { loadChartLib, makeCharts } from './charts.js';
import { mountExecShell, tokens } from './exec-shell.js';
import { benchmark, composition, equity, graduationCurve, METRICS, peerCsv, peerGroup, programMix, ranking, rates } from './metrics.js';
import { $, el, setText } from './ui.js';

const state = { data: null, focus: null, peers: [], metric: 'grad6' };
let charts = makeCharts(null);
let shell;
const fmt = (v, unit) => (v === null || v === undefined ? '—' : unit === '%' ? `${v.toFixed(1)}%` : unit === ':1' ? `${v.toFixed(0)}:1` : Number(v).toLocaleString());
const PEER_SETS = {
  carnegie: { label: 'Same Carnegie classification', pick: (f, all) => peerGroup(all, { carnegieCodes: [f.carnegieCode] }) },
  doctoral: { label: 'Illinois doctoral universities', pick: (f, all) => peerGroup(all, { carnegieCodes: [15, 16, 17] }) },
  masters: { label: "Illinois master's institutions", pick: (f, all) => peerGroup(all, { carnegieCodes: [18, 19, 20] }) },
  bacc: { label: 'Illinois baccalaureate colleges', pick: (f, all) => peerGroup(all, { carnegieCodes: [21, 22, 23] }) },
  control: { label: 'Same control (public / private)', pick: (f, all) => peerGroup(all, { control: f.control }) },
  large: { label: 'Illinois, enrollment ≥ 5,000', pick: (f, all) => peerGroup(all, { minEnrollment: 5000 }) },
  all: { label: 'All 84 Illinois four-year institutions', pick: (f, all) => peerGroup(all) }
};

function render() {
  const f = state.focus;
  const all = state.data.institutions;
  state.peers = PEER_SETS[$('peer-set').value].pick(f, all);
  const bench = benchmark(f, state.peers);
  const by = Object.fromEntries(bench.map((b) => [b.key, b]));
  setText('inst-meta', `${f.control} · ${f.carnegie} · ${f.city}, Illinois · ${f.size} · ${f.locale}${f.hbcu ? ' · HBCU' : ''}`);
  setText('peer-meta', `Peer group: ${PEER_SETS[$('peer-set').value].label} — ${state.peers.length} institutions (medians use those that report each measure).`);
  const tile = (id, key) => {
    const b = by[key];
    setText(`${id}`, fmt(b.value, b.unit));
    setText(`${id}-sub`, b.value === null ? 'not reported' : `peer median ${fmt(b.peerMedian, b.unit)} · ${b.percentile === null ? '' : `${b.percentile.toFixed(0)}th pct`} · n=${b.n}`);
  };
  tile('k-enroll', 'enrollment');
  tile('k-grad6', 'grad6');
  tile('k-grad4', 'grad4');
  tile('k-ret', 'retentionFt');
  tile('k-sf', 'studentFaculty');
  tile('k-admit', 'admit');
  tile('k-yield', 'yield');
  tile('k-bach', 'bachelors');

  const curve = graduationCurve(f, state.peers);
  charts.line($('gradChart'), curve.years.map((y) => `Within ${y} years`), [{ label: f.name, data: curve.own }, { label: 'Peer median', data: curve.peerMedian, colour: tokens().muted, dash: [6, 4] }], 'Years since entry (fall 2017 cohort)', 'Cumulative graduation rate (%)');
  const mix = programMix(f);
  charts.bars($('mixChart'), mix.map((m) => m.family), mix.map((m) => m.count), "Bachelor's degrees, 2022–23");
  const comp = composition(f);
  charts.donut($('compChart'), comp.map((c) => c.group), comp.map((c) => c.count));
  const pts = state.peers.map((p) => ({ inst: p, r: rates(p) })).filter((x) => x.r.retentionFt !== null && x.r.grad6 !== null);
  charts.scatterLabelled($('peerChart'), pts.map((x) => ({ x: x.r.retentionFt, y: x.r.grad6, label: x.inst.name, focus: x.inst.unitid === f.unitid })), 'Full-time retention (%)', '6-year graduation rate (%)');

  const eq = equity(f);
  const etb = $('equity-tbody');
  etb.replaceChildren();
  if (eq) {
    for (const g of eq.groups) {
      const tr = el('tr');
      tr.append(el('td', { text: g.group }), el('td', { text: g.cohort.toLocaleString() }), el('td', { text: g.rate === null ? 'suppressed (n<10)' : `${g.rate.toFixed(1)}%` }), el('td', { class: g.gap === null ? '' : g.gap < -10 ? 'is-danger' : g.gap < 0 ? 'is-warn' : 'is-ok', text: g.gap === null ? '—' : `${g.gap >= 0 ? '+' : ''}${g.gap.toFixed(1)}` }));
      etb.append(tr);
    }
    setText('equity-note', `Overall ${eq.overall.toFixed(1)}%; widest gap between reported groups ${eq.widestGap === null ? '—' : `${eq.widestGap.toFixed(1)} points`}${eq.suppressedGroups ? `; ${eq.suppressedGroups} group(s) suppressed for cohorts under 10` : ''}.`);
  } else setText('equity-note', 'No graduation-rate cohort reported (or cohort under 10).');

  renderRanking();
  const notes = state.data.notes;
  setText('source-note', `${state.data.source}. Built ${state.data.built} by scripts/build-ipeds.mjs. ${notes.graduation}. ${notes.enrollment}. ${notes.retention}. ${notes.admissions}. ${notes.completions}.`);
  shell?.refreshKpis();
}

function renderRanking() {
  const m = METRICS.find((x) => x.key === $('rank-metric').value);
  const rows = ranking(state.peers, m.key, state.focus.unitid);
  const tb = $('rank-tbody');
  tb.replaceChildren();
  for (const row of rows) {
    const tr = el('tr', { class: row.isFocus ? 'is-focus' : '' });
    tr.append(el('td', { text: row.rank }), el('td', { text: row.name }), el('td', { text: row.control }), el('td', { text: row.carnegie }), el('td', { text: fmt(row.value, m.unit) }));
    tb.append(tr);
  }
  setText('rank-note', `${rows.length} of ${state.peers.length} peers report ${m.label.toLowerCase()}${m.higherIsBetter === false ? ' (lower is better)' : m.higherIsBetter ? ' (higher is better)' : ''}.`);
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = el('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function boot() {
  const Chart = await loadChartLib();
  charts = makeCharts(Chart);
  if (!Chart) $('chart-notice').hidden = false;
  state.data = await fetch('data/ipeds-il-2023.json').then((r) => r.json());
  const sel = $('institution');
  for (const i of state.data.institutions) sel.append(el('option', { value: String(i.unitid), text: i.name }));
  const peerSel = $('peer-set');
  for (const [k, v] of Object.entries(PEER_SETS)) peerSel.append(el('option', { value: k, text: v.label }));
  const rank = $('rank-metric');
  for (const m of METRICS) rank.append(el('option', { value: m.key, text: m.label }));
  rank.value = 'grad6';
  sel.value = '145725';
  peerSel.value = 'doctoral';
  state.focus = state.data.institutions.find((i) => i.unitid === 145725);
  sel.addEventListener('change', () => { state.focus = state.data.institutions.find((i) => String(i.unitid) === sel.value); render(); });
  peerSel.addEventListener('change', render);
  rank.addEventListener('change', renderRanking);
  $('export-csv').addEventListener('click', () => download('peers.csv', peerCsv(state.peers, state.focus.unitid), 'text/csv'));
  render();

  shell = mountExecShell({
  theme: 'ember',
    title: 'Education Leadership Dashboard',
    tagline: 'Institutional benchmarks for Illinois four-year institutions from the IPEDS 2023 collection: enrollment, graduation and retention, admissions, program mix and completion equity, each compared with a peer group you choose. Every number is a ratio of counts NCES published.',
    repo: 'https://github.com/Freddricklogan/Education-Leadership-Dashboard',
    pagesUrl: 'https://freddricklogan.github.io/Education-Leadership-Dashboard/',
    badges: [{ label: 'IPEDS 2023', tone: 'accent' }, { label: '84 institutions', dot: true }, { label: 'Small cells suppressed', dot: true }],
    kpis: [
      { label: '12-month enrollment', compute: () => $('k-enroll').textContent, tone: 'accent' },
      { label: '6-year graduation', compute: () => $('k-grad6').textContent, tone: 'ok' },
      { label: 'Full-time retention', compute: () => $('k-ret').textContent },
      { label: 'Admit rate', compute: () => $('k-admit').textContent, tone: 'warn' },
      { label: 'Peers', compute: () => state.peers.length, tone: 'muted' }
    ],
    tour: [
      { selector: '#kpis', title: 'Counts NCES published, divided', body: 'Enrollment is the 12-month unduplicated headcount. The graduation rate is completers over the adjusted fall-2017 bachelor\'s cohort. Each tile shows the peer median, the percentile, and how many peers report the measure.' },
      { selector: '#peer-panel', title: 'Choose the comparison', body: 'Peer groups are Carnegie classes, control, or size — all drawn from the same file. Switch to all 84 Illinois four-year institutions and watch the medians move.', action: () => { $('peer-set').value = 'all'; render(); } },
      { selector: '#equity-panel', title: 'Equity with suppression', body: 'Six-year completion by race and ethnicity, with the gap to the overall rate. Groups with fewer than ten students in the cohort are suppressed rather than shown as a misleading percentage.', action: () => { $('peer-set').value = 'doctoral'; render(); } },
      { selector: '#rank-panel', title: 'Rank any measure', body: 'The table ranks the peer group on the measure you pick, in the right direction — students per faculty ranks low to high. Export the peer table as CSV for your own analysis.', action: () => { $('rank-metric').value = 'retentionFt'; renderRanking(); } }
    ]
  });
  shell.refreshKpis();
}

boot();

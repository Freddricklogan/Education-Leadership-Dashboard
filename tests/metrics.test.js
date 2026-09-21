import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { benchmark, composition, equity, graduationCurve, median, METRICS, peerCsv, peerGroup, percentileRank, programMix, ranking, rates } from '../src/metrics.js';

const data = JSON.parse(readFileSync(new URL('../data/ipeds-il-2023.json', import.meta.url), 'utf8'));
const inst = data.institutions;
const iit = inst.find((i) => i.unitid === 145725);

describe('dataset', () => {
  it('is the IPEDS 2023 Illinois four-year scope with reconciled completions', () => {
    expect(inst).toHaveLength(84);
    expect(data.source).toMatch(/IPEDS 2023/);
    for (const i of inst) {
      if (i.completions.bachelorsTotal !== null) expect(Object.values(i.completions.bachelorsByFamily).reduce((s, v) => s + v, 0)).toBe(i.completions.bachelorsTotal);
      if (i.graduation) expect(i.graduation.within4 + i.graduation.within5 + i.graduation.within6).toBe(i.graduation.completers150);
      if (i.enrollment) expect(i.enrollment.men + i.enrollment.women).toBe(i.enrollment.total);
    }
  });
  it('matches hand-checked IPEDS values for Illinois Institute of Technology', () => {
    expect(iit.enrollment).toMatchObject({ total: 8193, undergraduate: 3517, graduate: 4676 });
    expect(iit.graduation).toMatchObject({ cohort: 468, completers150: 339, within4: 166, within5: 147, within6: 26 });
    expect(iit.retention).toMatchObject({ fullTimePct: 87, partTimePct: 59, studentFacultyRatio: 17 });
    expect(iit.admissions).toMatchObject({ applicants: 8912, admitted: 4939, enrolled: 534 });
    expect(iit.completions).toMatchObject({ bachelorsTotal: 630, mastersTotal: 1218 });
    expect(iit.completions.bachelorsByFamily.Engineering).toBe(273);
  });
});

describe('rates', () => {
  it('computes ratios of reported counts and nulls for missing reports', () => {
    const r = rates(iit);
    expect(r.grad4).toBeCloseTo((166 / 468) * 100, 6);
    expect(r.grad5).toBeCloseTo((313 / 468) * 100, 6);
    expect(r.grad6).toBeCloseTo((339 / 468) * 100, 6);
    expect(r.admit).toBeCloseTo((4939 / 8912) * 100, 6);
    expect(r.yield).toBeCloseTo((534 / 4939) * 100, 6);
    expect(r.graduateShare).toBeCloseTo((4676 / 8193) * 100, 6);
    const seminary = inst.find((i) => !i.graduation && !i.admissions);
    expect(rates(seminary)).toMatchObject({ grad6: null, admit: null, yield: null });
  });
  it('suppresses graduation rates for cohorts under 10', () => {
    const tiny = { ...iit, graduation: { ...iit.graduation, cohort: 9, completers150: 9 } };
    expect(rates(tiny).grad6).toBeNull();
    expect(equity(tiny)).toBeNull();
  });
});

describe('peers and benchmarks', () => {
  const doctoral = peerGroup(inst, { carnegieCodes: [15, 16, 17] });
  it('filters by Carnegie, control and size', () => {
    expect(doctoral.map((i) => i.name)).toContain('Northwestern University');
    expect(doctoral.map((i) => i.name)).toContain('Illinois Institute of Technology');
    expect(peerGroup(inst, { control: 'Public' }).every((i) => i.control === 'Public')).toBe(true);
    expect(peerGroup(inst, { minEnrollment: 20000 }).length).toBeLessThan(10);
    expect(peerGroup(inst)).toHaveLength(84);
  });
  it('median and percentile rank behave on small arrays', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([null, NaN])).toBeNull();
    expect(percentileRank([1, 2, 3, 4], 3)).toBe(62.5);
    expect(percentileRank([1, 2, 2, 3], 2)).toBe(50);
    expect(percentileRank([], 1)).toBeNull();
    expect(percentileRank([1], null)).toBeNull();
  });
  it('benchmarks every metric against the peer median with the reporting count', () => {
    const b = benchmark(iit, doctoral);
    expect(b).toHaveLength(METRICS.length);
    const g6 = b.find((m) => m.key === 'grad6');
    expect(g6.value).toBeCloseTo(72.44, 1);
    expect(g6.n).toBeGreaterThan(5);
    expect(g6.peerMedian).toBeGreaterThan(0);
    expect(g6.percentile).toBeGreaterThanOrEqual(0);
    const curve = graduationCurve(iit, doctoral);
    expect(curve.own[2]).toBeGreaterThan(curve.own[0]);
    expect(curve.peerMedian.every((v) => v !== null)).toBe(true);
  });
  it('ranks with direction and flags the focus institution', () => {
    const r = ranking(doctoral, 'grad6', 145725);
    expect(r[0].value).toBeGreaterThanOrEqual(r[1].value);
    expect(r.find((x) => x.isFocus).name).toBe('Illinois Institute of Technology');
    const sf = ranking(doctoral, 'studentFaculty', 145725);
    expect(sf[0].value).toBeLessThanOrEqual(sf[1].value);
    const csv = peerCsv(doctoral, 145725);
    expect(csv.split('\n')[0]).toMatch(/^unitid,name,control,carnegie,enrollment/);
    expect(csv).toMatch(/"Illinois Institute of Technology".*"yes"/);
  });
});

describe('equity, program mix and composition', () => {
  it('reports six-year rates by group with small cells suppressed and gaps to the overall rate', () => {
    const e = equity(iit);
    expect(e.overall).toBeCloseTo(72.44, 1);
    const groups = Object.fromEntries(e.groups.map((g) => [g.group, g]));
    for (const g of e.groups) {
      expect(g.cohort).toBeGreaterThan(0);
      if (g.cohort < 10) expect(g.rate).toBeNull();
      else expect(g.rate).toBeCloseTo((g.completers / g.cohort) * 100, 6);
      if (g.rate !== null) expect(g.gap).toBeCloseTo(g.rate - e.overall, 6);
    }
    expect(groups['Asian'].cohort + groups['White'].cohort).toBeLessThanOrEqual(468);
    expect(e.widestGap).toBeGreaterThanOrEqual(0);
  });
  it('program mix sums to the bachelor total and folds the tail', () => {
    const mix = programMix(iit, 4);
    expect(mix.reduce((s, x) => s + x.count, 0)).toBe(630);
    expect(mix[0]).toMatchObject({ family: 'Engineering', count: 273 });
    expect(mix.at(-1).family).toMatch(/^Other/);
    expect(programMix({ completions: { bachelorsTotal: null, bachelorsByFamily: {} } })).toEqual([]);
  });
  it('composition shares sum to 100', () => {
    const c = composition(iit);
    expect(c.reduce((s, x) => s + x.share, 0)).toBeCloseTo(100, 6);
    expect(composition({ enrollment: null })).toEqual([]);
  });
});

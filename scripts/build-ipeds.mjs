/**
 * Builds data/ipeds-il-2023.json from the IPEDS 2023 collection (NCES Data Center complete data files):
 * HD2023 (institutional characteristics), EFFY2023 (12-month unduplicated enrollment), GR2023 (graduation
 * rates, 2017 bachelor's cohort), EF2023D (retention, student-to-faculty ratio), ADM2023 (admissions),
 * C2023_A (completions by CIP). Scope: Illinois public and private not-for-profit four-year, degree-granting,
 * Title IV institutions. Needs `unzip` on PATH. Run: node scripts/build-ipeds.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'https://nces.ed.gov/ipeds/datacenter/data/';
const FILES = { HD2023: 'hd2023.csv', EFFY2023: 'effy2023_rv.csv', GR2023: 'gr2023.csv', EF2023D: 'ef2023d.csv', ADM2023: 'adm2023.csv', C2023_A: 'c2023_a_rv.csv' };
const cache = join(tmpdir(), 'ipeds-2023');
mkdirSync(cache, { recursive: true });

async function fetchZip(name) {
  const zip = join(cache, `${name}.zip`);
  if (!existsSync(zip)) {
    const res = await fetch(`${BASE}${name}.zip`, { headers: { 'user-agent': 'Mozilla/5.0 (build-ipeds)' } });
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  }
  return zip;
}

function splitLine(line) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (ch === '"') q = false; else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

async function readCsv(name, member) {
  const zip = await fetchZip(name);
  const list = execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).split('\n');
  const file = list.find((f) => f.toLowerCase() === member) ?? list.find((f) => f.toLowerCase() === member.replace('_rv', ''));
  if (!file) throw new Error(`${name}: ${member} not in archive (${list.join(', ')})`);
  const text = execFileSync('unzip', ['-p', zip, file], { encoding: 'utf8', maxBuffer: 1 << 28 }).replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l) => l !== '');
  const head = splitLine(lines[0]).map((h) => h.replace(/^\uFEFF/, '').toUpperCase());
  return { file, rows: lines.slice(1).map((l) => Object.fromEntries(splitLine(l).map((v, i) => [head[i], v]))) };
}

const num = (v) => (v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? null : Number(v));

const CARNEGIE = { 15: "Doctoral: Highest Research Activity", 16: "Doctoral: Higher Research Activity", 17: 'Doctoral/Professional Universities', 18: "Master's: Larger Programs", 19: "Master's: Medium Programs", 20: "Master's: Small Programs", 21: 'Baccalaureate: Arts & Sciences Focus', 22: 'Baccalaureate: Diverse Fields', 23: "Baccalaureate/Associate's: Mixed", 24: 'Special Focus: Faith-Related', 25: 'Special Focus: Medical Schools & Centers', 26: 'Special Focus: Other Health Professions', 27: 'Special Focus: Research Institutions', 28: 'Special Focus: Engineering & Technology', 29: 'Special Focus: Business & Management', 30: 'Special Focus: Arts, Music & Design', 31: 'Special Focus: Law Schools', 32: 'Special Focus: Other', 33: 'Tribal Colleges', '-2': 'Not in Carnegie universe' };
const SIZE = { 1: 'Under 1,000', 2: '1,000–4,999', 3: '5,000–9,999', 4: '10,000–19,999', 5: '20,000 and above', '-1': 'Not reported', '-2': 'Not applicable' };
const LOCALE = { 11: 'City: Large', 12: 'City: Midsize', 13: 'City: Small', 21: 'Suburb: Large', 22: 'Suburb: Midsize', 23: 'Suburb: Small', 31: 'Town: Fringe', 32: 'Town: Distant', 33: 'Town: Remote', 41: 'Rural: Fringe', 42: 'Rural: Distant', 43: 'Rural: Remote' };
const CIP = { '01': 'Agriculture', '03': 'Natural Resources & Conservation', '04': 'Architecture', '05': 'Area, Ethnic, Cultural & Gender Studies', '09': 'Communication & Journalism', 10: 'Communications Technologies', 11: 'Computer & Information Sciences', 12: 'Culinary, Entertainment & Personal Services', 13: 'Education', 14: 'Engineering', 15: 'Engineering Technologies', 16: 'Foreign Languages & Linguistics', 19: 'Family & Consumer Sciences', 22: 'Legal Professions', 23: 'English Language & Literature', 24: 'Liberal Arts & General Studies', 25: 'Library Science', 26: 'Biological & Biomedical Sciences', 27: 'Mathematics & Statistics', 29: 'Military Technologies', 30: 'Multi/Interdisciplinary Studies', 31: 'Parks, Recreation & Fitness', 32: 'Basic Skills', 33: 'Citizenship Activities', 34: 'Health-Related Knowledge', 35: 'Interpersonal & Social Skills', 36: 'Leisure & Recreational Activities', 37: 'Personal Awareness', 38: 'Philosophy & Religious Studies', 39: 'Theology & Religious Vocations', 40: 'Physical Sciences', 41: 'Science Technologies', 42: 'Psychology', 43: 'Homeland Security, Law Enforcement & Firefighting', 44: 'Public Administration & Social Service', 45: 'Social Sciences', 46: 'Construction Trades', 47: 'Mechanic & Repair Technologies', 48: 'Precision Production', 49: 'Transportation & Materials Moving', 50: 'Visual & Performing Arts', 51: 'Health Professions', 52: 'Business, Management & Marketing', 54: 'History', 60: 'Residency Programs' };
const RACE = [['AIAN', 'American Indian or Alaska Native'], ['ASIA', 'Asian'], ['BKAA', 'Black or African American'], ['HISP', 'Hispanic or Latino'], ['NHPI', 'Native Hawaiian or Other Pacific Islander'], ['WHIT', 'White'], ['2MOR', 'Two or more races'], ['UNKN', 'Race/ethnicity unknown'], ['NRAL', 'U.S. nonresident']];

const hd = await readCsv('HD2023', FILES.HD2023);
const scope = hd.rows.filter((r) => r.STABBR === 'IL' && ['1', '2'].includes(r.SECTOR) && r.PSET4FLG === '1' && r.DEGGRANT === '1' && r.CYACTIVE === '1');
const ids = new Set(scope.map((r) => r.UNITID));
const pick = async (name, member) => {
  const { file, rows } = await readCsv(name, member);
  return { file, rows: rows.filter((r) => ids.has(r.UNITID)) };
};
const [effy, gr, efd, adm, comp] = await Promise.all([pick('EFFY2023', FILES.EFFY2023), pick('GR2023', FILES.GR2023), pick('EF2023D', FILES.EF2023D), pick('ADM2023', FILES.ADM2023), pick('C2023_A', FILES.C2023_A)]);
const by = (rows) => { const m = new Map(); for (const r of rows) { const a = m.get(r.UNITID) ?? []; a.push(r); m.set(r.UNITID, a); } return m; };
const E = by(effy.rows); const G = by(gr.rows); const D = by(efd.rows); const A = by(adm.rows); const C = by(comp.rows);

const institutions = scope.map((h) => {
  const id = h.UNITID;
  const lev = (code) => (E.get(id) ?? []).find((r) => r.EFFYALEV === code);
  const all = lev('1');
  const enrollment = all ? {
    total: num(all.EFYTOTLT), undergraduate: num(lev('2')?.EFYTOTLT), graduate: num(lev('12')?.EFYTOTLT), men: num(all.EFYTOTLM), women: num(all.EFYTOTLW),
    race: Object.fromEntries(RACE.map(([k, label]) => [label, num(all[`EFY${k}T`])]))
  } : null;
  const grt = (t) => (G.get(id) ?? []).find((r) => r.GRTYPE === t);
  const cohort = grt('8');
  const c150 = grt('12');
  const graduation = cohort && num(cohort.GRTOTLT) > 0 ? {
    cohort: num(cohort.GRTOTLT), completers150: num(c150?.GRTOTLT) ?? 0, within4: num(grt('13')?.GRTOTLT) ?? 0, within5: num(grt('14')?.GRTOTLT) ?? 0, within6: num(grt('15')?.GRTOTLT) ?? 0, transferOut: num(grt('16')?.GRTOTLT) ?? 0,
    byRace: Object.fromEntries(RACE.map(([k, label]) => [label, { cohort: num(cohort[`GR${k}T`]) ?? 0, completers: num(c150?.[`GR${k}T`]) ?? 0 }]))
  } : null;
  const d = (D.get(id) ?? [])[0];
  const a = (A.get(id) ?? [])[0];
  const bach = (C.get(id) ?? []).filter((r) => r.MAJORNUM === '1' && r.AWLEVEL === '5');
  const fam = {};
  let bachTotal = null;
  for (const r of bach) {
    if (r.CIPCODE === '99') { bachTotal = num(r.CTOTALT); continue; }
    const key = r.CIPCODE.slice(0, 2);
    fam[key] = (fam[key] ?? 0) + (num(r.CTOTALT) ?? 0);
  }
  const masters = (C.get(id) ?? []).find((r) => r.MAJORNUM === '1' && r.AWLEVEL === '7' && r.CIPCODE === '99');
  const doctoral = (C.get(id) ?? []).find((r) => r.MAJORNUM === '1' && r.AWLEVEL === '17' && r.CIPCODE === '99');
  return {
    unitid: Number(id), name: h.INSTNM, city: h.CITY, control: h.CONTROL === '1' ? 'Public' : 'Private not-for-profit', carnegie: CARNEGIE[h.C21BASIC] ?? h.C21BASIC, carnegieCode: Number(h.C21BASIC), size: SIZE[h.INSTSIZE] ?? h.INSTSIZE, locale: LOCALE[h.LOCALE] ?? h.LOCALE, hbcu: h.HBCU === '1', web: h.WEBADDR, lat: num(h.LATITUDE), lon: num(h.LONGITUD),
    enrollment, graduation,
    retention: d ? { fullTimePct: num(d.RET_PCF), partTimePct: num(d.RET_PCP), studentFacultyRatio: num(d.STUFACR), fallCohort: num(d.GRCOHRT) } : null,
    admissions: a && num(a.APPLCN) ? { applicants: num(a.APPLCN), admitted: num(a.ADMSSN), enrolled: num(a.ENRLT), sat: { math25: num(a.SATMT25), math75: num(a.SATMT75), ebrw25: num(a.SATVR25), ebrw75: num(a.SATVR75) }, act: { composite25: num(a.ACTCM25), composite75: num(a.ACTCM75) } } : null,
    completions: { bachelorsTotal: bachTotal, bachelorsByFamily: Object.fromEntries(Object.entries(fam).filter(([, v]) => v > 0).map(([k, v]) => [CIP[k] ?? `CIP ${k}`, v])), mastersTotal: num(masters?.CTOTALT), doctoralResearchTotal: num(doctoral?.CTOTALT) }
  };
});

// Reconciliation: bachelor's family sum equals the reported grand total for every institution that reports one.
const bad = institutions.filter((i) => i.completions.bachelorsTotal !== null && Object.values(i.completions.bachelorsByFamily).reduce((s, v) => s + v, 0) !== i.completions.bachelorsTotal);
if (bad.length) throw new Error(`completions do not reconcile for: ${bad.map((b) => b.name).join(', ')}`);

const out = {
  source: 'IPEDS 2023 collection, NCES Data Center complete data files (HD2023, EFFY2023, GR2023, EF2023D, ADM2023, C2023_A); revised (_RV) files where published',
  sourceUrl: 'https://nces.ed.gov/ipeds/datacenter/DataFiles.aspx',
  built: new Date().toISOString().slice(0, 10),
  scope: 'Illinois public and private not-for-profit four-year, degree-granting, Title IV institutions active in the 2023-24 collection',
  notes: {
    enrollment: '12-month unduplicated headcount, 2022-23 academic year (EFFY2023, EFFYALEV 1/2/12)',
    graduation: "Bachelor's-seeking subcohort entering fall 2017 (GR2023, GRTYPE 8/12/13/14/15/16); rates are completers ÷ adjusted cohort",
    retention: 'Fall 2022 cohort retained to fall 2023 (EF2023D); student-to-faculty ratio as reported',
    admissions: 'Fall 2023 applicants, admits and enrolled (ADM2023); test scores are 25th/75th percentiles of enrolled students who submitted',
    completions: "Degrees conferred July 2022–June 2023 (C2023_A), first major, by CIP 2-digit family"
  },
  files: { hd: hd.file, effy: effy.file, gr: gr.file, efd: efd.file, adm: adm.file, completions: comp.file },
  institutions: institutions.sort((x, y) => x.name.localeCompare(y.name))
};
writeFileSync(new URL('../data/ipeds-il-2023.json', import.meta.url), JSON.stringify(out));
console.log(`wrote ${institutions.length} institutions; with enrollment ${institutions.filter((i) => i.enrollment).length}, graduation ${institutions.filter((i) => i.graduation).length}, admissions ${institutions.filter((i) => i.admissions).length}`);

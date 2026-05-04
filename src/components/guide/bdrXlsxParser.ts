import * as XLSX from 'xlsx';
import type { CalcRow } from './bdrCalculatorData';

const LABEL_TO_KEY: Record<string, string> = {
  January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr', May: 'May', June: 'Jun',
  July: 'Jul', August: 'Aug', September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
  'Q1 Total': 'Q1', 'Q2 Total': 'Q2', 'Q3 Total': 'Q3', 'Q4 Total': 'Q4', '2026 Total': 'All',
};

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '' || v === '\u00a0') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const empty = (): CalcRow => ({
  monthlyGoal: null, actual: null, actVarDollar: null, actDaysNeeded: null, actVarPct: null,
  actBookingsToGoal: null, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null,
  actPlusPipe: null, expVarDollar: null, expVarPct: null, remainPipeNeed: null,
  expDaysNeeded: null, expBookings: null, commEarned: null, commForecast: null, totalCommPred: null,
});

const findSheet = (wb: XLSX.WorkBook, ...needles: string[]): XLSX.WorkSheet | null => {
  for (const name of wb.SheetNames) {
    const lc = name.toLowerCase();
    if (needles.every(n => lc.includes(n.toLowerCase()))) return wb.Sheets[name];
  }
  return null;
};

const sheetToGrid = (ws: XLSX.WorkSheet): unknown[][] =>
  XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: null }) as unknown[][];

interface RegionRollup {
  rows: Record<string, CalcRow>;
}

export interface ParsedSnapshot {
  hallie: Record<string, CalcRow>;
  matt: Record<string, CalcRow>;
  team: Record<string, CalcRow>;
  southeast: Record<string, CalcRow>;
  nyc: Record<string, CalcRow>;
  diagnostics: { hallieKeys: number; mattKeys: number; sheetNames: string[] };
}

const parseFromBdrSheet = (wb: XLSX.WorkBook) => {
  // Pull region map from "2026 Standings"
  const standings = findSheet(wb, '2026', 'standings');
  const regionByName: Record<string, string> = {};
  if (standings) {
    const grid = sheetToGrid(standings);
    for (const row of grid.slice(1)) {
      const name = row[0];
      if (typeof name === 'string' && name.includes(',')) {
        regionByName[name.trim()] = String(row[3] ?? '').trim();
      }
    }
  }

  const ws = findSheet(wb, '%', 'goal') ?? findSheet(wb, 'bdr', 'goal');
  const out = {
    hallie: {} as Record<string, CalcRow>,
    matt: {} as Record<string, CalcRow>,
    team: {} as Record<string, CalcRow>,
    southeast: {} as Record<string, CalcRow>,
    nyc: {} as Record<string, CalcRow>,
  };
  if (!ws) return out;

  const grid = sheetToGrid(ws);
  const hdr = grid[0] ?? [];
  const periods: Array<{ col: number; key: string }> = [];
  hdr.forEach((v, j) => {
    if (typeof v === 'string' && LABEL_TO_KEY[v]) periods.push({ col: j, key: `2026-${LABEL_TO_KEY[v]}` });
  });

  const initRollup = (r: RegionRollup) => {
    for (const { key } of periods) {
      const row = empty();
      row.monthlyGoal = 0;
      row.actual = 0;
      r.rows[key] = row;
    }
  };
  const team: RegionRollup = { rows: {} };
  const se: RegionRollup = { rows: {} };
  const nyc: RegionRollup = { rows: {} };
  initRollup(team); initRollup(se); initRollup(nyc);

  for (const r of grid.slice(2)) {
    const name = r[1];
    if (typeof name !== 'string' || !name.includes(',')) continue;
    const trimmed = name.trim();
    const region = regionByName[trimmed] ?? '';

    const target = trimmed === 'Bellack, Hallie' ? 'hallie'
      : trimmed === 'Griffith, Matthew' ? 'matt'
      : null;

    for (const { col, key } of periods) {
      const g = num(r[col - 3]);
      const a = num(r[col - 2]);

      if (target) {
        const row = empty();
        row.monthlyGoal = g;
        row.actual = a;
        if (g !== null && a !== null) {
          row.actVarDollar = +(a - g).toFixed(2);
          row.actVarPct = g !== 0 ? +(a / g).toFixed(4) : null;
        }
        out[target][key] = row;
      }

      if (g !== null) team.rows[key].monthlyGoal = (team.rows[key].monthlyGoal ?? 0) + g;
      if (a !== null) team.rows[key].actual = (team.rows[key].actual ?? 0) + a;
      if (region === 'Southeast') {
        if (g !== null) se.rows[key].monthlyGoal = (se.rows[key].monthlyGoal ?? 0) + g;
        if (a !== null) se.rows[key].actual = (se.rows[key].actual ?? 0) + a;
      }
      if (region === 'Northeast') {
        if (g !== null) nyc.rows[key].monthlyGoal = (nyc.rows[key].monthlyGoal ?? 0) + g;
        if (a !== null) nyc.rows[key].actual = (nyc.rows[key].actual ?? 0) + a;
      }
    }
  }

  for (const r of [team, se, nyc]) {
    for (const key of Object.keys(r.rows)) {
      const row = r.rows[key];
      const g = row.monthlyGoal, a = row.actual;
      if (g !== null && a !== null) {
        row.actVarDollar = +(a - g).toFixed(2);
        row.actVarPct = g !== 0 ? +(a / g).toFixed(4) : null;
      }
    }
  }
  out.team = team.rows;
  out.southeast = se.rows;
  out.nyc = nyc.rows;
  return out;
};

export const parseWorkbook = async (file: File): Promise<ParsedSnapshot> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const parsed = parseFromBdrSheet(wb);
  return {
    ...parsed,
    diagnostics: {
      hallieKeys: Object.keys(parsed.hallie).length,
      mattKeys: Object.keys(parsed.matt).length,
      sheetNames: wb.SheetNames,
    },
  };
};

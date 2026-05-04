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

export interface BdrMember {
  name: string;
  market: string;
  region: string;
  rows: Record<string, CalcRow>;
}

export interface ParsedSnapshot {
  hallie: Record<string, CalcRow>;
  matt: Record<string, CalcRow>;
  team: Record<string, CalcRow>;
  southeast: Record<string, CalcRow>;
  nyc: Record<string, CalcRow>;
  members: Record<string, BdrMember>;
  diagnostics: { hallieKeys: number; mattKeys: number; sheetNames: string[]; memberCount: number };
}

const parseFromBdrSheet = (wb: XLSX.WorkBook) => {
  // Pull region + market from "2026 Standings"
  const standings = findSheet(wb, '2026', 'standings');
  const regionByName: Record<string, string> = {};
  const marketByName: Record<string, string> = {};
  if (standings) {
    const grid = sheetToGrid(standings);
    for (const row of grid.slice(1)) {
      const name = row[0];
      if (typeof name === 'string' && name.includes(',')) {
        marketByName[name.trim()] = String(row[2] ?? '').trim();
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
    members: {} as Record<string, BdrMember>,
  };
  if (!ws) return out;

  const grid = sheetToGrid(ws);
  const hdr = grid[0] ?? [];
  const periods: Array<{ col: number; key: string }> = [];
  hdr.forEach((v, j) => {
    if (typeof v === 'string' && LABEL_TO_KEY[v]) periods.push({ col: j, key: `2026-${LABEL_TO_KEY[v]}` });
  });

  const initRollup = () => {
    const o: Record<string, CalcRow> = {};
    for (const { key } of periods) {
      const row = empty();
      row.monthlyGoal = 0;
      row.actual = 0;
      o[key] = row;
    }
    return o;
  };
  const team = initRollup();
  const se = initRollup();
  const nyc = initRollup();

  for (const r of grid.slice(2)) {
    const name = r[1];
    if (typeof name !== 'string' || !name.includes(',')) continue;
    const trimmed = name.trim();
    const region = regionByName[trimmed] ?? '';
    const market = marketByName[trimmed] ?? '';

    const memberRows: Record<string, CalcRow> = {};
    let hasAny = false;

    for (const { col, key } of periods) {
      const g = num(r[col - 3]);
      const a = num(r[col - 2]);

      const row = empty();
      row.monthlyGoal = g;
      row.actual = a;
      if (g !== null && a !== null) {
        row.actVarDollar = +(a - g).toFixed(2);
        row.actVarPct = g !== 0 ? +(a / g).toFixed(4) : null;
      }
      memberRows[key] = row;
      if (g !== null || a !== null) hasAny = true;

      if (g !== null) team[key].monthlyGoal = (team[key].monthlyGoal ?? 0) + g;
      if (a !== null) team[key].actual = (team[key].actual ?? 0) + a;
      if (region === 'Southeast') {
        if (g !== null) se[key].monthlyGoal = (se[key].monthlyGoal ?? 0) + g;
        if (a !== null) se[key].actual = (se[key].actual ?? 0) + a;
      }
      if (region === 'Northeast') {
        if (g !== null) nyc[key].monthlyGoal = (nyc[key].monthlyGoal ?? 0) + g;
        if (a !== null) nyc[key].actual = (nyc[key].actual ?? 0) + a;
      }
    }

    if (hasAny) out.members[trimmed] = { name: trimmed, market, region, rows: memberRows };
    if (trimmed === 'Bellack, Hallie') out.hallie = memberRows;
    if (trimmed === 'Griffith, Matthew') out.matt = memberRows;
  }

  for (const r of [team, se, nyc]) {
    for (const key of Object.keys(r)) {
      const row = r[key];
      const g = row.monthlyGoal, a = row.actual;
      if (g !== null && a !== null) {
        row.actVarDollar = +(a - g).toFixed(2);
        row.actVarPct = g !== 0 ? +(a / g).toFixed(4) : null;
      }
    }
  }
  out.team = team;
  out.southeast = se;
  out.nyc = nyc;
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
      memberCount: Object.keys(parsed.members).length,
    },
  };
};

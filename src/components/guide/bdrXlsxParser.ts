import * as XLSX from 'xlsx';
import type { CalcRow } from './bdrCalculatorData';
import { MONTHS, QUARTERS } from './bdrCalculatorData';

// Parses Hallie's "Calculator" sheet and Matt's GP rows from "2026 Goals Firm" + "% of BDRs to Goal".
// Returns one CalcRow record keyed like "2026-Mar", "2026-Q1", "2026-All".

const FIELD_ORDER: (keyof CalcRow)[] = [
  'monthlyGoal','actual','actVarDollar','actDaysNeeded','actVarPct','actBookingsToGoal',
  'gpGroupPipe','gpExistingPipe','totalPipe','actPlusPipe','expVarDollar','expVarPct',
  'remainPipeNeed','expDaysNeeded','expBookings','commEarned','commForecast','totalCommPred',
];

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const emptyRow = (): CalcRow => Object.fromEntries(FIELD_ORDER.map(k => [k, null])) as CalcRow;

const findSheet = (wb: XLSX.WorkBook, ...needles: string[]): XLSX.WorkSheet | null => {
  for (const name of wb.SheetNames) {
    const lc = name.toLowerCase();
    if (needles.every(n => lc.includes(n.toLowerCase()))) return wb.Sheets[name];
  }
  return null;
};

const sheetToGrid = (ws: XLSX.WorkSheet): unknown[][] =>
  XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: null }) as unknown[][];

const labelMatches = (cell: unknown, label: string): boolean => {
  if (typeof cell !== 'string') return false;
  return cell.trim().toLowerCase().startsWith(label.toLowerCase());
};

// Parse Hallie from "Calculator" sheet.
// Layout: column A holds month/quarter labels; columns B..S hold the 18 KPI fields in FIELD_ORDER.
const parseHallie = (wb: XLSX.WorkBook): Record<string, CalcRow> => {
  const ws = findSheet(wb, 'calculator');
  if (!ws) return {};
  const grid = sheetToGrid(ws);
  const out: Record<string, CalcRow> = {};

  for (const row of grid) {
    if (!row || row.length === 0) continue;
    const label = typeof row[0] === 'string' ? row[0].trim() : '';
    if (!label) continue;

    let key: string | null = null;
    // Match "Jan 2025", "January 2026", "2026 Jan", "Mar-26", etc.
    for (const yr of [2025, 2026]) {
      for (const m of MONTHS) {
        const re = new RegExp(`(${m}|${monthLong(m)})[\\s\\-,]*${yr}|${yr}[\\s\\-,]*(${m}|${monthLong(m)})`, 'i');
        if (re.test(label)) { key = `${yr}-${m}`; break; }
      }
      if (key) break;
      for (const q of QUARTERS) {
        const re = new RegExp(`${q}[\\s\\-,]*${yr}|${yr}[\\s\\-,]*${q}`, 'i');
        if (re.test(label)) { key = `${yr}-${q}`; break; }
      }
      if (key) break;
      if (new RegExp(`^${yr}\\b.*\\b(all|total|year)\\b`, 'i').test(label) ||
          new RegExp(`\\b(all|total|year)\\b.*\\b${yr}\\b`, 'i').test(label)) {
        key = `${yr}-All`; break;
      }
    }
    if (!key) continue;

    const r = emptyRow();
    FIELD_ORDER.forEach((field, i) => {
      r[field] = num(row[i + 1]);
    });
    out[key] = r;
  }

  return out;
};

const monthLong = (m: string): string => ({
  Jan:'January',Feb:'February',Mar:'March',Apr:'April',May:'May',Jun:'June',
  Jul:'July',Aug:'August',Sep:'September',Oct:'October',Nov:'November',Dec:'December',
}[m] ?? m);

// Parse Matt from "2026 Goals Firm" (GP goal) + "% of BDRs to Goal" or "BDR Standings" (actual).
const parseMatt = (wb: XLSX.WorkBook): Record<string, CalcRow> => {
  const out: Record<string, CalcRow> = {};
  const goalsSheet = findSheet(wb, 'goals') ?? findSheet(wb, '2026', 'goal');
  const standingsSheet =
    findSheet(wb, 'standings') ??
    findSheet(wb, '%', 'goal') ??
    findSheet(wb, 'bdr', 'goal');

  const goalsRow = goalsSheet ? findRowFor(goalsSheet, 'griffith') ?? findRowFor(goalsSheet, 'matt') : null;
  const standingsRow = standingsSheet ? findRowFor(standingsSheet, 'griffith') ?? findRowFor(standingsSheet, 'matt') : null;

  // Find the column index for each month/quarter on each sheet by reading the header rows.
  const goalsCols = goalsSheet ? findPeriodCols(goalsSheet, 2026) : {};
  const standingsCols = standingsSheet ? findPeriodCols(standingsSheet, 2026) : {};

  const periods = [...MONTHS.map(m => `2026-${m}`), ...QUARTERS.map(q => `2026-${q}`), '2026-All'];
  for (const p of periods) {
    const r = emptyRow();
    if (goalsRow && goalsCols[p] !== undefined) r.monthlyGoal = num(goalsRow[goalsCols[p]]);
    if (standingsRow && standingsCols[p] !== undefined) r.actual = num(standingsRow[standingsCols[p]]);
    if (r.monthlyGoal !== null && r.actual !== null) {
      r.actVarDollar = +(r.actual - r.monthlyGoal).toFixed(2);
      r.actVarPct = r.monthlyGoal !== 0 ? +(r.actual / r.monthlyGoal).toFixed(4) : null;
    }
    if (r.monthlyGoal !== null || r.actual !== null) out[p] = r;
  }
  return out;
};

const findRowFor = (ws: XLSX.WorkSheet, needle: string): unknown[] | null => {
  const grid = sheetToGrid(ws);
  for (const row of grid) {
    if (!row) continue;
    for (const cell of row.slice(0, 4)) {
      if (typeof cell === 'string' && cell.toLowerCase().includes(needle.toLowerCase())) return row;
    }
  }
  return null;
};

// Walk top rows looking for headers like "Jan", "Q1", "2026 All", returning column indexes.
const findPeriodCols = (ws: XLSX.WorkSheet, year: number): Record<string, number> => {
  const grid = sheetToGrid(ws);
  const cols: Record<string, number> = {};
  const headerRows = grid.slice(0, 6);
  for (const row of headerRows) {
    if (!row) continue;
    row.forEach((cell, idx) => {
      if (typeof cell !== 'string' && typeof cell !== 'number') return;
      const s = String(cell).trim();
      for (const m of MONTHS) {
        if (new RegExp(`^${m}|^${monthLong(m)}`, 'i').test(s)) {
          cols[`${year}-${m}`] = idx;
        }
      }
      for (const q of QUARTERS) {
        if (new RegExp(`^${q}\\b`, 'i').test(s)) cols[`${year}-${q}`] = idx;
      }
      if (/^(year|total|all|annual|fy)/i.test(s)) cols[`${year}-All`] = idx;
    });
  }
  return cols;
};

export interface ParsedSnapshot {
  hallie: Record<string, CalcRow>;
  matt: Record<string, CalcRow>;
  diagnostics: { hallieKeys: number; mattKeys: number; sheetNames: string[] };
}

export const parseWorkbook = async (file: File): Promise<ParsedSnapshot> => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const hallie = parseHallie(wb);
  const matt = parseMatt(wb);
  return {
    hallie,
    matt,
    diagnostics: {
      hallieKeys: Object.keys(hallie).length,
      mattKeys: Object.keys(matt).length,
      sheetNames: wb.SheetNames,
    },
  };
};

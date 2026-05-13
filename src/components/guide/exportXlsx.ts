import * as XLSX from 'xlsx';

export function exportRowsToXlsx(rows: Record<string, unknown>[], filename: string, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || 'Sheet1');
  const safe = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, safe);
}

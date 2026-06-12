import { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBdr } from './BdrContext';

export interface ImportedContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  source: 'zoominfo';
  added_at: string;
}

// Logical field keys we want to map to.
interface FieldDef { key: FieldKey; label: string; required?: boolean }
const FIELDS: FieldDef[] = [
  { key: 'company', label: 'Company Name', required: true },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'title', label: 'Job Title' },
  { key: 'email', label: 'Email' },
  { key: 'direct_phone', label: 'Direct Phone' },
  { key: 'mobile_phone', label: 'Mobile Phone' },
  { key: 'website', label: 'Website' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'employees', label: 'Employees' },
];
type FieldKey =
  | 'company' | 'first_name' | 'last_name' | 'title' | 'email'
  | 'direct_phone' | 'mobile_phone' | 'website' | 'city' | 'state' | 'employees';

// Common ZoomInfo header aliases → logical key.
const HEADER_ALIASES: Record<FieldKey, string[]> = {
  company: ['company name', 'company', 'account name', 'organization'],
  first_name: ['first name', 'firstname', 'first'],
  last_name: ['last name', 'lastname', 'last', 'surname'],
  title: ['job title', 'title', 'position'],
  email: ['email', 'email address', 'work email'],
  direct_phone: ['direct phone', 'direct dial', 'direct line', 'office phone', 'work phone'],
  mobile_phone: ['mobile phone', 'mobile', 'cell phone', 'cell'],
  website: ['website', 'company website', 'url', 'domain'],
  city: ['city', 'company city', 'hq city'],
  state: ['state', 'company state', 'hq state', 'state/province'],
  employees: ['employees', 'employee count', 'company size', '# of employees'],
};

const normHeader = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

const autoMap = (headers: string[]): Record<FieldKey, string> => {
  const out = {} as Record<FieldKey, string>;
  for (const f of FIELDS) out[f.key] = '';
  const normed = headers.map(h => ({ raw: h, n: normHeader(h) }));
  for (const f of FIELDS) {
    const aliases = HEADER_ALIASES[f.key];
    const hit = normed.find(h => aliases.includes(h.n));
    if (hit) out[f.key] = hit.raw;
  }
  return out;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onImported?: () => void;
}

const ImportContactsSheet = ({ open, onClose, onImported }: Props) => {
  const { selected } = useBdr();
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<{ appended: number; created: number; duped: number } | null>(null);

  const reset = () => {
    setFileName(''); setHeaders([]); setRows([]);
    setMapping({} as Record<FieldKey, string>);
    setSummary(null);
  };

  const close = () => { if (!importing) { reset(); onClose(); } };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setSummary(null);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const hs = res.meta.fields ?? [];
        setHeaders(hs);
        setRows(res.data.filter(r => Object.values(r).some(v => (v ?? '').toString().trim())));
        setMapping(autoMap(hs));
      },
      error: () => toast.error('Could not parse CSV'),
    });
  };

  const validRows = useMemo(() => {
    const companyCol = mapping.company;
    if (!companyCol) return [];
    return rows.filter(r => (r[companyCol] ?? '').trim());
  }, [rows, mapping]);

  const runImport = async () => {
    if (!selected) { toast.error('Select a BDR first'); return; }
    if (!mapping.company) { toast.error('Map the Company Name column'); return; }
    if (!validRows.length) { toast.error('No rows with a company name'); return; }

    setImporting(true);
    try {
      const { data: existing, error: exErr } = await supabase
        .from('opportunities')
        .select('id, company, contacts, active_intent, source_type, priority, signal_type, verified')
        .eq('assigned_bdr', selected.id);
      if (exErr) throw exErr;

      const byCompany = new Map<string, typeof existing[number]>();
      (existing ?? []).forEach(o => byCompany.set(o.company.trim().toLowerCase(), o));

      // Group CSV rows by company name (lowercased) so we batch updates.
      type Grouped = { displayCompany: string; market: string | null; contacts: ImportedContact[] };
      const groups = new Map<string, Grouped>();

      const get = (row: Record<string, string>, key: FieldKey) => {
        const col = mapping[key];
        return col ? (row[col] ?? '').toString().trim() : '';
      };

      for (const row of validRows) {
        const company = get(row, 'company');
        if (!company) continue;
        const k = company.toLowerCase();
        const first = get(row, 'first_name');
        const last = get(row, 'last_name');
        const name = [first, last].filter(Boolean).join(' ').trim();
        const email = get(row, 'email').toLowerCase();
        const directPhone = get(row, 'direct_phone');
        const mobilePhone = get(row, 'mobile_phone');
        const phone = directPhone || mobilePhone;
        const contact: ImportedContact = {
          name,
          title: get(row, 'title'),
          email,
          phone,
          source: 'zoominfo',
          added_at: new Date().toISOString(),
        };
        const city = get(row, 'city');
        const state = get(row, 'state');
        const market = [city, state].filter(Boolean).join(', ') || null;

        const existingGroup = groups.get(k);
        if (existingGroup) {
          existingGroup.contacts.push(contact);
          if (!existingGroup.market && market) existingGroup.market = market;
        } else {
          groups.set(k, { displayCompany: company, market, contacts: [contact] });
        }
      }

      let appended = 0;
      let created = 0;
      let duped = 0;

      const dedupe = (list: ImportedContact[]): { kept: ImportedContact[]; skipped: number } => {
        const seen = new Set<string>();
        const kept: ImportedContact[] = [];
        let skipped = 0;
        for (const c of list) {
          const k = c.email || `${c.name.toLowerCase()}|${c.title.toLowerCase()}`;
          if (!k) { kept.push(c); continue; }
          if (seen.has(k)) { skipped++; continue; }
          seen.add(c.email ? c.email : `${c.name.toLowerCase()}|${c.title.toLowerCase()}`);
          kept.push(c);
        }
        return { kept, skipped };
      };

      for (const [k, g] of groups) {
        const match = byCompany.get(k);
        if (match) {
          const existingContacts = (Array.isArray(match.contacts) ? match.contacts : []) as ImportedContact[];
          const combined = [...existingContacts, ...g.contacts];
          const { kept, skipped } = dedupe(combined);
          duped += skipped;
          appended += kept.length - existingContacts.length;
          const { error } = await supabase
            .from('opportunities')
            .update({ contacts: kept, active_intent: true })
            .eq('id', match.id);
          if (error) throw error;
        } else {
          const { kept, skipped } = dedupe(g.contacts);
          duped += skipped;
          const { error } = await supabase.from('opportunities').insert({
            company: g.displayCompany,
            market: g.market,
            vertical: null,
            signal_type: 'Active Intent (ZoomInfo)',
            description: 'Company showing active buyer intent on housing-related topics',
            why_it_matters: 'Imported from ZoomInfo intent signal — buying-stage account.',
            priority: 'Top Priority',
            verified: true,
            active_intent: true,
            source_type: 'zoominfo_intent',
            assigned_bdr: selected.id,
            contacts: kept,
            status: 'new',
            discovery_score: 85,
            housing_fit_score: 80,
            confidence_score: 80,
          });
          if (error) throw error;
          created++;
        }
      }

      setSummary({ appended, created, duped });
      toast.success(`Import complete — ${appended} appended, ${created} new, ${duped} duplicates skipped`);
      onImported?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg font-extrabold" style={{ color: '#0F172A' }}>
            Import Contacts from ZoomInfo
          </SheetTitle>
          <p className="text-[12px] text-muted-foreground">
            Upload a ZoomInfo CSV export. Matching companies get contacts attached + 🔥 Active Intent. New companies become Top-Priority intent leads.
          </p>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          {!headers.length && (
            <label
              className="block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:bg-slate-50"
              style={{ borderColor: '#E2E8F0' }}
            >
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <div className="text-[13px] font-semibold" style={{ color: '#0F172A' }}>Click to upload CSV</div>
              <div className="text-[11px] mt-1" style={{ color: '#64748B' }}>ZoomInfo company / contact export</div>
            </label>
          )}

          {headers.length > 0 && !summary && (
            <>
              <div className="text-[12px]" style={{ color: '#64748B' }}>
                <strong style={{ color: '#0F172A' }}>{fileName}</strong> · {rows.length} rows detected
              </div>

              <div className="rounded-lg border" style={{ borderColor: '#E2E8F0' }}>
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-b" style={{ background: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }}>
                  Column mapping
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FIELDS.map(f => (
                    <label key={f.key} className="text-[12px]" style={{ color: '#1e293b' }}>
                      <div className="font-semibold mb-1">
                        {f.label}{f.required && <span style={{ color: '#DC2626' }}> *</span>}
                      </div>
                      <select
                        value={mapping[f.key] ?? ''}
                        onChange={(e) => setMapping(m => ({ ...m, [f.key]: e.target.value }))}
                        className="w-full px-2 py-1.5 text-[12px] rounded border"
                        style={{ borderColor: '#E2E8F0', background: '#FFFFFF' }}
                      >
                        <option value="">— ignore —</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <button
                  onClick={reset}
                  disabled={importing}
                  className="text-[12px] px-3 py-2 rounded border"
                  style={{ borderColor: '#E2E8F0', color: '#475569', background: '#FFFFFF' }}
                >
                  Choose another file
                </button>
                <button
                  onClick={runImport}
                  disabled={importing || !mapping.company || !validRows.length || !selected}
                  className="text-[12px] font-bold px-4 py-2 rounded text-white"
                  style={{ background: importing || !mapping.company || !validRows.length || !selected ? '#94A3B8' : '#0F172A' }}
                >
                  {importing ? 'Importing…' : `Import ${validRows.length} row${validRows.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </>
          )}

          {summary && (
            <div className="rounded-lg p-4 space-y-2" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div className="text-[14px] font-extrabold" style={{ color: '#15803D' }}>✓ Import complete</div>
              <ul className="text-[12px] space-y-1" style={{ color: '#1e293b' }}>
                <li>📎 <strong>{summary.appended}</strong> contact{summary.appended === 1 ? '' : 's'} added to existing leads</li>
                <li>🔥 <strong>{summary.created}</strong> new Active Intent lead{summary.created === 1 ? '' : 's'} created</li>
                <li>🚫 <strong>{summary.duped}</strong> duplicate{summary.duped === 1 ? '' : 's'} skipped</li>
              </ul>
              <div className="flex justify-end pt-2">
                <button
                  onClick={close}
                  className="text-[12px] font-bold px-4 py-2 rounded text-white"
                  style={{ background: '#0F172A' }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ImportContactsSheet;

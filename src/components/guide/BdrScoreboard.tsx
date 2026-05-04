import { useEffect, useMemo, useRef, useState } from 'react';
import Eyebrow from './Eyebrow';
import { BDRS, KPI_LABELS, MONTHS, QUARTERS, revenueForGp, type CalcRow, type BDR } from './bdrCalculatorData';
import { parseWorkbook } from './bdrXlsxParser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const fmt = (v: number | null, kind: 'currency' | 'percent' | 'number') => {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (kind === 'currency') {
    const sign = v < 0 ? '-' : '';
    return `${sign}$${Math.abs(Math.round(v)).toLocaleString()}`;
  }
  if (kind === 'percent') return `${(v * 100).toFixed(1)}%`;
  return v.toFixed(1);
};

const YEARS = [2026, 2025] as const;

interface SnapshotMeta {
  refreshedAt: string;
  sourceFilename: string | null;
}

type View = 'bdr' | 'team' | 'southeast' | 'nyc';


const BdrScoreboard = () => {
  const [view, setView] = useState<View>('bdr');
  const [bdrId, setBdrId] = useState(BDRS[0].id);
  const now = new Date();
  const [year, setYear] = useState<number>(2026);
  const [period, setPeriod] = useState<string>(MONTHS[Math.min(now.getMonth(), 11)]);
  const [overrides, setOverrides] = useState<Record<string, Record<string, CalcRow>>>({});
  const [meta, setMeta] = useState<Record<string, SnapshotMeta>>({});
  const [refreshing, setRefreshing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const STORAGE_KEY = 'bdr_snapshot_v1';

  // Hydrate from localStorage immediately, then overlay backend rows if signed in
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { overrides: Record<string, Record<string, CalcRow>>; meta: Record<string, SnapshotMeta> };
        if (cached.overrides) setOverrides(cached.overrides);
        if (cached.meta) setMeta(cached.meta);
      }
    } catch { /* ignore */ }

    (async () => {
      const { data, error } = await supabase
        .from('bdr_snapshots')
        .select('bdr_id, data, source_filename, refreshed_at');
      if (error || !data || data.length === 0) return;
      const o: Record<string, Record<string, CalcRow>> = {};
      const m: Record<string, SnapshotMeta> = {};
      for (const row of data) {
        o[row.bdr_id] = row.data as unknown as Record<string, CalcRow>;
        m[row.bdr_id] = { refreshedAt: row.refreshed_at, sourceFilename: row.source_filename };
      }
      setOverrides(prev => ({ ...prev, ...o }));
      setMeta(prev => ({ ...prev, ...m }));
    })();
  }, []);

  const baseBdr: BDR = useMemo(() => {
    const base = BDRS.find(b => b.id === bdrId)!;
    const ov = overrides[bdrId];
    if (!ov) return base;
    return { ...base, rows: { ...base.rows, ...ov } };
  }, [bdrId, overrides]);

  // Synthetic "BDR" for region/team views built from aggregated rollups
  const regionBdr: BDR | null = useMemo(() => {
    if (view === 'bdr') return null;
    const ovKey = view === 'team' ? '__team' : view === 'southeast' ? '__southeast' : '__nyc';
    const rows = overrides[ovKey] ?? {};
    const annualGp = rows['2026-All']?.monthlyGoal ?? 0;
    // Approximate annual revenue with team-wide GP margin (~25%) so the revenue card stays sensible.
    const annualRev = annualGp ? Math.round(annualGp / 0.25) : 0;
    const label = view === 'team' ? 'Full Team' : view === 'southeast' ? 'Southeast' : 'NYC / Northeast';
    return { id: ovKey, name: label, market: 'Rollup', annualRevenueGoal: annualRev, annualGpGoal: annualGp, rows };
  }, [view, overrides]);

  const bdr: BDR = regionBdr ?? baseBdr;

  const key = `${year}-${period}`;
  const row: CalcRow | undefined = bdr.rows[key];

  const quarterTotals = useMemo(
    () => QUARTERS.map(q => bdr.rows[`${year}-${q}`]),
    [bdr, year]
  );
  const yearTotal = bdr.rows[`${year}-All`];

  const onTrack = row && row.monthlyGoal != null && row.actual != null && row.actual >= row.monthlyGoal;
  const accent = onTrack ? '#10B981' : '#fb923c';


  const handleRefreshClick = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setRefreshing(true);
    try {
      const parsed = await parseWorkbook(file);
      const updates: Array<{ bdr_id: string; data: Record<string, CalcRow>; rows: number }> = [];
      const push = (id: string, data: Record<string, CalcRow>) => {
        if (Object.keys(data).length > 0) updates.push({ bdr_id: id, data, rows: Object.keys(data).length });
      };
      push('hallie', parsed.hallie);
      push('matt', parsed.matt);
      push('__team', parsed.team);
      push('__southeast', parsed.southeast);
      push('__nyc', parsed.nyc);
      // Stash full per-member breakdown under one row so region views can list each contributor.
      if (Object.keys(parsed.members).length > 0) {
        updates.push({ bdr_id: '__members', data: parsed.members as unknown as Record<string, CalcRow>, rows: Object.keys(parsed.members).length });
      }

      if (updates.length === 0) {
        toast({
          title: 'Could not read the file',
          description: `No matching rows found. Sheets seen: ${parsed.diagnostics.sheetNames.join(', ')}`,
          variant: 'destructive',
        });
        return;
      }

      const newOv = { ...overrides };
      const newMeta = { ...meta };
      const refreshedAt = new Date().toISOString();
      for (const u of updates) {
        newOv[u.bdr_id] = u.data;
        newMeta[u.bdr_id] = { refreshedAt, sourceFilename: file.name };
      }
      setOverrides(newOv);
      setMeta(newMeta);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ overrides: newOv, meta: newMeta })); } catch { /* ignore */ }

      const memberCount = parsed.diagnostics.memberCount;
      const summary = `${memberCount} BDR${memberCount === 1 ? '' : 's'} parsed from ${file.name}`;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Numbers refreshed',
          description: `${summary}. Saved to this browser. Sign in to sync across devices.`,
        });
        return;
      }

      const payload = updates.map(u => ({
        bdr_id: u.bdr_id,
        data: u.data as unknown as Record<string, unknown>,
        source_filename: file.name,
        refreshed_by: user.id,
        refreshed_at: refreshedAt,
      }));

      const { error } = await supabase.from('bdr_snapshots').upsert(payload as never, { onConflict: 'bdr_id' });
      toast({
        title: error ? 'Loaded locally only' : 'Numbers refreshed',
        description: error
          ? `The workbook loaded into this session, but couldn't be saved to the backend: ${error.message}`
          : `Updated ${updates.map(u => `${u.bdr_id} (${u.rows} rows)`).join(', ')}.`,
        variant: error ? 'destructive' : 'default',
      });
    } catch (err) {
      toast({
        title: 'Parse error',
        description: err instanceof Error ? err.message : 'Could not read the file.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const lastRefresh = view === 'bdr' ? meta[bdrId] : (meta['__team'] ?? meta['__southeast'] ?? meta['__nyc']);
  const lastRefreshLabel = lastRefresh
    ? `Refreshed ${new Date(lastRefresh.refreshedAt).toLocaleString()} · ${lastRefresh.sourceFilename ?? 'uploaded file'}`
    : 'Using baked-in snapshot · click Refresh to upload latest';

  const rollupKey = `${year}-${period}`;
  const teamRow = overrides['__team']?.[rollupKey];
  const seRow = overrides['__southeast']?.[rollupKey];
  const nycRow = overrides['__nyc']?.[rollupKey];

  const FilterTab = ({ id, label, sub, r, dark }: { id: View; label: string; sub: string; r?: CalcRow; dark?: boolean }) => {
    const active = view === id;
    const pct = r && r.monthlyGoal && r.actual != null ? r.actual / r.monthlyGoal : null;
    const hit = pct != null && pct >= 1;
    const onClick = () => setView(id);
    return (
      <button
        onClick={onClick}
        type="button"
        className="text-left p-3 rounded-lg transition-all"
        style={{
          background: dark ? '#0e1e3a' : '#fff',
          border: `2px solid ${active ? '#fb923c' : (dark ? '#0e1e3a' : 'rgba(14,30,58,.06)')}`,
          boxShadow: active ? '0 4px 12px rgba(251,146,60,.25)' : 'none',
          cursor: 'pointer',
        }}
      >
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: dark ? '#fbbf24' : (active ? '#fb923c' : '#64748b') }}>
          {label}
        </div>
        {r ? (
          <>
            <div className="text-[18px] font-extrabold tabular-nums" style={{ color: dark ? '#fff' : '#0e1e3a' }}>
              {fmt(r.actual ?? null, 'currency')}
            </div>
            <div className="text-[10px] mt-0.5 tabular-nums" style={{ color: dark ? 'rgba(255,255,255,.7)' : '#94a3b8' }}>
              goal {fmt(r.monthlyGoal ?? null, 'currency')} · {pct != null ? `${(pct*100).toFixed(0)}%` : '—'} {pct != null && (hit ? '✓' : '⚠')}
            </div>
          </>
        ) : (
          <div className="text-[11px]" style={{ color: dark ? 'rgba(255,255,255,.6)' : '#94a3b8' }}>{sub}</div>
        )}
      </button>
    );
  };

  return (
    <div className="p-5 rounded-xl mb-5" style={{ background: '#FAF7F2', border: '1px solid rgba(14,30,58,.08)' }}>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFile}
      />

      <div className="mb-4">
        <Eyebrow gradient="linear-gradient(90deg, #fb923c, #fbbf24)">View · click to filter</Eyebrow>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
          <FilterTab id="bdr" label="Individual BDR" sub={`${baseBdr.name}`} r={view === 'bdr' ? baseBdr.rows[rollupKey] : undefined} />
          <FilterTab id="team" label="Full Team" sub="All BDRs" r={teamRow} dark />
          <FilterTab id="southeast" label="Southeast" sub="Hallie + Matt + region" r={seRow} />
          <FilterTab id="nyc" label="NYC / Northeast" sub="Northeast region" r={nycRow} />
        </div>
      </div>


      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <div>
          <Eyebrow gradient="linear-gradient(90deg, #fb923c, #fbbf24)">BDR Scoreboard</Eyebrow>
          <h3 className="text-[18px] font-extrabold tracking-tight mt-1" style={{ color: '#0e1e3a' }}>
            {bdr.name} <span className="font-medium" style={{ color: '#64748b' }}>· {bdr.market}</span>
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>{lastRefreshLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefreshClick}
            disabled={refreshing}
            className="text-[12px] font-bold rounded-lg px-3 py-2 inline-flex items-center gap-1.5 transition-opacity disabled:opacity-60"
            style={{ background: '#fb923c', color: '#fff', border: '1px solid #fb923c' }}
            title="Upload the latest Sales Forecasting .xlsx to refresh Hallie + Matt"
          >
            <span>{refreshing ? '⏳' : '↻'}</span>
            <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
          {view === 'bdr' && (
            <select
              value={bdrId}
              onChange={(e) => setBdrId(e.target.value)}
              className="text-[12px] font-semibold rounded-lg px-3 py-2 border outline-none"
              style={{ borderColor: 'rgba(14,30,58,.15)', background: '#fff', color: '#0e1e3a' }}
            >
              {BDRS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-[12px] font-semibold rounded-lg px-3 py-2 border outline-none"
            style={{ borderColor: 'rgba(14,30,58,.15)', background: '#fff', color: '#0e1e3a' }}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-[12px] font-semibold rounded-lg px-3 py-2 border outline-none"
            style={{ borderColor: 'rgba(14,30,58,.15)', background: '#fff', color: '#0e1e3a' }}
          >
            <optgroup label="Months">
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </optgroup>
            <optgroup label="Quarters">
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </optgroup>
            <optgroup label="Year">
              <option value="All">Full Year</option>
            </optgroup>
          </select>
        </div>
      </div>

      {!row && (
        <div className="p-4 rounded-lg text-[12px]" style={{ background: '#fff', color: '#64748b', border: '1px dashed rgba(14,30,58,.15)' }}>
          No data for {bdr.name} · {key}.
        </div>
      )}

      {row && (
        <>
          <div className="mb-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
               style={{ background: `${accent}1A`, color: accent }}>
            <span>{onTrack ? '✓ Hitting GP Goal' : '⚠ Behind GP Goal'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="p-3 rounded-lg" style={{ background: '#0e1e3a', border: '1px solid #0e1e3a' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#fbbf24' }}>Top Line Revenue Goal · Annual</div>
              <div className="text-[20px] font-extrabold tabular-nums" style={{ color: '#fff' }}>{fmt(bdr.annualRevenueGoal, 'currency')}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,.6)' }}>Annual GP Goal {fmt(bdr.annualGpGoal, 'currency')}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.06)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Revenue Needed to Hit GP Goal · {period}</div>
              <div className="text-[20px] font-extrabold tabular-nums" style={{ color: '#0e1e3a' }}>{fmt(revenueForGp(bdr, row.monthlyGoal), 'currency')}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>From GP goal {fmt(row.monthlyGoal, 'currency')}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.06)' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Revenue Booked (implied) · {period}</div>
              <div className="text-[20px] font-extrabold tabular-nums" style={{ color: '#0e1e3a' }}>{fmt(revenueForGp(bdr, row.actual), 'currency')}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>From actual GP {fmt(row.actual, 'currency')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {KPI_LABELS.map(({ key: k, label, format }) => {
              const v = row[k];
              const isHero = k === 'monthlyGoal' || k === 'actual' || k === 'totalCommPred';
              const negative = format === 'currency' && typeof v === 'number' && v < 0;
              return (
                <div key={k} className="p-3 rounded-lg" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.06)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>{label}</div>
                  <div className={`tabular-nums ${isHero ? 'text-[18px] font-extrabold' : 'text-[14px] font-bold'}`}
                       style={{ color: negative ? '#dc2626' : '#0e1e3a' }}>
                    {fmt(v, format)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view !== 'bdr' && (() => {
        const members = (overrides['__members'] as unknown as Record<string, { name: string; market: string; region: string; rows: Record<string, CalcRow> }>) || {};
        const list = Object.values(members).filter(m => {
          if (view === 'team') return true;
          if (view === 'southeast') return m.region === 'Southeast';
          if (view === 'nyc') return m.region === 'Northeast';
          return false;
        });
        list.sort((a, b) => (b.rows[rollupKey]?.actual ?? 0) - (a.rows[rollupKey]?.actual ?? 0));
        if (list.length === 0) {
          return (
            <div className="mt-4 pt-4 border-t text-[12px]" style={{ borderColor: 'rgba(14,30,58,.08)', color: '#94a3b8' }}>
              No per-BDR breakdown yet — click Refresh to load the latest workbook.
            </div>
          );
        }
        return (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(14,30,58,.08)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
              {bdr.name} · {period} breakdown ({list.length} BDR{list.length === 1 ? '' : 's'})
            </div>
            <div className="overflow-hidden rounded-lg" style={{ border: '1px solid rgba(14,30,58,.08)' }}>
              <table className="w-full text-[12px]">
                <thead style={{ background: '#fff' }}>
                  <tr style={{ color: '#64748b' }}>
                    <th className="text-left px-3 py-2 font-bold uppercase tracking-wider text-[10px]">BDR</th>
                    <th className="text-left px-3 py-2 font-bold uppercase tracking-wider text-[10px]">Market</th>
                    <th className="text-left px-3 py-2 font-bold uppercase tracking-wider text-[10px]">Region</th>
                    <th className="text-right px-3 py-2 font-bold uppercase tracking-wider text-[10px]">Goal</th>
                    <th className="text-right px-3 py-2 font-bold uppercase tracking-wider text-[10px]">Actual</th>
                    <th className="text-right px-3 py-2 font-bold uppercase tracking-wider text-[10px]">Var $</th>
                    <th className="text-right px-3 py-2 font-bold uppercase tracking-wider text-[10px]">% Goal</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m, i) => {
                    const r = m.rows[rollupKey];
                    const pct = r && r.monthlyGoal && r.actual != null ? r.actual / r.monthlyGoal : null;
                    const hit = pct != null && pct >= 1;
                    const varNeg = r?.actVarDollar != null && r.actVarDollar < 0;
                    return (
                      <tr key={m.name} style={{ background: i % 2 ? '#FAF7F2' : '#fff', borderTop: '1px solid rgba(14,30,58,.06)' }}>
                        <td className="px-3 py-2 font-bold" style={{ color: '#0e1e3a' }}>{m.name}</td>
                        <td className="px-3 py-2" style={{ color: '#64748b' }}>{m.market}</td>
                        <td className="px-3 py-2" style={{ color: '#64748b' }}>{m.region}</td>
                        <td className="px-3 py-2 text-right tabular-nums" style={{ color: '#0e1e3a' }}>{fmt(r?.monthlyGoal ?? null, 'currency')}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold" style={{ color: '#0e1e3a' }}>{fmt(r?.actual ?? null, 'currency')}</td>
                        <td className="px-3 py-2 text-right tabular-nums" style={{ color: varNeg ? '#dc2626' : '#10B981' }}>{fmt(r?.actVarDollar ?? null, 'currency')}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold" style={{ color: hit ? '#10B981' : '#fb923c' }}>
                          {pct != null ? `${(pct*100).toFixed(0)}%` : '—'} {pct != null && (hit ? '✓' : '⚠')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(14,30,58,.08)' }}>
        <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>{year} Quarter Rollup</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {QUARTERS.map((q, i) => {
            const qr = quarterTotals[i];
            return (
              <div key={q} className="p-2.5 rounded-lg" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.06)' }}>
                <div className="text-[10px] font-bold" style={{ color: '#64748b' }}>{q}</div>
                <div className="text-[13px] font-extrabold tabular-nums" style={{ color: '#0e1e3a' }}>{fmt(qr?.actual ?? null, 'currency')}</div>
                <div className="text-[10px] tabular-nums" style={{ color: '#94a3b8' }}>goal {fmt(qr?.monthlyGoal ?? null, 'currency')}</div>
              </div>
            );
          })}
          <div className="p-2.5 rounded-lg" style={{ background: '#0e1e3a', border: '1px solid #0e1e3a' }}>
            <div className="text-[10px] font-bold" style={{ color: '#fbbf24' }}>Year</div>
            <div className="text-[13px] font-extrabold tabular-nums" style={{ color: '#fff' }}>{fmt(yearTotal?.actual ?? null, 'currency')}</div>
            <div className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,.6)' }}>goal {fmt(yearTotal?.monthlyGoal ?? null, 'currency')}</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BdrScoreboard;

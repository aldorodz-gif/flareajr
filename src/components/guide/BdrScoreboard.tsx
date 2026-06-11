import { useEffect, useMemo, useRef, useState } from 'react';
import Eyebrow from './Eyebrow';
import { BDRS, KPI_LABELS, MONTHS, QUARTERS, revenueForGp, type CalcRow, type BDR } from './bdrCalculatorData';
import { parseWorkbook } from './bdrXlsxParser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useBdr } from './BdrContext';

const fmt = (v: number | null, kind: 'currency' | 'percent' | 'number') => {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  if (kind === 'currency') {
    const sign = v < 0 ? '-' : '';
    return `${sign}$${Math.abs(Math.round(v)).toLocaleString()}`;
  }
  if (kind === 'percent') return `${(v * 100).toFixed(1)}%`;
  return v.toFixed(1);
};

// Goal-hit semantics shared across all GP tiles.
// Hit when: goal is known and either non-positive, or actual has met/exceeded it.
// Returns null `hit` when there is not enough data to judge (goal missing).
const gpStatus = (goal: number | null | undefined, actual: number | null | undefined) => {
  if (goal == null || Number.isNaN(goal)) return { hit: null as boolean | null, remaining: null as number | null, over: null as number | null };
  if (goal <= 0) return { hit: true, remaining: 0, over: Math.max(0, (actual ?? 0)) };
  if (actual == null || Number.isNaN(actual)) return { hit: false, remaining: goal, over: 0 };
  const diff = actual - goal;
  return { hit: diff >= 0, remaining: Math.max(0, -diff), over: Math.max(0, diff) };
};

const YEARS = [2026, 2025] as const;

interface SnapshotMeta {
  refreshedAt: string;
  sourceFilename: string | null;
}

type View = 'bdr' | 'team' | `region:${string}`;

interface MemberSnapshot { name: string; market: string; region: string; rows: Record<string, CalcRow> }


const BdrScoreboard = () => {
  const { selected: globalBdr, refresh: refreshBdrs } = useBdr();
  const [view, setView] = useState<View>('team');
  const [bdrId, setBdrId] = useState(BDRS[0].id);
  const now = new Date();

  // Sync local bdrId with the global Active BDR. Match a baked-in id first,
  // then fall back to the workbook member snapshot (`member:<full name>`).
  useEffect(() => {
    if (!globalBdr?.name) return;
    const lname = globalBdr.name.toLowerCase();
    const baked = BDRS.find(b => lname.includes(b.name.split(',')[0].trim().toLowerCase()) || lname.includes(b.id));
    if (baked) { setBdrId(baked.id); return; }
    setBdrId(`member:${globalBdr.name}`);
  }, [globalBdr?.id, globalBdr?.name]);

  const [year, setYear] = useState<number>(2026);
  const [period, setPeriod] = useState<string>(MONTHS[Math.min(now.getMonth(), 11)]);
  const goalType: 'month' | 'quarter' | 'annual' =
    period === 'All' ? 'annual' : (QUARTERS as readonly string[]).includes(period) ? 'quarter' : 'month';
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

  // Build a unified BDR list: baked-in BDRS plus any member from the uploaded snapshot.
  // Member ids are prefixed with `member:` so they don't collide with baked-in ids.
  const baseBdr: BDR = useMemo(() => {
    const baked = BDRS.find(b => b.id === bdrId);
    if (baked) {
      const ov = overrides[bdrId];
      return ov ? { ...baked, rows: { ...baked.rows, ...ov } } : baked;
    }
    if (bdrId.startsWith('member:')) {
      const name = bdrId.slice('member:'.length);
      const m = (overrides['__members'] as unknown as Record<string, MemberSnapshot> | undefined)?.[name];
      if (m) {
        const annualGp = m.rows['2026-All']?.monthlyGoal ?? 0;
        const annualRev = annualGp ? Math.round(annualGp / 0.25) : 0;
        return { id: bdrId, name: m.name, market: m.market || m.region || '—', annualRevenueGoal: annualRev, annualGpGoal: annualGp, rows: m.rows };
      }
    }
    return BDRS[0];
  }, [bdrId, overrides]);

  const memberMap = useMemo(
    () => (overrides['__members'] as unknown as Record<string, MemberSnapshot>) || {},
    [overrides]
  );

  const regions = useMemo(
    () => Array.from(new Set(Object.values(memberMap).map(m => m.region).filter(Boolean))).sort(),
    [memberMap]
  );

  // Aggregate per-region rollups from member snapshots so every region (not just SE/NYC) shows up.
  const regionRollups = useMemo(() => {
    const out: Record<string, Record<string, CalcRow>> = {};
    for (const region of regions) {
      const agg: Record<string, CalcRow> = {};
      for (const m of Object.values(memberMap)) {
        if (m.region !== region) continue;
        for (const [k, r] of Object.entries(m.rows)) {
          if (!agg[k]) {
            agg[k] = { monthlyGoal: 0, actual: 0, actVarDollar: null, actDaysNeeded: null, actVarPct: null,
              actBookingsToGoal: null, gpGroupPipe: null, gpExistingPipe: null, totalPipe: null, actPlusPipe: null,
              expVarDollar: null, expVarPct: null, remainPipeNeed: null, expDaysNeeded: null, expBookings: null,
              commEarned: null, commForecast: null, totalCommPred: null };
          }
          agg[k].monthlyGoal = (agg[k].monthlyGoal ?? 0) + (r.monthlyGoal ?? 0);
          agg[k].actual = (agg[k].actual ?? 0) + (r.actual ?? 0);
        }
      }
      for (const k of Object.keys(agg)) {
        const g = agg[k].monthlyGoal, a = agg[k].actual;
        if (g != null && a != null) {
          agg[k].actVarDollar = +(a - g).toFixed(2);
          agg[k].actVarPct = g !== 0 ? +(a / g).toFixed(4) : null;
        }
      }
      out[region] = agg;
    }
    return out;
  }, [memberMap, regions]);

  // Synthetic "BDR" for region/team views built from aggregated rollups
  const regionBdr: BDR | null = useMemo(() => {
    if (view === 'bdr') return null;
    const isRegion = view.startsWith('region:');
    const regionName = isRegion ? view.slice('region:'.length) : '';
    const ovKey = view === 'team' ? '__team' : `__region__${regionName}`;
    const rows = overrides[ovKey] ?? regionRollups[regionName] ?? {};
    const annualGp = rows['2026-All']?.monthlyGoal ?? 0;
    // Approximate annual revenue with team-wide GP margin (~25%) so the revenue card stays sensible.
    const annualRev = annualGp ? Math.round(annualGp / 0.25) : 0;
    const label = view === 'team' ? 'Full Team' : regionName || 'Region';
    return { id: ovKey, name: label, market: 'Rollup', annualRevenueGoal: annualRev, annualGpGoal: annualGp, rows };
  }, [view, overrides]);

  // Main scoreboard KPIs always reflect the selected individual BDR.
  // The View filter cards at the bottom are comparison-only.
  const bdr: BDR = baseBdr;

  const key = `${year}-${period}`;
  const row: CalcRow | undefined = bdr.rows[key];

  const quarterTotals = useMemo(
    () => QUARTERS.map(q => bdr.rows[`${year}-${q}`]),
    [bdr, year]
  );
  const yearTotal = bdr.rows[`${year}-All`];

  const onTrack = row && row.monthlyGoal != null && row.actual != null && row.actual >= row.monthlyGoal;
  const accent = onTrack ? '#10B981' : '#0EA5E9';


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
      const payload = updates.map(u => ({
        bdr_id: u.bdr_id,
        data: u.data as unknown as Record<string, unknown>,
        source_filename: file.name,
        refreshed_by: user?.id ?? null,
        refreshed_at: refreshedAt,
      }));

      const { error } = await supabase.from('bdr_snapshots').upsert(payload as never, { onConflict: 'bdr_id' });
      // Refresh the global Active BDR list so newly-parsed members show up in the dropdown immediately.
      refreshBdrs().catch(() => { /* non-fatal */ });
      toast({
        title: error ? 'Loaded locally only' : 'Numbers refreshed',
        description: error
          ? `${summary}. Saved to this browser, but couldn't be saved to the shared backend: ${error.message}`
          : `${summary}. Saved to the shared backend — everyone will see this until a new file is uploaded.`,
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

  const FilterTab = ({ id, label, sub, r }: { id: View; label: string; sub: string; r?: CalcRow }) => {
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
          background: '#FFFFFF',
          border: `2px solid ${active ? '#0EA5E9' : '#E2E8F0'}`,
          boxShadow: active ? '0 4px 12px rgba(14,165,233,0.18)' : 'none',
          cursor: 'pointer',
        }}
      >
        <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: active ? '#0EA5E9' : '#64748B' }}>
          {label}
        </div>
        {r ? (
          <>
            <div className="text-[18px] font-extrabold tabular-nums" style={{ color: '#0F172A' }}>
              {fmt(r.actual ?? null, 'currency')}
            </div>
            <div className="text-[10px] mt-0.5 tabular-nums" style={{ color: '#64748B' }}>
              goal {fmt(r.monthlyGoal ?? null, 'currency')} · {pct != null ? `${(pct*100).toFixed(0)}%` : '—'} {pct != null && (hit ? '✓' : '⚠')}
            </div>
          </>
        ) : (
          <div className="text-[11px]" style={{ color: '#64748B' }}>{sub}</div>
        )}
      </button>
    );
  };

  return (
    <div className="p-5 rounded-xl mb-5" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <div>
          <Eyebrow gradient="#FFFFFF">BDR Scoreboard</Eyebrow>
          <h3 className="text-[22px] font-black tracking-tight mt-1" style={{ color: '#0F172A' }}>
            <span style={{ color: '#0F172A' }}>{bdr.name}</span>{' '}
            <span className="font-medium text-[16px]" style={{ color: '#64748B' }}>· {bdr.market}</span>

          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#64748B' }}>{lastRefreshLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefreshClick}
            disabled={refreshing}
            className="text-[12px] font-bold rounded-lg px-3 py-2 inline-flex items-center gap-1.5 transition-opacity disabled:opacity-60"
            style={{ background: '#0EA5E9', color: '#fff', border: '1px solid #0EA5E9' }}
            title="Upload the latest Sales Forecasting .xlsx to refresh the scoreboard"
          >
            <span>{refreshing ? '⏳' : '↻'}</span>
            <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
          {/* BDR picker removed — driven by the global Active BDR selector at the top of the page */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-[12px] font-semibold rounded-lg px-3 py-2 border outline-none"
            style={{ borderColor: '#E2E8F0', background: '#FFFFFF', color: '#0F172A' }}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={goalType}
            onChange={(e) => {
              const t = e.target.value as 'month' | 'quarter' | 'annual';
              if (t === 'month') setPeriod(MONTHS[Math.min(now.getMonth(), 11)]);
              else if (t === 'quarter') setPeriod(QUARTERS[Math.min(Math.floor(now.getMonth() / 3), 3)]);
              else setPeriod('All');
            }}
            className="text-[12px] font-semibold rounded-lg px-3 py-2 border outline-none"
            style={{ borderColor: '#E2E8F0', background: '#FFFFFF', color: '#0F172A' }}
            title="Switch between monthly, quarterly, or annual goal view"
          >
            <option value="month">Monthly Goal</option>
            <option value="quarter">Quarterly Goal</option>
            <option value="annual">Annual Goal</option>
          </select>
          {goalType !== 'annual' && (
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-[12px] font-semibold rounded-lg px-3 py-2 border outline-none"
              style={{ borderColor: '#E2E8F0', background: '#FFFFFF', color: '#0F172A' }}
            >
              {(goalType === 'month' ? MONTHS : QUARTERS).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!row && (
        <div className="p-4 rounded-lg text-[12px]" style={{ background: '#FFFFFF', color: '#64748B', border: '1px dashed #E2E8F0' }}>
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
            {(() => {
              const annualRow = bdr.rows[`${year}-All`];
              const { hit, remaining, over } = gpStatus(bdr.annualGpGoal, annualRow?.actual);
              const annualRevRemaining = revenueForGp(bdr, remaining) ?? 0;
              const annualHit = hit === true;
              return (
                <div className="p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: annualHit ? '#10B981' : '#64748B' }}>
                    {annualHit ? `Annual GP Goal Hit · ${year}` : `Top Line Revenue Still Needed · ${year}`}
                  </div>
                  <div className="text-[20px] font-extrabold tabular-nums" style={{ color: annualHit ? '#10B981' : '#0F172A' }}>
                    {annualHit ? '$0 needed ✓' : fmt(annualRevRemaining, 'currency')}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>
                    {annualHit
                      ? `Over by ${fmt(over ?? 0, 'currency')} GP · Goal ${fmt(bdr.annualRevenueGoal, 'currency')}`
                      : `GP remaining ${fmt(remaining, 'currency')} of ${fmt(bdr.annualGpGoal, 'currency')}`}
                  </div>
                </div>
              );
            })()}
            {(() => {
              const { hit, remaining, over } = gpStatus(row.monthlyGoal, row.actual);
              const goalHit = hit === true;
              const revNeeded = revenueForGp(bdr, remaining);
              return (
                <div className="p-3 rounded-lg" style={{ background: goalHit ? 'rgba(16,185,129,0.08)' : '#fff', border: `1px solid ${goalHit ? 'rgba(16,185,129,0.35)' : '#E2E8F0'}` }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: goalHit ? '#10B981' : '#64748B' }}>
                    {goalHit ? `GP Goal Hit · ${period}` : `Revenue Needed to Hit GP Goal · ${period}`}
                  </div>
                  <div className="text-[20px] font-extrabold tabular-nums" style={{ color: goalHit ? '#10B981' : '#0F172A' }}>
                    {goalHit ? '$0 needed ✓' : fmt(revNeeded, 'currency')}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: goalHit ? '#10B981' : '#64748B' }}>
                    {goalHit
                      ? `Over by ${fmt(over ?? 0, 'currency')} GP`
                      : `GP remaining ${fmt(remaining, 'currency')} of ${fmt(row.monthlyGoal, 'currency')}`}
                  </div>
                </div>
              );
            })()}
            <div className="p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>Revenue Booked (implied) · {period}</div>
              <div className="text-[20px] font-extrabold tabular-nums" style={{ color: '#0F172A' }}>{fmt(revenueForGp(bdr, row.actual), 'currency')}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>From actual GP {fmt(row.actual, 'currency')}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {KPI_LABELS.map(({ key: k, label, format }) => {
              const v = row[k];
              const isHero = k === 'monthlyGoal' || k === 'actual' || k === 'totalCommPred';
              const negative = format === 'currency' && typeof v === 'number' && v < 0;
              return (
                <div key={k} className="p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#64748B' }}>{label}</div>
                  <div className={`tabular-nums ${isHero ? 'text-[18px] font-extrabold' : 'text-[14px] font-bold'}`}
                       style={{ color: negative ? '#EF4444' : '#0F172A' }}>
                    {fmt(v, format)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E2E8F0' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#64748B' }}>{year} Quarter Rollup</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {QUARTERS.map((q, i) => {
                const qr = quarterTotals[i];
                const { hit, remaining } = gpStatus(qr?.monthlyGoal, qr?.actual);
                const qHit = hit === true;
                return (
                  <div key={q} className="p-2.5 rounded-lg" style={{ background: qHit ? 'rgba(16,185,129,0.08)' : '#fff', border: `1px solid ${qHit ? 'rgba(16,185,129,0.35)' : '#E2E8F0'}` }}>
                    <div className="text-[10px] font-bold" style={{ color: qHit ? '#10B981' : '#64748B' }}>{q} {qHit && '✓'}</div>
                    <div className="text-[13px] font-extrabold tabular-nums" style={{ color: qHit ? '#10B981' : '#0F172A' }}>{fmt(qr?.actual ?? null, 'currency')}</div>
                    <div className="text-[10px] tabular-nums" style={{ color: qHit ? '#10B981' : '#64748B' }}>
                      {qHit ? '$0 GP needed' : remaining != null ? `${fmt(remaining, 'currency')} to goal` : `goal ${fmt(qr?.monthlyGoal ?? null, 'currency')}`}
                    </div>
                  </div>
                );
              })}
              {(() => {
                const { hit, remaining } = gpStatus(yearTotal?.monthlyGoal, yearTotal?.actual);
                const yHit = hit === true;
                return (
                  <div className="p-2.5 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                    <div className="text-[10px] font-bold" style={{ color: yHit ? '#10B981' : '#64748B' }}>Year {yHit && '✓'}</div>
                    <div className="text-[13px] font-extrabold tabular-nums" style={{ color: yHit ? '#10B981' : '#0F172A' }}>{fmt(yearTotal?.actual ?? null, 'currency')}</div>
                    <div className="text-[10px] tabular-nums" style={{ color: '#64748B' }}>
                      {yHit ? '$0 GP needed ✓' : remaining != null ? `${fmt(remaining, 'currency')} to goal` : `goal ${fmt(yearTotal?.monthlyGoal ?? null, 'currency')}`}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}

      <div className="mt-8 -mx-5 px-5 pt-6 pb-2 border-t-4" style={{ borderColor: '#0EA5E9', background: '#FFFFFF' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] px-2 py-1 rounded" style={{ background: '#0EA5E9', color: '#fff' }}>
            Team Comparison
          </span>
          <span className="text-[11px]" style={{ color: '#64748B' }}>
            Separate from your individual numbers above — click a card to see how the team or a region is tracking.
          </span>
        </div>
        <Eyebrow gradient="#FFFFFF">View · click to filter</Eyebrow>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1 mb-4">
          <FilterTab id="team" label="Full Team" sub="All BDRs" r={teamRow} />
          {regions.map(region => {
            const r = regionRollups[region]?.[rollupKey];
            const memberCount = Object.values(memberMap).filter(m => m.region === region).length;
            return (
              <FilterTab
                key={region}
                id={`region:${region}` as View}
                label={region}
                sub={`${memberCount} BDR${memberCount === 1 ? '' : 's'}`}
                r={r}
              />
            );
          })}
        </div>

      {view !== 'bdr' && (() => {
        const list = Object.values(memberMap).filter(m => {
          if (view === 'team') return true;
          if (view.startsWith('region:')) return m.region === view.slice('region:'.length);
          return false;
        });
        list.sort((a, b) => (b.rows[rollupKey]?.actual ?? 0) - (a.rows[rollupKey]?.actual ?? 0));
        if (list.length === 0) {
          return (
            <div className="mt-4 pt-4 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-2" style={{ borderColor: '#E2E8F0' }}>
              <div className="text-[12px]" style={{ color: '#64748B' }}>
                No per-BDR breakdown yet — upload the latest Sales Forecasting workbook to populate this section.
              </div>
              <button
                onClick={handleRefreshClick}
                disabled={refreshing}
                className="text-[12px] font-bold rounded-lg px-3 py-2 inline-flex items-center gap-1.5"
                style={{ background: '#0EA5E9', color: '#fff', border: '1px solid #0EA5E9' }}
              >
                <span>{refreshing ? '⏳' : '↻'}</span>
                <span>{refreshing ? 'Loading…' : 'Upload workbook'}</span>
              </button>
            </div>
          );
        }
        return (
          <div className="mt-5">
              <table className="w-full overflow-hidden rounded-xl text-[12px]">
                <thead style={{ background: '#FFFFFF' }}>
                  <tr style={{ color: '#64748B' }}>
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
                      <tr key={m.name} style={{ background: i % 2 ? '#FFFFFF' : '#fff', borderTop: '1px solid #E2E8F0' }}>
                        <td className="px-3 py-2 font-bold" style={{ color: '#0F172A' }}>{m.name}</td>
                        <td className="px-3 py-2" style={{ color: '#64748B' }}>{m.market}</td>
                        <td className="px-3 py-2" style={{ color: '#64748B' }}>{m.region}</td>
                        <td className="px-3 py-2 text-right tabular-nums" style={{ color: '#0F172A' }}>{fmt(r?.monthlyGoal ?? null, 'currency')}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold" style={{ color: '#0F172A' }}>{fmt(r?.actual ?? null, 'currency')}</td>
                        <td className="px-3 py-2 text-right tabular-nums" style={{ color: varNeg ? '#EF4444' : '#10B981' }}>{fmt(r?.actVarDollar ?? null, 'currency')}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold" style={{ color: hit ? '#10B981' : '#0EA5E9' }}>
                          {pct != null ? `${(pct*100).toFixed(0)}%` : '—'} {pct != null && (hit ? '✓' : '⚠')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          </div>
        );
      })()}
      </div>


    </div>
  );
};

export default BdrScoreboard;

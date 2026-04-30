import { useMemo, useState } from 'react';
import Eyebrow from './Eyebrow';
import { BDRS, KPI_LABELS, MONTHS, QUARTERS, revenueForGp, type CalcRow } from './bdrCalculatorData';

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

const BdrScoreboard = () => {
  const [bdrId, setBdrId] = useState(BDRS[0].id);
  const now = new Date();
  const [year, setYear] = useState<number>(2026);
  const [period, setPeriod] = useState<string>(MONTHS[Math.min(now.getMonth(), 11)]);

  const bdr = useMemo(() => BDRS.find(b => b.id === bdrId)!, [bdrId]);
  const key = `${year}-${period}`;
  const row: CalcRow | undefined = bdr.rows[key];

  const quarterTotals = useMemo(() => {
    return QUARTERS.map(q => bdr.rows[`${year}-${q}`]);
  }, [bdr, year]);
  const yearTotal = bdr.rows[`${year}-All`];

  const onTrack = row && row.monthlyGoal != null && row.actual != null && row.actual >= row.monthlyGoal;
  const accent = onTrack ? '#10B981' : '#fb923c';

  return (
    <div className="p-5 rounded-xl mb-5" style={{ background: '#FAF7F2', border: '1px solid rgba(14,30,58,.08)' }}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <div>
          <Eyebrow gradient="linear-gradient(90deg, #fb923c, #fbbf24)">BDR Scoreboard</Eyebrow>
          <h3 className="text-[18px] font-extrabold tracking-tight mt-1" style={{ color: '#0e1e3a' }}>
            {bdr.name} <span className="font-medium" style={{ color: '#64748b' }}>· {bdr.market}</span>
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>From the Calculator sheet · {key}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={bdrId}
            onChange={(e) => setBdrId(e.target.value)}
            className="text-[12px] font-semibold rounded-lg px-3 py-2 border outline-none"
            style={{ borderColor: 'rgba(14,30,58,.15)', background: '#fff', color: '#0e1e3a' }}
          >
            {BDRS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
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

          {/* Top Line Revenue strip — derived from GP figures using each BDR's GP margin */}
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

import { useMemo } from 'react';
import { US_STATES } from './usStatesData';
import { VERTICAL_NAMES } from './verticalsData';

interface MarketSelectorProps {
  state: string;
  city: string;
  vertical: string;
  loading: boolean;
  onChange: (next: { state?: string; city?: string; vertical?: string }) => void;
  onScan: () => void;
}

const MarketSelector = ({ state, city, vertical, loading, onChange, onScan }: MarketSelectorProps) => {
  const cities = useMemo(
    () => US_STATES.find((s) => s.abbreviation === state)?.cities ?? [],
    [state],
  );

  const selectStyle = {
    background: '#fff',
    border: '1px solid rgba(14,30,58,.12)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#0e1e3a',
    minWidth: 140,
  } as const;

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.08)' }}>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9B78C8' }}>State</label>
        <select
          value={state}
          onChange={(e) => onChange({ state: e.target.value, city: '' })}
          style={selectStyle}
        >
          <option value="">Select state…</option>
          {US_STATES.map((s) => (
            <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9B78C8' }}>City</label>
        <select
          value={city}
          onChange={(e) => onChange({ city: e.target.value })}
          disabled={!state}
          style={{ ...selectStyle, opacity: state ? 1 : 0.5 }}
        >
          <option value="">Select city…</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9B78C8' }}>Vertical</label>
        <select
          value={vertical}
          onChange={(e) => onChange({ vertical: e.target.value })}
          style={selectStyle}
        >
          <option value="all">All verticals</option>
          {VERTICAL_NAMES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <button
        onClick={onScan}
        disabled={loading || !state || !city}
        className="px-5 py-[11px] rounded-lg text-[13px] font-bold uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        style={{
          background: 'linear-gradient(90deg, #fb923c, #fbbf24)',
          color: '#0a0a14',
          boxShadow: '0 4px 12px rgba(251,146,60,.3)',
        }}
      >
        {loading ? '⟳ Scanning…' : '🔄 Refresh Scan'}
      </button>
    </div>
  );
};

export default MarketSelector;

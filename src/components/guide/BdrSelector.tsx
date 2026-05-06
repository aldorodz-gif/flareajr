import { useBdr } from './BdrContext';

export default function BdrSelector() {
  const { bdrs, selected, setSelectedId, loading } = useBdr();

  if (loading) {
    return <div className="px-6 md:px-12 py-3 text-xs text-muted-foreground">Loading BDRs…</div>;
  }

  return (
    <div className="px-6 md:px-12 py-3 flex items-center gap-3 flex-wrap" style={{ background: '#0F172A', borderBottom: '1px solid rgba(251,146,60,.15)' }}>
      <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(251,146,60,.85)' }}>
        Active BDR
      </span>
      <select
        value={selected?.id || ''}
        onChange={(e) => setSelectedId(e.target.value)}
        className="px-3 py-1.5 rounded-md text-sm font-medium bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {bdrs.map(b => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      {selected && (
        <>
          <span className="text-xs text-muted-foreground">
            {selected.region} • {selected.markets.length} markets
          </span>
          <div className="flex gap-1 flex-wrap">
            {selected.markets.slice(0, 4).map(m => (
              <span key={m} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,.15)', color: '#fb923c' }}>
                {m}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

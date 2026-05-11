import { ReactNode } from 'react';
import Eyebrow from './Eyebrow';

export interface VerticalShare {
  vertical: string;
  share_pct: number;
  driver: string;
}

interface TopVerticalsProps {
  data: VerticalShare[];
  city: string;
  loading: boolean;
  selector?: ReactNode;
}

const TopVerticals = ({ data, city, loading, selector }: TopVerticalsProps) => {
  return (
    <div className="p-5 rounded-xl h-full" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.08)' }}>
      <Eyebrow gradient="linear-gradient(90deg, #8B8FE8, #D97FAA)">Market Heat</Eyebrow>
      <h3 className="text-[16px] font-extrabold tracking-tight mb-1" style={{ color: '#0e1e3a' }}>
        Top Verticals {city ? `in ${city}` : ''}
      </h3>
      <p className="text-[11px] mb-4" style={{ color: '#64748b' }}>Pick a market and scan to see where the heat is right now.</p>

      {selector && <div className="mb-4">{selector}</div>}

      {loading && <div className="text-[12px]" style={{ color: '#94a3b8' }}>Scanning…</div>}

      {!loading && data.length === 0 && (
        <div className="text-[12px]" style={{ color: '#94a3b8' }}>Run a scan to see vertical heat.</div>
      )}

      <div className="flex flex-col gap-3">
        {data.map((row, i) => (
          <div key={row.vertical}>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[12px] font-semibold flex items-center gap-2" style={{ color: '#0e1e3a' }}>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold" style={{ background: 'rgba(155,120,200,.15)', color: '#9B78C8' }}>{i + 1}</span>
                {row.vertical}
              </span>
              <span className="text-[12px] font-bold tabular-nums" style={{ color: '#ec4899' }}>{row.share_pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(14,30,58,.06)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${row.share_pct}%`, background: 'linear-gradient(90deg, #ec4899, #f9a8d4)' }}
              />
            </div>
            <p className="text-[11px] leading-snug" style={{ color: '#64748b' }}>{row.driver}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopVerticals;

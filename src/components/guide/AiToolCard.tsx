import { ReactNode } from 'react';

interface AiToolCardProps {
  icon: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Shared wrapper for all AI-powered tool sections.
 * Uses Flare brand colors (amber/orange) for accents.
 */
const AiToolCard = ({ icon, title, subtitle, children }: AiToolCardProps) => {
  return (
    <div className="relative group">
      {/* Outer glow on hover */}
      <div
        className="absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"
        style={{ background: 'radial-gradient(ellipse, rgba(251,146,60,.2), transparent 70%)' }}
      />

      {/* Subtle gradient border */}
      <div
        className="absolute -inset-[1px] rounded-xl animate-border-glow"
        style={{
          background: 'linear-gradient(135deg, rgba(251,146,60,.4), rgba(155,120,200,.3), rgba(16,185,129,.3), rgba(251,146,60,.4))',
          backgroundSize: '300% 300%',
        }}
      />
      <div
        className="absolute -inset-[1px] rounded-xl animate-shimmer opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(251,146,60,.25) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="relative rounded-xl overflow-hidden shadow-xl transition-shadow duration-300 group-hover:shadow-2xl">
        {/* ── Header ── */}
        <div
          className="relative px-6 py-6 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a2744 0%, #1e1650 40%, #2d1b69 70%, #4a2080 100%)' }}
        >
          {/* Ambient orbs — matching Flare header */}
          <div className="absolute top-0 right-1/4 w-44 h-44 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(251,146,60,.6), transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/4 w-36 h-36 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,.5), transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] opacity-[.06] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(251,146,60,.5), transparent 60%)' }} />

          {/* Sparkle decorations */}
          <div className="absolute top-4 right-16 pointer-events-none">
            <span className="absolute w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#f9a8d4', boxShadow: '0 0 6px #f9a8d4', top: 0, left: 0 }} />
            <span className="absolute w-1 h-1 rounded-full animate-pulse" style={{ background: '#ec4899', boxShadow: '0 0 4px #ec4899', top: 12, left: 20, animationDelay: '0.5s' }} />
            <span className="absolute w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#14b8a6', boxShadow: '0 0 6px #14b8a6', top: -4, left: 40, animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[24px]">{icon}</span>
                <span
                  className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 animate-shimmer rounded-sm"
                  style={{
                    background: 'linear-gradient(90deg, #ec4899, #f9a8d4, #ec4899)',
                    backgroundSize: '200% 100%',
                    color: '#0a0a14',
                  }}
                >
                  AI Tool
                </span>
              </div>
              <p className="text-[22px] font-extrabold tracking-tight" style={{ color: '#fff' }}>{title}</p>
              <p className="text-[13px] mt-1 font-medium" style={{ color: '#f9a8d4' }}>{subtitle}</p>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-full" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)' }}>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#14b8a6' }} />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-radar-ping" style={{ background: '#14b8a6' }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#14b8a6' }}>Live</span>
              </div>
              <div className="hidden md:block px-3.5 py-2 rounded-full" style={{ background: 'rgba(251,146,60,.1)', border: '1px solid rgba(251,146,60,.25)' }}>
                <p className="text-[11px] font-bold tracking-wide" style={{ color: '#ec4899' }}>Powered by AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 border-x border-b rounded-b-xl" style={{ borderColor: 'rgba(14,30,58,.08)', background: '#FAF7F2' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AiToolCard;

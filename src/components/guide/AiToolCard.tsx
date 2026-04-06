import { ReactNode } from 'react';

interface AiToolCardProps {
  icon: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Shared wrapper for all AI-powered tool sections.
 * Provides: floating animation, animated gradient border, sparkle decorations,
 * dramatic dark header with gold accents, and a clean white body.
 */
const AiToolCard = ({ icon, title, subtitle, children }: AiToolCardProps) => {
  return (
    <div className="relative group animate-tool-float">
      {/* Outer glow shadow */}
      <div
        className="absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"
        style={{ background: 'radial-gradient(ellipse, rgba(214,176,122,.25), transparent 70%)' }}
      />

      {/* Animated gradient border */}
      <div
        className="absolute -inset-[2px] rounded-xl animate-border-glow"
        style={{
          background: 'linear-gradient(135deg, #D6B07A, #9B78C8, #10B981, #D6B07A)',
          backgroundSize: '300% 300%',
        }}
      />
      <div
        className="absolute -inset-[2px] rounded-xl animate-shimmer opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(214,176,122,.4) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="relative rounded-xl overflow-hidden shadow-xl transition-shadow duration-300 group-hover:shadow-2xl">
        {/* ── Header ── */}
        <div
          className="relative px-6 py-6 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0E1E3A 0%, #1a1145 50%, #0E1E3A 100%)' }}
        >
          {/* Ambient orbs */}
          <div className="absolute top-0 left-1/4 w-44 h-44 opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle, #D6B07A, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-36 h-36 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #9B78C8, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[.04] pointer-events-none" style={{ background: 'radial-gradient(circle, #fff, transparent 60%)' }} />

          {/* Sparkle decorations */}
          <div className="absolute top-4 right-16 pointer-events-none">
            <span className="absolute w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#D6B07A', boxShadow: '0 0 6px #D6B07A', top: 0, left: 0 }} />
            <span className="absolute w-1 h-1 rounded-full animate-pulse" style={{ background: '#9B78C8', boxShadow: '0 0 4px #9B78C8', top: 12, left: 20, animationDelay: '0.5s' }} />
            <span className="absolute w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981', top: -4, left: 40, animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[24px]">{icon}</span>
                <span
                  className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 animate-shimmer rounded-sm"
                  style={{
                    background: 'linear-gradient(90deg, #D6B07A, #E8C98A, #D6B07A)',
                    backgroundSize: '200% 100%',
                    color: '#0E1E3A',
                  }}
                >
                  AI Tool
                </span>
              </div>
              <p className="text-[22px] font-extrabold tracking-tight" style={{ color: '#fff' }}>{title}</p>
              <p className="text-[13px] mt-1 font-medium" style={{ color: 'rgba(214,176,122,.7)' }}>{subtitle}</p>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-full" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)' }}>
                <div className="relative">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
                  <div className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-radar-ping" style={{ background: '#10B981' }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#10B981' }}>Live</span>
              </div>
              <div className="hidden md:block px-3.5 py-2 rounded-full" style={{ background: 'rgba(214,176,122,.12)', border: '1px solid rgba(214,176,122,.25)' }}>
                <p className="text-[11px] font-bold tracking-wide" style={{ color: '#D6B07A' }}>Powered by AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 border-x border-b rounded-b-xl" style={{ borderColor: 'rgba(214,176,122,.15)', background: '#fff' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AiToolCard;

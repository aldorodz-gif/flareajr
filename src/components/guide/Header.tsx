interface HeaderProps {
  onReplayTour?: () => void;
}

const Header = ({ onReplayTour }: HeaderProps) => {
  return (
    <header
      className="relative overflow-hidden px-6 py-12 md:px-12 md:py-16"
      style={{
        background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 25%, #1e1050 50%, #3b1560 75%, #4a1942 100%)',
      }}
    >
      {/* Glow effects */}
      <div
        className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(251,146,60,.15) 0%, transparent 65%)' }}
      />
      <div
        className="absolute -bottom-24 -left-16 w-[400px] h-[400px] rounded-full pointer-events-none blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,.12) 0%, transparent 65%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full pointer-events-none blur-[120px] opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(251,146,60,.2) 0%, transparent 70%)' }}
      />

      {/* Replay tour button */}
      {onReplayTour && (
        <button
          onClick={onReplayTour}
          className="absolute top-5 right-5 md:top-6 md:right-8 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
          style={{
            background: 'rgba(255,255,255,.08)',
            border: '1px solid rgba(255,255,255,.12)',
            color: 'rgba(255,255,255,.5)',
          }}
          title="Replay guided tour"
        >
          <span className="text-[13px]">❓</span>
          <span className="text-[11px] font-medium tracking-wide hidden md:inline">Tour</span>
        </button>
      )}

      <div className="relative z-10 flex flex-col items-start">
        {/* Flare wordmark */}
        <div className="mb-3 animate-hero-rise" style={{ animationDelay: '0.05s' }}>
          <h1
            className="text-[56px] md:text-[72px] font-black tracking-[-0.03em] leading-none"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 30%, #fb923c 60%, #f97316 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(251,146,60,.3))',
            }}
          >
            FLARE
          </h1>
        </div>

        {/* Tagline */}
        <p
          className="text-[15px] md:text-[16px] font-light leading-[1.7] max-w-[520px] animate-hero-rise"
          style={{ color: 'rgba(255,255,255,.7)', animationDelay: '0.14s' }}
        >
          Demand signals are flares — spot them first, and you're already ahead.
        </p>

        {/* Credit */}
        <p
          className="text-[11px] mt-3 animate-hero-rise tracking-wide uppercase"
          style={{ color: 'rgba(255,255,255,.3)', animationDelay: '0.22s' }}
        >
          Built for the NCH sales team by Aldo Rodriguez
        </p>
      </div>
    </header>
  );
};

export default Header;
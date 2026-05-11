import { useTheme } from './ThemeContext';

interface HeaderProps {
  onReplayTour?: () => void;
}

const Header = ({ onReplayTour }: HeaderProps) => {
  const { theme, toggle } = useTheme();
  return (
    <header
      data-shell="header"
      className="relative overflow-hidden px-6 py-12 md:px-12 md:py-16"
      style={{
        background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 25%, #1e1050 50%, #3b1560 75%, #4a1942 100%)',
      }}
    >
      {/* Glow effects */}
      <div
        data-shell="glow-1"
        className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,.20) 0%, transparent 65%)' }}
      />
      <div
        data-shell="glow-2"
        className="absolute -bottom-24 -left-16 w-[400px] h-[400px] rounded-full pointer-events-none blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,.18) 0%, transparent 65%)' }}
      />
      <div
        data-shell="glow-3"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full pointer-events-none blur-[120px] opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,.25) 0%, transparent 70%)' }}
      />

      {/* Theme toggle + Replay tour buttons */}
      <div className="absolute top-5 right-5 md:top-6 md:right-8 z-20 flex items-center gap-2">
        <button
          onClick={toggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
          style={{
            background: theme === 'warm' ? 'rgba(236,72,153,.14)' : 'rgba(255,255,255,.08)',
            border: theme === 'warm' ? '1px solid rgba(236,72,153,.4)' : '1px solid rgba(255,255,255,.12)',
            color: theme === 'warm' ? '#9d174d' : 'rgba(255,255,255,.6)',
          }}
          title={theme === 'dark' ? 'Switch to warm theme' : 'Switch to dark theme'}
        >
          <span className="text-[13px]">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="text-[11px] font-semibold tracking-wide hidden md:inline">
            {theme === 'dark' ? 'Warm' : 'Dark'}
          </span>
        </button>
        {onReplayTour && (
          <button
            onClick={onReplayTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
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
      </div>

      <div className="relative z-10 flex flex-col items-start">
        {/* Flare wordmark */}
        <div className="mb-3 animate-hero-rise" style={{ animationDelay: '0.05s' }}>
          <h1
            className="text-[56px] md:text-[72px] font-black tracking-[-0.03em] leading-none"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, #ffffff 0%, #2dd4bf 28%, #ec4899 62%, #a855f7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(236,72,153,.35))',
            }}
          >
            FLARE
          </h1>
          <div
            className="h-[3px] w-[80px] mt-2 rounded-full"
            style={{ background: 'linear-gradient(90deg, #ec4899, #a855f7 60%, rgba(168,85,247,0))' }}
          />
        </div>

        {/* Subtitle */}
        <p
          className="text-[13px] md:text-[14px] font-semibold uppercase tracking-widest animate-hero-rise"
          style={{ color: 'rgba(45,212,191,.9)', animationDelay: '0.1s' }}
        >
          The NCH BDR Prospecting Toolkit
        </p>

        {/* Value prop */}
        <p
          className="text-[15px] md:text-[16px] font-light leading-[1.7] max-w-[520px] mt-2 animate-hero-rise"
          style={{ color: 'rgba(255,255,255,.75)', animationDelay: '0.14s' }}
        >
          Find companies that need housing now. Know who to call. Send the right message. Every morning in under 30 minutes.
        </p>

      </div>
    </header>
  );
};

export default Header;
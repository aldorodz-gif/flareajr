const Header = () => {
  return (
    <header
      className="relative overflow-hidden px-6 py-12 md:px-12 md:py-16"
      style={{
        background: 'linear-gradient(135deg, #0F0F1A 0%, #1a1145 30%, #2d1b69 60%, #4a1942 100%)',
      }}
    >
      {/* Animated gradient orbs */}
      <div
        className="absolute -top-24 -right-16 w-[500px] h-[500px] rounded-full pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,.25) 0%, transparent 60%)' }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,.18) 0%, transparent 60%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none blur-3xl opacity-30"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,.2) 0%, transparent 70%)' }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase mb-4 animate-hero-rise"
          style={{
            background: 'rgba(168,85,247,.15)',
            color: '#c084fc',
            border: '1px solid rgba(168,85,247,.2)',
            animationDelay: '0.04s',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          Interactive Guide
        </div>
        <h1
          className="text-[34px] md:text-[40px] font-bold leading-[1.08] tracking-tight max-w-[700px] mb-3 animate-hero-rise"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 40%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animationDelay: '0.08s',
          }}
        >
          ChatGPT prospecting agent set up guide
        </h1>
        <p
          className="text-[13px] font-light leading-[1.7] max-w-[760px] mb-2 animate-hero-rise"
          style={{ color: 'rgba(255,255,255,.55)', animationDelay: '0.16s' }}
        >
          Use this guide to move from signal to research to the right contact and a more relevant outreach angle.
        </p>
      </div>
    </header>
  );
};

export default Header;

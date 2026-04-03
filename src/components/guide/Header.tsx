const Header = () => {
  return (
    <header
      className="relative overflow-hidden px-6 py-10 md:px-12 md:py-10"
      style={{
        background: 'linear-gradient(135deg, #0F0F1A 0%, #1a1145 30%, #2d1b69 60%, #4a1942 100%)',
      }}
    >
      <div
        className="absolute -top-20 -right-10 w-[340px] h-[340px] rounded-full pointer-events-none blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,.2) 0%, transparent 65%)' }}
      />
      <div className="relative z-10">
        <h1
          className="text-[32px] font-semibold leading-[1.2] max-w-[700px] mb-2 animate-hero-rise"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 40%, #c4b5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animationDelay: '0.08s',
          }}
        >
          Flare
        </h1>
        <p
          className="text-[14px] font-light leading-[1.7] max-w-[760px] animate-hero-rise"
          style={{ color: 'rgba(255,255,255,.55)', animationDelay: '0.16s' }}
        >
          Built for the NCH sales team by Aldo Rodriguez.
        </p>
        <p
          className="text-[14px] font-light leading-[1.7] max-w-[760px] animate-hero-rise"
          style={{ color: 'rgba(255,255,255,.55)', animationDelay: '0.24s' }}
        >
          Use this guide to move from signal to research to the right contact and a more relevant outreach angle.
        </p>
      </div>
    </header>
  );
};

export default Header;

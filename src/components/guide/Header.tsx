const Header = () => {
  return (
    <header className="relative overflow-hidden px-6 py-10 md:px-12" style={{ background: 'linear-gradient(135deg, #1E293B 0%, #252260 100%)' }}>
      <div className="absolute -top-20 -right-10 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 65%)' }} />
      <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight max-w-[700px] mb-2 animate-hero-rise" style={{ color: '#fff', animationDelay: '0.08s' }}>
        ChatGPT prospecting agent set up guide
      </h1>
      <p className="text-[13px] font-light leading-[1.7] max-w-[760px] mb-2 animate-hero-rise" style={{ color: 'rgba(255,255,255,.7)', animationDelay: '0.16s' }}>
        Use this guide to move from signal to research to the right contact and a more relevant outreach angle.
      </p>
    </header>
  );
};

export default Header;

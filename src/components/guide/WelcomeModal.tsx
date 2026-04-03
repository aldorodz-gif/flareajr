import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'flare-welcome-dismissed';

const WelcomeModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) {
      setOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,15,26,.65)' }}>
      <div
        className="w-full max-w-[480px] rounded-lg overflow-hidden shadow-2xl animate-hero-rise"
        style={{ background: 'hsl(var(--card))' }}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #0F0F1A 0%, #1a1145 30%, #2d1b69 60%, #4a1942 100%)' }}>
          <h2
            className="text-[22px] font-semibold leading-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 40%, #c4b5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to Prospect Engine
          </h2>
          <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,.55)' }}>
            Three AI-powered tools for the NCH sales team.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-[13px] leading-[1.7] text-foreground">
            This toolkit helps you move from signal to outreach faster. Here's what's inside:
          </p>

          <div className="space-y-2.5">
            {[
              { icon: '📋', name: 'Score Signals', desc: 'Paste a business signal → get a HIGH / MEDIUM / LOW score with the likely service line.' },
              { icon: '📡', name: 'Prompt Builder', desc: 'Pick a city, vertical, and signal type → get a ready-to-paste ChatGPT search prompt.' },
              { icon: '✉️', name: 'Write Outreach', desc: 'Enter company details → get a first-touch email drafted in NCH\'s voice.' },
            ].map((tool) => (
              <div key={tool.name} className="flex gap-3 items-start">
                <span className="text-[18px] mt-0.5 flex-shrink-0">{tool.icon}</span>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{tool.name}</p>
                  <p className="text-[12px] leading-[1.5] text-muted-foreground">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-muted-foreground pt-1">
            The other tabs are reference guides — read them once, revisit when needed.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={handleDismiss}
            className="w-full py-2.5 rounded text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}
          >
            Got it — let's go
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

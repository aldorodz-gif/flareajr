import { useState, useEffect, useCallback } from 'react';

interface PromptBuilderTourProps {
  open: boolean;
  onClose: () => void;
}

interface Step {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  simId: 'pick-market' | 'pick-vertical' | 'pick-signal' | 'build' | 'copy-paste' | 'schedule';
  gradient: string;
}

const STEPS: Step[] = [
  {
    icon: '📍',
    title: 'Step 1 — Pick your market',
    subtitle: 'Use a preset or type your own city',
    description: 'Click a quick-select chip (Huntsville, Nashville, Atlanta) or type any "City, State". This anchors the search to companies physically moving in that metro.',
    detail: 'Tip: If your BDR coverage is multiple cities, run the prompt once per city — results are sharper than a regional sweep.',
    simId: 'pick-market',
    gradient: 'linear-gradient(135deg, #1a3a5c, #0F0F1A)',
  },
  {
    icon: '🏢',
    title: 'Step 2 — Choose a vertical',
    subtitle: 'Tells AI which industry to scan',
    description: 'Pick from the 7 NCH verticals (Relocation, Consult, Govt, Tech, Healthcare, Construction, Interns). The prompt narrows the search to companies in that industry.',
    detail: 'Not sure which vertical? Match it to whichever service line you have the strongest pricing on right now.',
    simId: 'pick-vertical',
    gradient: 'linear-gradient(135deg, #2d1b3d, #1a1145)',
  },
  {
    icon: '📡',
    title: 'Step 3 — Pick the signal type',
    subtitle: 'What kind of business movement?',
    description: 'Contract awards, relocations, expansions, training cohorts, M&A, funding rounds — each one creates a different housing or travel need. Pick the one that matches what you sell best.',
    detail: 'Construction → Contract awards. Healthcare → Training cohorts. Tech → Funding rounds. That\'s where response rates spike.',
    simId: 'pick-signal',
    gradient: 'linear-gradient(135deg, #3d2410, #1a1410)',
  },
  {
    icon: '⚡',
    title: 'Step 4 — Build the prompt',
    subtitle: 'One click → custom search query',
    description: 'When all three fields are filled, the orange "Build My Prompt" button activates. We assemble a ChatGPT Agent Mode prompt tuned to your exact city + vertical + signal combo.',
    detail: 'Watch the green checkmarks fill in as you complete each field — that\'s your readiness indicator.',
    simId: 'build',
    gradient: 'linear-gradient(135deg, #4a2410, #1a1145)',
  },
  {
    icon: '📋',
    title: 'Step 5 — Copy & paste into ChatGPT',
    subtitle: 'Run it once to get your first leads',
    description: 'Hit COPY on the dark prompt box. Open ChatGPT, switch to Agent Mode, and paste. In ~2 minutes you get a list of companies in your market with verified housing-relevant signals.',
    detail: 'Stay inside the same ChatGPT chat — you\'ll need it for the schedule step next.',
    simId: 'copy-paste',
    gradient: 'linear-gradient(135deg, #1a3a5c, #2d1b69)',
  },
  {
    icon: '⏰',
    title: 'Step 6 — Automate it daily',
    subtitle: 'Wake up to fresh leads, no work',
    description: 'In the SAME ChatGPT chat, paste the schedule prompt: "Create this as a recurring task every weekday at 7:00 AM." ChatGPT runs it for you forever — you just review the results.',
    detail: 'This is the move that gets you under 30 mins/day. Set it once Monday morning and you\'re done.',
    simId: 'schedule',
    gradient: 'linear-gradient(135deg, #1a1145, #0F0F1A)',
  },
];

const Sim = ({ simId }: { simId: Step['simId'] }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, [simId]);
  const frame = tick % 6;

  if (simId === 'pick-market') {
    const presets = [
      { label: 'Huntsville, AL', icon: '🚀' },
      { label: 'Nashville, TN', icon: '🎵' },
      { label: 'Atlanta, GA', icon: '🍑' },
    ];
    const active = frame % 3;
    return (
      <div className="h-[140px] rounded-md p-3 flex flex-col gap-2 justify-center" style={{ background: '#0a0a14', border: '1px solid rgba(251,146,60,.25)' }}>
        <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Quick select a market</div>
        <div className="flex gap-2">
          {presets.map((p, i) => (
            <div
              key={p.label}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-[11px] font-medium transition-all duration-300"
              style={{
                background: i === active ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'rgba(255,255,255,.06)',
                color: i === active ? '#fff' : 'rgba(255,255,255,.6)',
                transform: i === active ? 'scale(1.05)' : 'scale(1)',
                boxShadow: i === active ? '0 4px 12px rgba(251,146,60,.4)' : 'none',
              }}
            >
              <span>{p.icon}</span>
              {p.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (simId === 'pick-vertical') {
    const verticals = ['Relocation', 'Construction', 'Healthcare', 'Tech', 'Govt', 'Consult', 'Interns'];
    const active = frame % verticals.length;
    return (
      <div className="h-[140px] rounded-md p-3 flex flex-col justify-center" style={{ background: '#0a0a14', border: '1px solid rgba(251,146,60,.25)' }}>
        <div className="text-[10px] uppercase tracking-wider text-white/50 mb-2">🏢 Which industry?</div>
        <div className="flex flex-wrap gap-1.5">
          {verticals.map((v, i) => (
            <div
              key={v}
              className="px-2.5 py-1 rounded text-[11px] transition-all duration-300"
              style={{
                background: i === active ? 'linear-gradient(135deg, #fb923c, #f59e0b)' : 'rgba(255,255,255,.05)',
                color: i === active ? '#fff' : 'rgba(255,255,255,.55)',
                transform: i === active ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              {v}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (simId === 'pick-signal') {
    const signals = [
      { label: 'Contract award', icon: '📝' },
      { label: 'Office relocation', icon: '📦' },
      { label: 'Facility expansion', icon: '🏗️' },
      { label: 'Training cohort', icon: '👥' },
      { label: 'Funding round', icon: '💰' },
    ];
    const active = frame % signals.length;
    return (
      <div className="h-[140px] rounded-md p-3 flex flex-col justify-center gap-1" style={{ background: '#0a0a14', border: '1px solid rgba(251,146,60,.25)' }}>
        <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">📡 Movement type</div>
        {signals.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center gap-2 px-2 py-1 rounded text-[11px] transition-all duration-300"
            style={{
              background: i === active ? 'rgba(251,146,60,.18)' : 'transparent',
              color: i === active ? '#fb923c' : 'rgba(255,255,255,.5)',
              borderLeft: i === active ? '2px solid #fb923c' : '2px solid transparent',
            }}
          >
            <span>{s.icon}</span>
            {s.label}
          </div>
        ))}
      </div>
    );
  }

  if (simId === 'build') {
    const fields = ['Market', 'Vertical', 'Signal'];
    const filled = Math.min(frame, 3);
    const ready = filled === 3;
    return (
      <div className="h-[140px] rounded-md p-3 flex flex-col justify-center gap-3" style={{ background: '#0a0a14', border: '1px solid rgba(251,146,60,.25)' }}>
        <div className="flex items-center gap-2 justify-center">
          {fields.map((f, i) => (
            <div key={f} className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300"
                style={{
                  background: i < filled ? '#10B981' : 'rgba(255,255,255,.1)',
                  color: '#fff',
                  transform: i < filled ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {i < filled ? '✓' : ''}
              </div>
              <span className="text-[10px]" style={{ color: i < filled ? '#10B981' : 'rgba(255,255,255,.4)' }}>{f}</span>
              {i < 2 && <span className="text-[10px] text-white/20 mx-0.5">→</span>}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <div
            className="px-5 py-2 rounded text-[12px] font-bold transition-all duration-300"
            style={{
              background: ready ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'rgba(255,255,255,.08)',
              color: ready ? '#fff' : 'rgba(255,255,255,.3)',
              boxShadow: ready ? '0 4px 14px rgba(251,146,60,.5)' : 'none',
              transform: ready ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            ⚡ Build My Prompt
          </div>
        </div>
      </div>
    );
  }

  if (simId === 'copy-paste') {
    const copied = frame >= 2;
    const pasted = frame >= 4;
    return (
      <div className="h-[140px] rounded-md p-3 flex gap-2" style={{ background: '#0a0a14', border: '1px solid rgba(251,146,60,.25)' }}>
        <div className="flex-1 rounded p-2 flex flex-col" style={{ background: 'linear-gradient(135deg, #0E1E3A, #1a1145)' }}>
          <div className="text-[8px] text-white/40 uppercase tracking-wider mb-1">Flare prompt</div>
          <div className="text-[9px] text-white/70 leading-[1.4] font-mono">Find companies in Atlanta, GA with construction contract awards...</div>
          <div className="mt-auto flex justify-end">
            <div
              className="px-2 py-0.5 rounded text-[8px] font-bold transition-all duration-300"
              style={{
                background: copied ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #fb923c, #f97316)',
                color: copied ? '#fff' : '#0E1E3A',
              }}
            >
              {copied ? '✓ COPIED' : '📋 COPY'}
            </div>
          </div>
        </div>
        <div className="text-white/30 self-center text-[14px]">→</div>
        <div className="flex-1 rounded p-2 flex flex-col" style={{ background: 'rgba(16,163,127,.08)', border: '1px solid rgba(16,163,127,.25)' }}>
          <div className="text-[8px] uppercase tracking-wider mb-1" style={{ color: '#10A37F' }}>ChatGPT · Agent</div>
          <div className="text-[9px] leading-[1.4]" style={{ color: pasted ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.25)' }}>
            {pasted ? 'Searching market... 12 leads found ✓' : 'Paste prompt here...'}
          </div>
        </div>
      </div>
    );
  }

  if (simId === 'schedule') {
    const days = ['M', 'T', 'W', 'T', 'F'];
    const active = frame % 5;
    return (
      <div className="h-[140px] rounded-md p-3 flex flex-col justify-center gap-2" style={{ background: '#0a0a14', border: '1px solid rgba(251,146,60,.25)' }}>
        <div className="text-[10px] uppercase tracking-wider text-white/50 text-center">⏰ 7:00 AM · Every weekday</div>
        <div className="flex gap-1.5 justify-center">
          {days.map((d, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded flex flex-col items-center justify-center transition-all duration-300"
              style={{
                background: i <= active ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'rgba(255,255,255,.05)',
                transform: i === active ? 'scale(1.15)' : 'scale(1)',
                boxShadow: i === active ? '0 4px 12px rgba(251,146,60,.5)' : 'none',
              }}
            >
              <div className="text-[10px] font-bold" style={{ color: i <= active ? '#fff' : 'rgba(255,255,255,.4)' }}>{d}</div>
              <div className="text-[8px]" style={{ color: i <= active ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.2)' }}>
                {i <= active ? '✓' : '·'}
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-center" style={{ color: '#10B981' }}>
          {active >= 4 ? '✓ Fresh leads in your inbox every morning' : 'Running...'}
        </div>
      </div>
    );
  }

  return null;
};

const PromptBuilderTour = ({ open, onClose }: PromptBuilderTourProps) => {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const goTo = useCallback((next: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 200);
  }, []);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) goTo(step + 1);
    else onClose();
  }, [step, goTo, onClose]);

  const handleBack = useCallback(() => {
    if (step > 0) goTo(step - 1);
  }, [step, goTo]);

  if (!open) return null;

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ background: 'rgba(30,20,10,.45)', backdropFilter: 'blur(6px)' }}>
      <div
        className="w-full max-w-[540px] rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg, #FFFBF5 0%, #FFF1E0 100%)',
          border: '1px solid rgba(251,146,60,.25)',
          boxShadow: '0 30px 80px -20px rgba(251,146,60,.35), 0 0 0 1px rgba(255,255,255,.6) inset, 0 1px 0 rgba(255,255,255,.9) inset',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Skip tour"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(255,255,255,.7)',
            color: '#7c3a14',
            border: '1px solid rgba(251,146,60,.3)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(251,146,60,.15)',
          }}
        >
          ✕
        </button>

        <div className="h-[3px] w-full" style={{ background: 'rgba(251,146,60,.12)' }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #fbbf24, #fb923c, #f97316)',
              boxShadow: '0 0 14px rgba(251,146,60,.7)',
            }}
          />
        </div>

        <div className="px-6 pt-6 pb-4 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-50" style={{ background: 'radial-gradient(circle, #fde68a, transparent 70%)' }} />
          <div className="absolute -top-8 right-12 w-24 h-24 rounded-full opacity-40" style={{ background: 'radial-gradient(circle, #fb923c, transparent 70%)' }} />
          <div className={`relative transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] rounded-full" style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: '#fff', boxShadow: '0 2px 6px rgba(251,146,60,.4)' }}>
                Step {step + 1} / {STEPS.length}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#9a6b3a' }}>Prompt Builder Tour</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[28px]">{current.icon}</span>
              <div>
                <h2 className="text-[18px] font-bold leading-tight tracking-tight" style={{ color: '#1E293B' }}>
                  {current.title}
                </h2>
                <p className="text-[12px] font-semibold mt-0.5" style={{ color: '#ea580c' }}>
                  {current.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <div className={`transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="mb-4">
              <Sim simId={current.simId} />
              <div className="text-[9px] mt-1.5 text-center uppercase tracking-[0.2em] font-semibold" style={{ color: '#b07c4d' }}>— Live preview —</div>
            </div>
            <p className="text-[13px] leading-[1.7] mb-3" style={{ color: '#1E293B' }}>
              {current.description}
            </p>
            <div className="flex gap-3 items-start p-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)', border: '1px solid rgba(251,146,60,.25)' }}>
              <span className="text-[14px] flex-shrink-0 mt-0.5">💡</span>
              <p className="text-[12px] leading-[1.6]" style={{ color: '#5c3a1a' }}>{current.detail}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(251,146,60,.15)', background: 'rgba(255,255,255,.4)' }}>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBack}
              disabled={isFirst}
              className="px-3 py-1.5 text-[12px] font-semibold transition-all duration-200"
              style={{
                color: isFirst ? 'rgba(30,41,59,.25)' : '#475569',
                cursor: isFirst ? 'not-allowed' : 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={{ color: '#94a3b8' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ea580c')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
            >
              Skip tour
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 items-center">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? '20px' : '6px',
                    height: '6px',
                    background: i === step
                      ? 'linear-gradient(90deg, #fbbf24, #f97316)'
                      : i < step
                        ? 'rgba(251,146,60,.5)'
                        : 'rgba(251,146,60,.18)',
                    boxShadow: i === step ? '0 0 8px rgba(251,146,60,.6)' : 'none',
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg text-[12px] font-bold tracking-wide text-white transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #fb923c, #f97316)',
                boxShadow: '0 4px 14px rgba(251,146,60,.5), inset 0 1px 0 rgba(255,255,255,.3)',
              }}
            >
              {isLast ? 'Got it 🔥' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default PromptBuilderTour;


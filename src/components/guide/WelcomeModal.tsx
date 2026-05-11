import { useState, useEffect, useCallback } from 'react';
import StepSimulation from './StepSimulation';

const DISMISSED_KEY = 'flare-welcome-dismissed';

interface TourStep {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  detail: string;
  tabId?: string;
  gradient: string;
  simId: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: '🔥',
    title: 'Welcome to Flare',
    subtitle: '7 tools to fill your pipeline in 30 mins/day',
    description: 'Flare helps NCH BDRs find companies with active housing needs, identify the right buyer, and send signal-specific outreach — without spending hours researching.',
    detail: 'This 30-second walkthrough shows you each tool and how they fit into a daily routine.',
    gradient: 'linear-gradient(135deg, #0F0F1A 0%, #1f1d2e 50%, #2d1b35 100%)',
    simId: 'intro',
  },
  {
    icon: '🏠',
    title: 'Dashboard',
    subtitle: 'Your daily command center',
    description: 'Open Flare each morning here. See your assigned markets, fresh opportunities from overnight scans, and what to action first.',
    detail: 'Start every day on Dashboard. It tells you exactly where to begin.',
    tabId: 'dashboard',
    gradient: 'linear-gradient(135deg, #1a2540, #0F0F1A)',
    simId: 'dashboard',
  },
  {
    icon: '⚡',
    title: 'Opportunities',
    subtitle: 'Live leads, scored and ready',
    description: 'Auto-scanned companies with real housing signals — sorted HIGH / MEDIUM / LOW so you call the right one first.',
    detail: 'Pull HIGH priority first. Log it. Research the company. Then move to outreach.',
    tabId: 'opportunities',
    gradient: 'linear-gradient(135deg, #3d2410, #1a1410)',
    simId: 'results',
  },
  {
    icon: '🔥',
    title: 'Market Heat',
    subtitle: 'See where demand is spiking',
    description: 'A live heat map of your markets so you know which cities and verticals are hot this week — and where to focus prospecting.',
    detail: 'If a market goes red, prioritize it before competitors do.',
    tabId: 'market',
    gradient: 'linear-gradient(135deg, #4a1f1a, #2d1410)',
    simId: 'heat',
  },
  {
    icon: '🎪',
    title: 'Find Events',
    subtitle: 'Verified events in your markets',
    description: 'Nationwide search for conferences, project kickoffs, and industry events tied to your verticals — each link health-checked.',
    detail: 'Events = warm intros. Mention one in your first email and response rates jump.',
    tabId: 'events',
    gradient: 'linear-gradient(135deg, #2d1b3d, #1a1145)',
    simId: 'events',
  },
  {
    icon: '📡',
    title: 'Prompt Builder',
    subtitle: 'Find companies showing demand signals',
    description: 'Pick city, vertical, and signal type. Get a ready-to-paste ChatGPT Agent Mode prompt that finds companies with real housing needs.',
    detail: 'Set it up once, schedule it weekday mornings, and wake up to fresh leads.',
    tabId: 'tracker',
    gradient: 'linear-gradient(135deg, #1a3a5c, #1a1145)',
    simId: 'tracker',
  },
  {
    icon: '📋',
    title: 'Score Signals',
    subtitle: 'Is this lead worth chasing?',
    description: 'Paste any headline or news blurb. Get an instant HIGH / MEDIUM / LOW score plus the likely service line to pitch.',
    detail: 'Use this anytime you\'re unsure if a lead deserves your time.',
    tabId: 'signals',
    gradient: 'linear-gradient(135deg, #2d1b69, #1a1145)',
    simId: 'bonus',
  },
  {
    icon: '✉️',
    title: 'Write Outreach',
    subtitle: 'Signal-specific first emails',
    description: 'Enter the company, signal, buyer title, service line, and tone. Get a 4-sentence, under-100-word email in NCH\'s voice — ready to send.',
    detail: 'Pro tip: Send it to yourself first and read on your phone. If it looks like a wall of text, rewrite it.',
    tabId: 'outreach',
    gradient: 'linear-gradient(135deg, #1a1145, #0F0F1A)',
    simId: 'outreach',
  },
];

interface WelcomeModalProps {
  onNavigateToTab?: (tabId: string) => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

const WelcomeModal = ({ onNavigateToTab, forceOpen, onClose }: WelcomeModalProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setStep(0);
      setOpen(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) {
      setOpen(true);
    }
  }, []);

  const goTo = useCallback((nextStep: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 200);
  }, []);

  const closeModal = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setOpen(false);
    onClose?.();
  }, [onClose]);

  const handleNext = useCallback(() => {
    if (step < TOUR_STEPS.length - 1) {
      goTo(step + 1);
    } else {
      closeModal();
    }
  }, [step, goTo, closeModal]);

  const handleBack = useCallback(() => {
    if (step > 0) goTo(step - 1);
  }, [step, goTo]);

  const handleSkip = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleJumpToTab = useCallback(() => {
    const current = TOUR_STEPS[step];
    if (current.tabId && onNavigateToTab) {
      closeModal();
      onNavigateToTab(current.tabId);
    }
  }, [step, onNavigateToTab, closeModal]);

  if (!open) return null;

  const current = TOUR_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TOUR_STEPS.length - 1;
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" style={{ background: 'rgba(8,8,16,.82)', backdropFilter: 'blur(8px)' }}>
      <div
        className="w-full max-w-[540px] rounded-xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg, #0F0F1A 0%, #14141f 100%)',
          border: '1px solid rgba(251,146,60,.18)',
          boxShadow: '0 30px 80px -20px rgba(251,146,60,.25), 0 0 0 1px rgba(251,146,60,.08), inset 0 1px 0 rgba(255,255,255,.04)',
        }}
      >
        {/* Persistent Skip / Close */}
        <button
          onClick={closeModal}
          aria-label="Skip tour"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-all duration-200 hover:scale-110"
          style={{
            background: 'rgba(255,255,255,.06)',
            color: 'rgba(255,255,255,.6)',
            border: '1px solid rgba(255,255,255,.08)',
            backdropFilter: 'blur(8px)',
          }}
        >
          ✕
        </button>

        {/* Progress bar */}
        <div className="h-[2px] w-full" style={{ background: 'rgba(251,146,60,.08)' }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #fb923c, #f97316)',
              boxShadow: '0 0 12px rgba(251,146,60,.6)',
            }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #fb923c, transparent 70%)' }} />
          <div className={`relative transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] rounded" style={{ background: 'rgba(251,146,60,.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,.25)' }}>
                Step {step + 1} / {TOUR_STEPS.length}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/30">Welcome Tour</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[28px]">{current.icon}</span>
              <div>
                <h2 className="text-[18px] font-bold leading-tight tracking-tight text-white">
                  {current.title}
                </h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: '#fb923c' }}>
                  {current.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-5">
          <div className={`transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="mb-4">
              <StepSimulation stepId={current.simId} />
              <div className="text-[9px] text-white/30 mt-1.5 text-center uppercase tracking-[0.2em]">— Live preview —</div>
            </div>
            <p className="text-[13px] leading-[1.7] text-white/85 mb-3">
              {current.description}
            </p>
            <div className="flex gap-3 items-start p-3 rounded-md" style={{ background: 'rgba(251,146,60,.06)', border: '1px solid rgba(251,146,60,.18)' }}>
              <span className="text-[13px] flex-shrink-0 mt-0.5">💡</span>
              <p className="text-[12px] leading-[1.6] text-white/70">
                {current.detail}
              </p>
            </div>

            {current.tabId && (
              <button
                onClick={handleJumpToTab}
                className="mt-3 text-[11px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
                style={{ color: '#fb923c' }}
              >
                Jump to this tab →
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,.05)', background: 'rgba(0,0,0,.2)' }}>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBack}
              disabled={isFirst}
              className="px-3 py-1.5 text-[12px] font-semibold transition-all duration-200"
              style={{
                color: isFirst ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.6)',
                cursor: isFirst ? 'not-allowed' : 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors"
            >
              Skip tour
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? '18px' : '6px',
                    height: '6px',
                    background: i === step
                      ? 'linear-gradient(90deg, #fb923c, #f97316)'
                      : i < step
                        ? 'rgba(251,146,60,.5)'
                        : 'rgba(255,255,255,.12)',
                    boxShadow: i === step ? '0 0 8px rgba(251,146,60,.6)' : 'none',
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-md text-[12px] font-bold tracking-wide text-white transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                boxShadow: '0 4px 14px rgba(251,146,60,.4), inset 0 1px 0 rgba(255,255,255,.2)',
              }}
            >
              {isLast ? 'Let\'s go 🔥' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

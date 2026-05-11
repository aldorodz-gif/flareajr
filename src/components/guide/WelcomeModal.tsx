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
    subtitle: '5 AI tools to fill your pipeline',
    description: 'Flare helps NCH BDRs find companies with active housing needs, identify the right buyer, and send signal-specific outreach — without spending hours researching.',
    detail: 'This 30-second walkthrough shows you each tool and how they connect into a daily routine.',
    gradient: 'linear-gradient(135deg, #0F0F1A 0%, #1a1145 30%, #2d1b69 60%, #4a1942 100%)',
    simId: 'intro',
  },
  {
    icon: '📡',
    title: 'Step 2: Prompt Builder',
    subtitle: 'Find companies showing demand signals',
    description: 'Pick your city, vertical, and signal type. Get a ready-to-paste ChatGPT Agent Mode prompt that finds companies with real housing needs.',
    detail: 'Set it up once, schedule it to run every weekday morning, and wake up to fresh leads.',
    tabId: 'tracker',
    gradient: 'linear-gradient(135deg, #1a3a5c, #1a1145)',
    simId: 'tracker',
  },
  {
    icon: '⚡',
    title: 'Step 3: Work Your List',
    subtitle: 'Triage, prioritize, and research',
    description: 'Review overnight results. HIGH signals go straight to your call list. Each vertical has a sample signal, buyer, outreach angle, and email ready to go.',
    detail: 'Pull HIGH priority first. Log it. Research the company. Then move to outreach.',
    tabId: 'results',
    gradient: 'linear-gradient(135deg, #2d1b69, #4a1942)',
    simId: 'results',
  },
  {
    icon: '🎯',
    title: 'Step 4: Who to Call',
    subtitle: 'Match the buyer to the signal',
    description: 'Don\'t start with HR. Start with whoever\'s job breaks if the need isn\'t solved — the project manager, company manager, or operations lead.',
    detail: 'Every vertical has primary and non-traditional titles mapped out for you.',
    tabId: 'contact',
    gradient: 'linear-gradient(135deg, #4a1942, #6b2150)',
    simId: 'contact',
  },
  {
    icon: '✉️',
    title: 'Step 5: Write Outreach',
    subtitle: 'Signal-specific first emails',
    description: 'Enter the company, signal, buyer title, and service line. Get a 4-sentence, under-100-word email drafted in NCH\'s voice — ready to send.',
    detail: 'Pro tip: Send it to yourself first and read it on your phone. If it looks like a wall of text, rewrite it.',
    tabId: 'outreach',
    gradient: 'linear-gradient(135deg, #1a1145, #0F0F1A)',
    simId: 'outreach',
  },
  {
    icon: '📋',
    title: 'Bonus: Score Signals & Mindset',
    subtitle: 'Two more tools in your kit',
    description: 'Score Signals instantly rates any headline HIGH / MEDIUM / LOW with the likely service line. Mindset keeps you sharp on the approach.',
    detail: 'Use Score Signals when you\'re not sure if a lead is worth pursuing. Check Mindset when you need a reset.',
    gradient: 'linear-gradient(135deg, #2d1b69, #1a1145)',
    simId: 'bonus',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,15,26,.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-[520px] rounded-lg overflow-hidden shadow-2xl"
        style={{ background: 'hsl(var(--card))' }}
      >
        {/* Progress bar */}
        <div className="h-[3px] w-full" style={{ background: 'rgba(155,120,200,.15)' }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8B8FE8, #D97FAA)',
              boxShadow: '0 0 10px rgba(155,120,200,.4)',
            }}
          />
        </div>

        {/* Header with gradient */}
        <div
          className="px-6 py-5 transition-all duration-300"
          style={{ background: current.gradient }}
        >
          <div className={`transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[28px]">{current.icon}</span>
              <div>
                <h2
                  className="text-[20px] font-semibold leading-tight"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 40%, #c4b5fd 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {current.title}
                </h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,.5)' }}>
                  {current.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className={`transition-all duration-200 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <p className="text-[14px] leading-[1.7] text-foreground mb-3">
              {current.description}
            </p>

            <div className="flex gap-3 items-start p-3.5 rounded" style={{ background: 'rgba(155,120,200,.06)', border: '1px solid rgba(155,120,200,.12)' }}>
              <span className="text-[14px] flex-shrink-0 mt-0.5">💡</span>
              <p className="text-[12px] leading-[1.6] text-muted-foreground">
                {current.detail}
              </p>
            </div>

            {current.tabId && (
              <button
                onClick={handleJumpToTab}
                className="mt-3 text-[12px] font-semibold transition-opacity hover:opacity-80"
                style={{ color: '#9B78C8' }}
              >
                Jump to this tab →
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            )}
            {isFirst && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Step dots */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="w-[7px] h-[7px] rounded-full transition-all duration-300"
                  style={{
                    background: i === step
                      ? 'linear-gradient(135deg, #9B78C8, #D97FAA)'
                      : i < step
                        ? 'rgba(155,120,200,.4)'
                        : 'rgba(155,120,200,.15)',
                    transform: i === step ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: i === step ? '0 0 6px rgba(155,120,200,.4)' : 'none',
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}
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
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface SignalsTabProps {
  onNavigate: (tabId: string) => void;
}

const signalRows = [
  { pursue: 'HQ or Office Relocation', skip: 'Generic Hiring Posts', why: 'Relocation means people physically moving, bridge housing needed. Hiring posts mean remote roles with no physical movement.' },
  { pursue: 'New Facility, Plant or Expansion', skip: 'One-Day Events', why: 'Facility launches bring contractors and management on-site for months. Conferences end the same day.' },
  { pursue: 'Defense or Commercial Contract Award', skip: 'Short Conference Traffic', why: 'Contract awards deploy engineering and field teams for defined periods. Conference hotel traffic has no project angle.' },
  { pursue: 'Infrastructure Build Phase', skip: 'General Company News', why: 'Large construction creates rotating crew needs across phases. Company news without physical expansion creates no demand.' },
  { pursue: 'Merger or Acquisition', skip: 'Remote-Only Hiring', why: 'M&A integration teams travel and need temporary housing. Remote hires never relocate.' },
  { pursue: 'Training, Onboarding or Intern Cohort', skip: 'Speculative Plans', why: 'Cohorts have defined start dates and headcount. Speculative plans have no confirmed timeline.' },
  { pursue: 'Series B/C + Physical Expansion', skip: '—', why: 'Funding alone is not the signal. The physical move or market entry that follows the funding is.' },
  { pursue: 'Return-to-Office Mandate', skip: '—', why: 'Remote employees relocating for RTO create immediate bridge housing need.' },
  { pursue: 'Sports Team / League Program', skip: 'Fan Events or Game-Day Ops', why: 'Player housing, fellowship programs, and staff rotations create recurring furnished housing needs. Game-day events are one-off with no stay.' },
  { pursue: 'Theater Production or Residency', skip: 'Single-Night Performances', why: 'LORT theaters and regional companies hire out-of-town actors, directors, and crew for 30+ day runs. One-night touring stops have no housing angle.' },
];

const exampleSignals = [
  { label: '🏗️ Construction', text: 'Turner Construction awarded $450M hospital expansion project in Phoenix, breaking ground Q3 2026' },
  { label: '🎭 Theater', text: 'Oregon Shakespeare Festival announces 8-show 2026 season with 6 world premieres running March through October' },
  { label: '🛡️ Defense', text: 'Northrop Grumman wins $1.2B ICBM modernization contract, establishing engineering hub in Roy, Utah' },
  { label: '🏈 Sports', text: 'MLS expansion team begins preseason training camp in San Diego, 40+ players and staff relocating' },
];

interface ScoreResult {
  score: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  service_line: string;
}

const SignalsTab = ({ onNavigate }: SignalsTabProps) => {
  const [signalText, setSignalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');
  const [typingDemo, setTypingDemo] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Typing animation for the demo text
  useEffect(() => {
    if (hasInteracted) return;
    const demoText = 'Boeing opens new 737 MAX assembly line in Everett, WA — 200+ engineers relocating...';
    let i = 0;
    const interval = setInterval(() => {
      setTypingDemo(demoText.slice(0, i + 1));
      i++;
      if (i >= demoText.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [hasInteracted]);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  const handleScore = useCallback(async () => {
    if (!signalText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('signal-scorer', {
        body: { signal: signalText.trim() },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data as ScoreResult);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [signalText]);

  const handleReset = () => {
    setSignalText('');
    setResult(null);
    setError('');
  };

  const handleExampleClick = (text: string) => {
    setHasInteracted(true);
    setSignalText(text);
  };

  const handleTextareaFocus = () => {
    setHasInteracted(true);
  };

  const scoreConfig = (score: string) => {
    if (score === 'HIGH') return { bg: 'linear-gradient(135deg, #10B981, #059669)', glow: '0 0 40px rgba(16,185,129,.3)', label: 'Call today.', icon: '🎯', action: 'This is a real signal. Pick up the phone.' };
    if (score === 'LOW') return { bg: 'linear-gradient(135deg, #64748B, #475569)', glow: '0 0 40px rgba(100,116,139,.2)', label: 'Move on.', icon: '→', action: 'No physical movement here. Skip it.' };
    return { bg: 'linear-gradient(135deg, #F59E0B, #D97706)', glow: '0 0 40px rgba(245,158,11,.25)', label: 'Track it.', icon: '👁', action: 'Not ready yet, but worth watching.' };
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #E8BE70, #E07878)">Step 05: Quick Reference</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Signals Guide: What Counts as a Real Demand Signal</h2>
      <p className="text-[13px] max-w-[760px] mb-6 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Use this as a fast filter. If the signal points to real people movement or clear buying pressure for temporary housing, travel, hotels, or destination services, pursue it. If it does not, move on.
      </p>

      {/* ═══════════════════════════════════════════════════ */}
      {/* SIGNAL SCORER — THE INTERACTIVE TOOL               */}
      {/* ═══════════════════════════════════════════════════ */}

      {/* Outer animated wrapper with floating + glowing border */}
      <div className="animate-tool-float mb-12 relative group">
        {/* Animated gradient border */}
        <div
          className="absolute -inset-[2px] rounded-[20px] animate-border-glow pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #D6B07A, #9B78C8, #10B981, #D6B07A)',
            backgroundSize: '300% 300%',
            animation: 'borderGlow 2.5s ease-in-out infinite, shimmer 4s linear infinite',
          }}
        />

        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0E1E3A 0%, #1a1145 50%, #2d1b69 100%)',
            boxShadow: '0 25px 80px rgba(14,30,58,.45), 0 0 60px rgba(214,176,122,.08)',
          }}
        >
          {/* Ambient glow effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[350px] h-[350px] opacity-30" style={{ background: 'radial-gradient(circle, rgba(214,176,122,.5), transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] opacity-25" style={{ background: 'radial-gradient(circle, rgba(155,120,200,.6), transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[.06]" style={{ background: 'radial-gradient(circle, rgba(255,255,255,.8), transparent 60%)' }} />
          </div>

          {/* Radar ping decoration */}
          <div className="absolute top-6 right-6 pointer-events-none">
            <div className="relative">
              <span className="absolute inset-0 rounded-full animate-radar-ping" style={{ background: 'rgba(16,185,129,.3)', width: '44px', height: '44px' }} />
              <span className="absolute inset-0 rounded-full animate-radar-ping" style={{ background: 'rgba(16,185,129,.2)', width: '44px', height: '44px', animationDelay: '0.8s' }} />
            </div>
          </div>

          {/* Header area */}
          <div className="relative px-6 md:px-8 pt-7 pb-2">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #D6B07A, #E8BE70)',
                    boxShadow: '0 8px 30px rgba(214,176,122,.45), 0 0 15px rgba(214,176,122,.2)',
                  }}
                >
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[22px] font-extrabold tracking-tight" style={{ color: '#fff' }}>Signal Scorer</p>
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-[.15em] animate-shimmer"
                      style={{
                        background: 'linear-gradient(90deg, rgba(214,176,122,.2), rgba(214,176,122,.4), rgba(214,176,122,.2))',
                        backgroundSize: '200% 100%',
                        color: '#D6B07A',
                        border: '1px solid rgba(214,176,122,.3)',
                      }}
                    >
                      AI Tool
                    </span>
                  </div>
                  <p className="text-[14px] mt-1 font-medium" style={{ color: 'rgba(214,176,122,.8)' }}>Paste any signal. I'll tell you if it's worth your time.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-full" style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', boxShadow: '0 0 20px rgba(16,185,129,.15)' }}>
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,.6)' }} />
                <span className="text-[11px] font-bold tracking-wide" style={{ color: '#10B981' }}>Live</span>
              </div>
            </div>
          </div>

        {/* Interactive body */}
        <div className="relative px-6 md:px-8 pb-8">
          {!result ? (
            <>
              {/* Demo typing preview — disappears once user interacts */}
              {!hasInteracted && !signalText && (
                <div className="mb-5 px-5 py-4 rounded-xl" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] mb-2" style={{ color: 'rgba(214,176,122,.5)' }}>Example input</p>
                  <p className="text-[14px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.7)' }}>
                    {typingDemo}
                    <span style={{ opacity: showCursor ? 1 : 0, color: '#D6B07A', transition: 'opacity 0.1s' }}>|</span>
                  </p>
                </div>
              )}

              {/* Example signal chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide self-center mr-1" style={{ color: 'rgba(255,255,255,.35)' }}>Try:</span>
                {exampleSignals.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => handleExampleClick(ex.text)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255,255,255,.06)',
                      border: '1px solid rgba(255,255,255,.1)',
                      color: 'rgba(255,255,255,.7)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLElement).style.background = 'rgba(214,176,122,.15)';
                      (e.target as HTMLElement).style.borderColor = 'rgba(214,176,122,.3)';
                      (e.target as HTMLElement).style.color = '#D6B07A';
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.background = 'rgba(255,255,255,.06)';
                      (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,.1)';
                      (e.target as HTMLElement).style.color = 'rgba(255,255,255,.7)';
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={signalText}
                  onChange={e => { setSignalText(e.target.value); setHasInteracted(true); }}
                  onFocus={handleTextareaFocus}
                  placeholder="Paste a headline, LinkedIn post, or article excerpt..."
                  className="w-full min-h-[130px] p-5 rounded-xl text-[14px] leading-[1.7] resize-none focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,.95)',
                    border: '2px solid transparent',
                    borderImage: signalText.trim() ? 'linear-gradient(135deg, #D6B07A, #9B78C8) 1' : 'none',
                    borderColor: signalText.trim() ? undefined : 'rgba(255,255,255,.2)',
                    borderRadius: '12px',
                    color: '#1a1145',
                    boxShadow: signalText.trim()
                      ? '0 0 30px rgba(214,176,122,.15), 0 8px 24px rgba(0,0,0,.1)'
                      : '0 4px 12px rgba(0,0,0,.1)',
                  }}
                  disabled={loading}
                />
                {signalText.trim() && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(214,176,122,.12)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#D6B07A' }} />
                    <span className="text-[11px] font-semibold" style={{ color: '#B8943F' }}>Ready</span>
                  </div>
                )}
              </div>

              {/* Score button */}
              <button
                onClick={handleScore}
                disabled={!signalText.trim() || loading}
                className="mt-5 w-full py-4 rounded-xl text-[15px] font-bold tracking-wide transition-all"
                style={{
                  background: !signalText.trim() || loading
                    ? 'rgba(255,255,255,.06)'
                    : 'linear-gradient(135deg, #D6B07A, #E8BE70)',
                  color: !signalText.trim() || loading ? 'rgba(255,255,255,.25)' : '#0E1E3A',
                  cursor: !signalText.trim() || loading ? 'not-allowed' : 'pointer',
                  boxShadow: signalText.trim() && !loading
                    ? '0 8px 30px rgba(214,176,122,.35), 0 0 0 1px rgba(214,176,122,.2)'
                    : 'none',
                  border: !signalText.trim() || loading ? '1px solid rgba(255,255,255,.08)' : 'none',
                  letterSpacing: '.04em',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full animate-spin"
                      style={{ border: '2.5px solid rgba(14,30,58,.2)', borderTopColor: '#0E1E3A' }}
                    />
                    Analyzing signal...
                  </span>
                ) : (
                  signalText.trim() ? '⚡ Score This Signal' : 'Paste a signal above to get started'
                )}
              </button>
              {error && (
                <p className="mt-3 text-[13px] font-medium text-center" style={{ color: '#F87171' }}>{error}</p>
              )}
            </>
          ) : (
            /* ─── Results View ─── */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Score result card */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ boxShadow: scoreConfig(result.score).glow }}
              >
                {/* Score banner */}
                <div className="px-6 py-6 flex items-center justify-between" style={{ background: scoreConfig(result.score).bg }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.2em] mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Verdict</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[36px] font-black tracking-tight" style={{ color: '#fff' }}>{result.score}</span>
                      <span className="text-[15px] font-medium" style={{ color: 'rgba(255,255,255,.85)' }}>{scoreConfig(result.score).label}</span>
                    </div>
                  </div>
                  <div className="text-[36px]">{scoreConfig(result.score).icon}</div>
                </div>

                {/* Analysis */}
                <div className="p-6" style={{ background: 'rgba(255,255,255,.97)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] mb-2" style={{ color: '#94A3B8' }}>Analysis</p>
                  <p className="text-[15px] leading-[1.7] mb-5" style={{ color: '#1a1145' }}>{result.reason}</p>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Service</span>
                      <span
                        className="px-3 py-1 rounded-full text-[12px] font-bold"
                        style={{ background: '#0E1E3A', color: '#D6B07A' }}
                      >
                        {result.service_line}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Action</span>
                      <span className="text-[13px] font-medium" style={{ color: '#1a1145' }}>{scoreConfig(result.score).action}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-6 w-full py-3.5 rounded-xl text-[14px] font-bold tracking-wide transition-all"
                style={{
                  background: 'rgba(255,255,255,.08)',
                  border: '1px solid rgba(255,255,255,.15)',
                  color: '#D6B07A',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.background = 'rgba(214,176,122,.12)';
                  (e.target as HTMLElement).style.borderColor = 'rgba(214,176,122,.3)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,.08)';
                  (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,.15)';
                }}
              >
                ← Score Another Signal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Score Legend ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
        {[
          { color: '#10B981', bg: 'rgba(16,185,129,.08)', label: 'HIGH', action: 'Call today', desc: 'Real people movement, defined timeline, identifiable buyer.' },
          { color: '#F59E0B', bg: 'rgba(245,158,11,.08)', label: 'MEDIUM', action: 'Track it', desc: 'Real change happening or early-stage signal with future potential.' },
          { color: '#EF4444', bg: 'rgba(239,68,68,.08)', label: 'LOW', action: 'Move on', desc: 'No plausible path to physical movement. Skip for now.' },
        ].map((tier) => (
          <div key={tier.label} className="rounded-xl p-4 relative overflow-hidden" style={{ background: tier.bg, border: `1px solid ${tier.color}22` }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: tier.color }} />
            <div className="flex items-center gap-2 mb-2 mt-1">
              <span className="text-[13px] font-black tracking-wide" style={{ color: tier.color }}>{tier.label}</span>
              <span className="text-[11px] font-semibold text-muted-foreground">→ {tier.action}</span>
            </div>
            <p className="text-[13px] text-foreground leading-[1.55]">{tier.desc}</p>
          </div>
        ))}
      </div>

      {/* ─── Pursue vs Skip Reference ─── */}
      <div className="mb-6">
        <h3 className="text-[16px] font-bold text-foreground mb-1">Quick Reference: Pursue vs. Skip</h3>
        <p className="text-[12px] text-muted-foreground mb-4">The signals that matter vs. the noise that doesn't.</p>
      </div>

      <div className="rounded-xl overflow-hidden mb-4 shadow-sm" style={{ border: '1px solid rgba(14,30,58,.08)' }}>
        <div className="grid grid-cols-[30%_22%_1fr] md:grid-cols-[28%_22%_1fr]" style={{ background: 'linear-gradient(135deg, #0E1E3A 0%, #1a1145 40%, #2d1b69 100%)' }}>
          <div className="px-4 py-3.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
            <span className="text-[11px] font-bold uppercase tracking-[.12em]" style={{ color: '#10B981' }}>Pursue</span>
          </div>
          <div className="px-4 py-3.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
            <span className="text-[11px] font-bold uppercase tracking-[.12em]" style={{ color: '#EF4444' }}>Skip</span>
          </div>
          <div className="px-4 py-3.5">
            <span className="text-[11px] font-bold uppercase tracking-[.12em]" style={{ color: 'rgba(255,255,255,.5)' }}>Why it matters</span>
          </div>
        </div>
        {signalRows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[30%_22%_1fr] md:grid-cols-[28%_22%_1fr] border-t"
            style={{ borderColor: 'rgba(14,30,58,.06)', background: i % 2 === 0 ? '#fff' : '#FAFAF8' }}
          >
            <div className="px-4 py-3.5 text-[13px] font-semibold text-foreground flex items-start gap-2">
              <span className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[7px]" style={{ background: '#10B981' }} />
              {row.pursue}
            </div>
            <div className="px-4 py-3.5 text-[13px] font-medium flex items-start gap-2" style={{ color: row.skip === '—' ? '#CBD5E1' : '#EF4444' }}>
              {row.skip !== '—' && <span className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[7px]" style={{ background: '#EF4444' }} />}
              {row.skip}
            </div>
            <div className="px-4 py-3.5 text-[12.5px] text-muted-foreground leading-[1.55]">{row.why}</div>
          </div>
        ))}
      </div>

      {/* Bottom callout */}
      <div className="rounded-xl p-5 flex gap-4 items-start" style={{ background: 'linear-gradient(135deg, #0E1E3A, #1a1145)', boxShadow: '0 4px 20px rgba(14,30,58,.2)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(214,176,122,.15)' }}>
          🔑
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[.12em] mb-1" style={{ color: '#D6B07A' }}>The one question that matters</p>
          <p className="text-[14px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.82)' }}>
            <strong style={{ color: '#fff' }}>Are real people physically going somewhere because of this?</strong> If yes, pursue. If the movement is virtual, speculative, or one day long, move on.
          </p>
        </div>
      </div>

      <SectionNav currentTab="signals" onNavigate={onNavigate} />
    </div>
  );
};

export default SignalsTab;

import { useState, useCallback } from 'react';
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

  const scoreConfig = (score: string) => {
    if (score === 'HIGH') return { bg: 'linear-gradient(135deg, #10B981, #059669)', glow: 'rgba(16,185,129,.15)', label: 'PURSUE', icon: '🎯' };
    if (score === 'LOW') return { bg: 'linear-gradient(135deg, #EF4444, #DC2626)', glow: 'rgba(239,68,68,.1)', label: 'SKIP', icon: '—' };
    return { bg: 'linear-gradient(135deg, #F59E0B, #D97706)', glow: 'rgba(245,158,11,.12)', label: 'WATCH', icon: '👁' };
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #E8BE70, #E07878)">Step 05: Quick Reference</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Signals Guide: What Counts as a Real Demand Signal</h2>
      <p className="text-[13px] max-w-[760px] mb-6 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Use this as a fast filter. If the signal points to real people movement or clear buying pressure for temporary housing, travel, hotels, or destination services, pursue it. If it does not, move on.
      </p>

      {/* ─── Signal Scorer Tool ─── */}
      <div className="rounded-xl overflow-hidden mb-10 shadow-lg" style={{ border: '1px solid rgba(155,120,200,.15)' }}>
        {/* Header */}
        <div className="relative px-6 py-5" style={{ background: 'linear-gradient(135deg, #0E1E3A 0%, #1a1145 40%, #2d1b69 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(214,176,122,.4), transparent 60%)' }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #D6B07A, #E8BE70)', boxShadow: '0 4px 12px rgba(214,176,122,.3)' }}>
                ⚡
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.15em]" style={{ color: 'rgba(214,176,122,.7)' }}>AI-Powered Tool</p>
                <p className="text-[20px] font-bold tracking-tight" style={{ color: '#fff' }}>Signal Scorer</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(214,176,122,.12)', border: '1px solid rgba(214,176,122,.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#D6B07A' }} />
              <p className="text-[11px] font-semibold tracking-wide" style={{ color: '#D6B07A' }}>Live</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6" style={{ background: '#FAF7F2' }}>
          {!result ? (
            <>
              {/* How it works - visual steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {[
                  { step: '1', title: 'Copy', desc: 'Grab a headline, LinkedIn post, or key paragraph from any article' },
                  { step: '2', title: 'Paste', desc: 'Drop the text below — paste the actual words, not the URL' },
                  { step: '3', title: 'Score', desc: 'Get an instant read on whether to pursue, watch, or skip' },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-3 p-3.5 rounded-lg" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.06)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold" style={{ background: 'linear-gradient(135deg, #0E1E3A, #1a1145)', color: '#D6B07A' }}>
                      {s.step}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-foreground">{s.title}</p>
                      <p className="text-[12px] text-muted-foreground leading-[1.5] mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={signalText}
                  onChange={e => setSignalText(e.target.value)}
                  placeholder={'"Lockheed Martin awarded $2.3B contract for F-35 sustainment at Fort Worth facility"\n\nPaste a headline, LinkedIn post, or article excerpt here...'}
                  className="w-full min-h-[130px] p-5 rounded-lg border-2 text-[14px] leading-[1.7] resize-none focus:outline-none transition-all"
                  style={{
                    borderColor: signalText.trim() ? 'rgba(214,176,122,.5)' : 'rgba(14,30,58,.1)',
                    background: '#fff',
                    boxShadow: signalText.trim() ? '0 0 0 3px rgba(214,176,122,.1)' : 'none',
                  }}
                  disabled={loading}
                />
                {signalText.trim() && (
                  <span className="absolute top-3 right-3 text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(214,176,122,.15)', color: '#B8943F' }}>
                    Ready to score
                  </span>
                )}
              </div>

              {/* Button */}
              <button
                onClick={handleScore}
                disabled={!signalText.trim() || loading}
                className="mt-4 w-full md:w-auto px-8 py-3.5 rounded-lg text-[14px] font-bold tracking-wide transition-all"
                style={{
                  background: !signalText.trim() || loading
                    ? '#CBD5E1'
                    : 'linear-gradient(135deg, #0E1E3A, #1a1145)',
                  color: !signalText.trim() || loading ? '#94A3B8' : '#D6B07A',
                  cursor: !signalText.trim() || loading ? 'not-allowed' : 'pointer',
                  boxShadow: signalText.trim() && !loading ? '0 4px 16px rgba(14,30,58,.25)' : 'none',
                  letterSpacing: '.05em',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D6B07A', borderTopColor: 'transparent' }} />
                    Analyzing...
                  </span>
                ) : 'Score This Signal'}
              </button>
              {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#C95B6A' }}>{error}</p>}
            </>
          ) : (
            <>
              {/* Result card */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(14,30,58,.08)', boxShadow: '0 8px 24px rgba(0,0,0,.06)' }}>
                {/* Score banner */}
                <div className="px-6 py-5 flex items-center justify-between" style={{ background: scoreConfig(result.score).bg }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[28px]">{scoreConfig(result.score).icon}</span>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[.15em]" style={{ color: 'rgba(255,255,255,.7)' }}>Signal Score</p>
                      <p className="text-[28px] font-black tracking-tight" style={{ color: '#fff' }}>{result.score}</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)' }}>
                    <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: '#fff' }}>{scoreConfig(result.score).label}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6" style={{ background: '#fff' }}>
                  <p className="text-[15px] leading-[1.7] text-foreground mb-4">{result.reason}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Recommended Service</span>
                    <span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ background: 'linear-gradient(135deg, rgba(14,30,58,.06), rgba(14,30,58,.03))', color: '#0E1E3A', border: '1px solid rgba(14,30,58,.1)' }}>
                      {result.service_line}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="mt-5 px-6 py-3 rounded-lg text-[13px] font-bold tracking-wide transition-all"
                style={{ background: 'linear-gradient(135deg, #0E1E3A, #1a1145)', color: '#D6B07A', boxShadow: '0 4px 16px rgba(14,30,58,.2)' }}
              >
                ← Score Another Signal
              </button>
            </>
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
        {/* Table header */}
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

        {/* Table rows */}
        {signalRows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[30%_22%_1fr] md:grid-cols-[28%_22%_1fr] border-t transition-colors"
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

      {/* Bottom filter callout */}
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

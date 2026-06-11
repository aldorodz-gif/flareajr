import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AiToolCard from './AiToolCard';
import PageHeader from './PageHeader';
import { useBdr } from './BdrContext';

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
  const { selected } = useBdr();
  const [signalText, setSignalText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');
  const [referenceOpen, setReferenceOpen] = useState(false);

  const handleScore = useCallback(async () => {
    if (!signalText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('signal-scorer', {
        body: { signal: signalText.trim(), bdr_id: selected?.id ?? null },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data as ScoreResult);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [signalText, selected?.id]);

  const handleReset = () => {
    setSignalText('');
    setResult(null);
    setError('');
  };

  const handleExampleClick = (text: string) => {
    setSignalText(text);
  };

  const scoreConfig = (score: string) => {
    if (score === 'HIGH') return { bg: 'linear-gradient(135deg, #14b8a6, #0d9488)', glow: '0 0 40px rgba(16,185,129,.3)', label: 'Call today.', icon: '🎯', action: 'This is a real signal. Pick up the phone.' };
    if (score === 'LOW') return { bg: 'linear-gradient(135deg, #64748B, #475569)', glow: '0 0 40px rgba(100,116,139,.2)', label: 'Move on.', icon: '→', action: 'No physical movement here. Skip it.' };
    return { bg: 'linear-gradient(135deg, #DC2626, #D97706)', glow: '0 0 40px rgba(245,158,11,.25)', label: 'Track it.', icon: '👁', action: 'Not ready yet, but worth watching.' };
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <PageHeader
        title="Score Signals"
        subtitle="Paste any signal and get an instant read on whether it's worth your time."
      />

      <div className="mb-12">
        <AiToolCard icon="⚡" title="Signal Scorer" subtitle="Paste any signal. I'll tell you if it's worth your time.">
          {!result ? (
            <>
              {/* Example signal chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide self-center mr-1 text-muted-foreground">Try:</span>
                {exampleSignals.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => handleExampleClick(ex.text)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all hover:scale-105"
                    style={{
                      background: 'rgba(251,146,60,.06)',
                      border: '1px solid rgba(251,146,60,.15)',
                      color: '#92400e',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLElement).style.background = 'rgba(251,146,60,.15)';
                      (e.target as HTMLElement).style.borderColor = 'rgba(251,146,60,.3)';
                      (e.target as HTMLElement).style.color = '#db2777';
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.background = 'rgba(251,146,60,.06)';
                      (e.target as HTMLElement).style.borderColor = 'rgba(251,146,60,.15)';
                      (e.target as HTMLElement).style.color = '#92400e';
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
                  onChange={e => setSignalText(e.target.value)}
                  placeholder="Paste a headline, LinkedIn post, or article excerpt..."
                  className="w-full min-h-[130px] p-5 rounded-xl text-[14px] leading-[1.7] resize-none focus:outline-none transition-all"
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid',
                    borderColor: signalText.trim() ? '#DC2626' : 'rgba(251,146,60,.15)',
                    borderRadius: '12px',
                    color: '#1a1145',
                    boxShadow: signalText.trim()
                      ? '0 0 30px rgba(251,146,60,.1), 0 8px 24px rgba(0,0,0,.06)'
                      : '0 4px 12px rgba(0,0,0,.04)',
                  }}
                  disabled={loading}
                />
                {signalText.trim() && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,146,60,.1)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#DC2626' }} />
                    <span className="text-[11px] font-semibold" style={{ color: '#db2777' }}>Ready</span>
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
                    ? '#f1f0ee'
                    : 'linear-gradient(135deg, #DC2626, #db2777)',
                  color: !signalText.trim() || loading ? '#c4c0b8' : '#fff',
                  cursor: !signalText.trim() || loading ? 'not-allowed' : 'pointer',
                  boxShadow: signalText.trim() && !loading
                    ? '0 8px 30px rgba(251,146,60,.3), 0 0 0 1px rgba(251,146,60,.15)'
                    : 'none',
                  letterSpacing: '.04em',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span
                      className="w-5 h-5 rounded-full animate-spin"
                      style={{ border: '2.5px solid rgba(251,146,60,.2)', borderTopColor: '#DC2626' }}
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
              <div
                className="rounded-xl overflow-hidden"
                style={{ boxShadow: scoreConfig(result.score).glow }}
              >
                <div className="px-6 py-6 flex items-center justify-between" style={{ background: scoreConfig(result.score).bg }}>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.2em] mb-1" style={{ color: 'rgba(255,255,255,.8)' }}>Verdict</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-[36px] font-black tracking-tight" style={{ color: '#fff' }}>{result.score}</span>
                      <span className="text-[15px] font-medium" style={{ color: 'rgba(255,255,255,.85)' }}>{scoreConfig(result.score).label}</span>
                    </div>
                  </div>
                  <div className="text-[36px]">{scoreConfig(result.score).icon}</div>
                </div>

                <div className="p-6" style={{ background: '#FFFFFF' }}>
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] mb-2" style={{ color: '#94A3B8' }}>Analysis</p>
                  <p className="text-[15px] leading-[1.7] mb-5" style={{ color: '#1a1145' }}>{result.reason}</p>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#94A3B8' }}>Service</span>
                      <span
                        className="px-3 py-1 rounded-full text-[12px] font-bold"
                        style={{ background: '#0a0a14', color: '#DC2626' }}
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
                  background: 'rgba(251,146,60,.06)',
                  border: '1px solid rgba(251,146,60,.2)',
                  color: '#db2777',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.background = 'rgba(251,146,60,.12)';
                  (e.target as HTMLElement).style.borderColor = 'rgba(251,146,60,.3)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.background = 'rgba(251,146,60,.06)';
                  (e.target as HTMLElement).style.borderColor = 'rgba(251,146,60,.2)';
                }}
              >
                ← Score Another Signal
              </button>
            </div>
          )}
        </AiToolCard>
      </div>

      {/* ─── Score Legend ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
        {[
          { color: '#14b8a6', bg: 'rgba(16,185,129,.08)', label: 'HIGH', action: 'Call today', desc: 'Real people movement, defined timeline, identifiable buyer.' },
          { color: '#DC2626', bg: 'rgba(245,158,11,.08)', label: 'MEDIUM', action: 'Track it', desc: 'Real change happening or early-stage signal with future potential.' },
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
            <span className="w-2 h-2 rounded-full" style={{ background: '#14b8a6' }} />
            <span className="text-[11px] font-bold uppercase tracking-[.12em]" style={{ color: '#14b8a6' }}>Pursue</span>
          </div>
          <div className="px-4 py-3.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
            <span className="text-[11px] font-bold uppercase tracking-[.12em]" style={{ color: '#EF4444' }}>Skip</span>
          </div>
          <div className="px-4 py-3.5">
            <span className="text-[11px] font-bold uppercase tracking-[.12em]" style={{ color: 'rgba(255,255,255,.8)' }}>Why it matters</span>
          </div>
        </div>
        {signalRows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[30%_22%_1fr] md:grid-cols-[28%_22%_1fr] border-t"
            style={{ borderColor: 'rgba(14,30,58,.06)', background: i % 2 === 0 ? '#fff' : '#FAFAF8' }}
          >
            <div className="px-4 py-3.5 text-[13px] font-semibold text-foreground flex items-start gap-2">
              <span className="inline-block w-[6px] h-[6px] rounded-full flex-shrink-0 mt-[7px]" style={{ background: '#14b8a6' }} />
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
      <div className="rounded-xl p-5 flex gap-4 items-start" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)', boxShadow: '0 4px 20px rgba(14,30,58,.2)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg" style={{ background: 'rgba(251,146,60,.15)' }}>
          🔑
        </div>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[.12em] mb-1" style={{ color: '#DC2626' }}>The one question that matters</p>
          <p className="text-[14px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.82)' }}>
            <strong style={{ color: '#fff' }}>Are real people physically going somewhere because of this?</strong> If yes, pursue. If the movement is virtual, speculative, or one day long, move on.
          </p>
        </div>
      </div>

    </div>
  );
};

export default SignalsTab;

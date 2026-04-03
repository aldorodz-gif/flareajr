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

  const scoreBg = (score: string) => {
    if (score === 'HIGH') return '#D6B07A';
    if (score === 'LOW') return '#C95B6A';
    return '#94A3B8';
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #E8BE70, #E07878)">Quick Reference</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Signals Guide: What Counts as a Real Demand Signal</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Use this as a fast filter. If the signal points to real people movement or clear buying pressure for temporary housing, travel, hotels, or destination services, pursue it. If it does not, move on.
      </p>

      {/* Interactive Signal Scorer */}
      <div className="overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.5)' }}>AI Tool</p>
            <p className="text-[18px] font-semibold" style={{ color: '#fff' }}>Signal Scorer</p>
          </div>
          <div className="px-3 py-1.5" style={{ background: 'rgba(155,120,200,.15)' }}>
            <p className="text-[12px] font-semibold" style={{ color: '#C4A5DE' }}>Powered by AI</p>
          </div>
        </div>
        <div className="p-5 border border-t-0" style={{ borderColor: 'rgba(155,120,200,.12)', background: '#fff' }}>
          {!result ? (
            <>
              <p className="text-[13px] text-muted-foreground mb-4">Paste a headline, LinkedIn post, or business signal and get an instant score.</p>
              <textarea
                value={signalText}
                onChange={e => setSignalText(e.target.value)}
                placeholder="Paste a headline, LinkedIn post, or business signal here."
                className="w-full min-h-[120px] p-4 border text-[14px] leading-[1.7] resize-none focus:outline-none focus:ring-2"
                style={{ borderColor: 'rgba(155,120,200,.2)', background: '#FAF7F2' }}
                disabled={loading}
              />
              <button
                onClick={handleScore}
                disabled={!signalText.trim() || loading}
                className="mt-3 px-6 py-3 text-[14px] font-semibold transition-all"
                style={{
                  background: !signalText.trim() || loading ? '#94A3B8' : 'linear-gradient(135deg, #9B78C8, #D97FAA)',
                  color: '#fff',
                  cursor: !signalText.trim() || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Thinking...' : 'Score It'}
              </button>
              {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#C95B6A' }}>{error}</p>}
            </>
          ) : (
            <>
              <div className="p-5 border" style={{ borderColor: 'rgba(155,120,200,.12)' }}>
                <div className="inline-block px-5 py-2.5 text-[20px] font-bold mb-3" style={{ background: scoreBg(result.score), color: '#fff' }}>
                  {result.score}
                </div>
                <p className="text-[14px] leading-[1.7] text-foreground mb-3">{result.reason}</p>
                <span className="inline-block px-3 py-1 text-[12px] font-semibold" style={{ background: 'rgba(155,120,200,.1)', color: '#9B78C8' }}>
                  {result.service_line}
                </span>
              </div>
              <button
                onClick={handleReset}
                className="mt-4 px-5 py-2.5 text-[13px] font-semibold"
                style={{ background: 'linear-gradient(135deg, #9B78C8, #D97FAA)', color: '#fff' }}
              >
                Score another
              </button>
            </>
          )}
        </div>
      </div>

      {/* Explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
        <div className="p-3 border-l-[3px]" style={{ background: 'rgba(16,185,129,.06)', borderColor: '#10B981' }}>
          <p className="text-[12px] font-bold uppercase tracking-wide mb-1" style={{ color: '#10B981' }}>HIGH means</p>
          <p className="text-[13px] text-foreground leading-[1.5]">Real people movement, defined timeline, identifiable buyer. Call today.</p>
        </div>
        <div className="p-3 border-l-[3px]" style={{ background: 'rgba(251,191,36,.06)', borderColor: '#F59E0B' }}>
          <p className="text-[12px] font-bold uppercase tracking-wide mb-1" style={{ color: '#D97706' }}>MEDIUM means</p>
          <p className="text-[13px] text-foreground leading-[1.5]">Real change but timing or ownership unclear. Log it and watch.</p>
        </div>
        <div className="p-3 border-l-[3px]" style={{ background: 'rgba(239,68,68,.06)', borderColor: '#EF4444' }}>
          <p className="text-[12px] font-bold uppercase tracking-wide mb-1" style={{ color: '#EF4444' }}>LOW means</p>
          <p className="text-[13px] text-foreground leading-[1.5]">Interesting headline but no real movement yet. Skip for now.</p>
        </div>
      </div>

      {/* Signal comparison table */}
      <div className="overflow-hidden border" style={{ borderColor: 'rgba(155,120,200,.12)' }}>
        <div className="grid grid-cols-[28%_22%_1fr]" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
          <div className="px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider" style={{ color: '#10B981' }}>Pursue. Real Signal</div>
          <div className="px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider" style={{ color: '#EF4444' }}>Skip. Noise</div>
          <div className="px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.6)' }}>Why the difference matters</div>
        </div>
        {signalRows.map((row, i) => (
          <div key={i} className="grid grid-cols-[28%_22%_1fr] border-t" style={{ borderColor: '#E2E8F0', background: '#fff' }}>
            <div className="px-4 py-3.5 text-[13px] font-semibold text-foreground flex items-start gap-2">
              <span className="inline-block w-[7px] h-[7px] rounded-full flex-shrink-0 mt-1.5" style={{ background: '#10B981' }} />
              {row.pursue}
            </div>
            <div className="px-4 py-3.5 text-[13px] font-semibold flex items-start gap-2" style={{ color: row.skip === '—' ? '#94A3B8' : '#EF4444' }}>
              {row.skip !== '—' && <span className="inline-block w-[7px] h-[7px] rounded-full flex-shrink-0 mt-1.5" style={{ background: '#EF4444' }} />}
              {row.skip}
            </div>
            <div className="px-4 py-3.5 text-[13px] text-muted-foreground leading-[1.55]">{row.why}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3.5 items-start p-4 mt-4" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
        <span className="text-[12px] font-bold uppercase tracking-wide whitespace-nowrap pt-0.5" style={{ color: '#C4A5DE' }}>The filter</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.82)' }}>Ask one question: <strong style={{ color: '#fff' }}>are real people physically going somewhere because of this?</strong> If yes, pursue. If the movement is virtual, speculative, or one day long, move on.</p>
      </div>

      <SectionNav currentTab="signals" onNavigate={onNavigate} />
    </div>
  );
};

export default SignalsTab;

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface TrackerTabProps {
  onNavigate: (tabId: string) => void;
}

const basePrompt = (city: string, focus?: string) => `Search for new ${city} business movements that could create demand for temporary housing, travel, hotels, or destination services. Focus on SMB and mid-market companies and government-adjacent businesses where relevant. Prioritize regional operators, project-driven companies, relocations, contract awards, phased construction, mobilizations, training cohorts, new office or facility launches, and temporary workforce movement.
${focus ? `\n${focus}\n` : ''}
Stay away from broad Fortune 500 sweeps, entertainment, and direct government targets unless the signal clearly points to a commercial or government-adjacent need we can support.

Find a minimum of 10 new companies.

For each company provide a brief, scannable entry:
— Company name + city
— Signal (what triggered this — be specific)
— Likely service line(s): temporary housing, travel, hotels, or destination services
— Why that service line likely applies
— Estimated stay type or trip pattern
— Priority: High / Medium / Low

Keep each entry concise — 3 to 4 lines max. No long paragraphs.
Close with a one-sentence summary of the strongest opportunity.`;

const VERTICALS = ['Construction', 'Defense', 'Energy', 'Healthcare', 'Technology', 'Manufacturing', 'Sports', 'Theater / Performing Arts', 'Other'];
const SIGNAL_TYPES = ['Contract award', 'Office relocation', 'Facility expansion', 'Training cohort', 'Merger or acquisition', 'Funding round', 'Return to office mandate', 'Production season or touring', 'Other'];

const TrackerTab = ({ onNavigate }: TrackerTabProps) => {
  const [showExamples, setShowExamples] = useState(false);

  // Prompt Builder state
  const [city, setCity] = useState('');
  const [vertical, setVertical] = useState('');
  const [signalType, setSignalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const canBuild = city.trim() && vertical && signalType;

  const handleBuild = useCallback(async () => {
    if (!canBuild) return;
    setLoading(true);
    setError('');
    setGeneratedPrompt('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('prompt-builder', {
        body: { city: city.trim(), vertical, signal_type: signalType },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setGeneratedPrompt(data.prompt);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [city, vertical, signalType, canBuild]);

  const handleCopyPrompt = useCallback(() => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [generatedPrompt]);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #5AB8D4, #8B8FE8)">Step 03: Set Once. Runs Every Morning</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Find Companies Showing Demand Signals</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Copy the prompt for your market and paste it into Agent Mode. Get your first results, then tell ChatGPT when to run it automatically every day.
      </p>

      <PromptBox label="Your Market — Paste into Agent Mode">
        {basePrompt('[YOUR CITY, STATE]')}
      </PromptBox>

      <p className="text-[12px] mb-6 text-muted-foreground">Replace <strong className="text-foreground">[YOUR CITY, STATE]</strong> with your market before pasting.</p>

      {/* Collapsible market examples */}
      <div className="border overflow-hidden mb-6" style={{ borderColor: 'rgba(155,120,200,.12)' }}>
        <button onClick={() => setShowExamples(!showExamples)} className="w-full px-4 py-3.5 flex items-center justify-between text-left" style={{ background: '#fff' }}>
          <span className="text-[14px] font-semibold text-foreground">See market examples</span>
          <span className="text-[12px] text-muted-foreground transition-transform duration-200" style={{ transform: showExamples ? 'rotate(180deg)' : '' }}>▼</span>
        </button>
        {showExamples && (
          <div>
            {[
              { city: 'Huntsville, AL', desc: 'Defense, aerospace, and advanced manufacturing tied to Redstone Arsenal and space programs.', focus: 'Huntsville focus: Prioritize defense contractors, aerospace, and advanced manufacturing tied to Redstone Arsenal and space programs.' },
              { city: 'Nashville, TN', desc: 'Healthcare systems and staffing, construction tied to infrastructure and hospitality growth, corporate relocations.', focus: 'Nashville focus: Prioritize healthcare systems and staffing, construction tied to infrastructure and hospitality growth, and corporate relocations from higher-cost markets.' },
              { city: 'Atlanta, GA', desc: 'Logistics and distribution expansion, financial services and tech relocations, major construction buildouts.', focus: 'Atlanta focus: Prioritize logistics and distribution expansion, financial services and tech relocations, and major construction and infrastructure buildouts.' },
            ].map(ex => (
              <div key={ex.city} className="border-t p-5" style={{ borderColor: '#E2E8F0', background: '#F8FAFC' }}>
                <p className="text-[12px] font-bold uppercase tracking-wide mb-1" style={{ color: '#9B78C8' }}>{ex.city}</p>
                <p className="text-[13px] text-muted-foreground mb-3">{ex.desc}</p>
                <PromptBox>{basePrompt(ex.city.includes('Huntsville') ? 'Huntsville, Alabama' : ex.city.includes('Nashville') ? 'Nashville, Tennessee' : 'Atlanta, Georgia', ex.focus)}</PromptBox>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[14px] font-semibold mb-1.5 text-foreground">Set your schedule — stay in the same chat and type this</p>
      <p className="text-[13px] mb-2.5 text-muted-foreground">In the same chat where you ran your first results, tell ChatGPT when to run it:</p>
      <PromptBox label="Schedule prompt">{"\"Create this as a recurring task every weekday at 7:00 AM.\""}</PromptBox>

      {/* Interactive Prompt Builder */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(14,30,58,.08)' }}>
        <div className="relative">
          {/* Animated gradient border */}
          <div className="absolute -inset-[2px] rounded-none animate-border-glow" style={{
            background: 'linear-gradient(135deg, #D6B07A, #9B78C8, #10B981, #D6B07A)',
            backgroundSize: '300% 300%',
          }} />
          {/* Shimmer overlay */}
          <div className="absolute -inset-[2px] rounded-none animate-shimmer opacity-40" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(214,176,122,.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }} />

          <div className="relative overflow-hidden">
            {/* Header */}
            <div className="relative flex items-center justify-between px-6 py-5" style={{ background: 'linear-gradient(135deg, #0E1E3A 0%, #1a1145 50%, #0E1E3A 100%)' }}>
              {/* Ambient glow */}
              <div className="absolute top-0 left-1/4 w-40 h-40 opacity-20" style={{ background: 'radial-gradient(circle, #D6B07A, transparent 70%)' }} />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 opacity-15" style={{ background: 'radial-gradient(circle, #9B78C8, transparent 70%)' }} />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[20px]">🔧</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 animate-shimmer" style={{
                    background: 'linear-gradient(90deg, #D6B07A, #E8C98A, #D6B07A)',
                    backgroundSize: '200% 100%',
                    color: '#0E1E3A',
                  }}>AI Tool</span>
                </div>
                <p className="text-[20px] font-bold tracking-tight" style={{ color: '#fff' }}>Custom Prompt Builder</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,.5)' }}>Build a tailored prompt for your market in seconds</p>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                {/* Live indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)' }}>
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
                    <div className="absolute inset-0 w-2 h-2 rounded-full animate-radar-ping" style={{ background: '#10B981' }} />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#10B981' }}>Live</span>
                </div>
                <div className="px-3 py-1.5" style={{ background: 'rgba(214,176,122,.1)', border: '1px solid rgba(214,176,122,.2)' }}>
                  <p className="text-[11px] font-semibold" style={{ color: '#D6B07A' }}>Powered by AI</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 border-x border-b" style={{ borderColor: 'rgba(155,120,200,.12)', background: '#fff' }}>
              <p className="text-[13px] text-muted-foreground mb-5">Select your market, vertical, and signal type — we'll generate a custom Agent Mode prompt ready to paste.</p>

              <div className="flex flex-col gap-3 mb-5">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">📍</span>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Your city and state"
                    className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200"
                    style={{
                      borderColor: city ? 'rgba(214,176,122,.5)' : 'rgba(155,120,200,.2)',
                      background: city ? '#FFFBF5' : '#FAF7F2',
                      boxShadow: city ? '0 0 0 3px rgba(214,176,122,.1)' : 'none',
                    }}
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none">🏢</span>
                  <select
                    value={vertical}
                    onChange={e => setVertical(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                    style={{
                      borderColor: vertical ? 'rgba(214,176,122,.5)' : 'rgba(155,120,200,.2)',
                      background: vertical ? '#FFFBF5' : '#FAF7F2',
                      boxShadow: vertical ? '0 0 0 3px rgba(214,176,122,.1)' : 'none',
                    }}
                    disabled={loading}
                  >
                    <option value="">Select vertical</option>
                    {VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none">📡</span>
                  <select
                    value={signalType}
                    onChange={e => setSignalType(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                    style={{
                      borderColor: signalType ? 'rgba(214,176,122,.5)' : 'rgba(155,120,200,.2)',
                      background: signalType ? '#FFFBF5' : '#FAF7F2',
                      boxShadow: signalType ? '0 0 0 3px rgba(214,176,122,.1)' : 'none',
                    }}
                    disabled={loading}
                  >
                    <option value="">Select signal type</option>
                    {SIGNAL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center gap-2 mb-5">
                {[city.trim(), vertical, signalType].map((val, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] transition-all duration-300" style={{
                      background: val ? '#10B981' : 'rgba(148,163,184,.3)',
                      color: '#fff',
                    }}>
                      {val ? '✓' : ''}
                    </div>
                    <span className="text-[11px]" style={{ color: val ? '#10B981' : '#94A3B8' }}>
                      {['Market', 'Vertical', 'Signal'][i]}
                    </span>
                    {i < 2 && <span className="text-[10px] mx-1" style={{ color: '#CBD5E1' }}>→</span>}
                  </div>
                ))}
              </div>

              <button
                onClick={handleBuild}
                disabled={!canBuild || loading}
                className="px-7 py-3.5 text-[14px] font-bold tracking-wide transition-all duration-200"
                style={{
                  background: !canBuild || loading ? '#94A3B8' : 'linear-gradient(135deg, #D6B07A, #C49A5C)',
                  color: '#fff',
                  cursor: !canBuild || loading ? 'not-allowed' : 'pointer',
                  boxShadow: canBuild && !loading ? '0 4px 15px rgba(214,176,122,.35)' : 'none',
                  transform: canBuild && !loading ? 'translateY(0)' : undefined,
                }}
                onMouseEnter={e => { if (canBuild && !loading) (e.target as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { if (canBuild && !loading) (e.target as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                {loading ? '⏳ Building...' : '⚡ Build My Prompt'}
              </button>

              {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#C95B6A' }}>{error}</p>}

              {generatedPrompt && (
                <div className="mt-6 animate-card-rise">
                  <div className="relative p-5" style={{ background: 'linear-gradient(135deg, #0E1E3A, #1a1145)' }}>
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10" style={{ background: 'radial-gradient(circle, #D6B07A, transparent 70%)' }} />
                    <button
                      onClick={handleCopyPrompt}
                      className="absolute top-3 right-3 text-[11px] font-bold px-4 py-2 tracking-wider z-10 transition-all duration-200"
                      style={{
                        background: copied ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #D6B07A, #C49A5C)',
                        color: copied ? '#fff' : '#0E1E3A',
                        boxShadow: '0 2px 8px rgba(0,0,0,.2)',
                      }}
                    >
                      {copied ? '✓ COPIED' : '📋 COPY'}
                    </button>
                    <pre className="text-[13px] leading-[1.85] whitespace-pre-wrap break-words pr-20 font-mono" style={{ color: '#E2E8F0' }}>
                      {generatedPrompt}
                    </pre>
                  </div>
                  <p className="text-[12px] mt-2 text-muted-foreground">Paste this directly into ChatGPT Agent Mode.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SectionNav currentTab="tracker" onNavigate={onNavigate} />
    </div>
  );
};

export default TrackerTab;

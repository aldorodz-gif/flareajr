import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import AiToolCard from './AiToolCard';
import SectionNav from './SectionNav';
import PromptBuilderTour from './PromptBuilderTour';
import { useBdr } from './BdrContext';

interface TrackerTabProps {
  onNavigate: (tabId: string) => void;
}

import { VERTICAL_NAMES } from './verticalsData';
const VERTICALS = VERTICAL_NAMES;
const SIGNAL_TYPES = ['Contract award', 'Office relocation', 'Facility expansion', 'Training cohort', 'Merger or acquisition', 'Funding round', 'Return to office mandate', 'Production season or touring', 'Other'];

const CITY_PRESETS = [
  { label: 'Huntsville, AL', value: 'Huntsville, Alabama', icon: '🚀' },
  { label: 'Nashville, TN', value: 'Nashville, Tennessee', icon: '🎵' },
  { label: 'Atlanta, GA', value: 'Atlanta, Georgia', icon: '🍑' },
];

const TrackerTab = ({ onNavigate }: TrackerTabProps) => {
  const { selected } = useBdr();
  const [city, setCity] = useState('');
  const [vertical, setVertical] = useState('');
  const [signalType, setSignalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // When the active BDR changes, prefill the city from their first market.
  useEffect(() => {
    if (!selected || !selected.markets?.length) return;
    setCity(selected.markets[0]);
  }, [selected?.id]);

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
      <p className="text-[13px] max-w-[760px] mb-5 text-muted-foreground">
        Instead of cold-calling from a list, you're going to let AI scan your market every morning for companies that are <strong className="text-foreground">already moving</strong> — hiring, expanding, relocating, or launching projects that create temporary housing and travel demand.
      </p>

      {/* Why this matters — context block */}
      <div className="mb-6 p-4" style={{ background: 'linear-gradient(135deg, rgba(251,146,60,.06), rgba(155,120,200,.06))', border: '1px solid rgba(251,146,60,.15)' }}>
        <p className="text-[13px] leading-[1.7] text-muted-foreground">
          <strong className="text-foreground">Why this works:</strong> Most reps wait for RFPs or referrals. This tool builds you a custom search prompt that finds companies <em>before</em> they start shopping — while they're still planning. You'll know who needs housing before your competitors do.
        </p>
      </div>

      {/* How it works — 3-step visual */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { num: '1', icon: '🔧', title: 'Build', desc: 'Pick your market, vertical, and signal type below. We generate a custom prompt.' },
          { num: '2', icon: '📋', title: 'Paste', desc: 'Copy the prompt and paste it into ChatGPT Agent Mode. Get your first batch of leads.' },
          { num: '3', icon: '⏰', title: 'Automate', desc: 'Tell ChatGPT to run it every weekday at 7 AM. Wake up to fresh leads daily.' },
        ].map(step => (
          <div key={step.num} className="p-4 text-center" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center text-[14px] font-bold" style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: '#fff' }}>
              {step.num}
            </div>
            <span className="text-[16px]">{step.icon}</span>
            <p className="text-[13px] font-semibold text-foreground mt-1">{step.title}</p>
            <p className="text-[11px] leading-[1.5] text-muted-foreground mt-1">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Interactive Prompt Builder — Hero */}
      <AiToolCard
        icon="🔧"
        title="Custom Prompt Builder"
        subtitle="Tell us your market — we'll write the search prompt for you"
      >
            <p className="text-[14px] font-medium text-foreground mb-1">Three fields. One click. Your custom prompt is ready.</p>
            <p className="text-[13px] text-muted-foreground mb-5">Pick your city, choose the industry you're targeting, and select the type of business movement you want to track. We'll generate a search prompt tuned to find companies in your market that likely need temporary housing, travel, or destination services.</p>

            {/* City presets */}
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5 text-muted-foreground">Quick select a market — or type your own below</p>
              <div className="flex flex-wrap gap-2">
                {CITY_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => setCity(preset.value)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium transition-all duration-200"
                    style={{
                      background: city === preset.value ? 'linear-gradient(135deg, #fb923c, #f97316)' : '#F1F5F9',
                      color: city === preset.value ? '#fff' : '#475569',
                      border: `1px solid ${city === preset.value ? '#fb923c' : '#E2E8F0'}`,
                      boxShadow: city === preset.value ? '0 2px 8px rgba(251,146,60,.3)' : 'none',
                    }}
                  >
                    <span>{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-5">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">📍</span>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Denver, Colorado"
                  className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200"
                  style={{
                    borderColor: city ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                    background: city ? '#FFF7ED' : '#FAF7F2',
                    boxShadow: city ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
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
                    borderColor: vertical ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                    background: vertical ? '#FFF7ED' : '#FAF7F2',
                    boxShadow: vertical ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
                  }}
                  disabled={loading}
                >
                  <option value="">Which industry are you targeting?</option>
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
                    borderColor: signalType ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                    background: signalType ? '#FFF7ED' : '#FAF7F2',
                    boxShadow: signalType ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
                  }}
                  disabled={loading}
                >
                  <option value="">What kind of movement are you looking for?</option>
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
                background: !canBuild || loading ? '#94A3B8' : 'linear-gradient(135deg, #fb923c, #f97316)',
                color: '#fff',
                cursor: !canBuild || loading ? 'not-allowed' : 'pointer',
                boxShadow: canBuild && !loading ? '0 4px 15px rgba(251,146,60,.35)' : 'none',
              }}
            >
              {loading ? '⏳ Building...' : '⚡ Build My Prompt'}
            </button>

            {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#C95B6A' }}>{error}</p>}

            {generatedPrompt && (
              <div className="mt-6 animate-card-rise">
                <p className="text-[13px] font-semibold text-foreground mb-2">✅ Your prompt is ready — here's what to do next:</p>
                <ol className="text-[12px] text-muted-foreground mb-3 space-y-1 list-decimal list-inside">
                  <li>Click <strong className="text-foreground">Copy</strong> to grab the prompt below</li>
                  <li>Open <strong className="text-foreground">ChatGPT → Agent Mode</strong> and paste it in</li>
                  <li>Review your results, then schedule it (see below)</li>
                </ol>
                <div className="relative p-5" style={{ background: 'linear-gradient(135deg, #0E1E3A, #1a1145)' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10" style={{ background: 'radial-gradient(circle, #fb923c, transparent 70%)' }} />
                  <button
                    onClick={handleCopyPrompt}
                    className="absolute top-3 right-3 text-[11px] font-bold px-4 py-2 tracking-wider z-10 transition-all duration-200"
                    style={{
                      background: copied ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #fb923c, #f97316)',
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
              </div>
            )}
      </AiToolCard>

      {/* Schedule — follow-up step */}
      <div className="p-5 mb-6" style={{ background: 'linear-gradient(135deg, rgba(251,146,60,.04), rgba(155,120,200,.04))', border: '1px solid rgba(251,146,60,.15)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[16px]">⏰</span>
          <p className="text-[14px] font-semibold text-foreground">Last step: Automate it so it runs without you</p>
        </div>
        <p className="text-[13px] mb-3 text-muted-foreground">
          After your first batch of results comes back, stay in the <strong className="text-foreground">same ChatGPT chat</strong> and paste this. ChatGPT will re-run your search every weekday morning — you'll wake up to fresh leads in your inbox.
        </p>
        <PromptBox label="Schedule prompt">{"\"Create this as a recurring task every weekday at 7:00 AM.\""}</PromptBox>
        <p className="text-[11px] mt-2 text-muted-foreground italic">That's it. One setup, daily results. Move to the next step to learn how to work through your list.</p>
      </div>

      <SectionNav currentTab="tracker" onNavigate={onNavigate} />
    </div>
  );
};

export default TrackerTab;

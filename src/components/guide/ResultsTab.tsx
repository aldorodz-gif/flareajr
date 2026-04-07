import { useState } from 'react';
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface ResultsTabProps {
  onNavigate: (tabId: string) => void;
}

const ResultsTab = ({ onNavigate }: ResultsTabProps) => {
  const [researchOpen, setResearchOpen] = useState(false);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #fb923c, #f97316)">Step 03: Every Morning</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Work Your Results</h2>
      <p className="text-[13px] max-w-[760px] mb-6 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(251,146,60,.1)' }}>
        Your overnight search just dropped results. Three moves, then you're selling.
      </p>

      {/* ── Morning routine: visual timeline ── */}
      <div className="grid grid-cols-3 gap-0 mb-8 overflow-hidden rounded-xl border" style={{ borderColor: 'rgba(251,146,60,.15)' }}>
        {[
          { icon: '📥', action: 'Scan', detail: 'Pull HIGH-priority signals', bg: 'linear-gradient(135deg, #fb923c, #f97316)' },
          { icon: '📝', action: 'Log', detail: 'CRM: company + signal + service line', bg: 'linear-gradient(135deg, #f97316, #ea580c)' },
          { icon: '🔍', action: 'Research', detail: 'Run the prompt below before calling', bg: 'linear-gradient(135deg, #ea580c, #c2410c)' },
        ].map((s, i) => (
          <div key={s.action} className="relative flex flex-col items-center text-center p-5 md:p-6" style={{ background: '#FAF7F2' }}>
            {i < 2 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 z-10" style={{ transform: 'translateY(-50%)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M9 6l6 6-6 6" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                </svg>
              </div>
            )}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-[22px] mb-3 shadow-md"
              style={{ background: s.bg }}
            >
              {s.icon}
            </div>
            <p className="text-[14px] font-bold text-foreground mb-0.5">{s.action}</p>
            <p className="text-[11px] leading-[1.5] text-muted-foreground">{s.detail}</p>
          </div>
        ))}
      </div>

      {/* ── Sample result card ── */}
      <Eyebrow>What a Result Looks Like</Eyebrow>
      <div className="overflow-hidden rounded-xl mb-8" style={{ boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}>
          <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,.7)' }}>Sample Daily Result</span>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full animate-priority-pulse"
            style={{ color: '#fff', background: 'rgba(251,146,60,.25)', border: '1px solid rgba(251,146,60,.4)' }}
          >
            🔥 HIGH PRIORITY
          </span>
        </div>

        <div className="p-5" style={{ background: '#fff', borderLeft: '4px solid #fb923c' }}>
          {/* Signal hero */}
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#9B78C8' }}>Signal</p>
          <p className="text-[16px] font-semibold leading-snug text-foreground mb-4">
            Awarded $40M Army contract at Redstone Arsenal. Mobilization begins Q2.
          </p>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Company', value: 'Meridian Defense Systems', icon: '🏢' },
              { label: 'City', value: 'Huntsville, AL', icon: '📍' },
              { label: 'Housing Need', value: '60+ engineers, 6–12 months', icon: '🏠' },
              { label: 'Why HIGH', value: 'Defined timeline, large headcount', icon: '⚡' },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-lg" style={{ background: '#FAF7F2' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[12px]">{m.icon}</span>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</p>
                </div>
                <p className="text-[13px] font-medium text-foreground leading-snug">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cross-reference cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => onNavigate('signals')}
          className="flex gap-3.5 items-center p-4 rounded-xl text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: 'rgba(232,190,112,.06)', border: '1px solid rgba(232,190,112,.2)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(232,190,112,.15)' }}>
            <span className="text-[18px]">⚡</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">Not sure if it's worth it?</p>
            <p className="text-[12px] text-muted-foreground">Score it instantly →</p>
          </div>
        </button>
        <button
          onClick={() => onNavigate('contact')}
          className="flex gap-3.5 items-center p-4 rounded-xl text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: 'rgba(251,146,60,.06)', border: '1px solid rgba(251,146,60,.2)' }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,146,60,.12)' }}>
            <span className="text-[18px]">🎯</span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">Know the signal, not the buyer?</p>
            <p className="text-[12px] text-muted-foreground">Find who to call →</p>
          </div>
        </button>
      </div>

      {/* ── Research section: collapsible ── */}
      <div className="rounded-xl overflow-hidden mb-2" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <button
          onClick={() => setResearchOpen(!researchOpen)}
          className="w-full flex items-center justify-between gap-4 px-6 py-4 transition-colors"
          style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,146,60,.15)' }}>
              <span className="text-[16px]">📋</span>
            </div>
            <div className="text-left">
              <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#fb923c' }}>Before Every Call</p>
              <p className="text-[16px] font-semibold" style={{ color: '#fff' }}>Company Research Prompt</p>
            </div>
          </div>
          <svg
            className="w-5 h-5 transition-transform duration-300 flex-shrink-0"
            style={{ color: 'rgba(255,255,255,.5)', transform: researchOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: researchOpen ? '600px' : '0', opacity: researchOpen ? 1 : 0 }}
        >
          <div className="p-5 border border-t-0 rounded-b-xl" style={{ borderColor: 'rgba(251,146,60,.12)', background: '#fff' }}>
            <p className="text-[13px] text-muted-foreground mb-4">A call without context is just a cold call. Run this on every HIGH account.</p>
            <PromptBox label="Company Research Prompt">
{`Give me a full intelligence brief on [COMPANY NAME] in [CITY] for a sales call.

1. What they do — industry, size, what they're known for
2. The specific trigger — the expansion, contract, move, or program that flagged them
3. ⭐ Recent positive news — 2–3 wins or milestones I can open my call with
4. Most likely service line — temp housing, travel, hotels, or destination services, and why
5. Estimated people, timing, and duration
6. Likely pain points for their team
7. Biggest logistical challenge this movement creates

Concise and scannable. I'm preparing for a call, not writing a report.`}
            </PromptBox>
            <div className="flex gap-3 items-start p-3.5 rounded-lg" style={{ background: 'rgba(251,146,60,.05)', border: '1px solid rgba(251,146,60,.15)' }}>
              <span className="flex-shrink-0">💡</span>
              <p className="text-[13px] leading-[1.65] text-foreground"><strong>Use the positive news.</strong> Open with <em>"I saw you just landed [the contract] — congratulations"</em> and you've already separated yourself from every other cold call.</p>
            </div>
            <div className="flex gap-3 items-start p-3.5 mt-3 rounded-lg" style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.18)' }}>
              <span className="flex-shrink-0">🔗</span>
              <p className="text-[13px] leading-[1.65] text-foreground">You can also <strong>paste a LinkedIn URL or news article</strong> and ask: <em>"Analyze this for housing, travel, hotel, or destination services signals."</em></p>
            </div>
          </div>
        </div>
      </div>

      <SectionNav currentTab="results" onNavigate={onNavigate} />
    </div>
  );
};

export default ResultsTab;

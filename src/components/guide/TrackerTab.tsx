import { useState } from 'react';
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

const TrackerTab = ({ onNavigate }: TrackerTabProps) => {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #3B82F6, #8B5CF6)">Step 02: Set Once. Runs Every Morning</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Find Companies Showing Demand Signals</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Copy the prompt for your market and paste it into Agent Mode. Get your first results, then tell ChatGPT when to run it automatically every day.
      </p>

      <PromptBox label="Your Market — Paste into Agent Mode">
        {basePrompt('[YOUR CITY, STATE]')}
      </PromptBox>

      <p className="text-[12px] mb-6 text-muted-foreground">Replace <strong className="text-foreground">[YOUR CITY, STATE]</strong> with your market before pasting. That's the only thing you need to change.</p>

      {/* Collapsible market examples */}
      <div className="border overflow-hidden mb-6" style={{ borderColor: 'rgba(59,130,246,.15)' }}>
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left"
          style={{ background: '#fff' }}
        >
          <span className="text-[14px] font-semibold text-foreground">See market examples</span>
          <span className="text-[12px] text-muted-foreground transition-transform duration-200" style={{ transform: showExamples ? 'rotate(180deg)' : '' }}>▼</span>
        </button>
        {showExamples && (
          <div>
            {[
              { city: 'Huntsville, AL', desc: 'Defense, aerospace, and advanced manufacturing tied to Redstone Arsenal and space programs.', focus: 'Huntsville focus: Prioritize defense contractors, aerospace, and advanced manufacturing tied to Redstone Arsenal and space programs. These are the highest-density signal verticals in this market.' },
              { city: 'Nashville, TN', desc: 'Healthcare systems and staffing, construction tied to infrastructure and hospitality growth, corporate relocations.', focus: 'Nashville focus: Prioritize healthcare systems and staffing, construction tied to infrastructure and hospitality growth, and corporate relocations from higher-cost markets. Healthcare travel staffing is a high-frequency signal here.' },
              { city: 'Atlanta, GA', desc: 'Logistics and distribution expansion, financial services and tech relocations, major construction buildouts.', focus: 'Atlanta focus: Prioritize logistics and distribution expansion, financial services and tech relocations, and major construction and infrastructure buildouts. Atlanta is one of the highest-volume corporate relocation markets in the Southeast.' },
            ].map(ex => (
              <div key={ex.city} className="border-t p-5" style={{ borderColor: '#E2E8F0', background: '#EFF6FF' }}>
                <p className="text-[12px] font-bold uppercase tracking-wide mb-1" style={{ color: '#3B82F6' }}>{ex.city}</p>
                <p className="text-[13px] text-muted-foreground mb-3">{ex.desc}</p>
                <PromptBox>{basePrompt(ex.city.includes('Huntsville') ? 'Huntsville, Alabama' : ex.city.includes('Nashville') ? 'Nashville, Tennessee' : 'Atlanta, Georgia', ex.focus)}</PromptBox>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[14px] font-semibold mb-1.5 text-foreground">Set your schedule — stay in the same chat and type this</p>
      <p className="text-[13px] mb-2.5 text-muted-foreground">In the same chat where you ran your first results, tell ChatGPT when to run it:</p>

      <PromptBox label="Schedule prompt">
        {"\"Create this as a recurring task every weekday at 7:00 AM.\""}
      </PromptBox>

      <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.18)' }}>
        <span className="text-[16px] flex-shrink-0 mt-0.5">⚙️</span>
        <p className="text-[13px] leading-[1.65] text-foreground">
          Manage all your tasks anytime under your <strong>profile icon → Pulse</strong>. Up to 10 active tasks — one per city is the recommended setup.
        </p>
      </div>

      {/* Custom Prompt Builder */}
      <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(14,30,58,.08)' }}>
        <div className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #1E3A5F, #1E1B4B)' }}>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.5)' }}>Quick Tool</p>
              <p className="text-[18px] font-semibold" style={{ color: '#fff' }}>Custom Prompt Builder</p>
            </div>
            <div className="px-3 py-1.5" style={{ background: 'rgba(59,130,246,.2)' }}>
              <p className="text-[12px] font-semibold" style={{ color: '#93C5FD' }}>Paste into ChatGPT or Claude</p>
            </div>
          </div>
          <div className="p-5 border border-t-0" style={{ borderColor: 'rgba(59,130,246,.12)', background: '#fff' }}>
            <p className="text-[13px] text-muted-foreground mb-4">The city prompts above are your daily engine. Use this when you want a prompt built around a specific vertical or signal type you're already tracking.</p>
            <PromptBox label="Custom Prompt Builder">
{`Build me a ChatGPT Agent Mode search prompt for the following:

City: [YOUR CITY AND STATE]
Vertical: [CONSTRUCTION / DEFENSE / ENERGY / HEALTHCARE / TECHNOLOGY / MANUFACTURING]
Signal type I'm targeting: [CONTRACT AWARD / OFFICE RELOCATION / FACILITY EXPANSION / TRAINING COHORT / M&A / FUNDING ROUND / RETURN TO OFFICE]

The prompt should:
- Search for companies in that city and vertical showing that specific signal type
- Surface opportunities for temporary housing, travel management, hotel programs, or destination services
- Find a minimum of 10 companies
- Return results with: company name, city, signal detail, most likely service line, and priority (High / Medium / Low)
- Stay focused on SMB and mid-market companies, not Fortune 500
- Keep each result to 3 to 4 lines max

Return only the finished prompt. I will paste it directly into ChatGPT Agent Mode.`}
            </PromptBox>
            <div className="flex gap-3 items-start p-3.5" style={{ background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.2)' }}>
              <span className="flex-shrink-0">💡</span>
              <p className="text-[13px] leading-[1.65] text-foreground">You only need to do this when the standard city prompt isn't specific enough. If you're targeting a specific vertical or signal type in your market, this gets you a prompt built for exactly that.</p>
            </div>
          </div>
        </div>
      </div>

      <SectionNav currentTab="tracker" onNavigate={onNavigate} />
    </div>
  );
};

export default TrackerTab;
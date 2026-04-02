import { useState } from 'react';
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface TrackerTabProps {
  onNavigate: (tabId: string) => void;
}

const cities = [
  { id: 'huntsville', label: '🚀 Huntsville, AL', city: 'Huntsville, Alabama' },
  { id: 'nashville', label: '🎸 Nashville, TN', city: 'Nashville, Tennessee' },
  { id: 'atlanta', label: '🍑 Atlanta, GA', city: 'Atlanta, Georgia' },
  { id: 'custom', label: '➕ My City', city: '[YOUR CITY, STATE]' },
];

const TrackerTab = ({ onNavigate }: TrackerTabProps) => {
  const [activeCity, setActiveCity] = useState('huntsville');
  const city = cities.find(c => c.id === activeCity)!;

  const promptText = `Search for new ${city.city} business movements that could create demand for temporary housing, travel, hotels, or destination services. Focus on SMB and mid-market companies and government-adjacent businesses where relevant. Prioritize regional operators, project-driven companies, relocations, contract awards, phased construction, mobilizations, training cohorts, new office or facility launches, and temporary workforce movement.

Stay away from broad Fortune 500 sweeps, entertainment, MLB, and direct government targets unless the signal clearly points to a commercial or government-adjacent need we can support.

Find a minimum of 10 new companies.

For each company provide a brief, scannable entry:
— Company name + city
— Signal (what triggered this — be specific)
— Likely service line(s): temporary housing, travel, hotels, and/or destination services
— Why that service line likely applies
— Estimated stay type or trip pattern
— Priority: High / Medium / Low

Keep each entry concise — 3 to 4 lines max. No long paragraphs.
Close with a one-sentence summary of the strongest opportunity.`;

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #5AB8D4, #8B8FE8)">Step 02 — Set Once, Runs Every Morning</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>Find Companies Showing Demand Signals</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Select your city and copy the prompt. Paste it into Agent Mode, get your first results, then tell ChatGPT when to run it automatically every day.
      </p>

      <p className="text-[13px] font-semibold mb-2.5" style={{ color: '#1E293B' }}>Select your city:</p>
      <div className="flex flex-wrap gap-2.5 mb-4">
        {cities.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCity(c.id)}
            className="px-4 py-2.5 text-[12px] font-semibold border-2 transition-all duration-200 min-h-[48px]"
            style={{
              background: activeCity === c.id ? 'linear-gradient(135deg, #8B8FE8, #9B78C8)' : '#fff',
              borderColor: activeCity === c.id ? '#6366F1' : '#E2E8F0',
              color: activeCity === c.id ? '#fff' : '#64748B',
              borderRadius: '999px',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <PromptBox label={`${city.city} — Paste into Agent Mode`}>
        {promptText}
      </PromptBox>

      <p className="text-[14px] font-semibold mb-1.5 mt-6" style={{ color: '#1E293B' }}>Set your schedule — stay in the same chat and type this</p>
      <p className="text-[13px] mb-2.5" style={{ color: '#64748B' }}>In the same chat where you ran your first results, tell ChatGPT when to run it:</p>

      <PromptBox label="Schedule prompt">
        {"\"Create this as a recurring task every weekday at 7:00 AM.\""}
      </PromptBox>

      <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(99,102,241,.05)', border: '1px solid rgba(99,102,241,.18)' }}>
        <span className="text-[16px] flex-shrink-0 mt-0.5">⚙️</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: '#1E293B' }}>
          Manage all your tasks anytime under your <strong>profile icon → Pulse</strong>. Up to 10 active tasks — one per city is the recommended setup.
        </p>
      </div>

      <SectionNav currentTab="tracker" onNavigate={onNavigate} />
    </div>
  );
};

export default TrackerTab;

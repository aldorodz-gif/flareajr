import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
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
];

const SignalsTab = ({ onNavigate }: SignalsTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #EF4444, #F97316)">Quick Reference</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Signals Guide: What Counts as a Real Demand Signal</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Use this as a fast filter. If the signal points to real people movement or clear buying pressure for temporary housing, travel, hotels, or destination services, pursue it. If it does not, move on.
      </p>

      {/* Signal Scorer Tool */}
      <div className="overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #7F1D1D, #991B1B)' }}>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.5)' }}>Quick Tool</p>
            <p className="text-[18px] font-semibold" style={{ color: '#fff' }}>Signal Scorer</p>
          </div>
          <div className="px-3 py-1.5" style={{ background: 'rgba(239,68,68,.2)' }}>
            <p className="text-[12px] font-semibold" style={{ color: '#FCA5A5' }}>Paste into ChatGPT or Claude</p>
          </div>
        </div>
        <div className="p-5 border border-t-0" style={{ borderColor: 'rgba(239,68,68,.15)', background: '#fff' }}>
          <p className="text-[13px] text-muted-foreground mb-4">Got a headline or LinkedIn post and not sure if it's worth your time? Copy this prompt, paste it into ChatGPT or Claude, then add your signal at the bottom.</p>
          <PromptBox label="Signal Scorer Prompt">
{`You are a signal scoring tool for a corporate housing sales team. We sell temporary housing, travel management, hotel programs, and destination services to businesses.

Score the signal below as HIGH, MEDIUM, or LOW based on whether it implies real physical people movement that would create demand for our services.

Return your answer in this format:
Score: [HIGH / MEDIUM / LOW]
Reason: [One sentence. Plain language. No jargon.]
Service line most likely in play: [Temporary Housing / Travel / Hotels / Destination Services / None]
What to do next: [One sentence on whether to pursue, watch, or skip.]

Signal to score:
[PASTE YOUR HEADLINE OR SIGNAL HERE]`}
          </PromptBox>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
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
        </div>
      </div>

      {/* Signal comparison table */}
      <div className="overflow-hidden border" style={{ borderColor: 'rgba(239,68,68,.15)' }}>
        <div className="grid grid-cols-[28%_22%_1fr]" style={{ background: 'linear-gradient(135deg, #7F1D1D, #991B1B)' }}>
          <div className="px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider" style={{ color: '#10B981' }}>Pursue. Real Signal</div>
          <div className="px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider" style={{ color: '#FCA5A5' }}>Skip. Noise</div>
          <div className="px-4 py-3.5 text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.6)' }}>Why the difference matters</div>
        </div>
        {signalRows.map((row, i) => (
          <div key={i} className="grid grid-cols-[28%_22%_1fr] border-t" style={{ borderColor: '#FECACA', background: '#fff' }}>
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

      {/* The filter */}
      <div className="flex gap-3.5 items-start p-4 mt-4" style={{ background: 'linear-gradient(135deg, #7F1D1D, #78350F)' }}>
        <span className="text-[12px] font-bold uppercase tracking-wide whitespace-nowrap pt-0.5" style={{ color: '#FBBF24' }}>The filter</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.82)' }}>Ask one question: <strong style={{ color: '#fff' }}>are real people physically going somewhere because of this?</strong> If yes, pursue. If the movement is virtual, speculative, or one day long, move on.</p>
      </div>

      <SectionNav currentTab="signals" onNavigate={onNavigate} />
    </div>
  );
};

export default SignalsTab;
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface DeeperTabProps {
  onNavigate: (tabId: string) => void;
}

const DeeperTab = ({ onNavigate }: DeeperTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #9B78C8, #D97FAA)">Step 04 — Before Every Call</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>Research the Company — Show You've Done Your Homework</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        This is what separates a cold call from a warm one. Run this on any High priority company. In 60 seconds you'll have the likely service line, the right contact, and a draft outreach angle.
      </p>

      <div className="flex gap-3 items-start p-3.5 mb-4" style={{ background: '#E8D1AC', border: '1px solid rgba(16,65,118,.10)', borderRadius: '10px' }}>
        <span className="text-[20px] flex-shrink-0">⭐</span>
        <div>
          <p className="text-[13px] font-semibold mb-1" style={{ color: '#1E293B' }}>Always pull their recent positive news — this is your opener.</p>
          <p className="text-[13px] leading-[1.6]" style={{ color: '#1E293B' }}>A contract win, a facility opening, a funding round — anything good. You reference it in the first sentence and it earns you the next 30 seconds of attention.</p>
        </div>
      </div>

      <PromptBox label="Company Research Prompt">
{`Give me a full intelligence brief on [COMPANY NAME] in [CITY] for a sales call focused on temporary housing, travel, hotels, or destination services.

I need:
1. What they do — industry, size, what they're known for
2. The specific trigger — details on the expansion, contract, move, launch, or program that flagged them
3. ⭐ Recent positive news — wins, awards, milestones, or announcements I can open my call or email with. Give me 2–3 specific things.
4. Most likely service line — temporary housing, travel, hotels, destination services, or a combination, and why
5. Estimated number of people, timing, and likely length or trip pattern
6. Likely pain points across temporary housing, travel, hotels, or destination services
7. Biggest logistical challenge this movement likely creates for their team

Keep it concise and scannable. I'm using this to prepare for a call, not write a report.`}
      </PromptBox>

      <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(155,120,200,.05)', border: '1px solid rgba(99,102,241,.18)' }}>
        <span className="text-[16px] flex-shrink-0 mt-0.5">💡</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: '#1E293B' }}>
          <strong>Use the positive news.</strong> When you open a call with something like <em>"I saw Meridian just landed the Redstone contract — congratulations"</em> — you've shown you're not just another vendor dialing a list.
        </p>
      </div>

      <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.18)' }}>
        <span className="text-[16px] flex-shrink-0 mt-0.5">🔗</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: '#1E293B' }}>
          You can also <strong>paste a LinkedIn URL or news article directly</strong> and ask: <em>"Analyze this for temporary housing, travel, hotel, or destination services signals."</em>
        </p>
      </div>

      <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.18)' }}>
        <span className="text-[16px] flex-shrink-0 mt-0.5">➡️</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: '#1E293B' }}>
          <strong>Next:</strong> Click the <strong>Buyer Map</strong> tab to identify who to call and what to say to them.
        </p>
      </div>

      <SectionNav currentTab="deeper" onNavigate={onNavigate} />
    </div>
  );
};

export default DeeperTab;

import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface ContactTabProps {
  onNavigate: (tabId: string) => void;
}

const ContactTab = ({ onNavigate }: ContactTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #E07878, #E8A87A)">Step 05 — Find the Right Person</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>Service Line Buyer Map</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Most reps go after the obvious titles first. Start with the person whose project, move, team, or relocation process is affected if the need is not solved.
      </p>

      <div className="flex gap-3 items-start p-3.5 mb-6" style={{ background: 'rgba(99,102,241,.05)', border: '1px solid rgba(99,102,241,.18)' }}>
        <span className="text-[16px] flex-shrink-0 mt-0.5">📌</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: '#1E293B' }}>
          <strong>The rule:</strong> In most accounts, HR is not the first pain owner. Match the buyer to the signal. Start with whoever's job breaks if the need is not solved.
        </p>
      </div>

      <PromptBox label="POC Finder Prompt — Run this after your company research">
{`For [COMPANY NAME] — a company that is [DESCRIBE THE SIGNAL] — identify the best person to contact for temporary housing, travel, hotels, or destination services.

1. Based on the signal, which service line is most likely in play?
2. Given that signal and service line, who most likely owns this problem? Give me the exact title and why.
3. Find the actual person in that role — name, title, LinkedIn URL if available.
4. What are their top 3 challenges right now given this expansion, project, move, or traveler demand?
5. What language resonates with this role — what outcomes do they care about most?
6. What would make them act now versus letting employees, crews, or travelers figure it out themselves?`}
      </PromptBox>

      {/* Tier 1 / Tier 2 */}
      <p className="text-[14px] font-semibold mb-1.5" style={{ color: '#1E293B' }}>Who Owns the Pain — Match the Buyer to the Signal</p>
      <p className="text-[13px] mb-4" style={{ color: '#64748B' }}>Start with the signal and service line. Pick the lane that owns the pain first.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Tier 1 */}
        <div className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)' }}>
          <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #1E293B, #2A2760)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-[2px] mb-1" style={{ color: '#818CF8' }}>Tier 1 — Signal Owner</div>
            <p className="text-[13px] leading-[1.5]" style={{ color: 'rgba(255,255,255,.7)' }}>The person whose project, launch, or crew schedule breaks if the need is not solved.</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { icon: '⚙️', title: 'Operations Leaders', roles: 'VP of Operations · Director of Operations · Regional Operations Manager', why: 'Delays create crew disruption, missed timelines, and traveler friction.' },
              { icon: '📋', title: 'Project & Program Leaders', roles: 'Program Manager · Project Director · Mobilization Lead', why: 'They own readiness. If housing isn\'t sorted, programs slip.' },
              { icon: '🚀', title: 'Mobility & Travel Leaders', roles: 'Global Mobility Manager · Travel Program Manager', why: 'They own the employee relocation or travel experience end-to-end.' },
            ].map(r => (
              <div key={r.title}>
                <p className="text-[12px] font-semibold mb-0.5" style={{ color: '#1E293B' }}>{r.icon} {r.title}</p>
                <p className="text-[12px] mb-1" style={{ color: '#64748B' }}>{r.roles}</p>
                <p className="text-[12px]" style={{ color: '#334155' }}><strong>Why:</strong> {r.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 2 */}
        <div className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)' }}>
          <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #334155, #3B3B6B)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-[2px] mb-1" style={{ color: '#A5B4FC' }}>Tier 2 — Process Owner</div>
            <p className="text-[13px] leading-[1.5]" style={{ color: 'rgba(255,255,255,.7)' }}>The person who executes once interest is confirmed. Bring them in second.</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { icon: '🏢', title: 'Facilities & Workplace', roles: 'Facilities Manager · Workplace Services Lead', why: 'They manage the physical space and vendor relationships.' },
              { icon: '👥', title: 'HR & People Operations', roles: 'HR Manager · People Operations Manager', why: 'They handle the people side — onboarding, benefits, relocation policy.' },
              { icon: '💼', title: 'Procurement & Admin', roles: 'Procurement Manager · Administrative Officer', why: 'They handle vendor setup, invoicing, and policy alignment.' },
            ].map(r => (
              <div key={r.title}>
                <p className="text-[12px] font-semibold mb-0.5" style={{ color: '#1E293B' }}>{r.icon} {r.title}</p>
                <p className="text-[12px] mb-1" style={{ color: '#64748B' }}>{r.roles}</p>
                <p className="text-[12px]" style={{ color: '#334155' }}><strong>Why:</strong> {r.why}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prioritization */}
      <div className="p-5" style={{ background: '#1E293B', borderRadius: '10px' }}>
        <p className="text-[12px] font-semibold uppercase tracking-wider mb-3.5" style={{ color: '#818CF8' }}>How to Prioritize Your Outreach</p>
        <div className="flex flex-col gap-2.5">
          {[
            'Start with the pain owner in operations, project leadership, mobility, facilities, or field logistics.',
            'Add the non-traditional title that coordinates the move, launch, outage, or training wave.',
            'Bring in procurement or travel later when you need policy alignment, vendor setup, or invoicing support.',
          ].map((text, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: '#6366F1', color: '#fff' }}>{i + 1}</div>
              <p className="text-[13px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.8)' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>

      <SectionNav currentTab="contact" onNavigate={onNavigate} />
    </div>
  );
};

export default ContactTab;

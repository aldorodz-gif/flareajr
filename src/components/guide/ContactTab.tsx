import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface ContactTabProps {
  onNavigate: (tabId: string) => void;
}

const verticalTitles = [
  { cols: [
    { icon: '🔨', name: 'Construction', signals: 'Mobilization, new site launch, phased buildouts', primary: 'Project Manager · Site Superintendent · Director of Operations', nonTrad: 'Mobilization Manager · Labor Coordinator · Commissioning Manager' },
    { icon: '🛡️', name: 'Defense & Gov\'t Contractors', signals: 'Program ramp, deployment, contract transition', primary: 'Program Manager · Site Lead · Operations Director', nonTrad: 'Deployment Manager · Gov\'t Services Manager · Contract Transition Manager' },
  ]},
  { cols: [
    { icon: '🏭', name: 'Manufacturing & Industrial', signals: 'Plant launch, installs, training cohorts, outages', primary: 'Plant Manager · Operations Manager · Training Manager', nonTrad: 'Launch Manager · Production Readiness Manager · Maintenance Outage Lead' },
    { icon: '⚡', name: 'Energy & Utilities', signals: 'Turnarounds, outages, storm response, field maintenance', primary: 'Outage Manager · Turnaround Manager · Field Operations Manager', nonTrad: 'Crew Logistics Manager · Shutdown Planner · Project Controls Manager' },
  ]},
  { cols: [
    { icon: '🏥', name: 'Healthcare', signals: 'Travel clinicians, physician relocation, residency housing', primary: 'Clinical Staffing Manager · Recruitment Manager · Travel Program Manager', nonTrad: 'Physician Recruitment Manager · GME Coordinator · Workforce Planning Manager' },
    { icon: '💻', name: 'Technology & Consulting', signals: 'Relocations, intern housing, office launch, deployment teams', primary: 'Global Mobility Manager · People Operations Manager · Program Manager', nonTrad: 'University Recruiting Manager · Employee Experience Manager · Travel Program Manager' },
  ]},
  { cols: [
    { icon: '🏀', name: 'Sports & Entertainment', signals: 'Player housing, fellowship programs, staff rotations, seasonal roster moves', primary: 'Director of Team Operations · Player Services Manager · Program Coordinator', nonTrad: 'Fellowship Program Manager · Travel Coordinator · Front Office Operations Manager' },
  ]},
];

const ContactTab = ({ onNavigate }: ContactTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #E07878, #E8A87A)">Step 04: Find the Right Person</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Service Line Buyer Map</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Match the buyer to the signal. Start with whoever's job breaks if the need isn't solved. Not whoever has the most obvious title.
      </p>

      <div className="flex gap-3 items-start p-3.5 mb-6" style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)' }}>
        <span className="flex-shrink-0">📌</span>
        <p className="text-[13px] leading-[1.65] text-foreground">
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

      <p className="text-[14px] font-semibold mb-1.5 text-foreground">Who Owns the Pain</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Start with the signal and service line. Pick the lane that owns the pain first.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
          <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-[2px] mb-1" style={{ color: '#C4A5DE' }}>Tier 1 — Signal Owner</div>
            <p className="text-[13px] leading-[1.5]" style={{ color: 'rgba(255,255,255,.7)' }}>The person whose project, launch, or crew schedule breaks if the need is not solved.</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { icon: '⚙️', title: 'Operations Leaders', roles: 'VP of Operations · Director of Operations · Regional Operations Manager', why: 'Delays create crew disruption, missed timelines, and traveler friction.' },
              { icon: '🏗️', title: 'Project & Site Leaders', roles: 'Project Manager · Site Superintendent · Program Manager', why: 'They get the call when crews or teams cannot get placed or get on site quickly.' },
            ].map(r => (
              <div key={r.title}>
                <p className="text-[12px] font-semibold mb-0.5 text-foreground">{r.icon} {r.title}</p>
                <p className="text-[12px] mb-1 text-muted-foreground">{r.roles}</p>
                <p className="text-[12px] text-foreground"><strong>Why:</strong> {r.why}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
          <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #2d1b69, #4a1942)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-[2px] mb-1" style={{ color: '#D9A5E0' }}>Tier 2 — Support Owner</div>
            <p className="text-[13px] leading-[1.5]" style={{ color: 'rgba(255,255,255,.7)' }}>The person who helps with policy, travel, sourcing, or vendor setup after the need is clear.</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { icon: '🔄', title: 'Mobility & People Programs', roles: 'Global Mobility Manager · Relocation Manager · Travel Program Manager', why: 'They coordinate relocations, intern stays, and employee experience at scale.' },
              { icon: '🏢', title: 'Facilities & Workplace', roles: 'Facilities Manager · Workplace Services Lead · Office Operations Manager', why: 'Travel, hotel, and settling-in needs often land with them for office launches.' },
            ].map(r => (
              <div key={r.title}>
                <p className="text-[12px] font-semibold mb-0.5 text-foreground">{r.icon} {r.title}</p>
                <p className="text-[12px] mb-1 text-muted-foreground">{r.roles}</p>
                <p className="text-[12px] text-foreground"><strong>Why:</strong> {r.why}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Titles by Vertical */}
      <p className="text-[14px] font-semibold mb-1.5 text-foreground">Best Titles by Vertical</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Use the signal type to decide where to start: operations, project, mobility, or facilities.</p>

      <div className="flex flex-col gap-2 mb-6">
        {verticalTitles.map((row, ri) => (
          <div key={ri} className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {row.cols.map((col, ci) => (
                <div key={ci} className={`p-4 ${ci === 0 ? 'md:border-r' : ''}`} style={{ borderColor: '#E2E8F0' }}>
                  <p className="text-[12px] font-semibold mb-1.5 text-foreground">{col.icon} {col.name}</p>
                  <p className="text-[12px] text-muted-foreground mb-1"><strong>Signals:</strong> {col.signals}</p>
                  <p className="text-[12px] text-foreground"><strong>Primary:</strong> {col.primary}</p>
                  <p className="text-[12px] mt-1" style={{ color: '#9B78C8' }}><strong>Non-traditional:</strong> {col.nonTrad}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Prioritization */}
      <div className="p-5" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
        <p className="text-[12px] font-semibold uppercase tracking-wider mb-3.5" style={{ color: '#C4A5DE' }}>How to Prioritize Your Outreach</p>
        <div className="flex flex-col gap-2.5">
          {[
            'Start with the pain owner in operations, project leadership, mobility, facilities, or field logistics.',
            'Add the non-traditional title that coordinates the move, launch, outage, or training wave.',
            'Bring in procurement or travel later when you need policy alignment, vendor setup, or invoicing support.',
          ].map((text, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #9B78C8, #C47EAA)', color: '#fff' }}>{i + 1}</div>
              <p className="text-[13px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.8)' }}>{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3.5" style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <p className="text-[12px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#C4A5DE' }}>Pattern to watch</p>
          <p className="text-[13px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.75)' }}>Project-based industries (construction, energy, defense) buy through <strong style={{ color: '#fff' }}>operations and field leaders</strong>. Program-based industries (tech, consulting, healthcare) buy through <strong style={{ color: '#fff' }}>mobility, travel, facilities, or people operations</strong>.</p>
        </div>
      </div>

      <SectionNav currentTab="contact" onNavigate={onNavigate} />
    </div>
  );
};

export default ContactTab;

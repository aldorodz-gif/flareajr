import { useState } from 'react';
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';
import type { VerticalData } from './types';

interface ResultsTabProps {
  onNavigate: (tabId: string) => void;
}

const verticals: Record<string, VerticalData> = {
  construction: {
    signal: { label: "Signal", tag: "HIGH", title: "New site mobilization. Q2 launch", body: "A regional GC just landed a $28M contract for a phased industrial build outside Nashville. Engineering and field crews mobilize in 6 weeks. No housing solution in place yet." },
    buyer: { label: "Who to call", tag: "Project Manager", title: "Marcus Reid. Project Manager", body: "He owns the timeline. If crews can't get placed quickly, his schedule slips. Start with him before going to HR or procurement." },
    angle: { label: "Outreach angle", tag: "Temp Housing + Hotels", title: "Crew placement before they land", body: "Mobilizations move fast and housing is always what gets sorted last. Lead with the contract win, connect it to the crew placement problem, offer to solve it clean." },
    email: { subj: "Nashville build, crew housing", body: "Marcus,\n\nSaw your team just landed the Phase 1 contract, big win.\n\nMobilizations like this move fast and housing for incoming crews is usually the last thing to get locked in. We work with project teams to get that sorted before they land.\n\nWorth a 15-minute call before your Q2 kickoff?" }
  },
  defense: {
    signal: { label: "Signal", tag: "HIGH", title: "Contract award, program ramp", body: "A mid-size defense contractor just received a major Army program award. Engineering and program staff deploy over 90 days across two phases." },
    buyer: { label: "Who to call", tag: "Program Manager", title: "Program Manager or Site Lead", body: "They own readiness. Delays in housing or travel setup become their problem on day one. Operations director is a strong secondary." },
    angle: { label: "Outreach angle", tag: "Temp Housing + Travel", title: "Program readiness from day one", body: "Frame it around the deployment timeline, not housing. They care about people being ready to work. Not scrambling for a place to stay or figuring out travel." },
    email: { subj: "Program housing", body: "Jennifer,\n\nCongrats on the contract award. That's a strong program win for your team.\n\nWhen engineering staff deploy in phases like this, getting housing and travel sorted early is what keeps the program on track. We handle that for teams so day one isn't spent on logistics.\n\nWorth a quick call before your first deployment wave?" }
  },
  energy: {
    signal: { label: "Signal", tag: "HIGH", title: "Planned outage or turnaround", body: "A utility operator in the Southeast is running a 6-week planned outage at a generation facility. 40+ contractors rotating on 2-week shifts. No travel or lodging program in place." },
    buyer: { label: "Who to call", tag: "Outage Manager", title: "Outage or Turnaround Manager", body: "They coordinate the entire crew logistics puzzle. Hotels, shuttles, shift overlap: it all lands on them. Start here before going to procurement." },
    angle: { label: "Outreach angle", tag: "Hotels + Travel", title: "Shift logistics handled cleanly", body: "Rotating crews on a tight outage schedule need lodging that works around shift times, not standard hotel check-in windows. Lead with that pain." },
    email: { subj: "Outage crew lodging — [Facility]", body: "Brian,\n\nHeard about the planned outage coming up this spring, looks like a significant one.\n\nRotating crews on shift schedules usually run into hotel issues fast, standard check-in windows don't work when your shifts don't line up with them. We handle lodging setups built around how your crew actually operates.\n\nWorth a quick call before you finalize your contractor logistics?" }
  },
  healthcare: {
    signal: { label: "Signal", tag: "MEDIUM", title: "Travel nurse cohort or residency launch", body: "A regional hospital system in Atlanta is onboarding 30 travel nurses for a 13-week assignment. HR is scrambling to find furnished housing close to the facility." },
    buyer: { label: "Who to call", tag: "Clinical Staffing or HR", title: "Clinical Staffing Manager or HR Manager", body: "They made the hire and now own the housing problem. Travel program managers are a strong second call once interest is confirmed." },
    angle: { label: "Outreach angle", tag: "Temp Housing + DS", title: "Housing that keeps nurses focused on the job", body: "Travel nurses who spend week one sorting out their living situation aren't focused on patient care. Lead with that, it's a quality and retention angle, not just a logistics one." },
    email: { subj: "Housing for your travel nurse cohort", body: "Diane,\n\nSaw your system is onboarding a travel nurse cohort next quarter. That's a real staffing commitment.\n\nWhen nurses arrive without housing locked in, the first week usually goes sideways. We work with healthcare teams to have furnished housing ready before they land, close to the facility, move-in ready.\n\nHappy to share how we've supported similar cohorts, worth a quick call?" }
  },
  tech: {
    signal: { label: "Signal", tag: "MEDIUM", title: "Office launch or intern cohort", body: "A Series C tech company is opening a second office in Austin and relocating 15 engineers from their SF HQ. Intern class of 22 starts in June. No relocation or housing program exists yet." },
    buyer: { label: "Who to call", tag: "People Ops or Global Mobility", title: "People Operations or Global Mobility Manager", body: "They own both the relocation and the intern experience. If there's no mobility function, go to the HR Manager directly. Facilities is a strong secondary for the office launch." },
    angle: { label: "Outreach angle", tag: "Temp Housing + DS", title: "Relocation that doesn't slow down hiring momentum", body: "Engineers who take 3 weeks to find an apartment are distracted engineers. Lead with the experience angle, housing that lets them show up ready." },
    email: { subj: "Austin office relocation housing", body: "Alex,\n\nSaw the Austin expansion announcement, exciting move for the team.\n\nRelocating engineers while standing up a new office is a lot to manage at once. We handle furnished housing for incoming teams so the transition stays clean and people land focused on the work.\n\nWorth a 15-minute call before your first relocation wave?" }
  },
  manufacturing: {
    signal: { label: "Signal", tag: "HIGH", title: "Plant launch or training cohort", body: "An industrial manufacturer is launching a new production line in your market. They're running 3 onboarding cohorts of 20 technicians over 6 months, all coming from out of state." },
    buyer: { label: "Who to call", tag: "Training or Plant Manager", title: "Training Manager or Plant Manager", body: "They own the readiness of each cohort. If technicians show up distracted by housing, it costs them time and ramp speed. Operations Manager is a strong second." },
    angle: { label: "Outreach angle", tag: "Temp Housing", title: "Cohort housing locked in before each wave", body: "Phased cohorts mean phased housing needs. Lead with the operational efficiency angle, pre-arranged housing means faster ramp, less distraction." },
    email: { subj: "Cohort housing", body: "Kevin,\n\nSaw you're ramping production with phased technician cohorts. That's a significant launch.\n\nBringing in out-of-state techs in waves usually means housing gets re-solved every time. We set it up in advance by cohort so each group lands ready to work.\n\nWorth a quick call before your first wave arrives?" }
  }
};

const verticalBtns = [
  { id: 'construction', label: '🔨 Construction' },
  { id: 'defense', label: '🛡️ Defense' },
  { id: 'energy', label: '⚡ Energy' },
  { id: 'healthcare', label: '🏥 Healthcare' },
  { id: 'tech', label: '💻 Tech & Consulting' },
  { id: 'manufacturing', label: '🏭 Manufacturing' },
];

const ResultsTab = ({ onNavigate }: ResultsTabProps) => {
  const [activeVertical, setActiveVertical] = useState('construction');
  const v = verticals[activeVertical];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #F59E0B, #F97316)">Step 03: Every Morning</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Work Your Results</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Review overnight results. Prioritize the strongest signals. Move the right accounts into action.
      </p>

      {/* Sample result */}
      <Eyebrow gradient="linear-gradient(90deg, #F59E0B, #EF4444)">What Each Result Looks Like</Eyebrow>
      <div className="overflow-hidden border mb-6" style={{ background: '#fff', borderColor: 'rgba(245,158,11,.2)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div className="flex items-center justify-between px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #78350F, #92400E)', borderBottom: '2px solid #F59E0B' }}>
          <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>Sample Daily Result — swap with your market</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full animate-priority-pulse" style={{ color: '#fff' }}>HIGH PRIORITY</span>
        </div>
        {[
          ['Company', 'Meridian Defense Systems'],
          ['City', 'Huntsville, AL'],
          ['Signal', 'Awarded $40M Army contract at Redstone Arsenal. Mobilization begins Q2'],
          ['Housing Use Case', '60+ engineers and contractors relocating for a 9-month build phase'],
          ['Estimated Stay', '6–12 months, phased arrivals'],
          ['Priority', 'HIGH. Defined timeline, large headcount, identifiable housing buyer.'],
        ].map(([k, val]) => (
          <div key={k} className="flex border-b last:border-b-0" style={{ borderColor: '#FDE68A' }}>
            <div className="w-[145px] flex-shrink-0 px-3.5 py-2.5 text-[12px] font-semibold border-r" style={{ background: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A' }}>{k}</div>
            <div className="px-3.5 py-2.5 text-[13px] flex-1" style={{ color: '#334155' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Triage framework */}
      <div className="overflow-hidden border mb-4" style={{ background: '#fff', borderColor: 'rgba(245,158,11,.2)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #78350F, #92400E)' }}>
          <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>Simple Triage Framework</span>
        </div>
        {[
          ['HIGH', 'Clear timeline, real people movement, and a likely buyer you can identify now. Call and research today.', '#10B981'],
          ['MEDIUM', 'Real change, but timing or ownership is not fully clear yet. Log it and keep watching.', '#F59E0B'],
          ['LOW', 'Interesting headline, but no defined movement, timing, or housing use case yet. Skip unless another signal confirms it.', '#EF4444'],
        ].map(([k, val, color]) => (
          <div key={k} className="flex border-b last:border-b-0" style={{ borderColor: '#FDE68A' }}>
            <div className="w-[120px] flex-shrink-0 px-3.5 py-4 text-[12px] font-bold tracking-wide border-r flex items-center" style={{ background: '#FFFBEB', color: color as string, borderColor: '#FDE68A' }}>{k}</div>
            <div className="px-4 py-4 text-[13px] flex-1 leading-[1.6]" style={{ color: '#334155' }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          { num: 1, gradient: 'linear-gradient(135deg,#F59E0B,#FBBF24)', text: 'Pull High priority first. These go straight onto your call list. Don\'t start anywhere else.' },
          { num: 2, gradient: 'linear-gradient(135deg,#F97316,#FB923C)', text: 'Log it in your CRM. Note the company name and the specific signal. You\'ll use it in every touchpoint.' },
          { num: 3, gradient: 'linear-gradient(135deg,#EF4444,#F87171)', text: 'Scroll down to Research the Company before you call. Run the prompt on every HIGH account.' },
        ].map(s => (
          <div key={s.num} className="flex gap-3 items-start p-3.5 border" style={{ background: '#fff', borderColor: 'rgba(245,158,11,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
            <div className="min-w-[27px] h-[27px] rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5" style={{ background: s.gradient, color: '#fff' }}>{s.num}</div>
            <p className="text-[13px] leading-[1.65] text-muted-foreground"><strong className="text-foreground">{s.text.split('.')[0]}.</strong>{s.text.substring(s.text.indexOf('.') + 1)}</p>
          </div>
        ))}
      </div>

      {/* Call vs Email Decision Tree */}
      <Eyebrow gradient="linear-gradient(90deg, #F59E0B, #10B981)">First Move Decision</Eyebrow>
      <h3 className="text-[18px] font-semibold mb-1.5 text-foreground">Call first or email first?</h3>
      <p className="text-[13px] text-muted-foreground mb-4">For every HIGH priority signal, your first move depends on the signal type. Not personal preference.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="overflow-hidden border" style={{ borderColor: 'rgba(245,158,11,.2)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #78350F, #92400E)' }}>
            <span>📞</span>
            <span className="text-[14px] font-bold" style={{ color: '#fff' }}>Call First</span>
          </div>
          <div className="p-4" style={{ background: '#fff' }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide mb-2 text-foreground">When the signal is time-bound</p>
            <div className="flex flex-col gap-1.5">
              {['🏗️ Contract award or mobilization starting soon', '⚡ Outage or turnaround with a defined start date', '🎓 Cohort or onboarding class arriving in weeks'].map(t => (
                <div key={t} className="text-[12px] p-2 border-l-[3px]" style={{ background: '#FFFBEB', borderColor: '#F59E0B', color: '#475569' }}>{t}</div>
              ))}
            </div>
            <p className="text-[12px] italic mt-2.5 text-muted-foreground">Time pressure = phone. They need a solution now and email gives them room to ignore it.</p>
          </div>
        </div>
        <div className="overflow-hidden border" style={{ borderColor: 'rgba(16,185,129,.2)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #064E3B, #065F46)' }}>
            <span>✉️</span>
            <span className="text-[14px] font-bold" style={{ color: '#fff' }}>Email First</span>
          </div>
          <div className="p-4" style={{ background: '#fff' }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide mb-2 text-foreground">When the signal is early-stage</p>
            <div className="flex flex-col gap-1.5">
              {['🏢 Office opening or market entry: planning phase', '💰 Funding round. No confirmed move timeline yet', '🤝 M&A announcement: integration still being planned'].map(t => (
                <div key={t} className="text-[12px] p-2 border-l-[3px]" style={{ background: '#ECFDF5', borderColor: '#10B981', color: '#475569' }}>{t}</div>
              ))}
            </div>
            <p className="text-[12px] italic mt-2.5 text-muted-foreground">Longer timeline = email first. Warm them up, earn the call.</p>
          </div>
        </div>
      </div>

      {/* Vertical selector */}
      <Eyebrow gradient="linear-gradient(90deg, #F97316, #EC4899)">See It In Action</Eyebrow>
      <h3 className="text-[18px] font-semibold mb-1.5 text-foreground">What does this look like in your vertical?</h3>
      <p className="text-[13px] mb-4 text-muted-foreground">Pick the industry you're working and see exactly how the full flow applies: signal, buyer, and outreach angle.</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {verticalBtns.map(b => (
          <button
            key={b.id}
            onClick={() => setActiveVertical(b.id)}
            className="px-4 py-2 text-[12px] font-semibold border-2 rounded-full transition-all duration-200"
            style={{
              background: activeVertical === b.id ? 'linear-gradient(135deg, #F59E0B, #F97316)' : '#fff',
              borderColor: activeVertical === b.id ? '#F59E0B' : '#E2E8F0',
              color: activeVertical === b.id ? '#fff' : '#64748B',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden border transition-all duration-300" style={{ background: '#fff', borderColor: 'rgba(245,158,11,.2)', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[v.signal, v.buyer, v.angle].map((col, i) => (
            <div key={i} className="p-5 md:border-r last:border-r-0" style={{ borderColor: '#FDE68A' }}>
              <Eyebrow gradient={i === 0 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' : i === 1 ? 'linear-gradient(90deg, #EC4899, #F472B6)' : 'linear-gradient(90deg, #10B981, #34D399)'}>{col.label}</Eyebrow>
              <span className="inline-block text-[11px] font-semibold px-2 py-0.5 mb-2" style={{ background: i === 0 ? '#FFFBEB' : i === 1 ? '#FDF2F8' : '#ECFDF5', color: i === 0 ? '#92400E' : i === 1 ? '#9D174D' : '#065F46' }}>{col.tag}</span>
              <h4 className="text-[14px] font-semibold mb-1.5 text-foreground">{col.title}</h4>
              <p className="text-[13px] leading-[1.65] text-muted-foreground">{col.body}</p>
            </div>
          ))}
        </div>
        <div className="p-5 border-t" style={{ background: 'linear-gradient(135deg, #78350F, #92400E)', borderColor: 'rgba(245,158,11,.2)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-[1.8px] mb-2.5" style={{ color: '#FBBF24' }}>Sample first email</div>
          <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,.55)' }}>Subject: {v.email.subj}</div>
          <div className="text-[13px] leading-[1.85] whitespace-pre-line" style={{ color: 'rgba(255,255,255,.9)' }}>{v.email.body}</div>
        </div>
      </div>

      {/* Research section */}
      <div className="mt-12">
        <div className="flex items-center gap-4 px-6 py-4" style={{ background: 'linear-gradient(135deg, #1E3A5F, #1E1B4B)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,.2)' }}>
            <span className="text-[16px]">📋</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[2px] mb-0.5" style={{ color: '#93C5FD' }}>Before You Call</p>
            <p className="text-[18px] font-semibold" style={{ color: '#fff' }}>Research the Company</p>
          </div>
        </div>
        <div className="p-5 border border-t-0" style={{ borderColor: 'rgba(59,130,246,.12)', background: '#fff' }}>
          <p className="text-[13px] text-muted-foreground mb-4">Run this on every HIGH priority account before you pick up the phone. It tells you what changed, why it matters, and who to call.</p>
          <PromptBox label="Company Research Prompt">
{`Research [COMPANY NAME] and tell me:

1. What does the company do? One sentence.
2. Where are they headquartered and do they have other offices or job sites?
3. What recent news, expansion, contract, project, or business change triggered this signal?
4. Based on that signal, what NCH service line is most likely in play — temporary housing, travel, hotels, or destination services?
5. Why does that signal create demand for that service line? Be specific.
6. Who is most likely the internal owner of this need? Give me a title and why that person.
7. What is the estimated timeline — is this happening now, next quarter, or later?
8. What is one specific thing I could say on a call that shows I understand their situation?`}
          </PromptBox>
        </div>
      </div>

      <SectionNav currentTab="results" onNavigate={onNavigate} />
    </div>
  );
};

export default ResultsTab;
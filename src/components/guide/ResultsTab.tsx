import { useState } from 'react';
import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';
import type { VerticalData } from './types';

interface ResultsTabProps {
  onNavigate: (tabId: string) => void;
}

const verticals: Record<string, VerticalData> = {
  construction: {
    signal: { label: "Signal", tag: "HIGH", title: "New site mobilization — Q2 launch", body: "A regional GC just landed a $28M contract for a phased industrial build outside Nashville. Engineering and field crews mobilize in 6 weeks." },
    buyer: { label: "Who to call", tag: "Project Manager", title: "Marcus Reid — Project Manager", body: "He owns the timeline. If crews can't get placed quickly, his schedule slips." },
    angle: { label: "Outreach angle", tag: "Temp Housing + Hotels", title: "Crew placement before they land", body: "Mobilizations move fast and housing is always what gets sorted last." },
    email: { subj: "Nashville build — crew housing", body: "Marcus,\n\nSaw your team just landed the Phase 1 contract — big win.\n\nMobilizations like this move fast and housing for incoming crews is usually the last thing to get locked in. We work with project teams to get that sorted before they land.\n\nWorth a 15-minute call before your Q2 kickoff?" }
  },
  defense: {
    signal: { label: "Signal", tag: "HIGH", title: "Contract award — program ramp", body: "A mid-size defense contractor at Redstone Arsenal just received a $40M Army program award. Engineering and program staff deploy over 90 days." },
    buyer: { label: "Who to call", tag: "Program Manager", title: "Program Manager or Site Lead", body: "They own readiness. Delays in housing or travel setup become their problem on day one." },
    angle: { label: "Outreach angle", tag: "Temp Housing + Travel", title: "Program readiness from day one", body: "Frame it around the deployment timeline, not housing." },
    email: { subj: "Redstone program housing", body: "Jennifer,\n\nCongrats on the Army contract — that's a strong program win for your team.\n\nWhen engineering staff deploy in phases like this, getting housing and travel sorted early is what keeps the program on track.\n\nWorth a quick call before your first deployment wave?" }
  },
  energy: {
    signal: { label: "Signal", tag: "HIGH", title: "Planned outage or turnaround", body: "A utility operator in the Southeast is running a 6-week planned outage. 40+ contractors rotating on 2-week shifts." },
    buyer: { label: "Who to call", tag: "Outage Manager", title: "Outage or Turnaround Manager", body: "They coordinate the entire crew logistics puzzle. Hotels, shuttles, shift overlap." },
    angle: { label: "Outreach angle", tag: "Hotels + Travel", title: "Shift logistics handled cleanly", body: "Rotating crews on a tight outage schedule need lodging that works around shift times." },
    email: { subj: "Outage crew lodging", body: "Brian,\n\nHeard about the planned outage coming up this spring — looks like a significant one.\n\nRotating crews on shift schedules usually run into hotel issues fast. We handle lodging setups built around how your crew actually operates.\n\nWorth a quick call before you finalize your contractor logistics?" }
  },
  healthcare: {
    signal: { label: "Signal", tag: "MEDIUM", title: "Travel nurse cohort or residency launch", body: "A regional hospital system in Atlanta is onboarding 30 travel nurses for a 13-week assignment." },
    buyer: { label: "Who to call", tag: "Clinical Staffing", title: "Clinical Staffing Manager or HR Manager", body: "They made the hire and now own the housing problem." },
    angle: { label: "Outreach angle", tag: "Temp Housing + DS", title: "Housing that keeps nurses focused", body: "Travel nurses who spend week one sorting out their living situation aren't focused on patient care." },
    email: { subj: "Housing for your travel nurse cohort", body: "Diane,\n\nSaw your system is onboarding a travel nurse cohort next quarter.\n\nWhen nurses arrive without housing locked in, the first week usually goes sideways. We work with healthcare teams to have furnished housing ready before they land.\n\nHappy to share how we've supported similar cohorts — worth a quick call?" }
  },
  tech: {
    signal: { label: "Signal", tag: "MEDIUM", title: "Office launch or intern cohort", body: "A Series C tech company is opening a second office in Austin and relocating 15 engineers from SF. Intern class of 22 starts in June." },
    buyer: { label: "Who to call", tag: "People Ops", title: "People Operations or Global Mobility Manager", body: "They own both the relocation and the intern experience." },
    angle: { label: "Outreach angle", tag: "Temp Housing + DS", title: "Relocation that doesn't slow hiring momentum", body: "Engineers who take 3 weeks to find an apartment are distracted engineers." },
    email: { subj: "Austin office relocation housing", body: "Alex,\n\nSaw the Austin expansion announcement — exciting move for the team.\n\nRelocating engineers while standing up a new office is a lot to manage at once. We handle furnished housing so people land focused on the work.\n\nWorth a 15-minute call before your first relocation wave?" }
  },
  manufacturing: {
    signal: { label: "Signal", tag: "HIGH", title: "Plant launch or training cohort", body: "An industrial manufacturer is launching a new production line in Huntsville. Running 3 onboarding cohorts of 20 technicians over 6 months." },
    buyer: { label: "Who to call", tag: "Training Manager", title: "Training Manager or Plant Manager", body: "They own the readiness of each cohort. If technicians show up distracted by housing, it costs them time." },
    angle: { label: "Outreach angle", tag: "Temp Housing", title: "Cohort housing locked in before each wave", body: "Phased cohorts mean phased housing needs. Lead with the operational efficiency angle." },
    email: { subj: "Huntsville cohort housing", body: "Kevin,\n\nSaw you're ramping production in Huntsville with phased technician cohorts — that's a significant launch.\n\nBringing in out-of-state techs in waves usually means housing gets re-solved every time. We set it up in advance by cohort.\n\nWorth a quick call before your first wave arrives?" }
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
      <Eyebrow gradient="linear-gradient(90deg, #E8BE70, #E8A87A)">Step 03 — Every Morning</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>Work Your Results</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Your tracker ran overnight. Review the signal, decide how urgent it is, and move the right accounts into action.
      </p>

      {/* Sample result */}
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[2px] mb-2" style={{ color: '#6366F1' }}>
        <span className="inline-block w-3.5 h-0.5" style={{ background: 'linear-gradient(90deg, #E8BE70, #E8A87A)' }} />
        What Each Result Looks Like
      </div>
      <div className="overflow-hidden border mb-6" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div className="flex items-center justify-between px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #1E293B, #1E1B4B)', borderBottom: '2px solid #6366F1' }}>
          <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>Sample Daily Result</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full animate-priority-pulse" style={{ color: '#fff' }}>HIGH PRIORITY</span>
        </div>
        {[
          ['Company', 'Meridian Defense Systems'],
          ['City', 'Huntsville, AL'],
          ['Signal', 'Awarded $40M Army contract at Redstone Arsenal — mobilization begins Q2'],
          ['Housing Use Case', '60+ engineers and contractors relocating for a 9-month build phase'],
          ['Estimated Stay', '6–12 months, phased arrivals'],
        ].map(([k, v]) => (
          <div key={k} className="flex border-b last:border-b-0" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-[145px] flex-shrink-0 px-3.5 py-2.5 text-[12px] font-semibold border-r" style={{ background: '#F8FAFC', color: '#1E293B', borderColor: '#E2E8F0' }}>{k}</div>
            <div className="px-3.5 py-2.5 text-[13px] flex-1" style={{ color: '#334155' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Triage framework */}
      <p className="text-[14px] font-semibold mb-3" style={{ color: '#1E293B' }}>3 things to do every morning</p>
      <div className="overflow-hidden border mb-4" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #1E293B, #1E1B4B)' }}>
          <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>Simple Triage Framework</span>
        </div>
        {[
          ['HIGH', 'Clear timeline, real people movement, and a likely buyer you can identify now. Call and research today.'],
          ['MEDIUM', 'Real change, but timing or ownership is not fully clear yet. Log it and keep watching.'],
          ['LOW', 'Interesting headline, but no defined movement, timing, or housing use case yet. Skip unless another signal confirms it.'],
        ].map(([k, v]) => (
          <div key={k} className="flex border-b last:border-b-0" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-[120px] flex-shrink-0 px-3.5 py-4 text-[12px] font-bold tracking-wide border-r flex items-center" style={{ background: '#F8FAFC', color: '#1E293B', borderColor: '#E2E8F0' }}>{k}</div>
            <div className="px-4 py-4 text-[13px] flex-1 leading-[1.6]" style={{ color: '#334155' }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          { num: 1, gradient: 'linear-gradient(135deg,#9B78C8,#A885D4)', text: 'Pull High priority first. These go straight onto your call list.' },
          { num: 2, gradient: 'linear-gradient(135deg,#D97895,#DE8AA0)', text: 'Log it in your CRM. Note the company name and the specific signal.' },
          { num: 3, gradient: 'linear-gradient(135deg,#EBC980,#F0D490)', text: 'Go to the 🔍 Step 4 tab before you call. Research the company so every conversation is backed by real context.' },
        ].map(s => (
          <div key={s.num} className="flex gap-3 items-start p-3.5 border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
            <div className="min-w-[27px] h-[27px] rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5" style={{ background: s.gradient, color: '#fff' }}>{s.num}</div>
            <p className="text-[13px] leading-[1.65]" style={{ color: '#475569' }}><strong style={{ color: '#1E293B' }}>{s.text.split('.')[0]}.</strong>{s.text.substring(s.text.indexOf('.') + 1)}</p>
          </div>
        ))}
      </div>

      {/* Vertical selector */}
      <div className="mt-7">
        <Eyebrow>See It In Action</Eyebrow>
        <h3 className="text-[18px] font-semibold mb-1.5" style={{ color: '#1E293B' }}>What does this look like in your vertical?</h3>
        <p className="text-[13px] mb-4" style={{ color: '#64748B' }}>Pick the industry you're working and see exactly how the full flow applies.</p>

        <div className="flex flex-wrap gap-2 mb-5">
          {verticalBtns.map(b => (
            <button
              key={b.id}
              onClick={() => setActiveVertical(b.id)}
              className="px-4 py-2 text-[12px] font-semibold border-2 rounded-full transition-all duration-200"
              style={{
                background: activeVertical === b.id ? 'linear-gradient(135deg, #8B8FE8, #9B78C8)' : '#fff',
                borderColor: activeVertical === b.id ? '#6366F1' : '#E2E8F0',
                color: activeVertical === b.id ? '#fff' : '#64748B',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden border transition-all duration-300" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.2)', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[v.signal, v.buyer, v.angle].map((col, i) => (
              <div key={i} className="p-5 md:border-r last:border-r-0" style={{ borderColor: '#D8E0EC' }}>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[1.8px] mb-2" style={{ color: '#6366F1' }}>
                  <span className="inline-block w-3 h-0.5" style={{ background: 'linear-gradient(90deg, #8B8FE8, #D97FAA)' }} />
                  {col.label}
                </div>
                <span className="inline-block text-[11px] font-semibold px-2 py-0.5 mb-2" style={{ background: '#EEF2FF', color: '#4F46E5' }}>{col.tag}</span>
                <h4 className="text-[14px] font-semibold mb-1.5" style={{ color: '#1E293B' }}>{col.title}</h4>
                <p className="text-[13px] leading-[1.65]" style={{ color: '#475569' }}>{col.body}</p>
              </div>
            ))}
          </div>
          <div className="p-5 border-t" style={{ background: 'linear-gradient(135deg, #1E293B, #1E1B4B)', borderColor: 'rgba(99,102,241,.2)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-[1.8px] mb-2.5" style={{ color: '#818CF8' }}>Sample first email</div>
            <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,.55)' }}>Subject: {v.email.subj}</div>
            <div className="text-[13px] leading-[1.85] whitespace-pre-line" style={{ color: 'rgba(255,255,255,.9)' }}>{v.email.body}</div>
          </div>
        </div>
      </div>

      <SectionNav currentTab="results" onNavigate={onNavigate} />
    </div>
  );
};

export default ResultsTab;

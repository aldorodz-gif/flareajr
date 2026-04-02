import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface OutreachTabProps {
  onNavigate: (tabId: string) => void;
}

const OutreachTab = ({ onNavigate }: OutreachTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #5BBFA0, #8B8FE8)">Step 06 — Make Contact</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>First Outreach — What Belongs in It</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Your first outreach should connect the signal to a likely business need and the most relevant service line. Keep it relevant, direct, and easy to respond to.
      </p>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-5 p-3.5 mb-5 border" style={{ background: '#E2E8F0', borderColor: 'rgba(99,102,241,.12)' }}>
        {[
          { val: '4', label: 'sentences max' },
          { val: '<100', label: 'words total' },
          { val: '2–4', label: 'word subject' },
          { val: '1', label: 'ask only' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[18px] font-semibold" style={{ color: '#1E293B' }}>{s.val}</p>
            <p className="text-[11px]" style={{ color: '#64748B' }}>{s.label}</p>
          </div>
        ))}
        <div className="flex-1 min-w-[200px] flex items-center">
          <p className="text-[13px] leading-[1.5]" style={{ color: '#64748B' }}>If you'd never say it out loud to someone's face — cut it.</p>
        </div>
      </div>

      {/* Personal tone rule */}
      <div className="p-5 mb-6" style={{ background: '#1E293B', borderRadius: '12px' }}>
        <p className="text-[13px] font-semibold tracking-wide mb-3" style={{ color: '#818CF8' }}>THE PERSONAL TONE RULE</p>
        <p className="text-[14px] leading-[1.75]" style={{ color: 'rgba(255,255,255,.88)' }}>
          Write it like you're texting a colleague about someone you both know. Not like you're sending a sales email. No "I wanted to reach out." No "I hope this finds you well." Just one person talking to another.
        </p>
      </div>

      {/* 4 parts */}
      <p className="text-[14px] font-semibold mb-1.5" style={{ color: '#1E293B' }}>What the Body Should Contain — 4 Things, in Order</p>
      <p className="text-[13px] mb-4" style={{ color: '#64748B' }}>Nothing else. No company history. No features. Every sentence has one job.</p>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          { num: 1, gradient: 'linear-gradient(160deg,#9B78C8,#A885D4)', title: 'One specific observation — proof you actually looked', good: '"Saw Meridian just landed the Redstone contract — congrats, that\'s a big one."', goodLabel: '✓ PERSONAL', bad: '"I came across your company and was impressed by what you do."', badLabel: '✗ GENERIC' },
          { num: 2, gradient: 'linear-gradient(160deg,#C47EAA,#CF8EBB)', title: 'One sentence naming their likely problem', good: '"Mobilizations like that move fast — housing for incoming crews is usually the thing that gets figured out last."', goodLabel: '✓ THEIR PROBLEM', bad: '"We help teams get placed quickly with the right mix of temporary housing."', badLabel: '✗ YOUR SOLUTION' },
          { num: 3, gradient: 'linear-gradient(160deg,#E2907A,#E89D85)', title: 'One sentence on what you do — plain English', good: '"We help get crews placed before they land — temporary housing, hotels, or travel support handled cleanly."', goodLabel: '✓ OUTCOME FIRST', bad: '"We help teams get placed quickly and keep moves organized."', badLabel: '✗ COMPANY-FIRST' },
          { num: 4, gradient: '#2F4858', title: 'One ask — the smallest possible yes', good: '"Worth a quick 15-minute call to see if it makes sense for your Q2 timeline?"', goodLabel: '✓ LOW FRICTION', bad: '"I\'d love to schedule a 30-minute demo to walk you through our platform."', badLabel: '✗ HIGH FRICTION' },
        ].map(s => (
          <div key={s.num} className="flex flex-col md:flex-row overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)' }}>
            <div className="md:min-w-[64px] flex md:flex-col items-center justify-center p-4" style={{ background: s.gradient }}>
              <span className="text-[20px] font-semibold" style={{ color: '#fff' }}>{s.num}</span>
            </div>
            <div className="p-4 flex-1">
              <p className="font-semibold mb-1.5" style={{ color: '#1E293B' }}>{s.title}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="p-3 rounded-md border-l-[3px]" style={{ background: '#EEF4F1', borderColor: '#2F4858' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#2F4858' }}>{s.goodLabel}</p>
                  <p className="text-[13px] italic leading-[1.5]" style={{ color: '#1E293B' }}>{s.good}</p>
                </div>
                <div className="p-3 rounded-md border-l-[3px]" style={{ background: 'rgba(239,68,68,.06)', borderColor: '#EF4444' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#EF4444' }}>{s.badLabel}</p>
                  <p className="text-[13px] italic leading-[1.5]" style={{ color: '#1E293B' }}>{s.bad}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sample emails */}
      <p className="text-[14px] font-semibold mb-1.5" style={{ color: '#1E293B' }}>Two Real Emails — Same Company, Different Contacts</p>
      <p className="text-[13px] mb-4" style={{ color: '#64748B' }}>Same trigger. Different role. Completely different email.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
        <div className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)' }}>
          <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg,#9B78C8,#A885D4)' }}>
            <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,.55)' }}>To the Project Manager</p>
            <p className="text-[13px] font-semibold" style={{ color: '#fff' }}>Marcus Johnson — Mobilization focus</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#64748B' }}>Subject</p>
            <p className="text-[13px] italic mb-3.5 pb-3 border-b" style={{ color: '#1E293B', borderColor: '#E2E8F0' }}>"Redstone mobilization housing"</p>
            <p className="text-[13px] leading-[1.8]" style={{ color: '#334155' }}>
              Marcus,<br /><br />
              Saw Meridian just landed the Redstone contract — that's a significant win.<br /><br />
              Mobilizations like that move fast and housing for incoming crews is usually what gets figured out last. We work with project teams to have that sorted before they land — fully furnished, move-in ready, one invoice.<br /><br />
              Worth a 15-minute call to see if it's a fit for your Q2 timeline?
            </p>
          </div>
        </div>
        <div className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)' }}>
          <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg,#D97895,#DE8AA0)' }}>
            <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,.55)' }}>To the HR / People Lead</p>
            <p className="text-[13px] font-semibold" style={{ color: '#fff' }}>Sarah Chen — Employee experience focus</p>
          </div>
          <div className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#64748B' }}>Subject</p>
            <p className="text-[13px] italic mb-3.5 pb-3 border-b" style={{ color: '#1E293B', borderColor: '#E2E8F0' }}>"Housing for your Redstone team"</p>
            <p className="text-[13px] leading-[1.8]" style={{ color: '#334155' }}>
              Sarah,<br /><br />
              Congrats on the Redstone contract — big milestone for the team.<br /><br />
              When engineers relocate for a build like this, the housing situation can make or break how quickly they settle in. We handle furnished housing for incoming teams so your people arrive focused on the job.<br /><br />
              Happy to share how we've supported similar teams — worth a quick call?
            </p>
          </div>
        </div>
      </div>

      {/* Follow-up sequence */}
      <p className="text-[14px] font-semibold mb-1.5" style={{ color: '#1E293B' }}>The Follow-Up Sequence</p>
      <p className="text-[13px] mb-4" style={{ color: '#64748B' }}>60% of replies come after the first email. Each follow-up adds something new.</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6">
        {[
          { day: 'Email 1 — Day 1', title: 'The Hook', body: 'Signal + their problem + one ask.', color: '#6366F1' },
          { day: 'Email 2 — Day 4', title: 'Add Proof', body: 'One line. How you helped a similar team.', color: '#6366F1' },
          { day: 'Email 3 — Day 9', title: 'Try a New Angle', body: 'Different contact or different pain point.', color: '#818CF8' },
          { day: 'Email 4 — Day 16', title: 'The Graceful Exit', body: '"I don\'t want to keep reaching out if the timing\'s off."', color: '#64748B' },
        ].map(e => (
          <div key={e.day} className="p-3.5 border border-t-[3px]" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', borderTopColor: e.color }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#64748B' }}>{e.day}</p>
            <p className="text-[13px] font-semibold mb-1" style={{ color: '#1E293B' }}>{e.title}</p>
            <p className="text-[12px] leading-[1.55]" style={{ color: '#64748B' }}>{e.body}</p>
          </div>
        ))}
      </div>

      {/* Generate prompt */}
      <p className="text-[14px] font-semibold mb-1.5" style={{ color: '#1E293B' }}>Generate Your Email</p>
      <p className="text-[13px] mb-4" style={{ color: '#64748B' }}>Fill in the blanks from your Steps 4 and 5 research.</p>

      <PromptBox label="Outreach Generator Prompt">
{`Write a first-touch cold email for [COMPANY NAME].

Context:
— Trigger / signal: [e.g. awarded $40M Army contract, mobilizing crews Q2]
— Recent positive news or win to open with: [something specific to reference]
— Contact name and title: [e.g. Marcus Johnson, Project Manager]
— Most likely service line: [temporary housing, travel, hotels, or destination services]
— Their role's main challenge right now: [from Step 5]
— One similar company or situation I can reference as proof: [optional]

Rules — follow all of these:
— Subject line: 2–4 words, specific to their situation
— Open with their name only, then immediately reference the trigger or news
— No "I hope this email finds you well" — ever
— Body: 4 sentences max covering: their situation → their likely problem → what I do → one ask
— Under 100 words total
— CTA: a question, not a statement. 15 minutes max. No demo asks.
— Tone: one person talking to another
— Also write a Day 4 follow-up (2–3 sentences) that adds proof without repeating Email 1`}
      </PromptBox>

      <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(99,102,241,.05)', border: '1px solid rgba(99,102,241,.18)' }}>
        <span className="text-[16px] flex-shrink-0 mt-0.5">💡</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: '#1E293B' }}>
          <strong>The test:</strong> Read your email out loud. If it sounds like something you'd actually say to someone's face — send it. If it sounds like a brochure — rewrite it.
        </p>
      </div>

      <SectionNav currentTab="outreach" onNavigate={onNavigate} />
    </div>
  );
};

export default OutreachTab;

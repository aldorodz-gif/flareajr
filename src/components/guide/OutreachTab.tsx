import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface OutreachTabProps {
  onNavigate: (tabId: string) => void;
}

const OutreachTab = ({ onNavigate }: OutreachTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #10B981, #34D399)">Step 05: Make Contact</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">First Outreach</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Connect the signal to the business need. One service line angle. Easy to respond to.
      </p>

      {/* First Email Generator */}
      <div className="overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #064E3B, #065F46)' }}>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.5)' }}>Quick Tool</p>
            <p className="text-[18px] font-semibold" style={{ color: '#fff' }}>First Email Generator</p>
          </div>
          <div className="px-3 py-1.5" style={{ background: 'rgba(16,185,129,.2)' }}>
            <p className="text-[12px] font-semibold" style={{ color: '#6EE7B7' }}>Paste into ChatGPT or Claude</p>
          </div>
        </div>
        <div className="p-5 border border-t-0" style={{ borderColor: 'rgba(16,185,129,.15)', background: '#fff' }}>
          <p className="text-[13px] text-muted-foreground mb-4">You have the signal. You have the buyer. Now you need the email. Copy this prompt, paste it into ChatGPT or Claude, and fill in the four blanks.</p>
          <PromptBox label="First Email Generator Prompt">
{`Write a first outreach email for a corporate housing sales rep at National Corporate Housing. NCH sells temporary housing, travel management, hotel programs, and destination services to businesses.

Company I'm reaching out to: [COMPANY NAME]
The signal or trigger: [WHAT HAPPENED — CONTRACT WIN, EXPANSION, RELOCATION, ETC.]
Buyer title I'm contacting: [JOB TITLE]
Service line most relevant: [TEMPORARY HOUSING / TRAVEL / HOTELS / DESTINATION SERVICES]

Rules for the email:
- Under 100 words, maximum 4 sentences
- Write like one person texting another, not a sales email
- First sentence references the specific trigger. Not a generic opener.
- Second sentence names their likely problem without pitching anything
- Third sentence says what NCH does in plain English, outcome first
- Last sentence asks for a 10 to 15 minute call. Low friction.
- No "I hope this email finds you well"
- No "I wanted to reach out"
- No company history or feature list

Also generate a 2 to 4 word subject line that references the specific trigger.

Return the subject line first, then the email body.`}
          </PromptBox>
          <div className="p-3.5" style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)' }}>
            <p className="text-[12px] font-bold uppercase tracking-wide mb-2" style={{ color: '#059669' }}>After you get the draft</p>
            <div className="flex flex-col gap-1.5">
              {['Read it out loud. If it sounds like a sales email, rewrite it.', 'Could it be sent to anyone else? If yes, it needs a more specific first line.', 'Is the ask clear and easy to say yes to? If not, simplify it.'].map((t, i) => (
                <p key={i} className="text-[13px] text-foreground flex gap-2.5"><span className="font-bold" style={{ color: '#059669' }}>{i + 1}</span> {t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-5 p-3.5 mb-5 border" style={{ background: '#ECFDF5', borderColor: 'rgba(16,185,129,.15)' }}>
        {[{ val: '4', label: 'sentences max' }, { val: '<100', label: 'words total' }, { val: '2–4', label: 'word subject' }, { val: '1', label: 'ask only' }].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[18px] font-semibold text-foreground">{s.val}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
        <div className="flex-1 min-w-[200px] flex items-center">
          <p className="text-[13px] leading-[1.5] text-muted-foreground">If you'd never say it out loud to someone's face — cut it.</p>
        </div>
      </div>

      {/* Personal tone rule */}
      <div className="p-5 mb-6" style={{ background: 'linear-gradient(135deg, #064E3B, #065F46)' }}>
        <p className="text-[13px] font-semibold tracking-wide mb-3" style={{ color: '#6EE7B7' }}>THE PERSONAL TONE RULE</p>
        <p className="text-[14px] leading-[1.75]" style={{ color: 'rgba(255,255,255,.88)' }}>
          Write it like you're texting a colleague about someone you both know. Not like you're sending a sales email. No "I wanted to reach out." No "I hope this finds you well." Just one person talking to another.
        </p>
      </div>

      {/* 4 parts */}
      <p className="text-[14px] font-semibold mb-1.5 text-foreground">What the Body Should Contain</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Nothing else. No company history. No features. Every sentence has one job.</p>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          { num: 1, gradient: 'linear-gradient(160deg,#10B981,#34D399)', title: 'One specific observation: proof you actually looked', good: '"Saw [Company] just [landed the contract / kicked off the expansion], congrats, that\'s a big one."', goodLabel: '✓ PERSONAL', bad: '"I came across your company and was impressed by what you do."', badLabel: '✗ GENERIC' },
          { num: 2, gradient: 'linear-gradient(160deg,#0EA5E9,#38BDF8)', title: 'One sentence naming their likely problem: not your solution', good: '"Mobilizations like that move fast, travel, lodging, or temporary housing for incoming crews is usually the thing that gets figured out last."', goodLabel: '✓ THEIR PROBLEM', bad: '"We help teams get placed quickly with the right mix of temporary housing."', badLabel: '✗ YOUR SOLUTION' },
          { num: 3, gradient: 'linear-gradient(160deg,#F59E0B,#FBBF24)', title: 'One sentence on what you do: plain English, outcome-first', good: '"We help get crews placed before they land — temporary housing, hotels, or travel support handled cleanly."', goodLabel: '✓ OUTCOME FIRST', bad: '"We help teams get placed quickly and keep moves, travel, and lodging organized."', badLabel: '✗ COMPANY-FIRST' },
          { num: 4, gradient: 'linear-gradient(160deg,#8B5CF6,#A78BFA)', title: 'One ask: the smallest possible yes', good: '"Worth a quick 15-minute call to see if it makes sense for your Q2 timeline?"', goodLabel: '✓ LOW FRICTION', bad: '"I\'d love to schedule a 30-minute demo to walk you through our platform."', badLabel: '✗ HIGH FRICTION' },
        ].map(s => (
          <div key={s.num} className="flex flex-col md:flex-row overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(16,185,129,.15)' }}>
            <div className="md:min-w-[64px] flex md:flex-col items-center justify-center p-4" style={{ background: s.gradient }}>
              <span className="text-[20px] font-semibold" style={{ color: '#fff' }}>{s.num}</span>
            </div>
            <div className="p-4 flex-1">
              <p className="font-semibold mb-1.5 text-foreground">{s.title}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="p-3 border-l-[3px]" style={{ background: '#ECFDF5', borderColor: '#10B981' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#059669' }}>{s.goodLabel}</p>
                  <p className="text-[13px] italic leading-[1.5] text-foreground">{s.good}</p>
                </div>
                <div className="p-3 border-l-[3px]" style={{ background: 'rgba(239,68,68,.06)', borderColor: '#EF4444' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#EF4444' }}>{s.badLabel}</p>
                  <p className="text-[13px] italic leading-[1.5] text-foreground">{s.bad}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Real Emails */}
      <p className="text-[14px] font-semibold mb-1.5 text-foreground">Four Real Emails: Same Trigger, Different Service Lines</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Same contract win. Four different contacts. The signal doesn't change. Your angle does.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
        {[
          { header: 'Temporary Housing · Project Manager', title: 'Project Manager. Crew placement', gradient: 'linear-gradient(135deg,#10B981,#059669)', subj: '"[Company] mobilization housing"', body: 'Marcus,\n\nSaw [Company] just landed [the contract/project]. That\'s a significant win.\n\nMobilizations like that move fast and housing for incoming crews is usually what gets figured out last. We work with project teams to have that sorted before they land, fully furnished, move-in ready, one invoice.\n\nWorth a 15-minute call to see if it\'s a fit for your timeline?\n\n[Your name]' },
          { header: 'Destination Services · HR / People Lead', title: 'People Operations Lead. Relocation experience', gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)', subj: '"Settling in your [Company] team"', body: 'Sarah,\n\nCongrats on [the expansion/move/contract], big milestone for the team.\n\nWhen people relocate for a build like this, the settling-in process (licenses, schools, area orientation) is what takes the longest to sort. We handle destination services so your people arrive ready to focus, not overwhelmed.\n\nWorth a quick call to see if it fits what you\'re planning?\n\n[Your name]' },
          { header: 'Travel · Operations Director', title: 'Operations Director. Crew logistics', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', subj: '"[Company] crew travel"', body: 'Brian,\n\nSaw [Company] just [landed the contract / kicked off the project]. That\'s a serious ramp for your team.\n\nGetting rotating crews to site on a tight schedule is usually where travel starts to leak: ad hoc bookings, no rate discipline. We manage crew travel programs so your ops team isn\'t chasing flights and hotel receipts.\n\nHappy to show you how we\'ve handled similar deployments, worth 15 minutes?\n\n[Your name]' },
          { header: 'Hotels · Travel Program Manager', title: 'Travel Program Manager. Hotel leakage', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', subj: '"Hotel coverage. [Company] build"', body: 'Kim,\n\nCongrats on [the contract win / project launch], looks like a significant deployment coming up.\n\nWhen project headcount spikes fast, hotel spend usually gets messy: multiple properties, no rate negotiation, leakage outside the program. We lock in negotiated hotel blocks around active job sites so your spend is clean from day one.\n\nWorth a quick call before your mobilization starts?\n\n[Your name]' },
        ].map(e => (
          <div key={e.header} className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(16,185,129,.12)' }}>
            <div className="px-4 py-3" style={{ background: e.gradient }}>
              <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,.55)' }}>{e.header}</p>
              <p className="text-[13px] font-semibold" style={{ color: '#fff' }}>{e.title}</p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 text-muted-foreground">Subject</p>
              <p className="text-[13px] italic mb-3.5 pb-3 border-b text-foreground" style={{ borderColor: '#E2E8F0' }}>{e.subj}</p>
              <p className="text-[13px] leading-[1.8] whitespace-pre-line" style={{ color: '#334155' }}>{e.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Follow-up sequence */}
      <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(14,30,58,.08)' }}>
        <p className="text-[14px] font-semibold mb-1.5 text-foreground">The Follow-Up Sequence</p>
        <p className="text-[13px] mb-4 text-muted-foreground">60% of replies come after the first email. Each follow-up adds something new.</p>
        <div className="overflow-hidden border" style={{ borderColor: 'rgba(16,185,129,.15)' }}>
          <div className="grid grid-cols-[100px_120px_1fr]" style={{ background: 'linear-gradient(135deg, #064E3B, #065F46)' }}>
            <div className="px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,.55)' }}>Touch</div>
            <div className="px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-wide" style={{ color: '#6EE7B7' }}>Angle</div>
            <div className="px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,.55)' }}>What you send</div>
          </div>
          {[
            ['Email 1: Day 1', 'The Hook', 'Signal + their problem + one ask. Everything in the framework above.'],
            ['Email 2: Day 4', 'Add Proof', 'One line. How you helped a similar team. Keep it short.'],
            ['Email 3: Day 9', 'New Angle', 'Different contact or different service line. Reference any new signal.'],
            ['Email 4: Day 16', 'Graceful Exit', '"I don\'t want to keep reaching out if the timing\'s off." Leaves the door open.'],
          ].map(([touch, angle, what], i) => (
            <div key={i} className="grid grid-cols-[100px_120px_1fr] border-t" style={{ borderColor: '#D1FAE5', background: '#fff' }}>
              <div className="px-3.5 py-3 text-[12px] font-semibold text-muted-foreground">{touch}</div>
              <div className="px-3.5 py-3 text-[13px] font-semibold text-foreground">{angle}</div>
              <div className="px-3.5 py-3 text-[13px] text-muted-foreground leading-[1.55]">{what}</div>
            </div>
          ))}
        </div>
      </div>

      <SectionNav currentTab="outreach" onNavigate={onNavigate} />
    </div>
  );
};

export default OutreachTab;
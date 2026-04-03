import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface OutreachTabProps {
  onNavigate: (tabId: string) => void;
}

const SERVICE_LINES = ['Temporary Housing', 'Travel', 'Hotels', 'Destination Services'];

interface EmailResult {
  subject: string;
  body: string;
}

const OutreachTab = ({ onNavigate }: OutreachTabProps) => {
  const [company, setCompany] = useState('');
  const [signal, setSignal] = useState('');
  const [buyerTitle, setBuyerTitle] = useState('');
  const [serviceLine, setServiceLine] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const canGenerate = company.trim() && signal.trim() && buyerTitle.trim() && serviceLine;

  const callApi = useCallback(async (vary = false) => {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    if (!vary) setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('email-generator', {
        body: { company: company.trim(), signal: signal.trim(), buyer_title: buyerTitle.trim(), service_line: serviceLine, vary },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data as EmailResult);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [company, signal, buyerTitle, serviceLine, canGenerate]);

  const wordCount = result ? result.body.split(/\s+/).filter(Boolean).length : 0;

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #5BBFA0, #8B8FE8)">Step 06: Make Contact</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">First Outreach</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Connect the signal to the business need. One service line angle. Easy to respond to.
      </p>

      {/* ── Before You Send: Micro-Closes ── */}
      <section className="mb-8">
        <Eyebrow gradient="linear-gradient(90deg, #E8A87A, #EBC980)">Before You Send</Eyebrow>
        <h3 className="text-[20px] font-semibold mb-1 text-foreground">Build Agreement as You Go</h3>
        <p className="text-[13px] text-muted-foreground mb-1.5">Most deals don't die at the close. They die somewhere in the middle — because nobody checked whether the buyer was actually tracking.</p>
        <p className="text-[13px] text-muted-foreground mb-4">The fix is simple: get small confirmations throughout the call. By the time you ask for next steps, you're not closing — you're summarizing what they already said yes to.</p>

        <div className="flex flex-col gap-3">
          {[
            {
              num: '01',
              title: 'Confirm the pain is real',
              gradient: 'linear-gradient(135deg,#9B78C8,#A885D4)',
              phrase: '"What happens to your team when housing isn\'t locked in before people arrive?"',
              example: 'You\'re not pitching yet. You\'re getting them to say the problem out loud. Once they articulate it, they own it — and the rest of the call builds on that.',
            },
            {
              num: '02',
              title: 'Confirm the value clicks',
              gradient: 'linear-gradient(135deg,#C47EAA,#CF8EBB)',
              phrase: '"If someone handled all of that — the sourcing, the lease terms, the move-ins — would that free up bandwidth your team needs right now?"',
              example: 'Don\'t explain value. Ask if they see it. When they say yes, that\'s a commitment — not a feature dump they\'ll forget.',
            },
            {
              num: '03',
              title: 'Confirm there\'s a reason to act now',
              gradient: 'linear-gradient(135deg,#D97895,#DE8AA0)',
              phrase: '"If this doesn\'t get addressed before Q3, what does that look like for your team?"',
              example: 'Urgency isn\'t pressure you create — it\'s a consequence they already feel. Help them connect the timeline to the cost of doing nothing.',
            },
            {
              num: '04',
              title: 'Confirm the next move',
              gradient: 'linear-gradient(135deg,#E8A87A,#EDB880)',
              phrase: '"It sounds like this is already costing your team time. Would it make sense to map out what a solution looks like for your specific setup?"',
              example: 'If you\'ve confirmed the pain, value, and urgency — this isn\'t a hard ask. It\'s the obvious next step. If they hesitate here, something earlier wasn\'t solid.',
            },
          ].map(mc => (
            <div key={mc.num} className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ background: mc.gradient }}>
                <span className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,.5)' }}>{mc.num}</span>
                <span className="text-[14px] font-semibold" style={{ color: '#fff' }}>{mc.title}</span>
              </div>
              <div className="p-4">
                <p className="text-[13px] font-semibold italic mb-2.5 text-foreground">{mc.phrase}</p>
                <p className="text-[13px] leading-[1.65] text-muted-foreground">{mc.example}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(155,120,200,.05)', border: '1px solid rgba(99,102,241,.18)' }}>
          <span className="text-[16px] flex-shrink-0 mt-0.5">💡</span>
          <p className="text-[13px] leading-[1.65] text-foreground">
            <strong>Yes/No questions aren't always bad.</strong> If you've built real agreement through the first three steps, a direct "Does that make sense for your team?" isn't risky — it's earned.
          </p>
        </div>
      </section>

      {/* ── BANT Reframed ── */}
      <section className="mb-8">
        <h3 className="text-[20px] font-semibold mb-1 text-foreground">Qualify Smarter — BANT Reframed</h3>
        <p className="text-[13px] text-muted-foreground mb-4">BANT isn't a checklist you run through. Each element should emerge naturally from the conversation — not from a scripted question.</p>

        <div className="overflow-hidden border" style={{ borderColor: 'rgba(155,120,200,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.55)' }}>What to uncover — and how</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              { letter: 'B', label: 'Budget', wrong: '"What\'s your budget?"', right: 'Surfaces when you talk about what the current problem is costing them. Let the number come from their side.' },
              { letter: 'A', label: 'Authority', wrong: '"Are you the decision-maker?"', right: 'Ask how decisions like this typically get made. Map the process — don\'t put them on the spot.' },
              { letter: 'N', label: 'Need', wrong: '"Do you need this?"', right: 'The need should come from them, not you. If you have to convince them there\'s a problem, you\'re too early.' },
              { letter: 'T', label: 'Timing', wrong: '"When do you want to start?"', right: 'Anchor timing to their business events — a mobilization date, a lease ending, a cohort arriving. Not a calendar quarter.' },
            ].map((b, i) => (
              <div key={b.letter} className={`p-4 border-b ${i % 2 === 0 ? 'md:border-r' : ''}`} style={{ borderColor: '#E2E8F0', background: '#fff' }}>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #9B78C8, #C47EAA)', color: '#fff' }}>{b.letter}</span>
                  <span className="text-[14px] font-semibold text-foreground">{b.label}</span>
                </div>
                <p className="text-[12px] line-through mb-1.5" style={{ color: '#94A3B8' }}>{b.wrong}</p>
                <p className="text-[13px] leading-[1.6] text-muted-foreground">{b.right}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Email Generator ── */}
      <div className="overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.5)' }}>AI Tool</p>
            <p className="text-[18px] font-semibold" style={{ color: '#fff' }}>First Email Generator</p>
          </div>
          <div className="px-3 py-1.5" style={{ background: 'rgba(155,120,200,.15)' }}>
            <p className="text-[12px] font-semibold" style={{ color: '#C4A5DE' }}>Powered by AI</p>
          </div>
        </div>
        <div className="p-5 border border-t-0" style={{ borderColor: 'rgba(155,120,200,.12)', background: '#fff' }}>
          {!result ? (
            <>
              <p className="text-[13px] text-muted-foreground mb-4">Fill in the details and get a ready-to-send first outreach email.</p>
              <div className="flex flex-col gap-3 mb-4">
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company you're reaching out to" className="w-full px-4 py-3 border text-[14px] focus:outline-none focus:ring-2" style={{ borderColor: 'rgba(155,120,200,.2)', background: '#FAF7F2' }} disabled={loading} />
                <input type="text" value={signal} onChange={e => setSignal(e.target.value)} placeholder="What happened — contract win, expansion, new office, etc." className="w-full px-4 py-3 border text-[14px] focus:outline-none focus:ring-2" style={{ borderColor: 'rgba(155,120,200,.2)', background: '#FAF7F2' }} disabled={loading} />
                <input type="text" value={buyerTitle} onChange={e => setBuyerTitle(e.target.value)} placeholder="Job title of the person you're contacting" className="w-full px-4 py-3 border text-[14px] focus:outline-none focus:ring-2" style={{ borderColor: 'rgba(155,120,200,.2)', background: '#FAF7F2' }} disabled={loading} />
                <select value={serviceLine} onChange={e => setServiceLine(e.target.value)} className="w-full px-4 py-3 border text-[14px] focus:outline-none focus:ring-2" style={{ borderColor: 'rgba(155,120,200,.2)', background: '#FAF7F2' }} disabled={loading}>
                  <option value="">Select service line</option>
                  {SERVICE_LINES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                onClick={() => callApi(false)}
                disabled={!canGenerate || loading}
                className="px-6 py-3 text-[14px] font-semibold transition-all"
                style={{
                  background: !canGenerate || loading ? '#94A3B8' : 'linear-gradient(135deg, #9B78C8, #D97FAA)',
                  color: '#fff',
                  cursor: !canGenerate || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Thinking...' : 'Write My Email'}
              </button>
              {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#C95B6A' }}>{error}</p>}
            </>
          ) : (
            <>
              <div className="mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Subject Line</p>
                <p className="text-[15px] font-semibold text-foreground">{result.subject}</p>
              </div>
              <div className="relative p-5 border" style={{ borderColor: 'rgba(155,120,200,.12)', background: '#FAF7F2' }}>
                <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1`} style={{ background: wordCount > 100 ? '#C95B6A' : 'rgba(155,120,200,.15)', color: wordCount > 100 ? '#fff' : '#9B78C8' }}>
                  {wordCount} words
                </span>
                <p className="text-[14px] leading-[1.8] whitespace-pre-line pr-16" style={{ color: '#334155' }}>{result.body}</p>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCopy}
                  className="px-5 py-2.5 text-[13px] font-semibold transition-all"
                  style={{ background: copied ? 'linear-gradient(135deg, #5BBFA0, #4AAA8A)' : 'linear-gradient(135deg, #9B78C8, #D97FAA)', color: '#fff' }}
                >
                  {copied ? 'COPIED' : 'COPY'}
                </button>
                <button
                  onClick={() => callApi(true)}
                  disabled={loading}
                  className="px-5 py-2.5 text-[13px] font-semibold border"
                  style={{ borderColor: 'rgba(155,120,200,.3)', color: '#9B78C8', background: loading ? '#f1f1f1' : '#fff' }}
                >
                  {loading ? 'Thinking...' : 'Try a different angle'}
                </button>
                <button
                  onClick={() => { setResult(null); setError(''); }}
                  className="px-5 py-2.5 text-[13px] font-semibold text-muted-foreground"
                >
                  Start over
                </button>
              </div>
              {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#C95B6A' }}>{error}</p>}
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-5 p-3.5 mb-5 border" style={{ background: '#E2E8F0', borderColor: 'rgba(155,120,200,.12)' }}>
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
      <div className="p-5 mb-6" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
        <p className="text-[13px] font-semibold tracking-wide mb-3" style={{ color: '#C4A5DE' }}>THE PERSONAL TONE RULE</p>
        <p className="text-[14px] leading-[1.75]" style={{ color: 'rgba(255,255,255,.88)' }}>
          Write it like you're texting a colleague about someone you both know. Not like you're sending a sales email. No "I wanted to reach out." No "I hope this finds you well." Just one person talking to another.
        </p>
      </div>

      {/* Mobile-first hack */}
      <div className="flex gap-3 items-start p-4 mb-6 border" style={{ background: 'rgba(91,191,160,.06)', borderColor: 'rgba(91,191,160,.25)' }}>
        <span className="text-[20px] flex-shrink-0">📱</span>
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-1">Hack: Send yourself the email first and read it on your phone.</p>
          <p className="text-[12px] leading-[1.6] text-muted-foreground">
            Most buyers read your email on a 4-inch screen between meetings. If it looks like a wall of text on your phone, it's getting skipped. Short sentences. Short paragraphs. Every line should be scannable in 2 seconds. If you wouldn't read it standing in line at a coffee shop — rewrite it.
          </p>
        </div>
      </div>

      {/* 4 parts */}
      <p className="text-[14px] font-semibold mb-1.5 text-foreground">What the Body Should Contain</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Nothing else. No company history. No features. Every sentence has one job.</p>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          { num: 1, gradient: 'linear-gradient(160deg,#9B78C8,#A885D4)', title: 'One specific observation: proof you actually looked', good: '"Saw [Company] just [landed the contract / kicked off the expansion], congrats, that\'s a big one."', goodLabel: '✓ PERSONAL', bad: '"I came across your company and was impressed by what you do."', badLabel: '✗ GENERIC' },
          { num: 2, gradient: 'linear-gradient(160deg,#C47EAA,#CF8EBB)', title: 'One sentence naming their likely problem: not your solution', good: '"Mobilizations like that move fast, travel, lodging, or temporary housing for incoming crews is usually the thing that gets figured out last."', goodLabel: '✓ THEIR PROBLEM', bad: '"We help teams get placed quickly with the right mix of temporary housing."', badLabel: '✗ YOUR SOLUTION' },
          { num: 3, gradient: 'linear-gradient(160deg,#E2907A,#E89D85)', title: 'One sentence on what you do: plain English, outcome-first', good: '"We help get crews placed before they land — temporary housing, hotels, or travel support handled cleanly."', goodLabel: '✓ OUTCOME FIRST', bad: '"We help teams get placed quickly and keep moves, travel, and lodging organized."', badLabel: '✗ COMPANY-FIRST' },
          { num: 4, gradient: '#2F4858', title: 'One ask: the smallest possible yes', good: '"Worth a quick 15-minute call to see if it makes sense for your Q2 timeline?"', goodLabel: '✓ LOW FRICTION', bad: '"I\'d love to schedule a 30-minute demo to walk you through our platform."', badLabel: '✗ HIGH FRICTION' },
        ].map(s => (
          <div key={s.num} className="flex flex-col md:flex-row overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
            <div className="md:min-w-[64px] flex md:flex-col items-center justify-center p-4" style={{ background: s.gradient }}>
              <span className="text-[20px] font-semibold" style={{ color: '#fff' }}>{s.num}</span>
            </div>
            <div className="p-4 flex-1">
              <p className="font-semibold mb-1.5 text-foreground">{s.title}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="p-3 border-l-[3px]" style={{ background: '#EEF4F1', borderColor: '#1E293B' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#1E293B' }}>{s.goodLabel}</p>
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

      {/* Bottom line */}
      <div className="p-4 flex gap-3.5 items-start mb-6" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
        <span className="text-[12px] font-bold uppercase tracking-wide whitespace-nowrap pt-0.5" style={{ color: '#C4A5DE' }}>Bottom line</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.82)' }}>Good prospecting starts with a real signal. Good closing starts with alignment you built along the way. When both are working, you don't need to "close hard" — you just confirm what's already been agreed.</p>
      </div>

      <SectionNav currentTab="outreach" onNavigate={onNavigate} />
    </div>
  );
};

export default OutreachTab;

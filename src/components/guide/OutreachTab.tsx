import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import AiToolCard from './AiToolCard';
import SectionNav from './SectionNav';

interface OutreachTabProps {
  onNavigate: (tabId: string) => void;
}

const SERVICE_LINES = ['Temporary Housing', 'Travel', 'Hotels', 'Destination Services'];

const TONES: { id: string; label: string; emoji: string; hint: string }[] = [
  { id: 'direct', label: 'Direct', emoji: '🎯', hint: 'Sharp, no fluff. Gets to the point fast.' },
  { id: 'warm', label: 'Warm', emoji: '🤝', hint: 'Human, conversational, relationship-first.' },
  { id: 'analytical', label: 'Analytical', emoji: '📊', hint: 'Data-led, specific numbers and operational logic.' },
  { id: 'consultative', label: 'Consultative', emoji: '💡', hint: 'Curious, question-driven, advisory.' },
  { id: 'bold', label: 'Bold', emoji: '⚡', hint: 'Confident, contrarian, pattern-interrupt.' },
];

interface SuggestedTarget {
  title: string;
  reason: string;
}

interface EmailResult {
  subject: string;
  subject_alternatives?: string[];
  body: string;
  suggested_targets?: SuggestedTarget[];
  article_insight?: string;
}


const EMAIL_PARTS = [
  { num: 1, title: 'One specific observation', subtitle: 'proof you actually looked', good: '"Saw [Company] just [landed the contract / kicked off the expansion], congrats, that\'s a big one."', goodLabel: '✓ PERSONAL', bad: '"I came across your company and was impressed by what you do."', badLabel: '✗ GENERIC' },
  { num: 2, title: 'One sentence naming their likely problem', subtitle: 'not your solution', good: '"Mobilizations like that move fast, travel, lodging, or temporary housing for incoming crews is usually the thing that gets figured out last."', goodLabel: '✓ THEIR PROBLEM', bad: '"We help teams get placed quickly with the right mix of temporary housing."', badLabel: '✗ YOUR SOLUTION' },
  { num: 3, title: 'One sentence on what you do', subtitle: 'plain English, outcome-first', good: '"We help get crews placed before they land — temporary housing, hotels, or travel support handled cleanly."', goodLabel: '✓ OUTCOME FIRST', bad: '"We help teams get placed quickly and keep moves, travel, and lodging organized."', badLabel: '✗ COMPANY-FIRST' },
  { num: 4, title: 'One ask', subtitle: 'the smallest possible yes', good: '"Worth a quick 15-minute call to see if it makes sense for your Q2 timeline?"', goodLabel: '✓ LOW FRICTION', bad: '"I\'d love to schedule a 30-minute demo to walk you through our platform."', badLabel: '✗ HIGH FRICTION' },
];

const OutreachTab = ({ onNavigate }: OutreachTabProps) => {

  // Email generator state
  const [company, setCompany] = useState('');
  const [signal, setSignal] = useState('');
  const [buyerTitle, setBuyerTitle] = useState('');
  const [serviceLine, setServiceLine] = useState('');
  const [tone, setTone] = useState<string>('direct');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Article scraping state
  const [articleContent, setArticleContent] = useState('');
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [scrapedTitle, setScrapedTitle] = useState('');

  const isUrl = (text: string) => /^https?:\/\/.+/i.test(text.trim());

  const handleSignalChange = useCallback(async (value: string) => {
    setSignal(value);
    setArticleContent('');
    setScrapedTitle('');

    if (isUrl(value.trim()) && value.trim().length > 10) {
      setScrapingUrl(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('article-scraper', {
          body: { url: value.trim() },
        });
        if (fnError) throw fnError;
        if (data.error) throw new Error(data.error);
        setArticleContent(data.content || '');
        setScrapedTitle(data.title || '');
      } catch {
        setArticleContent('');
        setScrapedTitle('');
      } finally {
        setScrapingUrl(false);
      }
    }
  }, []);

  const canGenerate = company.trim() && (signal.trim() || articleContent) && buyerTitle.trim() && serviceLine;

  const callApi = useCallback(async (vary = false) => {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    if (!vary) setResult(null);
    try {
      const signalText = articleContent
        ? `Article: "${scrapedTitle}". Content: ${articleContent}`
        : signal.trim();
      const { data, error: fnError } = await supabase.functions.invoke('email-generator', {
        body: { company: company.trim(), signal: signalText, buyer_title: buyerTitle.trim(), service_line: serviceLine, tone, vary },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data as EmailResult);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [company, signal, buyerTitle, serviceLine, tone, articleContent, scrapedTitle, canGenerate]);

  const [regenLoading, setRegenLoading] = useState(false);
  const regenerateSubjects = useCallback(async () => {
    if (!result) return;
    setRegenLoading(true);
    try {
      const signalText = articleContent
        ? `Article: "${scrapedTitle}". Content: ${articleContent}`
        : signal.trim();
      const { data, error: fnError } = await supabase.functions.invoke('subject-alternatives', {
        body: {
          company: company.trim(),
          signal: signalText,
          buyer_title: buyerTitle.trim(),
          service_line: serviceLine,
          current_subject: result.subject,
          exclude: result.subject_alternatives || [],
        },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(r => r ? { ...r, subject_alternatives: data.subject_alternatives } : r);
    } catch {
      setError('Could not refresh subjects. Try again.');
    } finally {
      setRegenLoading(false);
    }
  }, [result, company, signal, buyerTitle, serviceLine, articleContent, scrapedTitle]);

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
      <Eyebrow gradient="linear-gradient(90deg, #5BBFA0, #8B8FE8)">Step 07: Make Contact</Eyebrow>
      <h2 className="text-[26px] font-bold mb-2 leading-tight text-foreground">Write Outreach</h2>
      <p className="text-[14px] max-w-[720px] mb-6 text-muted-foreground leading-relaxed">
        Generate a short, personal first email ready to send.
      </p>

      {(
        <div className="space-y-8 animate-fade-in">
          {/* ── AI Email Generator (Hero) ── */}
          <AiToolCard
            icon="✉️"
            title="First Email Generator"
            subtitle="Fill in the details — I'll write your first outreach email"
          >
            <p className="text-[14px] font-medium text-foreground mb-1">Four fields. One click. Your outreach email is ready.</p>
            <p className="text-[13px] text-muted-foreground mb-5">Enter the company, signal, buyer title, and service line. We'll generate a short, personal email ready to send.</p>

                {!result ? (
                  <>
                    <div className="flex flex-col gap-3 mb-5">
                      {/* Company */}
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">🏢</span>
                        <input
                          type="text"
                          value={company}
                          onChange={e => setCompany(e.target.value)}
                          placeholder="Company you're reaching out to"
                          className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200"
                          style={{
                            borderColor: company ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                            background: company ? '#FFF7ED' : '#FAF7F2',
                            boxShadow: company ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
                          }}
                          disabled={loading}
                        />
                      </div>

                      {/* Signal — supports URL or plain text */}
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">{isUrl(signal) ? '🔗' : '📡'}</span>
                        <input
                          type="text"
                          value={signal}
                          onChange={e => handleSignalChange(e.target.value)}
                          placeholder="Paste an article link or describe what happened"
                          className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200"
                          style={{
                            borderColor: signal ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                            background: signal ? '#FFF7ED' : '#FAF7F2',
                            boxShadow: signal ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
                          }}
                          disabled={loading}
                        />
                        {scrapingUrl && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                            <span className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                            Reading article...
                          </span>
                        )}
                      </div>
                      {articleContent && !scrapingUrl && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px]" style={{ background: 'rgba(91,187,160,.08)', border: '1px solid rgba(91,187,160,.2)' }}>
                          <span>✅</span>
                          <span className="text-foreground font-medium truncate">Article loaded{scrapedTitle ? `: ${scrapedTitle}` : ''}</span>
                        </div>
                      )}

                      {/* Buyer Title */}
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">👤</span>
                        <input
                          type="text"
                          value={buyerTitle}
                          onChange={e => setBuyerTitle(e.target.value)}
                          placeholder="Job title of the person you're contacting"
                          className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200"
                          style={{
                            borderColor: buyerTitle ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                            background: buyerTitle ? '#FFF7ED' : '#FAF7F2',
                            boxShadow: buyerTitle ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
                          }}
                          disabled={loading}
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none">🎯</span>
                        <select
                          value={serviceLine}
                          onChange={e => setServiceLine(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                          style={{
                            borderColor: serviceLine ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                            background: serviceLine ? '#FFF7ED' : '#FAF7F2',
                            boxShadow: serviceLine ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
                            color: serviceLine ? 'inherit' : '#9CA3AF',
                          }}
                          disabled={loading}
                        >
                          <option value="">Select service line</option>
                          {SERVICE_LINES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      {/* Tone selector */}
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground mb-2 mt-1">Tone style</p>
                        <div className="flex flex-wrap gap-2">
                          {TONES.map(t => {
                            const active = tone === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setTone(t.id)}
                                disabled={loading}
                                title={t.hint}
                                className="px-3 py-2 text-[12px] font-semibold transition-all rounded-md border"
                                style={{
                                  background: active ? 'linear-gradient(135deg, #ec4899, #db2777)' : '#FAF7F2',
                                  color: active ? '#fff' : '#2F4858',
                                  borderColor: active ? 'transparent' : 'rgba(155,120,200,.2)',
                                  boxShadow: active ? '0 2px 8px rgba(251,146,60,.3)' : 'none',
                                }}
                              >
                                <span className="mr-1.5">{t.emoji}</span>{t.label}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1.5 italic">
                          {TONES.find(t => t.id === tone)?.hint}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => callApi(false)}
                      disabled={!canGenerate || loading}
                      className="w-full py-4 text-[15px] font-bold tracking-wide transition-all"
                      style={{
                        background: !canGenerate || loading ? '#E2E8F0' : 'linear-gradient(135deg, #ec4899, #db2777)',
                        color: !canGenerate || loading ? '#94A3B8' : '#fff',
                        cursor: !canGenerate || loading ? 'not-allowed' : 'pointer',
                        boxShadow: canGenerate && !loading ? '0 4px 15px rgba(251,146,60,.35)' : 'none',
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Writing your email...
                        </span>
                      ) : '✉️  Write My Email'}
                    </button>
                    {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#EF4444' }}>{error}</p>}
                  </>
                ) : (
                  <>
                    <div className="mb-4 px-5 py-4" style={{ background: '#FAF7F2', border: '1px solid rgba(251,146,60,.25)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-[.12em] mb-1 text-muted-foreground">Subject Line</p>
                      <p className="text-[17px] font-bold text-foreground">{result.subject}</p>
                      {result.subject_alternatives && result.subject_alternatives.length > 0 && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(251,146,60,.2)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">Alternatives</p>
                            <button
                              onClick={regenerateSubjects}
                              disabled={regenLoading}
                              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 hover:opacity-80 disabled:opacity-50 flex items-center gap-1.5"
                              style={{ background: 'rgba(45,212,191,.15)', color: '#2F4858', border: '1px solid rgba(45,212,191,.3)' }}
                            >
                              {regenLoading ? (
                                <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Refreshing</>
                              ) : '↻ Regenerate'}
                            </button>
                          </div>
                          <ul className="space-y-1.5">
                            {result.subject_alternatives.map((alt, i) => (
                              <li key={i} className="flex items-center justify-between gap-2 text-[14px] text-foreground">
                                <span>{alt}</span>
                                <button
                                  onClick={() => setResult(r => r ? { ...r, subject: alt, subject_alternatives: [result.subject, ...(r.subject_alternatives || []).filter(x => x !== alt)] } : r)}
                                  className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 hover:opacity-80"
                                  style={{ background: 'rgba(251,146,60,.15)', color: '#2F4858' }}
                                >Use</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="relative px-5 py-5" style={{ background: '#FAFAFA', border: '1px solid hsl(var(--border))' }}>
                      <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1" style={{ background: wordCount > 100 ? 'rgba(201,91,106,.1)' : 'rgba(251,146,60,.15)', color: wordCount > 100 ? '#C95B6A' : '#2F4858', border: `1px solid ${wordCount > 100 ? 'rgba(201,91,106,.25)' : 'rgba(251,146,60,.25)'}` }}>
                        {wordCount} words
                      </span>
                      <p className="text-[14px] leading-[1.8] whitespace-pre-line pr-16 text-foreground">{result.body}</p>
                    </div>

                    {/* Article insight */}
                    {result.article_insight && (
                      <div className="mt-4 flex items-start gap-2.5 px-4 py-3 rounded-lg" style={{ background: 'rgba(91,187,160,.08)', border: '1px solid rgba(91,187,160,.2)' }}>
                        <span className="text-[14px] mt-0.5">🎯</span>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Key Signal Identified</p>
                          <p className="text-[13px] leading-relaxed text-foreground">{result.article_insight}</p>
                        </div>
                      </div>
                    )}

                    {/* Suggested targets */}
                    {result.suggested_targets && result.suggested_targets.length > 0 && (
                      <div className="mt-4 rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(251,146,60,.25)', background: '#FAF7F2' }}>
                        <div className="px-4 py-3 flex items-center gap-2" style={{ background: '#2F4858' }}>
                          <span className="text-[14px]">👥</span>
                          <p className="text-[13px] font-bold" style={{ color: '#ec4899' }}>Suggested Targets at {company}</p>
                        </div>
                        <div className="divide-y" style={{ borderColor: 'rgba(251,146,60,.12)' }}>
                          {result.suggested_targets.map((t, i) => (
                            <div key={i} className="flex items-start gap-3 px-4 py-3">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ background: '#2F4858', color: '#ec4899' }}>
                                {i + 1}
                              </span>
                              <div>
                                <p className="text-[14px] font-semibold text-foreground">{t.title}</p>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">{t.reason}</p>
                              </div>
                              <button
                                onClick={() => { setBuyerTitle(t.title); setResult(null); }}
                                className="ml-auto text-[11px] font-bold px-3 py-1.5 rounded-md flex-shrink-0 transition-colors hover:opacity-80"
                                style={{ background: 'rgba(251,146,60,.12)', color: '#db2777', border: '1px solid rgba(251,146,60,.25)' }}
                              >
                                Use this title
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 mt-5">
                      <button onClick={handleCopy} className="px-6 py-3 text-[13px] font-bold transition-all" style={{ background: copied ? '#14b8a6' : 'linear-gradient(135deg, #ec4899, #db2777)', color: '#fff', boxShadow: '0 2px 8px rgba(251,146,60,.3)' }}>
                        {copied ? '✓ COPIED' : '📋 COPY'}
                      </button>
                      <button onClick={() => callApi(true)} disabled={loading} className="px-6 py-3 text-[13px] font-bold transition-all" style={{ background: '#FAF7F2', border: '1px solid rgba(251,146,60,.3)', color: '#2F4858' }}>
                        {loading ? 'Thinking...' : '🔄 Different angle'}
                      </button>
                      <button onClick={() => { setResult(null); setError(''); }} className="px-6 py-3 text-[13px] font-bold transition-all text-muted-foreground">
                        Start over
                      </button>
                    </div>
                    {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#EF4444' }}>{error}</p>}
                  </>
                )}
          </AiToolCard>

          {/* ── Email Rules (collapsible) ── */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
            <button
              onClick={() => setRulesOpen(!rulesOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/[.02]"
            >
              <div className="flex items-center gap-3">
                <span className="text-[18px]">📐</span>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Email Rules & Guidelines</p>
                  <p className="text-[12px] text-muted-foreground">Stats, tone, mobile tips — everything that makes emails land</p>
                </div>
              </div>
              <span className="text-[16px] transition-transform duration-200 text-muted-foreground" style={{ transform: rulesOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
            </button>

            {rulesOpen && (
              <div className="px-5 pb-5 space-y-4 animate-fade-in border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {[{ val: '4', label: 'sentences max' }, { val: '<100', label: 'words total' }, { val: '2–4', label: 'word subject' }, { val: '1', label: 'ask only' }].map(s => (
                    <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#FAF7F2', border: '1px solid hsl(var(--border))' }}>
                      <span className="text-[16px] font-bold" style={{ color: '#2F4858' }}>{s.val}</span>
                      <span className="text-[11px] text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Tone rule */}
                <div className="rounded-lg p-4" style={{ background: '#2F4858' }}>
                  <p className="text-[12px] font-bold tracking-wide mb-2" style={{ color: '#ec4899' }}>THE PERSONAL TONE RULE</p>
                  <p className="text-[13px] leading-[1.7]" style={{ color: 'rgba(250,247,242,.88)' }}>
                    Write it like you're texting a colleague about someone you both know. No "I wanted to reach out." No "I hope this finds you well." Just one person talking to another.
                  </p>
                </div>

                {/* Mobile hack */}
                <div className="flex gap-3 items-start p-4 rounded-lg" style={{ background: 'rgba(91,191,160,.06)', border: '1px solid rgba(91,191,160,.2)' }}>
                  <span className="text-[18px] flex-shrink-0">📱</span>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground mb-1">Send yourself the email first — read it on your phone.</p>
                    <p className="text-[12px] leading-[1.6] text-muted-foreground">
                      Most buyers read your email on a 4-inch screen between meetings. If it looks like a wall of text, it's getting skipped.
                    </p>
                  </div>
                </div>

                <p className="text-[12px] text-muted-foreground italic">If you'd never say it out loud to someone's face — cut it.</p>
              </div>
            )}
          </div>

          {/* ── 4-Part Email Structure (timeline style) ── */}
          <section>
            <h3 className="text-[18px] font-bold mb-1 text-foreground">What the Body Should Contain</h3>
            <p className="text-[13px] text-muted-foreground mb-5">Nothing else. No company history. No features. Every sentence has one job.</p>

            <div className="relative pl-8">
              {/* Timeline line */}
              <div className="absolute left-[14px] top-3 bottom-3 w-[2px]" style={{ background: 'linear-gradient(to bottom, #ec4899, #2F4858)' }} />

              <div className="flex flex-col gap-4">
                {EMAIL_PARTS.map(s => (
                  <div key={s.num} className="relative">
                    {/* Dot */}
                    <div
                      className="absolute -left-8 top-4 w-[10px] h-[10px] rounded-full border-2"
                      style={{ borderColor: '#ec4899', background: 'hsl(var(--background))' }}
                    />
                    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
                      <div className="px-4 py-3 flex items-center gap-2.5" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                        <span className="w-6 h-6 rounded flex items-center justify-center text-[12px] font-bold" style={{ background: '#2F4858', color: '#ec4899' }}>{s.num}</span>
                        <div>
                          <span className="text-[14px] font-semibold text-foreground">{s.title}</span>
                          <span className="text-[12px] text-muted-foreground ml-1.5">— {s.subtitle}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="p-3.5 border-r" style={{ background: 'rgba(91,187,160,.04)', borderColor: 'hsl(var(--border))' }}>
                          <p className="text-[10px] font-bold mb-1" style={{ color: '#2F4858' }}>{s.goodLabel}</p>
                          <p className="text-[13px] italic leading-[1.5] text-foreground">{s.good}</p>
                        </div>
                        <div className="p-3.5" style={{ background: 'rgba(201,91,106,.04)' }}>
                          <p className="text-[10px] font-bold mb-1" style={{ color: '#C95B6A' }}>{s.badLabel}</p>
                          <p className="text-[13px] italic leading-[1.5] text-muted-foreground">{s.bad}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom line */}
          <div className="rounded-xl p-5 flex gap-4 items-start" style={{ background: '#2F4858' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap pt-0.5" style={{ color: '#ec4899' }}>Bottom line</span>
            <p className="text-[13px] leading-[1.7]" style={{ color: 'rgba(250,247,242,.85)' }}>
              Good prospecting emails aren't about you. They're about one signal, one problem, and one small ask. If you nail those three, the reply rate takes care of itself.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <SectionNav currentTab="outreach" onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default OutreachTab;

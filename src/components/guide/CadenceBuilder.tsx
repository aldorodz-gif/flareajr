import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CadenceType, CadenceStep } from './CadenceSelector';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

const WHY_THIS_WORKS: Record<string, string> = {
  'Signal-based intro': 'Leading with something specific about them — a news article, a hire, a move — proves you did your homework. It earns the right to a reply.',
  'Value add / insight': 'Sharing something useful without asking for anything builds credibility. It positions you as a resource, not just another rep selling.',
  'Social proof / case study': 'Buyers trust peers more than pitches. A short proof point from a similar company reduces perceived risk and sparks curiosity.',
  'Problem agitation': 'Naming a pain they likely feel makes them think "this person gets it." It creates urgency without being pushy.',
  'Breakup / last chance': 'The breakup email works because it removes pressure. People respond when they feel the window is closing, not when they feel chased.',
  'Follow-up nudge': 'Most deals are won in the follow-up, not the first touch. A short nudge keeps you top-of-mind without annoying them.',
  'New angle / re-approach': 'A fresh signal or angle gives you a legitimate reason to reach back out. It resets the conversation instead of repeating the old one.',
};

function getWhyText(step: { channel: string; emailType?: string; purpose: string }): string {
  if (step.channel === 'call') return 'A phone call after an email creates a multi-channel impression. Even if they don\'t pick up, the attempt signals confidence and seriousness.';
  if (step.channel === 'linkedin') return 'LinkedIn adds a face and a profile to your name. A thoughtful connect note or content engagement warms the relationship before you ever pitch.';
  if (step.channel === 'voicemail') return 'A short voicemail referencing prior touches shows persistence without desperation. It also gives them your voice — which builds trust faster than text.';
  if (step.emailType && WHY_THIS_WORKS[step.emailType]) return WHY_THIS_WORKS[step.emailType];
  return 'Each touch in the sequence builds on the last. Consistency and variety across channels is what separates reps who book meetings from those who don\'t.';
}

const channelIcon: Record<string, string> = {
  email: '✉️',
  call: '📞',
  linkedin: '💼',
  voicemail: '🎙️',
};

const channelColor: Record<string, string> = {
  email: '#fb923c',
  call: '#5BBFA0',
  linkedin: '#6366F1',
  voicemail: '#8B8FE8',
};

const EMAIL_TYPE_OPTIONS = [
  'Signal-based intro',
  'Value add / insight',
  'Social proof / case study',
  'Problem agitation',
  'Breakup / last chance',
  'Follow-up nudge',
  'New angle / re-approach',
];

const ANGLE_OPTIONS = [
  'Pain-based',
  'ROI-based',
  'Social proof',
  'Curiosity',
  'Trigger-based',
];

const CHANNEL_OPTIONS: CadenceStep['channel'][] = ['email', 'call', 'linkedin', 'voicemail'];

interface EmailResult {
  subject: string;
  body: string;
}

interface GeneratedEmails {
  [touchNum: number]: EmailResult;
}

interface EditableStep extends CadenceStep {
  emailType: string;
  angle: string;
}

const SERVICE_LINES = ['Temporary Housing', 'Travel', 'Hotels', 'Destination Services'];

function inferEmailType(purpose: string): string {
  const p = purpose.toLowerCase();
  if (p.includes('intro') || p.includes('signal')) return 'Signal-based intro';
  if (p.includes('value') || p.includes('insight')) return 'Value add / insight';
  if (p.includes('case study') || p.includes('social proof') || p.includes('proof')) return 'Social proof / case study';
  if (p.includes('breakup') || p.includes('last') || p.includes('door open')) return 'Breakup / last chance';
  if (p.includes('follow') || p.includes('nudge') || p.includes('next step')) return 'Follow-up nudge';
  if (p.includes('problem') || p.includes('pain') || p.includes('agitat')) return 'Problem agitation';
  if (p.includes('new angle') || p.includes('reconnect') || p.includes('new signal')) return 'New angle / re-approach';
  return 'Signal-based intro';
}

function inferAngle(purpose: string, touchNum: number): string {
  const p = purpose.toLowerCase();
  if (p.includes('signal') || p.includes('trigger') || p.includes('news')) return 'Trigger-based';
  if (p.includes('case study') || p.includes('social proof') || p.includes('proof')) return 'Social proof';
  if (p.includes('roi') || p.includes('value') || p.includes('benchmark') || p.includes('insight')) return 'ROI-based';
  if (p.includes('pain') || p.includes('problem') || p.includes('agitat')) return 'Pain-based';
  if (p.includes('breakup') || p.includes('curiosity') || p.includes('door')) return 'Curiosity';
  const defaults = ['Trigger-based', 'Pain-based', 'ROI-based', 'Social proof', 'Curiosity'];
  return defaults[(touchNum - 1) % defaults.length];
}
interface CadenceBuilderProps {
  cadence: CadenceType;
  onBack: () => void;
}

const CadenceBuilder = ({ cadence, onBack }: CadenceBuilderProps) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [company, setCompany] = useState('');
  const [signal, setSignal] = useState('');
  const [buyerTitle, setBuyerTitle] = useState('');
  const [serviceLine, setServiceLine] = useState('');
  const [generatedEmails, setGeneratedEmails] = useState<GeneratedEmails>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);

  // Editable steps — initialized from cadence
  const [editableSteps, setEditableSteps] = useState<EditableStep[]>(
    cadence.steps.map(s => ({ ...s, emailType: inferEmailType(s.purpose), angle: inferAngle(s.purpose, s.touchNum) }))
  );

  // Article scraping
  const [articleContent, setArticleContent] = useState('');
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [scrapedTitle, setScrapedTitle] = useState('');

  // Editing state
  const [editingStep, setEditingStep] = useState<number | null>(null);

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

  const updateStep = useCallback((touchNum: number, updates: Partial<EditableStep>) => {
    setEditableSteps(prev => prev.map(s =>
      s.touchNum === touchNum ? { ...s, ...updates } : s
    ));
  }, []);

  const generateForStep = useCallback(async (step: EditableStep) => {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    try {
      const touchContext = `This is touch #${step.touchNum} of a ${editableSteps.length}-touch ${cadence.title} cadence over ${cadence.duration}. Day ${step.day}. Channel: ${step.channel}. Email type: ${step.emailType}. Purpose: ${step.purpose}. Tone: ${step.tone}.${step.touchNum > 1 ? ` Previous touches have already been sent — this is a follow-up, not a first email.` : ''}`;

      const { data, error: fnError } = await supabase.functions.invoke('email-generator', {
        body: {
          company: company.trim(),
          signal: `${signal.trim()}${signal.trim() ? '\n\n' : ''}CADENCE CONTEXT: ${touchContext}`,
          buyer_title: buyerTitle.trim(),
          service_line: serviceLine,
          vary: step.touchNum > 1,
          ...(articleContent ? { article_content: articleContent, article_title: scrapedTitle } : {}),
        },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setGeneratedEmails(prev => ({ ...prev, [step.touchNum]: data as EmailResult }));
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [company, signal, buyerTitle, serviceLine, articleContent, scrapedTitle, canGenerate, cadence, editableSteps]);

  const handleCopy = useCallback((touchNum: number, email: EmailResult) => {
    navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`).then(() => {
      setCopied(touchNum);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const emailSteps = editableSteps.filter(s => s.channel === 'email');

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(47,72,88,.06)', color: 'hsl(var(--foreground))' }}
        >
          ← Back
        </button>
        <div className="flex items-center gap-2.5">
          <span className="text-[24px]">{cadence.icon}</span>
          <div>
            <h3 className="text-[18px] font-bold text-foreground">{cadence.title} Cadence</h3>
            <p className="text-[12px] text-muted-foreground">{editableSteps.length} touches · {cadence.duration}</p>
          </div>
        </div>
      </div>

      {/* Context inputs */}
      <div className="rounded-xl p-5 mb-6 border" style={{ background: '#FAF7F2', borderColor: 'hsl(var(--border))' }}>
        <p className="text-[13px] font-semibold text-foreground mb-3">Set context for the entire sequence</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px]">🏢</span>
            <input
              type="text" value={company} onChange={e => setCompany(e.target.value)}
              placeholder="Company" disabled={loading}
              className="w-full pl-9 pr-3 py-2.5 border text-[13px] focus:outline-none rounded-lg"
              style={{ borderColor: company ? 'rgba(251,146,60,.5)' : 'hsl(var(--border))', background: company ? '#FFF7ED' : '#fff' }}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px]">{isUrl(signal) ? '🔗' : '📡'}</span>
            <input
              type="text" value={signal} onChange={e => handleSignalChange(e.target.value)}
              placeholder="Signal or article link" disabled={loading}
              className="w-full pl-9 pr-3 py-2.5 border text-[13px] focus:outline-none rounded-lg"
              style={{ borderColor: signal ? 'rgba(251,146,60,.5)' : 'hsl(var(--border))', background: signal ? '#FFF7ED' : '#fff' }}
            />
            {scrapingUrl && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px]">👤</span>
            <input
              type="text" value={buyerTitle} onChange={e => setBuyerTitle(e.target.value)}
              placeholder="Buyer title" disabled={loading}
              className="w-full pl-9 pr-3 py-2.5 border text-[13px] focus:outline-none rounded-lg"
              style={{ borderColor: buyerTitle ? 'rgba(251,146,60,.5)' : 'hsl(var(--border))', background: buyerTitle ? '#FFF7ED' : '#fff' }}
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none">🎯</span>
            <select
              value={serviceLine} onChange={e => setServiceLine(e.target.value)}
              disabled={loading}
              className="w-full pl-9 pr-3 py-2.5 border text-[13px] focus:outline-none rounded-lg appearance-none cursor-pointer"
              style={{ borderColor: serviceLine ? 'rgba(251,146,60,.5)' : 'hsl(var(--border))', background: serviceLine ? '#FFF7ED' : '#fff', color: serviceLine ? 'inherit' : '#9CA3AF' }}
            >
              <option value="">Service line</option>
              {SERVICE_LINES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        {articleContent && !scrapingUrl && (
          <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg text-[11px]" style={{ background: 'rgba(91,187,160,.08)', border: '1px solid rgba(91,187,160,.2)' }}>
            <span>✅</span>
            <span className="text-foreground font-medium truncate">Article loaded{scrapedTitle ? `: ${scrapedTitle}` : ''}</span>
          </div>
        )}
      </div>

      {/* Editable cadence timeline */}
      <div className="relative">
        <div className="flex flex-col gap-0">
          {editableSteps.map((step, idx) => {
            const isActive = activeStep === step.touchNum;
            const hasEmail = !!generatedEmails[step.touchNum];
            const isEmailChannel = step.channel === 'email';
            const isEditing = editingStep === step.touchNum;

            return (
              <div key={step.touchNum} className="relative">
                {/* Connector line */}
                {idx < editableSteps.length - 1 && (
                  <div
                    className="absolute left-[18px] top-[44px] w-[2px]"
                    style={{
                      height: 'calc(100% - 24px)',
                      background: hasEmail ? '#5BBFA0' : 'hsl(var(--border))',
                    }}
                  />
                )}

                <button
                  onClick={() => setActiveStep(step.touchNum)}
                  className="w-full flex items-start gap-4 p-3 rounded-xl transition-all duration-200 text-left"
                  style={{
                    background: isActive ? 'hsl(var(--card))' : 'transparent',
                    border: isActive ? '1px solid rgba(251,146,60,.3)' : '1px solid transparent',
                    boxShadow: isActive ? '0 2px 12px rgba(0,0,0,.04)' : 'none',
                  }}
                >
                  {/* Touch circle */}
                  <div
                    className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[15px] flex-shrink-0 relative"
                    style={{
                      background: hasEmail ? '#5BBFA0' : isActive ? '#2F4858' : 'hsl(var(--card))',
                      border: `2px solid ${hasEmail ? '#5BBFA0' : isActive ? '#fb923c' : 'hsl(var(--border))'}`,
                      color: hasEmail || isActive ? '#FAF7F2' : 'inherit',
                    }}
                  >
                    {hasEmail ? '✓' : channelIcon[step.channel]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[13px] font-bold text-foreground">Touch {step.touchNum}</span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: `${channelColor[step.channel]}15`, color: channelColor[step.channel], border: `1px solid ${channelColor[step.channel]}30` }}
                      >
                        {step.channel}
                      </span>
                      {isEmailChannel && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(47,72,88,.06)', color: '#2F4858', border: '1px solid rgba(47,72,88,.1)' }}
                        >
                          {step.emailType}
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground ml-auto">Day {step.day}</span>
                    </div>
                    <p className="text-[13px] text-foreground leading-snug">{step.purpose}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 italic">Tone: {step.tone}</p>
                  </div>
                </button>

                {/* Why this works — outside button to avoid nested interactive elements */}
                <div className="ml-[54px] mr-3">
                  <Collapsible>
                    <CollapsibleTrigger
                      className="mt-0.5 mb-1 flex items-center gap-1 text-[11px] font-semibold transition-colors group"
                      style={{ color: '#fb923c' }}
                    >
                      <span className="group-data-[state=open]:rotate-90 transition-transform text-[10px]">▶</span>
                      Why this works
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 pl-3.5 mb-2">
                      <p className="text-[11px] leading-relaxed text-muted-foreground" style={{ maxWidth: 420 }}>
                        {getWhyText(step)}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Expanded panel for active step */}
                {isActive && (
                  <div className="ml-[54px] mr-3 mb-3 animate-fade-in">
                    {/* Edit toggle */}
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingStep(isEditing ? null : step.touchNum); }}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors"
                        style={{
                          background: isEditing ? '#2F4858' : 'rgba(47,72,88,.06)',
                          color: isEditing ? '#FAF7F2' : 'hsl(var(--foreground))',
                        }}
                      >
                        {isEditing ? '✓ Done editing' : '✏️ Edit this step'}
                      </button>
                    </div>

                    {/* Edit form */}
                    {isEditing && (
                      <div
                        className="rounded-lg p-4 mb-3 space-y-3 animate-fade-in"
                        style={{ background: 'rgba(47,72,88,.03)', border: '1px solid hsl(var(--border))' }}
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Day</label>
                            <input
                              type="number" min={0} max={60}
                              value={step.day}
                              onChange={e => updateStep(step.touchNum, { day: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border text-[13px] focus:outline-none rounded-lg"
                              style={{ borderColor: 'hsl(var(--border))', background: '#fff' }}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Channel</label>
                            <select
                              value={step.channel}
                              onChange={e => updateStep(step.touchNum, { channel: e.target.value as CadenceStep['channel'] })}
                              className="w-full px-3 py-2 border text-[13px] focus:outline-none rounded-lg appearance-none cursor-pointer"
                              style={{ borderColor: 'hsl(var(--border))', background: '#fff' }}
                            >
                              {CHANNEL_OPTIONS.map(c => (
                                <option key={c} value={c}>{channelIcon[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {step.channel === 'email' && (
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Email Type</label>
                            <select
                              value={step.emailType}
                              onChange={e => updateStep(step.touchNum, { emailType: e.target.value })}
                              className="w-full px-3 py-2 border text-[13px] focus:outline-none rounded-lg appearance-none cursor-pointer"
                              style={{ borderColor: 'hsl(var(--border))', background: '#fff' }}
                            >
                              {EMAIL_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Goal / Purpose</label>
                          <input
                            type="text"
                            value={step.purpose}
                            onChange={e => updateStep(step.touchNum, { purpose: e.target.value })}
                            className="w-full px-3 py-2 border text-[13px] focus:outline-none rounded-lg"
                            style={{ borderColor: 'hsl(var(--border))', background: '#fff' }}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Tone</label>
                          <input
                            type="text"
                            value={step.tone}
                            onChange={e => updateStep(step.touchNum, { tone: e.target.value })}
                            className="w-full px-3 py-2 border text-[13px] focus:outline-none rounded-lg"
                            style={{ borderColor: 'hsl(var(--border))', background: '#fff' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Generate / result for email steps */}
                    {isEmailChannel && (
                      <>
                        {!generatedEmails[step.touchNum] ? (
                          <div>
                            <button
                              onClick={() => generateForStep(step)}
                              disabled={!canGenerate || loading}
                              className="w-full py-3 text-[13px] font-bold tracking-wide rounded-lg transition-all"
                              style={{
                                background: !canGenerate || loading ? '#E2E8F0' : 'linear-gradient(135deg, #fb923c, #f97316)',
                                color: !canGenerate || loading ? '#94A3B8' : '#fff',
                                cursor: !canGenerate || loading ? 'not-allowed' : 'pointer',
                                boxShadow: canGenerate && !loading ? '0 4px 15px rgba(251,146,60,.3)' : 'none',
                              }}
                            >
                              {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Writing touch {step.touchNum}...
                                </span>
                              ) : `✉️  Generate Touch ${step.touchNum} Email`}
                            </button>
                            {!canGenerate && (
                              <p className="text-[11px] text-muted-foreground mt-2 text-center">Fill in all context fields above first</p>
                            )}
                          </div>
                        ) : (
                          <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'rgba(251,146,60,.2)' }}>
                            <div className="px-4 py-3" style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(251,146,60,.15)' }}>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Subject</p>
                              <p className="text-[15px] font-bold text-foreground">{generatedEmails[step.touchNum].subject}</p>
                            </div>
                            <div className="px-4 py-4" style={{ background: 'hsl(var(--card))' }}>
                              <p className="text-[13px] leading-[1.8] whitespace-pre-line text-foreground">
                                {generatedEmails[step.touchNum].body}
                              </p>
                            </div>
                            <div className="flex gap-2 px-4 py-3" style={{ background: '#FAF7F2', borderTop: '1px solid rgba(251,146,60,.15)' }}>
                              <button
                                onClick={() => handleCopy(step.touchNum, generatedEmails[step.touchNum])}
                                className="px-4 py-2 text-[12px] font-bold rounded-lg transition-all"
                                style={{
                                  background: copied === step.touchNum ? '#10B981' : 'linear-gradient(135deg, #fb923c, #f97316)',
                                  color: '#fff',
                                }}
                              >
                                {copied === step.touchNum ? '✓ Copied' : '📋 Copy'}
                              </button>
                              <button
                                onClick={() => generateForStep(step)}
                                disabled={loading}
                                className="px-4 py-2 text-[12px] font-bold rounded-lg transition-all"
                                style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                              >
                                {loading ? '...' : '🔄 Rewrite'}
                              </button>
                            </div>
                          </div>
                        )}
                        {error && <p className="mt-2 text-[12px] font-medium" style={{ color: '#EF4444' }}>{error}</p>}
                      </>
                    )}

                    {/* Non-email: coaching note */}
                    {!isEmailChannel && (
                      <div
                        className="px-4 py-3 rounded-lg"
                        style={{ background: `${channelColor[step.channel]}08`, border: `1px solid ${channelColor[step.channel]}20` }}
                      >
                        <p className="text-[12px] font-semibold text-foreground mb-1">{channelIcon[step.channel]} {step.channel === 'call' ? 'Call' : step.channel === 'linkedin' ? 'LinkedIn' : 'Voicemail'} touch — use the frameworks from the Calling tab</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{step.purpose}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress summary */}
      {Object.keys(generatedEmails).length > 0 && (
        <div className="mt-5 rounded-xl p-4 flex items-center justify-between" style={{ background: '#2F4858' }}>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#fb923c' }}>Sequence Progress</span>
            <span className="text-[13px]" style={{ color: 'rgba(250,247,242,.8)' }}>
              {Object.keys(generatedEmails).length} of {emailSteps.length} emails generated
            </span>
          </div>
          <div className="flex gap-1">
            {emailSteps.map(s => (
              <div
                key={s.touchNum}
                className="w-3 h-3 rounded-full"
                style={{ background: generatedEmails[s.touchNum] ? '#5BBFA0' : 'rgba(250,247,242,.15)' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CadenceBuilder;

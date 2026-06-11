import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SEQUENCE_STEPS, dueDateForDay } from './sequenceConfig';

const TONES = ['direct', 'warm', 'analytical', 'consultative', 'bold'] as const;
type Tone = typeof TONES[number];

export interface PipelineLead {
  company_name: string;
  vertical: string;
  signal_type: string;
  signal_detail: string;
  why_housing: string;
  recommended_titles: string[];
  source_url?: string;
  city?: string;
}

interface Props {
  lead: PipelineLead | null;
  onClose: () => void;
  onSaved?: (lead: PipelineLead) => void;
}

const AddToPipelineSheet = ({ lead, onClose, onSaved }: Props) => {
  const [chosenTitle, setChosenTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [tone, setTone] = useState<Tone>('direct');
  const [generating, setGenerating] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const recommendedTitles = Array.isArray(lead?.recommended_titles) ? lead.recommended_titles : [];

  useEffect(() => {
    if (lead) {
      setChosenTitle(recommendedTitles[0] ?? '');
      setCustomTitle('');
      setTone('direct');
      setEmailSubject('');
      setEmailBody('');
      setCelebrating(false);
    }
  }, [lead, recommendedTitles]);

  const effectiveTitle = (customTitle.trim() || chosenTitle).trim();

  const close = () => {
    if (saving || generating) return;
    onClose();
  };

  const handleGenerate = async () => {
    if (!lead || !effectiveTitle) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-generator', {
        body: {
          company: lead.company_name,
          signal: lead.signal_detail,
          buyer_title: effectiveTitle,
          service_line: lead.vertical,
          tone,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setEmailSubject(data.subject ?? '');
      setEmailBody(data.body ?? '');
    } catch (e: unknown) {
      toast({ title: 'Email generation failed', description: e instanceof Error ? e.message : 'Try again.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!lead || !effectiveTitle || !emailBody) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Sign in required', variant: 'destructive' });
        setSaving(false);
        return;
      }

      // Emails 2-5 are drafted on demand from the Pipeline tab to save AI credits.
      // Email 1 (above) is what the rep edited and gets sent today.
      const sequenceEmails: Array<{ step_key: string; subject: string; body: string }> = [];

      const noteBody =
        `Target: ${effectiveTitle}\n` +
        `Signal: ${lead.signal_type} — ${lead.signal_detail}\n` +
        `Why housing: ${lead.why_housing}\n` +
        (lead.source_url ? `Source: ${lead.source_url}\n` : '') +
        `\n--- EMAIL 1 ---\nSubject: ${emailSubject}\n\n${emailBody}`;

      const { error: piErr } = await supabase.from('pipeline_items').insert({
        user_id: user.id,
        company_name: lead.company_name,
        contact_title: effectiveTitle,
        stage: 'working',
        notes: noteBody,
      });
      if (piErr) throw piErr;

      const draftFor = (stepKey: string) =>
        sequenceEmails.find((e) => e.step_key === stepKey);

      const taskRows = SEQUENCE_STEPS.map(step => {
        let notes: string | null = null;
        if (step.day === 1) {
          // Use the rep's edited Email 1 verbatim.
          notes = `Subject: ${emailSubject}\n\n${emailBody}`;
        } else {
          const d = draftFor(step.task_type);
          notes = d ? `Subject: ${d.subject}\n\n${d.body}` : null;
        }
        return {
          user_id: user.id,
          company_name: lead.company_name,
          contact_title: effectiveTitle,
          task_type: step.task_type,
          due_date: dueDateForDay(step.day),
          status: 'pending',
          signal: lead.signal_detail,
          reason: step.reason,
          notes,
        };
      });
      const { error: tErr } = await supabase.from('tasks').insert(taskRows);
      if (tErr) {
        toast({ title: 'Pipeline saved, sequence partial', description: tErr.message, variant: 'destructive' });
      } else {
        toast({
          title: '+ Pipeline · sequence scheduled',
          description: `${lead.company_name} · Email 1 ready · Emails 2-5 draft on demand from Pipeline`,
        });
      }
      window.dispatchEvent(new CustomEvent('flare:tasks-updated'));
      onSaved?.(lead);
      setCelebrating(true);
      window.setTimeout(() => {
        onClose();
      }, 2200);
    } catch (e: unknown) {
      toast({ title: 'Could not save', description: e instanceof Error ? e.message : 'Try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && close()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {lead && celebrating && (
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 animate-fade-in" style={{ minHeight: '60vh' }}>
            <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none" aria-hidden>
              {Array.from({ length: 22 }).map((_, i) => {
                const emojis = ['🎉','✨','🎯','⚡','💥','⭐','🚀','🔥'];
                const left = (i * 4.7) % 100;
                const dx = (Math.random() - 0.5) * 80;
                const dy = 200 + Math.random() * 220;
                const rot = (Math.random() - 0.5) * 720;
                return (
                  <span
                    key={i}
                    className="flare-confetti"
                    style={{
                      left: `${left}%`,
                      ['--cx' as string]: `${dx}px`,
                      ['--cy' as string]: `${dy}px`,
                      ['--cr' as string]: `${rot}deg`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    {emojis[i % emojis.length]}
                  </span>
                );
              })}
            </div>
            <div className="relative z-10 animate-scale-in">
              <div className="text-5xl mb-3">🎯</div>
              <div className="text-xl font-extrabold mb-1" style={{ color: '#0e1e3a' }}>
                {lead.company_name} is locked & loaded
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                5 touches scheduled over 21 days — Email 1 ready to send today.
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold"
                style={{ background: 'linear-gradient(135deg, #DC2626, #0EA5E9)', color: '#fff' }}>
                ⚡ Pipeline +1
              </div>
            </div>
          </div>
        )}
        {lead && !celebrating && (
          <div className="space-y-5">
            <SheetHeader className="text-left">
              <SheetTitle className="text-lg font-extrabold" style={{ color: '#0e1e3a' }}>
                Add {lead.company_name} to pipeline
              </SheetTitle>
              <p className="text-[12px] text-muted-foreground">Generate Email 1 and auto-schedule a 5-touch sequence.</p>
            </SheetHeader>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block text-muted-foreground">Target this person</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {recommendedTitles.map(t => (
                  <button
                    key={t}
                    onClick={() => { setChosenTitle(t); setCustomTitle(''); }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded transition-all"
                    style={{
                      background: chosenTitle === t && !customTitle ? '#0e1e3a' : '#FFFFFF',
                      color: chosenTitle === t && !customTitle ? '#fff' : '#475569',
                      border: '1px solid rgba(14,30,58,.08)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="…or type a custom title"
                className="w-full px-3 py-2 text-[13px] border rounded"
                style={{ borderColor: 'rgba(14,30,58,.15)', background: '#fff' }}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block text-muted-foreground">Tone</label>
              <div className="flex flex-wrap gap-1.5">
                {TONES.map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded capitalize transition-all"
                    style={{
                      background: tone === t ? 'linear-gradient(135deg, #DC2626, #db2777)' : '#FFFFFF',
                      color: tone === t ? '#fff' : '#475569',
                      border: '1px solid rgba(14,30,58,.08)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded text-[12px]" style={{ background: '#FFFFFF', border: '1px solid rgba(14,30,58,.08)', color: '#1e293b' }}>
              <span className="font-bold" style={{ color: '#14b8a6' }}>Signal:</span> {lead.signal_detail}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!effectiveTitle || generating}
              className="w-full px-4 py-2.5 text-[13px] font-bold tracking-wide rounded transition-all"
              style={{
                background: !effectiveTitle || generating ? '#94A3B8' : 'linear-gradient(135deg, #DC2626, #db2777)',
                color: '#fff',
                cursor: !effectiveTitle || generating ? 'not-allowed' : 'pointer',
              }}
            >
              {generating ? '⏳ Generating…' : emailBody ? '↻ Regenerate Email 1' : '⚡ Generate Email 1'}
            </button>

            {emailBody && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider block text-muted-foreground">Email 1 — editable</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] font-semibold border rounded"
                  style={{ borderColor: 'rgba(14,30,58,.15)' }}
                  placeholder="Subject"
                />
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 text-[13px] border rounded font-sans"
                  style={{ borderColor: 'rgba(14,30,58,.15)' }}
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block text-muted-foreground">5-touch cadence (auto-scheduled)</label>
              <div className="grid grid-cols-5 gap-1.5">
                {SEQUENCE_STEPS.map(s => (
                  <div key={s.task_type} className="p-2 rounded text-center" style={{ background: '#F8FAFC', border: '1px solid rgba(14,30,58,.08)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#0e1e3a' }}>Day {s.day}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{s.label.split(' · ')[1]}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!emailBody || !effectiveTitle || saving}
              className="w-full px-4 py-3 text-[13px] font-bold tracking-wide rounded transition-all"
              style={{
                background: !emailBody || !effectiveTitle || saving ? '#94A3B8' : '#0e1e3a',
                color: '#fff',
                cursor: !emailBody || !effectiveTitle || saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving…' : '✓ Save to pipeline & schedule sequence'}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AddToPipelineSheet;

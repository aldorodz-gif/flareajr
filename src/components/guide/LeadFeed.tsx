import { useState } from 'react';
import Eyebrow from './Eyebrow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getDiscoveryPlaybook } from './discoveryQuestions';
import { SEQUENCE_STEPS, dueDateForDay } from './sequenceConfig';

export interface ScanLead {
  company_name: string;
  vertical: string;
  signal_type: string;
  signal_detail: string;
  why_housing: string;
  recommended_titles: string[];
}

interface LeadFeedProps {
  leads: ScanLead[];
  city: string;
  state: string;
  loading: boolean;
}

const SIGNAL_COLORS: Record<string, string> = {
  Expansion: '#ec4899',
  'Contract Win': '#14b8a6',
  'Hiring Surge': '#8B8FE8',
  'Project Award': '#f9a8d4',
  Merger: '#D97FAA',
  Default: '#9B78C8',
};

const TONES = ['direct', 'warm', 'analytical', 'consultative', 'bold'] as const;
type Tone = typeof TONES[number];

const LeadFeed = ({ leads, city, state, loading }: LeadFeedProps) => {
  const [pipelineIds, setPipelineIds] = useState<Set<string>>(new Set());
  const [askLead, setAskLead] = useState<ScanLead | null>(null);
  const [pipeLead, setPipeLead] = useState<ScanLead | null>(null);

  // Add-to-pipeline sheet state
  const [chosenTitle, setChosenTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [tone, setTone] = useState<Tone>('direct');
  const [generating, setGenerating] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [saving, setSaving] = useState(false);

  const openPipeline = (lead: ScanLead) => {
    setPipeLead(lead);
    setChosenTitle(lead.recommended_titles[0] ?? '');
    setCustomTitle('');
    setTone('direct');
    setEmailSubject('');
    setEmailBody('');
  };

  const closePipeline = () => {
    if (saving || generating) return;
    setPipeLead(null);
  };

  const effectiveTitle = (customTitle.trim() || chosenTitle).trim();

  const handleGenerate = async () => {
    if (!pipeLead || !effectiveTitle) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('email-generator', {
        body: {
          company: pipeLead.company_name,
          signal: pipeLead.signal_detail,
          buyer_title: effectiveTitle,
          service_line: pipeLead.vertical,
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

  const handleSavePipeline = async () => {
    if (!pipeLead || !effectiveTitle || !emailBody) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Sign in required', variant: 'destructive' });
        setSaving(false);
        return;
      }

      const noteBody =
        `Target: ${effectiveTitle}\n` +
        `Signal: ${pipeLead.signal_type} — ${pipeLead.signal_detail}\n` +
        `Why housing: ${pipeLead.why_housing}\n\n` +
        `--- EMAIL 1 ---\nSubject: ${emailSubject}\n\n${emailBody}`;

      const { error: piErr } = await supabase.from('pipeline_items').insert({
        user_id: user.id,
        company_name: pipeLead.company_name,
        contact_title: effectiveTitle,
        stage: 'working',
        notes: noteBody,
      });
      if (piErr) throw piErr;

      const taskRows = SEQUENCE_STEPS.map(step => ({
        user_id: user.id,
        company_name: pipeLead.company_name,
        contact_title: effectiveTitle,
        task_type: step.task_type,
        due_date: dueDateForDay(step.day),
        status: 'pending',
        signal: pipeLead.signal_detail,
        reason: step.reason,
        notes: step.day === 1 ? `Subject: ${emailSubject}\n\n${emailBody}` : null,
      }));
      const { error: tErr } = await supabase.from('tasks').insert(taskRows);
      if (tErr) {
        toast({ title: 'Pipeline saved, sequence partial', description: tErr.message, variant: 'destructive' });
      } else {
        toast({ title: '+ Pipeline · sequence scheduled', description: `${pipeLead.company_name} · 5 emails over 21 days` });
      }
      window.dispatchEvent(new CustomEvent('flare:tasks-updated'));
      setPipelineIds(prev => new Set(prev).add(pipeLead.company_name));
      setPipeLead(null);
    } catch (e: unknown) {
      toast({ title: 'Could not save', description: e instanceof Error ? e.message : 'Try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Eyebrow gradient="linear-gradient(90deg, #14b8a6, #f9a8d4)">Live Scan</Eyebrow>
          <h3 className="text-[16px] font-extrabold tracking-tight" style={{ color: '#0e1e3a' }}>
            Leads {city && state ? `in ${city}, ${state}` : ''}
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,146,60,.12)', color: '#ec4899' }}>
          {leads.length} found
        </span>
      </div>

      {loading && <div className="py-12 text-center text-[13px]" style={{ color: '#94a3b8' }}>Scanning the market…</div>}

      {!loading && leads.length === 0 && (
        <div className="py-12 text-center text-[13px]" style={{ color: '#94a3b8' }}>
          Pick a state, city, and vertical, then hit <span className="font-bold" style={{ color: '#ec4899' }}>Refresh Scan</span> to surface fresh leads.
        </div>
      )}

      <div className="grid gap-3">
        {leads.map((lead) => {
          const color = SIGNAL_COLORS[lead.signal_type] ?? SIGNAL_COLORS.Default;
          const inPipeline = pipelineIds.has(lead.company_name);
          return (
            <div
              key={lead.company_name}
              className="p-4 rounded-lg border transition-all hover:shadow-md"
              style={{ borderColor: 'rgba(14,30,58,.08)', borderLeft: `3px solid ${color}` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[15px] font-extrabold" style={{ color: '#0e1e3a' }}>{lead.company_name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: `${color}20`, color }}>
                      {lead.signal_type}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(155,120,200,.1)', color: '#9B78C8' }}>
                      {lead.vertical}
                    </span>
                  </div>
                  <p className="text-[13px] leading-snug mb-1.5" style={{ color: '#1e293b' }}>{lead.signal_detail}</p>
                  <p className="text-[12px] italic mb-2" style={{ color: '#64748b' }}>
                    <span className="font-bold not-italic" style={{ color: '#14b8a6' }}>Why housing:</span> {lead.why_housing}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.recommended_titles.slice(0, 5).map((t) => (
                      <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: '#FAF7F2', color: '#475569', border: '1px solid rgba(14,30,58,.08)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => openPipeline(lead)}
                    disabled={inPipeline}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-default"
                    style={{ background: inPipeline ? 'rgba(16,185,129,.15)' : '#0e1e3a', color: inPipeline ? '#14b8a6' : '#fff' }}
                  >
                    {inPipeline ? '✓ In pipeline' : '+ Pipeline'}
                  </button>
                  <button
                    onClick={() => setAskLead(lead)}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(251,146,60,.12)', color: '#ec4899', border: '1px solid rgba(251,146,60,.35)' }}
                  >
                    💬 What to Ask
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add-to-pipeline sheet */}
      <Sheet open={!!pipeLead} onOpenChange={(o) => !o && closePipeline()}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {pipeLead && (
            <div className="space-y-5">
              <SheetHeader className="text-left">
                <SheetTitle className="text-lg font-extrabold" style={{ color: '#0e1e3a' }}>
                  Add {pipeLead.company_name} to pipeline
                </SheetTitle>
                <p className="text-[12px] text-muted-foreground">Generate Email 1 and auto-schedule a 5-touch sequence.</p>
              </SheetHeader>

              {/* Title picker */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block text-muted-foreground">Target this person</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {pipeLead.recommended_titles.map(t => (
                    <button
                      key={t}
                      onClick={() => { setChosenTitle(t); setCustomTitle(''); }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded transition-all"
                      style={{
                        background: chosenTitle === t && !customTitle ? '#0e1e3a' : '#FAF7F2',
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

              {/* Tone picker */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block text-muted-foreground">Tone</label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded capitalize transition-all"
                      style={{
                        background: tone === t ? 'linear-gradient(135deg, #ec4899, #db2777)' : '#FAF7F2',
                        color: tone === t ? '#fff' : '#475569',
                        border: '1px solid rgba(14,30,58,.08)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Signal context */}
              <div className="p-3 rounded text-[12px]" style={{ background: '#FAF7F2', border: '1px solid rgba(14,30,58,.08)', color: '#1e293b' }}>
                <span className="font-bold" style={{ color: '#14b8a6' }}>Signal:</span> {pipeLead.signal_detail}
              </div>

              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={!effectiveTitle || generating}
                className="w-full px-4 py-2.5 text-[13px] font-bold tracking-wide rounded transition-all"
                style={{
                  background: !effectiveTitle || generating ? '#94A3B8' : 'linear-gradient(135deg, #ec4899, #db2777)',
                  color: '#fff',
                  cursor: !effectiveTitle || generating ? 'not-allowed' : 'pointer',
                }}
              >
                {generating ? '⏳ Generating…' : emailBody ? '↻ Regenerate Email 1' : '⚡ Generate Email 1'}
              </button>

              {/* Email preview */}
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

              {/* Cadence preview */}
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

              {/* Save */}
              <button
                onClick={handleSavePipeline}
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

      {/* What-to-ask sheet (unchanged) */}
      <Sheet open={!!askLead} onOpenChange={(o) => !o && setAskLead(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {askLead && (() => {
            const pb = getDiscoveryPlaybook(askLead.vertical);
            return (
              <div className="space-y-5">
                <SheetHeader className="text-left space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(251,146,60,.12)', color: '#ec4899' }}>{askLead.vertical}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(155,120,200,.1)', color: '#9B78C8' }}>{askLead.signal_type}</span>
                  </div>
                  <SheetTitle className="text-lg font-extrabold" style={{ color: '#0e1e3a' }}>{askLead.company_name}</SheetTitle>
                </SheetHeader>
                <div className="p-3 rounded-lg text-[13px] leading-relaxed" style={{ background: '#FAF7F2', color: '#0e1e3a', border: '1px solid rgba(14,30,58,.08)' }}>
                  {pb.framing}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Discovery Questions</p>
                  <ul className="space-y-2">
                    {pb.questions.map((q, i) => (
                      <li key={i} className="flex gap-2.5 items-start py-2 border-b text-[13px]" style={{ color: '#1e293b', borderColor: 'rgba(14,30,58,.06)' }}>
                        <span className="mt-0.5 w-3.5 h-3.5 rounded border shrink-0" style={{ borderColor: 'rgba(14,30,58,.25)' }} />
                        <span className="leading-snug">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-lg text-[12px] leading-relaxed" style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)', color: '#0e1e3a' }}>
                  <span className="font-bold" style={{ color: '#14b8a6' }}>👂 Listen for:</span> {pb.listenFor}
                </div>
                <div className="p-3 rounded-lg text-[12px] leading-relaxed" style={{ background: 'rgba(251,146,60,.08)', border: '1px solid rgba(251,146,60,.25)', color: '#0e1e3a' }}>
                  <span className="font-bold" style={{ color: '#ec4899' }}>🔥 Cross-sell:</span> {pb.crossSell}
                </div>
                <div className="text-[11px] italic pt-1" style={{ color: '#64748b' }}>
                  Why this lead: {askLead.why_housing}
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LeadFeed;

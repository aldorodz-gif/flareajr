import { useState } from 'react';
import Eyebrow from './Eyebrow';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getDiscoveryPlaybook } from './discoveryQuestions';
import AddToPipelineSheet from './AddToPipelineSheet';
import { exportRowsToXlsx } from './exportXlsx';
import { toast } from '@/hooks/use-toast';

export interface ScanLead {
  company_name: string;
  vertical: string;
  signal_type: string;
  signal_detail: string;
  why_housing: string;
  recommended_titles: string[];
  source_url?: string;
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

const LeadFeed = ({ leads, city, state, loading }: LeadFeedProps) => {
  const [pipelineIds, setPipelineIds] = useState<Set<string>>(new Set());
  const [askLead, setAskLead] = useState<ScanLead | null>(null);
  const [pipeLead, setPipeLead] = useState<ScanLead | null>(null);
  const [burstId, setBurstId] = useState<string | null>(null);

  const openPipeline = (lead: ScanLead) => {
    setBurstId(lead.company_name);
    window.setTimeout(() => setBurstId(curr => (curr === lead.company_name ? null : curr)), 750);
    window.setTimeout(() => setPipeLead(lead), 220);
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
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,146,60,.12)', color: '#ec4899' }}>
            {leads.length} found
          </span>
          <button
            onClick={() => {
              if (!leads.length) { toast({ title: 'Nothing to export', description: 'Run a scan first.' }); return; }
              const rows = leads.map(l => ({
                Company: l.company_name,
                Vertical: l.vertical,
                Signal: l.signal_type,
                'Signal Detail': l.signal_detail,
                'Why Housing': l.why_housing,
                'Recommended Titles': (l.recommended_titles || []).join('; '),
                City: city,
                State: state,
              }));
              const stamp = new Date().toISOString().slice(0, 10);
              const slug = `${city || 'market'}-${state || ''}`.replace(/\s+/g, '-');
              exportRowsToXlsx(rows, `flare-market-scan-${slug}-${stamp}.xlsx`, 'Market Scan');
              toast({ title: 'Exported', description: `${rows.length} leads exported to Excel` });
            }}
            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all hover:-translate-y-0.5"
            style={{ background: '#0e1e3a', color: '#fff' }}
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {loading && <div className="py-12 text-center text-[13px]" style={{ color: '#94a3b8' }}>Scanning the market…</div>}

      {!loading && leads.length === 0 && (
        <div className="py-12 text-center text-[13px]" style={{ color: '#94a3b8' }}>
          Pick a state, city, and vertical, then hit <span className="font-bold" style={{ color: '#ec4899' }}>Refresh Scan</span> to surface fresh leads.
        </div>
      )}

      <div className="grid gap-3">
        {leads.map((lead, index) => {
          const color = SIGNAL_COLORS[lead.signal_type] ?? SIGNAL_COLORS.Default;
          const inPipeline = pipelineIds.has(lead.company_name);
          const recommendedTitles = Array.isArray(lead.recommended_titles) ? lead.recommended_titles : [];
          return (
            <div
              key={`${lead.company_name}-${index}`}
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
                  <div className="flex flex-wrap items-center gap-1.5">
                    {recommendedTitles.slice(0, 5).map((t) => (
                      <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: '#FAF7F2', color: '#475569', border: '1px solid rgba(14,30,58,.08)' }}>
                        {t}
                      </span>
                    ))}
                    {lead.source_url && (
                      <a
                        href={lead.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-flex items-center gap-1 transition-all hover:-translate-y-0.5"
                        style={{ background: 'rgba(20,184,166,.12)', color: '#14b8a6', border: '1px solid rgba(20,184,166,.35)' }}
                      >
                        🔗 Source
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <button
                      onClick={() => openPipeline(lead)}
                      disabled={inPipeline}
                      className="relative w-full text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-default overflow-visible"
                      style={{ background: inPipeline ? 'rgba(16,185,129,.15)' : '#0e1e3a', color: inPipeline ? '#14b8a6' : '#fff' }}
                    >
                      {inPipeline ? '✓ In pipeline' : '+ Pipeline'}
                      {burstId === lead.company_name && <span className="flare-pulse-ring" aria-hidden />}
                    </button>
                    {burstId === lead.company_name && (
                      <div className="absolute inset-0 pointer-events-none" aria-hidden>
                        {['✨','⚡','🎯','💥','✨','⭐'].map((emoji, i) => {
                          const angle = (i / 6) * Math.PI * 2;
                          const dist = 38 + (i % 2) * 14;
                          return (
                            <span
                              key={i}
                              className="flare-sparkle"
                              style={{
                                left: '50%',
                                top: '50%',
                                ['--fx' as string]: `${Math.cos(angle) * dist}px`,
                                ['--fy' as string]: `${Math.sin(angle) * dist}px`,
                                animationDelay: `${i * 25}ms`,
                              }}
                            >
                              {emoji}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
      <AddToPipelineSheet
        lead={pipeLead ? { ...pipeLead, city: `${city}, ${state}` } : null}
        onClose={() => setPipeLead(null)}
        onSaved={(l) => setPipelineIds(prev => new Set(prev).add(l.company_name))}
      />

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

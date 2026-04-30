import { useState } from 'react';
import Eyebrow from './Eyebrow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { getDiscoveryPlaybook } from './discoveryQuestions';

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
  Expansion: '#fb923c',
  'Contract Win': '#10B981',
  'Hiring Surge': '#8B8FE8',
  'Project Award': '#fbbf24',
  Merger: '#D97FAA',
  Default: '#9B78C8',
};

const LeadFeed = ({ leads, city, state, loading }: LeadFeedProps) => {
  const [pipelineIds, setPipelineIds] = useState<Set<string>>(new Set());
  const [askLead, setAskLead] = useState<ScanLead | null>(null);
  const addToPipeline = async (lead: ScanLead) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Sign in required', description: 'Sign in to save leads to your pipeline.', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('pipeline_items').insert({
      user_id: user.id,
      company_name: lead.company_name,
      contact_title: lead.recommended_titles[0] ?? null,
      stage: 'working',
      notes: `${lead.signal_type}: ${lead.signal_detail}\n\nWhy housing: ${lead.why_housing}`,
    });

    if (error) {
      toast({ title: 'Could not add', description: error.message, variant: 'destructive' });
      return;
    }

    setPipelineIds((prev) => new Set(prev).add(lead.company_name));
    toast({ title: 'Added to pipeline', description: lead.company_name });
  };

  return (
    <div className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Eyebrow gradient="linear-gradient(90deg, #10B981, #fbbf24)">Live Scan</Eyebrow>
          <h3 className="text-[16px] font-extrabold tracking-tight" style={{ color: '#0e1e3a' }}>
            Leads {city && state ? `in ${city}, ${state}` : ''}
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,146,60,.12)', color: '#fb923c' }}>
          {leads.length} found
        </span>
      </div>

      {loading && (
        <div className="py-12 text-center text-[13px]" style={{ color: '#94a3b8' }}>
          Scanning the market…
        </div>
      )}

      {!loading && leads.length === 0 && (
        <div className="py-12 text-center text-[13px]" style={{ color: '#94a3b8' }}>
          Pick a state, city, and vertical, then hit <span className="font-bold" style={{ color: '#fb923c' }}>Refresh Scan</span> to surface fresh leads.
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
                    <span className="font-bold not-italic" style={{ color: '#10B981' }}>Why housing:</span> {lead.why_housing}
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
                    onClick={() => addToPipeline(lead)}
                    disabled={inPipeline}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-default"
                    style={{
                      background: inPipeline ? 'rgba(16,185,129,.15)' : '#0e1e3a',
                      color: inPipeline ? '#10B981' : '#fff',
                    }}
                  >
                    {inPipeline ? '✓ In pipeline' : '+ Pipeline'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadFeed;

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type FeedbackReason =
  | 'Wrong territory'
  | 'No housing need'
  | 'Company too big'
  | 'Stale signal'
  | 'Already known/working it';

const REASONS: FeedbackReason[] = [
  'Wrong territory',
  'No housing need',
  'Company too big',
  'Stale signal',
  'Already known/working it',
];

interface Props {
  bdrId: string | null;
  companyName: string;
  opportunityId?: string | null;
  /** Optional callback after thumbs-up logged (e.g. visual hint). */
  onRated?: (rating: 'up' | 'down') => void;
  size?: number;
}

export async function logLeadFeedback(args: {
  bdrId: string;
  companyName: string;
  opportunityId?: string | null;
  rating: 'up' | 'down';
  reason?: string | null;
}) {
  try {
    await supabase.from('lead_feedback').insert({
      bdr_id: args.bdrId,
      company_name: args.companyName,
      opportunity_id: args.opportunityId ?? null,
      rating: args.rating,
      reason: args.reason ?? null,
    });
  } catch {
    // silent — feedback is fire-and-forget
  }
}

export default function LeadFeedbackButtons({ bdrId, companyName, opportunityId, onRated, size = 14 }: Props) {
  const [rated, setRated] = useState<'up' | 'down' | null>(null);
  const [pickingReason, setPickingReason] = useState(false);

  const submit = async (rating: 'up' | 'down', reason?: FeedbackReason) => {
    if (!bdrId) { toast.error('Select a BDR first'); return; }
    setRated(rating);
    setPickingReason(false);
    await logLeadFeedback({ bdrId, companyName, opportunityId, rating, reason });
    onRated?.(rating);
    toast.success(rating === 'up' ? '👍 Logged — more like this' : `👎 Logged${reason ? ` · ${reason}` : ''}`);
  };

  if (rated) {
    return (
      <span style={{ fontSize: 11, color: rated === 'up' ? '#059669' : '#94A3B8', fontWeight: 600 }}>
        {rated === 'up' ? '👍 Liked' : '👎 Dismissed'}
      </span>
    );
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <button
        type="button"
        onClick={() => submit('up')}
        title="Good lead — more like this"
        aria-label="Thumbs up"
        style={{
          background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 4,
          padding: 4, cursor: 'pointer', display: 'inline-flex', color: '#059669',
        }}
      >
        <ThumbsUp size={size} />
      </button>
      <button
        type="button"
        onClick={() => setPickingReason((v) => !v)}
        title="Not relevant"
        aria-label="Thumbs down"
        style={{
          background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 4,
          padding: 4, cursor: 'pointer', display: 'inline-flex', color: '#DC2626',
        }}
      >
        <ThumbsDown size={size} />
      </button>
      {pickingReason && (
        <div
          role="menu"
          style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 30,
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 6,
            boxShadow: '0 4px 12px rgba(15,23,42,.08)', padding: 6, minWidth: 200,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#94A3B8', padding: '4px 8px' }}>
            Why not?
          </div>
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => submit('down', r)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '6px 8px', fontSize: 12, color: '#0F172A', borderRadius: 4,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

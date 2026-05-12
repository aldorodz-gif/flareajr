import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBdr } from './BdrContext';

export default function DailySummaryToast() {
  const { selected } = useBdr();
  const lastShownIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    // Avoid double-firing for the same id (e.g., StrictMode remount)
    if (lastShownIdRef.current === selected.id) return;
    lastShownIdRef.current = selected.id;

    (async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('opportunities')
        .select('company, priority, discovery_score')
        .eq('assigned_bdr', selected.id)
        .gte('created_at', since)
        .order('discovery_score', { ascending: false });

      if (error || !data) return;
      const total = data.length;
      const highPriority = data.filter(d => d.priority === 'Top Priority');
      const top = highPriority.slice(0, 3).map(d => d.company);

      const description =
        total === 0
          ? `No new opportunities for ${selected.name} in the last 24 hours.`
          : highPriority.length > 0
            ? `${highPriority.length} high-priority${top.length ? `: ${top.join(', ')}` : ''}.`
            : `No high-priority hits — review the new list in Opportunities.`;

      const title =
        total === 0
          ? `${selected.name} — morning briefing`
          : `${selected.name} — ${total} new opportunities`;

      toast.custom((id) => (
        <div
          onClick={() => {
            if (total > 0) {
              window.dispatchEvent(new CustomEvent('flare:navigate-tab', { detail: 'opportunities' }));
              toast.dismiss(id);
            }
          }}
          className={`relative w-[420px] max-w-[92vw] rounded-2xl shadow-2xl ring-1 ring-white/20 p-5 ${total > 0 ? 'cursor-pointer hover:scale-[1.01]' : ''} transition-transform animate-scale-in`}
          style={{
            background: total > 0
              ? 'linear-gradient(135deg, #ec4899 0%, #a855f7 55%, #2dd4bf 110%)'
              : 'linear-gradient(135deg, #0e1e3a, #1e293b)',
            color: '#fff',
            boxShadow: '0 20px 50px -12px rgba(236,72,153,.55)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl leading-none">{total > 0 ? '🔥' : '☕'}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-extrabold tracking-tight">{title}</div>
              <div className="text-[13px] opacity-95 mt-1 leading-snug">
                {total === 0 ? description : description}
              </div>
              {total > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/25 backdrop-blur">
                  Open AI Daily Lead Feed →
                </div>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toast.dismiss(id); }}
              className="text-white/70 hover:text-white text-lg leading-none"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    })();

    // Sequenced-emails reminder
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lte('due_date', today);
      if (count && count > 0) {
        toast(`📬 ${count} sequenced email${count === 1 ? '' : 's'} to send`, {
          description: 'Open Prospects to work through today\'s touches.',
          duration: 9000,
          action: {
            label: 'Open',
            onClick: () => window.dispatchEvent(new CustomEvent('flare:navigate-tab', { detail: 'prospects' })),
          },
        });
      }
    })();
  }, [selected?.id]);

  return null;
}

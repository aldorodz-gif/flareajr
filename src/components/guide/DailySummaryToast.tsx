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

      toast(title, {
        description: total === 0 ? description : `${description} Click to open the AI Daily Lead Feed →`,
        duration: 8000,
        className: total > 0 ? 'cursor-pointer' : undefined,
        onDismiss: () => {},
        action: total > 0 ? {
          label: 'Open',
          onClick: () => window.dispatchEvent(new CustomEvent('flare:navigate-tab', { detail: 'opportunities' })),
        } : undefined,
      });
    })();
  }, [selected?.id]);

  return null;
}

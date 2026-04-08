import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw, ChevronRight, Building } from 'lucide-react';

const STAGES = ['working', 'contacted', 'meeting_set', 'opportunity'] as const;
const STAGE_LABELS: Record<string, string> = {
  working: 'Working',
  contacted: 'Contacted',
  meeting_set: 'Meeting Set',
  opportunity: 'Opportunity',
};
const STAGE_COLORS: Record<string, string> = {
  working: 'bg-muted/50',
  contacted: 'bg-blue-50 dark:bg-blue-950/20',
  meeting_set: 'bg-amber-50 dark:bg-amber-950/20',
  opportunity: 'bg-green-50 dark:bg-green-950/20',
};

interface PipelineItem {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_title: string | null;
  stage: string;
  notes: string | null;
}

const Pipeline = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('pipeline_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems((data as PipelineItem[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const moveStage = async (item: PipelineItem, newStage: string) => {
    await supabase.from('pipeline_items').update({ stage: newStage }).eq('id', item.id);
    if (newStage === 'meeting_set' && user) {
      await supabase.from('activity_log').insert({
        user_id: user.id,
        action_type: 'meeting_booked',
        company_name: item.company_name,
        contact_name: item.contact_name,
      });
    }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, stage: newStage } : i));
    toast.success(`Moved to ${STAGE_LABELS[newStage]}`);
  };

  const nextStage = (current: string) => {
    const idx = STAGES.indexOf(current as any);
    return idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
  };

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {STAGES.map(stage => {
        const stageItems = items.filter(i => i.stage === stage);
        const next = nextStage(stage);
        return (
          <div key={stage} className="animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {STAGE_LABELS[stage]}
              </h3>
              <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full">{stageItems.length}</span>
            </div>
            {stageItems.length === 0 ? (
              <div className={`rounded-xl p-4 text-center text-sm text-muted-foreground ${STAGE_COLORS[stage]}`}>
                No items in {STAGE_LABELS[stage].toLowerCase()}
              </div>
            ) : (
              <div className="space-y-2">
                {stageItems.map(item => (
                  <div key={item.id} className={`rounded-xl border p-4 ${STAGE_COLORS[stage]} hover:shadow-sm transition-shadow`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-primary" />
                          {item.company_name}
                        </p>
                        {item.contact_name && (
                          <p className="text-sm text-muted-foreground">{item.contact_name}{item.contact_title ? ` · ${item.contact_title}` : ''}</p>
                        )}
                      </div>
                      {next && (
                        <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1 text-xs shrink-0" onClick={() => moveStage(item, next)}>
                          {STAGE_LABELS[next]} <ChevronRight className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Pipeline;

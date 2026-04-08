import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search, Plus, Mail, Phone, RefreshCw, Sparkles, TrendingUp, Building, MapPin, Briefcase } from 'lucide-react';

interface Prospect {
  id: string;
  company_name: string;
  city: string | null;
  industry: string | null;
  signal_type: string | null;
  signal_detail: string | null;
  use_case: string | null;
  recommended_titles: string[] | null;
  contact_name: string | null;
  contact_title: string | null;
  score: number;
  status: string;
}

const Opportunities = () => {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [promptFocus, setPromptFocus] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');

  const fetchProspects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('prospects')
      .select('*')
      .eq('user_id', user.id)
      .eq('generated_date', today)
      .eq('status', 'new')
      .order('score', { ascending: false });
    setProspects((data as Prospect[]) || []);
    setLoading(false);
  }, [user]);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('user_settings').select('prompt_focus').eq('user_id', user.id).maybeSingle();
    if (data?.prompt_focus) setPromptFocus(data.prompt_focus);
  }, [user]);

  useEffect(() => { fetchProspects(); loadSettings(); }, [fetchProspects, loadSettings]);

  const generateOpportunities = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      // Save prompt focus
      await supabase.from('user_settings').upsert({ user_id: user.id, prompt_focus: promptFocus }, { onConflict: 'user_id' });
      
      const { data, error } = await supabase.functions.invoke('generate-prospects', {
        body: { focus: promptFocus || 'corporate housing opportunities' },
      });
      if (error) throw error;
      
      const opportunities = data?.opportunities || [];
      if (opportunities.length > 0) {
        const rows = opportunities.map((o: any) => ({
          user_id: user.id,
          company_name: o.company_name,
          city: o.city,
          industry: o.industry,
          signal_type: o.signal_type,
          signal_detail: o.signal_detail,
          use_case: o.use_case,
          recommended_titles: o.recommended_titles,
          contact_name: o.contact_name || null,
          contact_title: o.contact_title || null,
          score: o.score || 80,
          generated_date: new Date().toISOString().split('T')[0],
        }));
        await supabase.from('prospects').insert(rows);
        await fetchProspects();
        toast.success(`Found ${opportunities.length} new opportunities`);
      } else {
        toast.info('No new opportunities found. Try adjusting your focus.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate opportunities');
    } finally {
      setGenerating(false);
    }
  };

  const addToToday = async (prospect: Prospect) => {
    if (!user) return;
    await supabase.from('tasks').insert({
      user_id: user.id,
      prospect_id: prospect.id,
      task_type: 'outreach',
      company_name: prospect.company_name,
      contact_name: prospect.contact_name,
      contact_title: prospect.contact_title,
      reason: prospect.signal_detail,
      signal: prospect.signal_type,
    });
    await supabase.from('prospects').update({ status: 'added' }).eq('id', prospect.id);
    setProspects(prev => prev.filter(p => p.id !== prospect.id));
    toast.success(`Added ${prospect.company_name} to Today`);
  };

  const logAction = async (prospect: Prospect, action: string) => {
    if (!user) return;
    await supabase.from('activity_log').insert({
      user_id: user.id,
      prospect_id: prospect.id,
      action_type: action,
      company_name: prospect.company_name,
      contact_name: prospect.contact_name,
    });
    toast.success(`Logged: ${action.replace(/_/g, ' ')}`);
  };

  const filtered = prospects.filter(p => {
    if (filterCity && !p.city?.toLowerCase().includes(filterCity.toLowerCase())) return false;
    if (filterIndustry && !p.industry?.toLowerCase().includes(filterIndustry.toLowerCase())) return false;
    return true;
  });

  const signalCounts: Record<string, number> = {};
  prospects.forEach(p => { if (p.signal_type) signalCounts[p.signal_type] = (signalCounts[p.signal_type] || 0) + 1; });

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <div className="bg-card rounded-xl border p-5 animate-slide-up">
        <label className="text-sm font-semibold text-foreground mb-2 block">What should we look for?</label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. construction companies, healthcare expansions, government contractors..."
            value={promptFocus}
            onChange={e => setPromptFocus(e.target.value)}
            className="rounded-xl h-11"
          />
          <Button onClick={generateOpportunities} disabled={generating} className="rounded-xl h-11 px-5 shrink-0">
            {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Finding...' : 'Find'}
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      {prospects.length > 0 && (
        <div className="bg-card rounded-xl border p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" /> Today's Intelligence
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-primary/5 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-primary">{prospects.length}</p>
              <p className="text-xs text-muted-foreground">Opportunities</p>
            </div>
            {Object.entries(signalCounts).slice(0, 3).map(([signal, count]) => (
              <div key={signal} className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground truncate">{signal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[140px]">
          <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Filter city" value={filterCity} onChange={e => setFilterCity(e.target.value)} className="pl-9 h-9 rounded-xl text-sm" />
        </div>
        <div className="relative flex-1 min-w-[140px]">
          <Briefcase className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Filter industry" value={filterIndustry} onChange={e => setFilterIndustry(e.target.value)} className="pl-9 h-9 rounded-xl text-sm" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center animate-fade-in">
          <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-semibold text-foreground">No opportunities yet</p>
          <p className="text-sm text-muted-foreground mt-1">Enter what you're looking for and click Find</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="bg-card rounded-xl border p-4 hover:shadow-md transition-shadow animate-slide-up"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Building className="w-4 h-4 text-primary shrink-0" />
                    <p className="font-semibold text-foreground">{p.company_name}</p>
                    {p.city && <span className="text-xs text-muted-foreground">· {p.city}</span>}
                    {p.industry && <span className="text-xs bg-muted/40 px-2 py-0.5 rounded-full">{p.industry}</span>}
                  </div>
                  {p.signal_detail && (
                    <p className="text-sm text-foreground/80 mt-1.5">{p.signal_detail}</p>
                  )}
                  {p.use_case && (
                    <p className="text-sm text-muted-foreground mt-1">💡 {p.use_case}</p>
                  )}
                  {p.recommended_titles && p.recommended_titles.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {p.recommended_titles.map(t => (
                        <span key={t} className="text-[11px] bg-primary/8 text-primary px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  )}
                  {p.signal_type && (
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {p.signal_type}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" className="h-8 rounded-lg gap-1 text-xs" onClick={() => addToToday(p)}>
                    <Plus className="w-3 h-3" /> Today
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" onClick={() => logAction(p, 'email_sent')} title="Email">
                    <Mail className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" onClick={() => logAction(p, 'call_made')} title="Call">
                    <Phone className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Opportunities;

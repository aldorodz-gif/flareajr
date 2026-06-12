import { useState, useEffect } from 'react';
import { useBdr } from './BdrContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthProvider';

export default function BdrSelector() {
  const { isAdmin, signOut } = useAuth();

  const { bdrs, selected, setSelectedId, loading, refresh } = useBdr();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft((selected?.markets || []).join(', '));
    setEditing(false);
  }, [selected?.id]);

  if (loading) {
    return <div className="py-2 text-xs text-muted-foreground">Loading BDRs…</div>;
  }

  const save = async () => {
    if (!selected) return;
    const markets = draft
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    setSaving(true);
    const { error } = await supabase
      .from('bdr_profiles')
      .update({ markets })
      .eq('id', selected.id);
    setSaving(false);
    if (error) {
      toast.error('Could not save coverage');
      return;
    }
    toast.success(`Coverage updated for ${selected.name}`);
    await refresh();
    setEditing(false);
  };

  return (
    <div
      data-shell="bdr-bar"
      className="flex items-center gap-3 flex-wrap"
    >
      <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#DC2626' }}>
        Active BDR
      </span>
      {isAdmin ? (
        <select
          value={selected?.id || ''}
          onChange={(e) => setSelectedId(e.target.value)}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {bdrs.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      ) : (
        <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-200 text-slate-900">
          {selected?.name ?? '— no profile linked —'}
        </span>
      )}


      {selected && !editing && (
        <>
          <span className="text-xs text-slate-600">
            {selected.region} • {selected.markets.length} markets
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md ml-1"
            style={{ background: 'rgba(251,146,60,.15)', color: '#DC2626', border: '1px solid rgba(251,146,60,.3)' }}
          >
            ✎ Edit coverage
          </button>
        </>
      )}

      {selected && editing && (
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto md:flex-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="City, ST, City, ST…"
            className="flex-1 min-w-[260px] px-3 py-1.5 rounded-md text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={save}
            disabled={saving}
            className="text-[11px] font-bold px-3 py-1.5 rounded-md text-white"
            style={{ background: '#DC2626' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => { setDraft((selected.markets || []).join(', ')); setEditing(false); }}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <span className="text-[10px] text-muted-foreground basis-full">
            Comma-separated, format: <code>City, ST</code>
          </span>
        </div>
      )}

      <button
        onClick={() => signOut()}
        className="text-[11px] font-semibold px-2.5 py-1 rounded-md ml-auto text-muted-foreground hover:text-foreground"
        title="Sign out"
      >
        Sign out
      </button>
    </div>
  );
}

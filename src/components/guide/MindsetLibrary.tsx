import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBdr } from './BdrContext';
import { toast } from 'sonner';

interface Mindset {
  id: string;
  bdr_id: string | null;
  scope: 'global' | 'bdr';
  label: string;
  content: string;
  updated_at: string;
}

export default function MindsetLibrary() {
  const { selected } = useBdr();
  const [items, setItems] = useState<Mindset[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'global' | 'bdr'>('global');
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bdr_mindsets')
      .select('*')
      .order('scope', { ascending: true })
      .order('updated_at', { ascending: false });
    if (error) toast.error('Could not load mindsets');
    setItems((data || []) as Mindset[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => { setLabel(''); setContent(''); setEditingId(null); setScope('global'); };

  const save = async () => {
    if (!label.trim() || !content.trim()) {
      toast.error('Add a label and content');
      return;
    }
    if (scope === 'bdr' && !selected) {
      toast.error('Pick an Active BDR first');
      return;
    }
    setSaving(true);
    const payload = {
      label: label.trim(),
      content: content.trim(),
      scope,
      bdr_id: scope === 'bdr' ? selected!.id : null,
    };
    const { error } = editingId
      ? await supabase.from('bdr_mindsets').update(payload).eq('id', editingId)
      : await supabase.from('bdr_mindsets').insert(payload);
    setSaving(false);
    if (error) { toast.error('Save failed'); return; }
    toast.success(editingId ? 'Mindset updated' : 'Mindset added');
    reset();
    load();
  };

  const edit = (m: Mindset) => {
    setEditingId(m.id);
    setLabel(m.label);
    setContent(m.content);
    setScope(m.scope);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this mindset entry?')) return;
    const { error } = await supabase.from('bdr_mindsets').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    toast.success('Deleted');
    if (editingId === id) reset();
    load();
  };

  const globals = items.filter(i => i.scope === 'global');
  const mine = items.filter(i => i.scope === 'bdr' && selected && i.bdr_id === selected.id);

  return (
    <section>
      <div className="overflow-hidden rounded-xl shadow-lg">
        <div className="relative px-6 py-5 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #1a0d3e 50%, #0e2c2c 100%)' }}>
          <div className="absolute top-0 right-0 w-44 h-44 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(45,212,191,.6), transparent 70%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="text-[20px]">🧠</span>
              <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm"
                style={{ background: 'linear-gradient(90deg, #2dd4bf, #ec4899)', color: '#0a0a14' }}>
                Mindset Library
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                Wired into the AI daily lead scan
              </span>
            </div>
            <p className="text-[14px] font-extrabold tracking-tight text-white mb-1">
              Global mindset applies to every BDR. Add a BDR-specific overlay on top.
            </p>
            <p className="text-[12px] text-white/70">
              Anything you add here is injected into the system prompt for "Today's Leads" and "Scan a Market" — every search reflects your latest guidance.
            </p>
          </div>
        </div>

        <div className="border-x border-b rounded-b-xl bg-white p-5 space-y-5"
          style={{ borderColor: 'rgba(45,212,191,.18)' }}>

          {/* Editor */}
          <div className="rounded-lg p-4" style={{ background: '#FAF7F2', border: '1px solid rgba(14,30,58,.08)' }}>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#0d9488' }}>
                {editingId ? 'Edit mindset' : 'Add mindset'}
              </span>
              <div className="ml-auto flex gap-1.5">
                <button onClick={() => setScope('global')}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: scope === 'global' ? 'linear-gradient(135deg, #2dd4bf, #0d9488)' : '#fff',
                    color: scope === 'global' ? '#fff' : '#0e1e3a',
                    border: '1px solid rgba(45,212,191,.4)',
                  }}>
                  🌐 Global (all BDRs)
                </button>
                <button onClick={() => setScope('bdr')} disabled={!selected}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-all disabled:opacity-40"
                  style={{
                    background: scope === 'bdr' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : '#fff',
                    color: scope === 'bdr' ? '#fff' : '#0e1e3a',
                    border: '1px solid rgba(168,85,247,.4)',
                  }}>
                  🎯 {selected ? `Only for ${selected.name}` : 'Pick a BDR first'}
                </button>
              </div>
            </div>

            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Label (e.g. Defense Vertical Intelligence — WDC)"
              className="w-full px-3 py-2 mb-2 rounded-md text-sm bg-white border focus:outline-none focus:ring-2 focus:ring-teal-400"
              style={{ borderColor: 'rgba(14,30,58,.12)' }}
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste the full mindset / framework here. Region focus, verticals, target profile, signals to chase, titles, positioning, tone — the AI reads it verbatim."
              rows={10}
              className="w-full px-3 py-2 rounded-md text-sm bg-white border focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono"
              style={{ borderColor: 'rgba(14,30,58,.12)', lineHeight: 1.5 }}
            />
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button onClick={save} disabled={saving}
                className="text-[12px] font-bold px-4 py-2 rounded-md text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #2dd4bf, #ec4899)' }}>
                {saving ? 'Saving…' : editingId ? '💾 Update' : '＋ Add to library'}
              </button>
              {editingId && (
                <button onClick={reset} className="text-[12px] font-semibold px-3 py-2 rounded-md text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              )}
              <span className="text-[11px] text-muted-foreground italic ml-auto">
                Markdown / plain text. Length is fine — keep it specific.
              </span>
            </div>
          </div>

          {loading && <div className="text-[12px] text-muted-foreground">Loading library…</div>}

          {/* Global list */}
          {!loading && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#0d9488' }}>
                  🌐 Global — applied to every BDR ({globals.length})
                </span>
              </div>
              <div className="space-y-2">
                {globals.length === 0 && (
                  <div className="text-[12px] text-muted-foreground italic">No global mindset yet.</div>
                )}
                {globals.map(m => (
                  <MindsetRow key={m.id} item={m} accent="#0d9488" onEdit={() => edit(m)} onDelete={() => remove(m.id)} />
                ))}
              </div>
            </div>
          )}

          {/* BDR-specific list */}
          {!loading && selected && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#a855f7' }}>
                  🎯 Only for {selected.name} ({mine.length})
                </span>
                <span className="text-[10px] text-muted-foreground italic">
                  Layered on top of global mindset
                </span>
              </div>
              <div className="space-y-2">
                {mine.length === 0 && (
                  <div className="text-[12px] text-muted-foreground italic">
                    No overlay for this BDR yet — switch the scope toggle above to add one.
                  </div>
                )}
                {mine.map(m => (
                  <MindsetRow key={m.id} item={m} accent="#a855f7" onEdit={() => edit(m)} onDelete={() => remove(m.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MindsetRow({
  item, accent, onEdit, onDelete,
}: { item: Mindset; accent: string; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border bg-white" style={{ borderColor: `${accent}33` }}>
      <div className="flex items-start gap-2 p-3">
        <button onClick={() => setOpen(o => !o)} className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px]" style={{ color: accent }}>{open ? '▾' : '▸'}</span>
            <strong className="text-[13px] text-foreground">{item.label}</strong>
          </div>
          <div className="text-[11px] text-muted-foreground line-clamp-1 ml-4">
            {item.content.slice(0, 140)}…
          </div>
        </button>
        <div className="flex gap-1">
          <button onClick={onEdit} className="text-[10px] font-bold px-2 py-1 rounded text-foreground hover:bg-accent/40"
            style={{ border: `1px solid ${accent}55` }}>✎</button>
          <button onClick={onDelete} className="text-[10px] font-bold px-2 py-1 rounded text-rose-600 hover:bg-rose-50"
            style={{ border: '1px solid rgba(244,63,94,.3)' }}>🗑</button>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: `${accent}22` }}>
          <pre className="text-[12px] whitespace-pre-wrap font-sans leading-[1.55] text-foreground">{item.content}</pre>
        </div>
      )}
    </div>
  );
}

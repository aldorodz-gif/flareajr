import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import AiToolCard from './AiToolCard';
import SectionNav from './SectionNav';

interface LinkedInTabProps {
  onNavigate: (tabId: string) => void;
}

import { VERTICAL_NAMES } from './verticalsData';
const VERTICALS = VERTICAL_NAMES;

interface PostItem {
  number: number;
  type: string;
  hook: string;
  body: string;
  hashtags: string[];
  best_time: string;
  intent: string;
}

const POST_TYPE_ICONS: Record<string, string> = {
  'Industry Insight': '🔍',
  'Signal Commentary': '📡',
  'Value-Add': '💡',
  'Social Proof': '⭐',
  'Soft CTA': '🤝',
};

const LinkedInTab = ({ onNavigate }: LinkedInTabProps) => {
  const [vertical, setVertical] = useState('');
  const [signal, setSignal] = useState('');
  const [goal, setGoal] = useState('');
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!vertical || !signal) return;
    setLoading(true);
    setError('');
    setPosts([]);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('linkedin-strategy', {
        body: { vertical, signal, goal: goal || undefined },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setPosts(data.posts || []);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [vertical, signal, goal]);

  const copyPost = (idx: number) => {
    const p = posts[idx];
    const text = `${p.hook}\n\n${p.body}\n\n${p.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <Eyebrow gradient="linear-gradient(90deg, #ec4899, #db2777)">Step 09 · LinkedIn Strategy</Eyebrow>
      <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">LinkedIn Post Strategy</h2>
      <p className="text-muted-foreground text-sm max-w-2xl">
        Build a 5-post LinkedIn content arc that positions you as an industry insider — not a cold caller. Each post is designed to warm up your target vertical before you ever pick up the phone.
      </p>

      {/* ── AI Tool ── */}
      <AiToolCard
        icon="💼"
        title="Strategy Builder"
        subtitle="AI-powered LinkedIn content planning"
      >
        <div className="space-y-4">
          {/* Vertical */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#ec4899' }}>Target Vertical</label>
            <div className="flex flex-wrap gap-2">
              {VERTICALS.map(v => (
                <button
                  key={v}
                  onClick={() => setVertical(v)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: vertical === v ? 'linear-gradient(135deg,#ec4899,#db2777)' : 'rgba(0,0,0,.05)',
                    color: vertical === v ? '#fff' : '#475569',
                    border: `1px solid ${vertical === v ? '#ec4899' : 'rgba(0,0,0,.12)'}`,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Signal */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#ec4899' }}>Signal You've Spotted</label>
            <input
              value={signal}
              onChange={e => setSignal(e.target.value)}
              placeholder="e.g. MLS expansion team announced in Nashville"
              className="w-full px-3 py-2 rounded-lg text-sm bg-black/5 border border-black/10 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-pink-400/50"
            />
          </div>

          {/* Goal (optional) */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#ec4899' }}>Goal <span className="text-gray-400">(optional)</span></label>
            <input
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. get inbound DMs from facility managers"
              className="w-full px-3 py-2 rounded-lg text-sm bg-black/5 border border-black/10 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-pink-400/50"
            />
          </div>

          {/* Generate */}
          <button
            onClick={handleGenerate}
            disabled={!vertical || !signal || loading}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg,#ec4899,#db2777)',
              color: '#fff',
            }}
          >
            {loading ? '✍️ Building strategy…' : '💼 Generate 5-Post Strategy'}
          </button>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
        </div>
      </AiToolCard>

      {/* ── Results ── */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Your 5-Post LinkedIn Arc</h3>
          <div className="space-y-4">
            {posts.map((post, i) => {
              const icon = Object.entries(POST_TYPE_ICONS).find(([k]) => post.type.toLowerCase().includes(k.toLowerCase()))?.[1] || '📝';
              return (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ background: '#FAF7F2', border: '1px solid rgba(251,146,60,.12)' }}
                >
                  {/* Header */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#1E293B,#1a1f3d)', borderBottom: '1px solid rgba(251,146,60,.15)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <span className="text-xs font-bold" style={{ color: '#ec4899' }}>POST {post.number}</span>
                      <span className="text-xs font-medium text-white/60">— {post.type}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,.15)', color: '#ec4899' }}>
                      🕐 {post.best_time}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3">
                    <div className="rounded-lg p-3" style={{ background: 'rgba(251,146,60,.06)' }}>
                      <span className="text-[10px] font-bold block mb-1" style={{ color: '#db2777' }}>HOOK</span>
                      <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{post.hook}</p>
                    </div>

                    <p className="text-sm whitespace-pre-wrap" style={{ color: '#334155', lineHeight: '1.6' }}>{post.body}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.map((h, hi) => (
                        <span key={hi} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,.1)', color: '#a855f7' }}>
                          {h.startsWith('#') ? h : `#${h}`}
                        </span>
                      ))}
                    </div>

                    <div className="rounded-lg p-2.5" style={{ background: 'rgba(99,102,241,.05)' }}>
                      <span className="text-[10px] font-bold block mb-0.5" style={{ color: '#a855f7' }}>STRATEGIC INTENT</span>
                      <p className="text-xs" style={{ color: '#475569' }}>{post.intent}</p>
                    </div>

                    <button
                      onClick={() => copyPost(i)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: copiedIdx === i ? 'rgba(34,197,94,.15)' : 'rgba(251,146,60,.1)',
                        color: copiedIdx === i ? '#22c55e' : '#ec4899',
                      }}
                    >
                      {copiedIdx === i ? '✓ Copied!' : '📋 Copy Post'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SectionNav currentTab="linkedin" onNavigate={onNavigate} />
    </main>
  );
};

export default LinkedInTab;

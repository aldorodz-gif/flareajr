import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import AiToolCard from './AiToolCard';
import SectionNav from './SectionNav';

interface EventsTabProps {
  onNavigate: (tabId: string) => void;
}

const CITIES = ['Denver', 'Nashville', 'Atlanta', 'Huntsville', 'Austin', 'Phoenix', 'Charlotte', 'Dallas'];
const VERTICALS = ['Construction', 'Defense / Aerospace', 'Tech', 'Healthcare', 'Energy', 'Sports', 'Theater', 'Government'];
const TIMEFRAMES = ['Next 30 days', 'Next 3 months', 'Next 6 months'];

interface EventItem {
  name: string;
  date: string;
  location: string;
  why: string;
  attendees: string;
  angle: string;
  priority: string;
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High: { bg: 'rgba(239,68,68,.15)', text: '#ef4444' },
  Medium: { bg: 'rgba(251,146,60,.15)', text: '#fb923c' },
  Low: { bg: 'rgba(148,163,184,.15)', text: '#94a3b8' },
};

const EventsTab = ({ onNavigate }: EventsTabProps) => {
  const [city, setCity] = useState('');
  const [vertical, setVertical] = useState('');
  const [timeframe, setTimeframe] = useState('Next 3 months');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!city || !vertical) return;
    setLoading(true);
    setError('');
    setEvents([]);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('event-finder', {
        body: { city, vertical, timeframe },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setEvents(data.events || []);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [city, vertical, timeframe]);

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <Eyebrow gradient="linear-gradient(90deg, #fb923c, #f97316)">Step 08 · Find Events</Eyebrow>
      <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Networking Event Finder</h2>
      <p className="text-muted-foreground text-sm max-w-2xl">
        Discover conferences, trade shows, and networking events where your target buyers gather — so you can show up where decisions are made.
      </p>

      {/* ── AI Tool ── */}
      <AiToolCard
        icon="🎪"
        title="Event Finder"
        subtitle="AI-powered event discovery for your target market"
      >
        <div className="space-y-4">
          {/* City */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#fb923c' }}>City</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: city === c ? 'linear-gradient(135deg,#fb923c,#f97316)' : 'rgba(255,255,255,.06)',
                    color: city === c ? '#fff' : 'rgba(255,255,255,.7)',
                    border: `1px solid ${city === c ? '#fb923c' : 'rgba(255,255,255,.1)'}`,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Or type a city..."
              className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-400/50"
            />
          </div>

          {/* Vertical */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#fb923c' }}>Vertical</label>
            <div className="flex flex-wrap gap-2">
              {VERTICALS.map(v => (
                <button
                  key={v}
                  onClick={() => setVertical(v)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: vertical === v ? 'linear-gradient(135deg,#fb923c,#f97316)' : 'rgba(255,255,255,.06)',
                    color: vertical === v ? '#fff' : 'rgba(255,255,255,.7)',
                    border: `1px solid ${vertical === v ? '#fb923c' : 'rgba(255,255,255,.1)'}`,
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#fb923c' }}>Timeframe</label>
            <div className="flex gap-2">
              {TIMEFRAMES.map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: timeframe === t ? 'linear-gradient(135deg,#fb923c,#f97316)' : 'rgba(255,255,255,.06)',
                    color: timeframe === t ? '#fff' : 'rgba(255,255,255,.7)',
                    border: `1px solid ${timeframe === t ? '#fb923c' : 'rgba(255,255,255,.1)'}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={handleSearch}
            disabled={!city || !vertical || loading}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg,#fb923c,#f97316)',
              color: '#fff',
            }}
          >
            {loading ? '🔍 Searching events…' : '🎪 Find Networking Events'}
          </button>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}
        </div>
      </AiToolCard>

      {/* ── Results ── */}
      {events.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">
            {events.length} Events Found — {vertical} in {city}
          </h3>
          <div className="space-y-3">
            {events.map((ev, i) => {
              const pc = PRIORITY_COLORS[ev.priority] || PRIORITY_COLORS.Medium;
              return (
                <div
                  key={i}
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: '#FAF7F2', border: '1px solid rgba(251,146,60,.12)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-sm" style={{ color: '#1E293B' }}>{ev.name}</h4>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: pc.bg, color: pc.text }}
                    >
                      {ev.priority}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#64748b' }}>
                    <span>📅 {ev.date}</span>
                    <span>📍 {ev.location}</span>
                  </div>
                  <p className="text-xs" style={{ color: '#475569' }}>{ev.why}</p>
                  <div className="flex flex-col md:flex-row gap-3 pt-1">
                    <div className="flex-1 rounded-lg p-2.5" style={{ background: 'rgba(251,146,60,.06)' }}>
                      <span className="text-[10px] font-bold block mb-0.5" style={{ color: '#fb923c' }}>WHO'S THERE</span>
                      <p className="text-xs" style={{ color: '#475569' }}>{ev.attendees}</p>
                    </div>
                    <div className="flex-1 rounded-lg p-2.5" style={{ background: 'rgba(99,102,241,.06)' }}>
                      <span className="text-[10px] font-bold block mb-0.5" style={{ color: '#6366f1' }}>YOUR ANGLE</span>
                      <p className="text-xs" style={{ color: '#475569' }}>{ev.angle}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SectionNav currentTab="events" onNavigate={onNavigate} />
    </main>
  );
};

export default EventsTab;

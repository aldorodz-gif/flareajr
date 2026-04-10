import { useState, useCallback, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import AiToolCard from './AiToolCard';
import SectionNav from './SectionNav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { US_STATES } from './usStatesData';

interface EventsTabProps {
  onNavigate: (tabId: string) => void;
}

const VERTICALS: Record<string, string[]> = {
  'Relocation & Mobility': [
    'Corporate relocation programs',
    'Global mobility teams',
    'Talent acquisition & new hire relocation',
    'Executive relocation',
    'RMC partners & relocation management companies',
    'Mergers & acquisitions employee moves',
    'Internal transfers & rotational leadership programs',
  ],
  'Project Teams & Consultants': [
    'Management consulting firms',
    'IT implementation teams',
    'ERP & system rollout teams',
    'Training & enablement teams',
    'Audit & advisory teams',
    'Engineering consulting firms',
    'Staffing & professional services firms',
    'Client site deployment teams',
  ],
  'Government & Defense Contractors': [
    'Federal contractors',
    'Defense contractors',
    'Aerospace & aviation contractors',
    'Intelligence & cybersecurity firms',
    'Military support contractors',
    'Base & facility support vendors',
    'Program & project management offices',
    'Public sector consulting firms',
  ],
  'Tech': [
    'Software companies scaling teams',
    'Data center development & operations',
    'IT services & managed service providers',
    'Cybersecurity firms',
    'Hardware deployment teams',
    'Telecom & network infrastructure companies',
    'AI & engineering teams on project-based work',
    'Startup expansions & new office launches',
  ],
  'Healthcare': [
    'Travel nurses & clinicians',
    'Hospital systems & health networks',
    'Medical device companies',
    'Pharmaceutical companies',
    'Healthcare consulting firms',
    'Clinical trial teams',
    'Healthcare IT & EMR implementation teams',
    'Lab & diagnostics companies',
  ],
  'Construction & Field Services': [
    'General contractors',
    'Subcontractors & specialty trades',
    'Engineering & design-build firms',
    'Infrastructure & civil construction',
    'Utility & energy crews',
    'Renewable energy projects (solar, wind, battery storage)',
    'Oil & gas field teams',
    'Commissioning & installation crews',
    'Property restoration & disaster recovery teams',
  ],
  'Intern Programs': [
    'Corporate intern housing programs',
    'Summer associate programs (consulting, finance, legal)',
    'Engineering & tech intern cohorts',
    'Government & defense intern programs',
    'Healthcare residency & fellowship housing',
    'University-partnered corporate programs',
    'Apprenticeship & trade programs',
    'Large-scale seasonal workforce programs',
  ],
};
const TIMEFRAMES = ['Next 30 days', 'Next 3 months', 'Next 6 months'];

interface EventItem {
  name: string;
  date: string;
  location: string;
  why: string;
  attendees: string;
  angle: string;
  priority: string;
  url?: string;
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  High: { bg: 'rgba(239,68,68,.15)', text: '#ef4444' },
  Medium: { bg: 'rgba(251,146,60,.15)', text: '#fb923c' },
  Low: { bg: 'rgba(148,163,184,.15)', text: '#94a3b8' },
};

const EventsTab = ({ onNavigate }: EventsTabProps) => {
  const [selectedState, setSelectedState] = useState('');
  const [city, setCity] = useState('');
  const [vertical, setVertical] = useState('');
  const [subVertical, setSubVertical] = useState('');

  const subVerticals = useMemo(() => {
    if (!vertical) return [];
    return VERTICALS[vertical] || [];
  }, [vertical]);

  const handleVerticalChange = (value: string) => {
    setVertical(value);
    setSubVertical('');
  };
  const [timeframe, setTimeframe] = useState('Next 3 months');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const citiesForState = useMemo(() => {
    if (!selectedState) return [];
    const state = US_STATES.find(s => s.abbreviation === selectedState);
    return state?.cities || [];
  }, [selectedState]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setCity(''); // reset city when state changes
  };

  const handleSearch = useCallback(async () => {
    if (!city || !vertical) return;
    setLoading(true);
    setError('');
    setEvents([]);
    try {
      const stateName = US_STATES.find(s => s.abbreviation === selectedState)?.name || '';
      const verticalQuery = subVertical ? `${vertical} — ${subVertical}` : vertical;
      const { data, error: fnError } = await supabase.functions.invoke('event-finder', {
        body: { city: `${city}, ${stateName}`, vertical: verticalQuery, timeframe },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setEvents(data.events || []);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [city, vertical, subVertical, timeframe, selectedState]);

  const stateName = US_STATES.find(s => s.abbreviation === selectedState)?.name || '';

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <Eyebrow gradient="linear-gradient(90deg, #fb923c, #f97316)">Step 08 · Find Events</Eyebrow>
      <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">Networking Event Finder</h2>
      <p className="text-muted-foreground text-sm max-w-2xl">
        Discover conferences, trade shows, and networking events where your target buyers gather — so you can show up where decisions are made.
      </p>

      <AiToolCard
        icon="🎪"
        title="Event Finder"
        subtitle="AI-powered event discovery for your target market"
      >
        <div className="space-y-4">
          {/* State & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-accent">State</label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger className="w-full bg-background border-border text-foreground">
                  <SelectValue placeholder="Select a state…" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {US_STATES.map(s => (
                    <SelectItem key={s.abbreviation} value={s.abbreviation}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-accent">City</label>
              <Select value={city} onValueChange={setCity} disabled={!selectedState}>
                <SelectTrigger className="w-full bg-background border-border text-foreground">
                  <SelectValue placeholder={selectedState ? 'Select a city…' : 'Choose a state first'} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {citiesForState.map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vertical & Sub-Vertical */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-accent">Vertical</label>
              <Select value={vertical} onValueChange={handleVerticalChange}>
                <SelectTrigger className="w-full bg-background border-border text-foreground">
                  <SelectValue placeholder="Select an industry…" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {Object.keys(VERTICALS).map(v => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-accent">Sub-Vertical</label>
              <Select value={subVertical} onValueChange={setSubVertical} disabled={!vertical}>
                <SelectTrigger className="w-full bg-background border-border text-foreground">
                  <SelectValue placeholder={vertical ? 'Select a focus area…' : 'Choose a vertical first'} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {subVerticals.map(sv => (
                    <SelectItem key={sv} value={sv}>
                      {sv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-accent">Timeframe</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full bg-background border-border text-foreground">
                <SelectValue placeholder="Select timeframe…" />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map(t => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-foreground">
              {events.length} Events Found — {subVertical || vertical} in {city}, {stateName}
            </h3>
            <button
              onClick={() => {
                const text = events.map((ev, i) =>
                  `${i + 1}. ${ev.name}\n   📅 ${ev.date}  📍 ${ev.location}\n   Priority: ${ev.priority}\n   Why: ${ev.why}\n   Who's There: ${ev.attendees}\n   Your Angle: ${ev.angle}${ev.url ? `\n   Link: ${ev.url}` : ''}`
                ).join('\n\n');
                navigator.clipboard.writeText(text);
                toast.success('All events copied to clipboard');
              }}
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              📋 Copy All
            </button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            ✅ Only events with supporting public-web evidence and a working site are shown.
          </p>
          <div className="space-y-3">
            {events.map((ev, i) => {
              const pc = PRIORITY_COLORS[ev.priority] || PRIORITY_COLORS.Medium;
              return (
                <div
                  key={i}
                  className="rounded-xl p-4 space-y-2 bg-card border border-border"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-sm text-foreground">
                      {ev.url && ev.url.trim() !== '' ? (
                        <a href={ev.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent underline underline-offset-2 transition-colors">
                          {ev.name} ↗
                        </a>
                      ) : ev.name}
                    </h4>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: pc.bg, color: pc.text }}
                    >
                      {ev.priority}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>📅 {ev.date}</span>
                    <span>📍 {ev.location}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ev.why}</p>
                  <div className="flex flex-col md:flex-row gap-3 pt-1">
                    <div className="flex-1 rounded-lg p-2.5" style={{ background: 'rgba(251,146,60,.06)' }}>
                      <span className="text-[10px] font-bold block mb-0.5" style={{ color: '#fb923c' }}>WHO'S THERE</span>
                      <p className="text-xs text-muted-foreground">{ev.attendees}</p>
                    </div>
                    <div className="flex-1 rounded-lg p-2.5" style={{ background: 'rgba(99,102,241,.06)' }}>
                      <span className="text-[10px] font-bold block mb-0.5" style={{ color: '#6366f1' }}>YOUR ANGLE</span>
                      <p className="text-xs text-muted-foreground">{ev.angle}</p>
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

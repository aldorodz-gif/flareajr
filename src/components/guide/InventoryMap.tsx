import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Eyebrow from './Eyebrow';
import { INVENTORY_PROPERTIES, CITY_CENTERS, DEFAULT_CENTER, InventoryProperty } from './inventoryData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const flareIcon = L.divIcon({
  className: 'flare-marker',
  html: '<div style="width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#f9a8d4);border:2px solid #fff;box-shadow:0 2px 6px rgba(251,146,60,.5)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const selectedIcon = L.divIcon({
  className: 'flare-marker-selected',
  html: '<div style="width:22px;height:22px;border-radius:50%;background:#0e1e3a;border:3px solid #ec4899;box-shadow:0 0 0 4px rgba(251,146,60,.25)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface InventoryMapProps {
  city: string;
  state: string;
  focusInventory?: string | null;
}

const Recenter = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom, { animate: true }); }, [center, zoom, map]);
  return null;
};

interface VerticalRank {
  vertical: string;
  why_here: string;
  recommended_titles: string[];
}
interface NearbyTarget {
  vertical: string;
  anchor: string;
  summary: string;
  target_titles: string[];
  signals: string[];
}
interface VerticalsPayload {
  angle: string;
  top_verticals: VerticalRank[];
  nearby_targets: NearbyTarget[];
}

const normalizeInventoryName = (value: string) => value.replace(/\s*\([^)]*\)\s*$/, '').trim().toLowerCase();
const safeStringArray = (value: unknown) => Array.isArray(value)
  ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  : [];

const normalizeVerticalsPayload = (value: unknown): VerticalsPayload | null => {
  if (!value || typeof value !== 'object') return null;

  const payload = value as Record<string, unknown>;
  const top_verticals = Array.isArray(payload.top_verticals)
    ? payload.top_verticals.flatMap((row) => {
        if (!row || typeof row !== 'object') return [];
        const item = row as Record<string, unknown>;
        const vertical = typeof item.vertical === 'string' ? item.vertical.trim() : '';
        if (!vertical) return [];
        return [{
          vertical,
          why_here: typeof item.why_here === 'string' ? item.why_here.trim() : 'Relevant submarket fit.',
          recommended_titles: safeStringArray(item.recommended_titles),
        }];
      })
    : [];

  const nearby_targets = Array.isArray(payload.nearby_targets)
    ? payload.nearby_targets.flatMap((row) => {
        if (!row || typeof row !== 'object') return [];
        const item = row as Record<string, unknown>;
        const anchor = typeof item.anchor === 'string' ? item.anchor.trim() : '';
        if (!anchor) return [];
        return [{
          vertical: typeof item.vertical === 'string' ? item.vertical.trim() || 'Unknown vertical' : 'Unknown vertical',
          anchor,
          summary: typeof item.summary === 'string' ? item.summary.trim() : 'Nearby prospecting angle.',
          target_titles: safeStringArray(item.target_titles),
          signals: safeStringArray(item.signals),
        }];
      })
    : [];

  return {
    angle: typeof payload.angle === 'string' ? payload.angle.trim() : 'Submarket intelligence unavailable.',
    top_verticals,
    nearby_targets,
  };
};

const InventoryMap = ({ city, state, focusInventory = null }: InventoryMapProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<string>('all'); // city sub-chip
  const [verticals, setVerticals] = useState<VerticalsPayload | null>(null);
  const [vLoading, setVLoading] = useState(false);

  // Properties scoped by selected state (and city if provided)
  const stateProps = useMemo(() => {
    if (!state) return INVENTORY_PROPERTIES;
    return INVENTORY_PROPERTIES.filter((p) => p.state === state);
  }, [state]);

  const cityChips = useMemo(() => {
    const set = new Set(stateProps.map((p) => p.city));
    return Array.from(set).sort();
  }, [stateProps]);

  const visible = useMemo(() => {
    if (subFilter !== 'all') return stateProps.filter((p) => p.city === subFilter);
    if (city) return stateProps.filter((p) => p.city === city);
    return stateProps;
  }, [stateProps, city, subFilter]);

  const center: [number, number] = useMemo(() => {
    if (visible.length > 0) {
      const lat = visible.reduce((s, p) => s + p.lat, 0) / visible.length;
      const lng = visible.reduce((s, p) => s + p.lng, 0) / visible.length;
      return [lat, lng];
    }
    return CITY_CENTERS[`${city},${state}`] ?? DEFAULT_CENTER;
  }, [visible, city, state]);

  const zoom = visible.length === 1 ? 14 : visible.length < 8 ? 11 : visible.length < 30 ? 10 : 7;

  // Reset sub-filter when state changes
  useEffect(() => { setSubFilter('all'); setSelectedId(null); setVerticals(null); }, [state, city]);

  useEffect(() => {
    if (!focusInventory || visible.length === 0) return;
    const target = normalizeInventoryName(focusInventory);
    const match = visible.find((p) => normalizeInventoryName(p.name) === target);
    if (match && match.id !== selectedId) {
      void loadVerticals(match);
    }
  }, [focusInventory, visible, selectedId]);

  const selected = visible.find((p) => p.id === selectedId) ?? null;

  const loadVerticals = async (prop: InventoryProperty) => {
    setSelectedId(prop.id);
    setVerticals(null);
    setVLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('property-verticals', {
        body: { property: prop },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setVerticals(normalizeVerticalsPayload(data));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load verticals';
      toast({ title: 'Could not load verticals', description: msg, variant: 'destructive' });
    } finally {
      setVLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.08)' }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <Eyebrow gradient="linear-gradient(90deg, #D97FAA, #ec4899)">Core Inventory</Eyebrow>
          <h3 className="text-[16px] font-extrabold tracking-tight" style={{ color: '#0e1e3a' }}>
            Properties {state ? `· ${state}` : '— US-wide'}{city ? ` · ${city}` : ''}
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(217,127,170,.15)', color: '#D97FAA' }}>
          {visible.length} {visible.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      {/* City sub-chips (when a state is picked) */}
      {state && cityChips.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setSubFilter('all')}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full transition"
            style={{
              background: subFilter === 'all' ? '#0e1e3a' : 'rgba(14,30,58,.06)',
              color: subFilter === 'all' ? '#fff' : '#0e1e3a',
            }}
          >
            All
          </button>
          {cityChips.map((c) => (
            <button
              key={c}
              onClick={() => setSubFilter(c)}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full transition"
              style={{
                background: subFilter === c ? '#0e1e3a' : 'rgba(14,30,58,.06)',
                color: subFilter === c ? '#fff' : '#0e1e3a',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* Property list */}
        <div className="rounded-lg overflow-y-auto" style={{ maxHeight: 380, border: '1px solid rgba(14,30,58,.08)', background: '#FAF7F2' }}>
          {visible.length === 0 ? (
            <p className="p-4 text-[12px] italic" style={{ color: '#94a3b8' }}>
              No Core Inventory in this market yet.
            </p>
          ) : (
            visible.map((p) => (
              <button
                key={p.id}
                onClick={() => loadVerticals(p)}
                className="w-full text-left px-3 py-2.5 transition border-b last:border-b-0"
                style={{
                  background: selectedId === p.id ? 'rgba(251,146,60,.12)' : 'transparent',
                  borderColor: 'rgba(14,30,58,.06)',
                }}
              >
                <div className="text-[12px] font-extrabold leading-tight" style={{ color: '#0e1e3a' }}>{p.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
                  {p.city}, {p.state} {p.zip}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Map */}
        <div className="rounded-lg overflow-hidden" style={{ height: 380, border: '1px solid rgba(14,30,58,.08)' }}>
          <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Recenter center={center} zoom={zoom} />
            {visible.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={selectedId === p.id ? selectedIcon : flareIcon}
                eventHandlers={{ click: () => loadVerticals(p) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'inherit', minWidth: 180 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0e1e3a' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{p.address}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{p.city}, {p.state} {p.zip}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Verticals panel for selected property */}
      {selected && (
        <div className="mt-5 p-4 rounded-lg" style={{ background: '#FAF7F2', border: '1px solid rgba(14,30,58,.08)' }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <Eyebrow gradient="linear-gradient(90deg, #ec4899, #f9a8d4)">Local Verticals — Who to Prospect Nearby</Eyebrow>
              <div className="mt-1 text-[14px] font-extrabold" style={{ color: '#0e1e3a' }}>{selected.name}</div>
              <div className="text-[11px]" style={{ color: '#64748b' }}>{selected.address} · {selected.city}, {selected.state} {selected.zip}</div>
            </div>
          </div>

          {vLoading && <p className="text-[12px] italic" style={{ color: '#64748b' }}>⟳ Pulling local verticals & nearby targets…</p>}

          {!vLoading && verticals && (
            <>
              <div className="mb-4 p-3 rounded" style={{ background: 'rgba(251,146,60,.08)', borderLeft: '3px solid #ec4899' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#ec4899' }}>Angle</div>
                <p className="text-[12px] leading-snug" style={{ color: '#0e1e3a' }}>{verticals.angle}</p>
              </div>

              <div className="mb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9B78C8' }}>Top Verticals For This Property</div>
                <ol className="space-y-1.5">
                  {verticals.top_verticals.map((v, i) => (
                    <li key={v.vertical} className="text-[12px]" style={{ color: '#0e1e3a' }}>
                      <span className="font-bold">{i + 1}. {v.vertical}</span>
                      <span style={{ color: '#64748b' }}> — {v.why_here}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-2.5">
                {verticals.nearby_targets.map((t, i) => (
                  <div key={i} className="p-3 rounded" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.08)' }}>
                    <div className="flex items-start justify-between flex-wrap gap-1.5 mb-1.5">
                      <div className="text-[13px] font-extrabold" style={{ color: '#0e1e3a' }}>{t.anchor}</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(155,120,200,.15)', color: '#9B78C8' }}>{t.vertical}</span>
                    </div>
                    <p className="text-[12px] mb-2" style={{ color: '#475569' }}>{t.summary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-bold" style={{ color: '#ec4899' }}>Target: </span>
                        <span style={{ color: '#0e1e3a' }}>{t.target_titles.join(', ') || 'Recommended contacts vary by account'}</span>
                      </div>
                      <div>
                        <span className="font-bold" style={{ color: '#ec4899' }}>Signals: </span>
                        <span style={{ color: '#0e1e3a', fontStyle: 'italic' }}>{t.signals.join(', ') || 'Current local demand signals'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryMap;

import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Eyebrow from './Eyebrow';
import { INVENTORY_PROPERTIES, CITY_CENTERS, DEFAULT_CENTER } from './inventoryData';

// Fix leaflet default icon paths in bundlers
const flareIcon = L.divIcon({
  className: 'flare-marker',
  html: '<div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#fb923c,#fbbf24);border:2px solid #fff;box-shadow:0 2px 8px rgba(251,146,60,.6)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface InventoryMapProps {
  city: string;
  state: string;
}

const Recenter = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

const InventoryMap = ({ city, state }: InventoryMapProps) => {
  const key = `${city},${state}`;
  const center = CITY_CENTERS[key] ?? DEFAULT_CENTER;
  const zoom = CITY_CENTERS[key] ? 11 : 4;

  const properties = useMemo(() => {
    if (!city) return INVENTORY_PROPERTIES;
    // Show properties within ~50mi of selected city center
    const [clat, clng] = center;
    return INVENTORY_PROPERTIES.filter((p) => {
      const dLat = (p.lat - clat) * 69;
      const dLng = (p.lng - clng) * 55;
      return Math.sqrt(dLat * dLat + dLng * dLng) < 60;
    });
  }, [city, center]);

  return (
    <div className="p-5 rounded-xl" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Eyebrow gradient="linear-gradient(90deg, #D97FAA, #fb923c)">Core Inventory</Eyebrow>
          <h3 className="text-[16px] font-extrabold tracking-tight" style={{ color: '#0e1e3a' }}>
            Properties {city && state ? `near ${city}, ${state}` : '— US-wide'}
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(217,127,170,.15)', color: '#D97FAA' }}>
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </span>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ height: 380, border: '1px solid rgba(14,30,58,.08)' }}>
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter center={center} zoom={zoom} />
          {properties.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={flareIcon}>
              <Popup>
                <div style={{ fontFamily: 'inherit' }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0e1e3a' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{p.city}, {p.state}</div>
                  <div style={{ fontSize: 11, marginTop: 4, color: '#fb923c', fontWeight: 700 }}>
                    {p.units} units · {p.type}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {properties.length === 0 && (
        <p className="mt-3 text-[12px] italic" style={{ color: '#94a3b8' }}>
          No Core Inventory in this market yet — leads here would route to partner inventory.
        </p>
      )}
    </div>
  );
};

export default InventoryMap;

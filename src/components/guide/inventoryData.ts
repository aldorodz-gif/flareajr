/**
 * Seed Core Inventory properties for the dashboard map.
 * Replace with a `inventory_properties` table when real data lands.
 */
export interface InventoryProperty {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  units: number;
  type: 'Apartment' | 'Townhome' | 'Extended Stay';
}

export const INVENTORY_PROPERTIES: InventoryProperty[] = [
  // Denver
  { id: 'den-1', name: 'LoDo Lofts', city: 'Denver', state: 'CO', lat: 39.7531, lng: -104.9989, units: 24, type: 'Apartment' },
  { id: 'den-2', name: 'Cherry Creek Residences', city: 'Denver', state: 'CO', lat: 39.7184, lng: -104.9525, units: 18, type: 'Apartment' },
  { id: 'den-3', name: 'DTC Corporate Suites', city: 'Denver', state: 'CO', lat: 39.6553, lng: -104.8997, units: 32, type: 'Extended Stay' },
  // Nashville
  { id: 'nas-1', name: 'Gulch Towers', city: 'Nashville', state: 'TN', lat: 36.1500, lng: -86.7833, units: 22, type: 'Apartment' },
  { id: 'nas-2', name: 'Music Row Suites', city: 'Nashville', state: 'TN', lat: 36.1497, lng: -86.7937, units: 14, type: 'Apartment' },
  { id: 'nas-3', name: 'Cool Springs Townhomes', city: 'Franklin', state: 'TN', lat: 35.9722, lng: -86.8222, units: 12, type: 'Townhome' },
  // Austin
  { id: 'aus-1', name: 'East Austin Lofts', city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7331, units: 28, type: 'Apartment' },
  { id: 'aus-2', name: 'Domain Corporate', city: 'Austin', state: 'TX', lat: 30.4014, lng: -97.7256, units: 36, type: 'Extended Stay' },
  // Phoenix
  { id: 'phx-1', name: 'Camelback Residences', city: 'Phoenix', state: 'AZ', lat: 33.5092, lng: -112.0466, units: 26, type: 'Apartment' },
  { id: 'phx-2', name: 'Scottsdale Suites', city: 'Scottsdale', state: 'AZ', lat: 33.4942, lng: -111.9261, units: 20, type: 'Apartment' },
  // Atlanta
  { id: 'atl-1', name: 'Midtown ATL Apartments', city: 'Atlanta', state: 'GA', lat: 33.7838, lng: -84.3830, units: 30, type: 'Apartment' },
  { id: 'atl-2', name: 'Buckhead Residences', city: 'Atlanta', state: 'GA', lat: 33.8484, lng: -84.3781, units: 22, type: 'Apartment' },
  // Dallas
  { id: 'dal-1', name: 'Uptown Dallas Lofts', city: 'Dallas', state: 'TX', lat: 32.7935, lng: -96.8016, units: 32, type: 'Apartment' },
  // Charlotte
  { id: 'clt-1', name: 'South End Suites', city: 'Charlotte', state: 'NC', lat: 35.2127, lng: -80.8568, units: 18, type: 'Apartment' },
  // DC Metro
  { id: 'dc-1', name: 'Crystal City Corporate', city: 'Arlington', state: 'VA', lat: 38.8589, lng: -77.0500, units: 40, type: 'Extended Stay' },
];

/** Approximate geo center of a city for map default centering. */
export const CITY_CENTERS: Record<string, [number, number]> = {
  'Denver,CO': [39.7392, -104.9903],
  'Nashville,TN': [36.1627, -86.7816],
  'Austin,TX': [30.2672, -97.7431],
  'Phoenix,AZ': [33.4484, -112.0740],
  'Atlanta,GA': [33.7490, -84.3880],
  'Dallas,TX': [32.7767, -96.7970],
  'Charlotte,NC': [35.2271, -80.8431],
  'Arlington,VA': [38.8816, -77.0910],
  'New York City,NY': [40.7128, -74.0060],
  'Chicago,IL': [41.8781, -87.6298],
  'Los Angeles,CA': [34.0522, -118.2437],
  'San Francisco,CA': [37.7749, -122.4194],
  'Seattle,WA': [47.6062, -122.3321],
  'Boston,MA': [42.3601, -71.0589],
  'Miami,FL': [25.7617, -80.1918],
  'Houston,TX': [29.7604, -95.3698],
};

export const DEFAULT_CENTER: [number, number] = [39.5, -98.35]; // US center

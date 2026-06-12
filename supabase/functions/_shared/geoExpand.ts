// Geo expansion for market scans. Given a "City, ST" we expand to a list of
// related geos (city, suburbs, county, metro, state) so Tavily queries cover
// more than just exact-string city mentions.

export type GeoScope = "city" | "suburb" | "county" | "metro" | "state";

export interface GeoEntry {
  label: string;       // human-readable label included in queries (e.g. "Marietta, GA")
  scope: GeoScope;
}

interface MetroDef {
  metro: string;       // e.g. "Atlanta metro"
  county: string;      // e.g. "Fulton County, GA"
  suburbs: string[];   // e.g. ["Marietta, GA", "Alpharetta, GA", ...]
}

// Common US metros relevant to corporate-housing demand. Keys are lowercased
// "city, st". Add more as needed — unknown cities fall back to city+state only.
const METRO_TABLE: Record<string, MetroDef> = {
  "atlanta, ga": {
    metro: "Atlanta metro area",
    county: "Fulton County, GA",
    suburbs: ["Marietta, GA", "Alpharetta, GA", "Duluth, GA", "Smyrna, GA", "Sandy Springs, GA"],
  },
  "nashville, tn": {
    metro: "Nashville metro area",
    county: "Davidson County, TN",
    suburbs: ["Franklin, TN", "Murfreesboro, TN", "Hendersonville, TN", "Brentwood, TN", "Smyrna, TN"],
  },
  "dallas, tx": {
    metro: "Dallas-Fort Worth metroplex",
    county: "Dallas County, TX",
    suburbs: ["Plano, TX", "Frisco, TX", "Irving, TX", "Arlington, TX", "McKinney, TX"],
  },
  "houston, tx": {
    metro: "Houston metro area",
    county: "Harris County, TX",
    suburbs: ["The Woodlands, TX", "Katy, TX", "Sugar Land, TX", "Pearland, TX", "Spring, TX"],
  },
  "austin, tx": {
    metro: "Austin metro area",
    county: "Travis County, TX",
    suburbs: ["Round Rock, TX", "Cedar Park, TX", "Pflugerville, TX", "Georgetown, TX", "Leander, TX"],
  },
  "san antonio, tx": {
    metro: "San Antonio metro area",
    county: "Bexar County, TX",
    suburbs: ["New Braunfels, TX", "Schertz, TX", "Boerne, TX", "Universal City, TX"],
  },
  "phoenix, az": {
    metro: "Phoenix metro area",
    county: "Maricopa County, AZ",
    suburbs: ["Scottsdale, AZ", "Mesa, AZ", "Chandler, AZ", "Gilbert, AZ", "Tempe, AZ"],
  },
  "denver, co": {
    metro: "Denver metro area",
    county: "Denver County, CO",
    suburbs: ["Aurora, CO", "Lakewood, CO", "Centennial, CO", "Boulder, CO", "Westminster, CO"],
  },
  "charlotte, nc": {
    metro: "Charlotte metro area",
    county: "Mecklenburg County, NC",
    suburbs: ["Concord, NC", "Huntersville, NC", "Matthews, NC", "Gastonia, NC", "Rock Hill, SC"],
  },
  "raleigh, nc": {
    metro: "Raleigh-Durham metro area",
    county: "Wake County, NC",
    suburbs: ["Durham, NC", "Cary, NC", "Apex, NC", "Chapel Hill, NC", "Morrisville, NC"],
  },
  "tampa, fl": {
    metro: "Tampa Bay metro area",
    county: "Hillsborough County, FL",
    suburbs: ["St. Petersburg, FL", "Clearwater, FL", "Brandon, FL", "Riverview, FL", "Wesley Chapel, FL"],
  },
  "orlando, fl": {
    metro: "Orlando metro area",
    county: "Orange County, FL",
    suburbs: ["Kissimmee, FL", "Winter Park, FL", "Lake Mary, FL", "Sanford, FL", "Altamonte Springs, FL"],
  },
  "miami, fl": {
    metro: "Miami metro area",
    county: "Miami-Dade County, FL",
    suburbs: ["Fort Lauderdale, FL", "Hialeah, FL", "Coral Gables, FL", "Doral, FL", "Hollywood, FL"],
  },
  "jacksonville, fl": {
    metro: "Jacksonville metro area",
    county: "Duval County, FL",
    suburbs: ["St. Augustine, FL", "Orange Park, FL", "Ponte Vedra, FL", "Fernandina Beach, FL"],
  },
  "chicago, il": {
    metro: "Chicagoland metro area",
    county: "Cook County, IL",
    suburbs: ["Naperville, IL", "Schaumburg, IL", "Aurora, IL", "Evanston, IL", "Oak Brook, IL"],
  },
  "new york, ny": {
    metro: "New York metro area",
    county: "New York County, NY",
    suburbs: ["Jersey City, NJ", "Newark, NJ", "White Plains, NY", "Stamford, CT", "Hoboken, NJ"],
  },
  "los angeles, ca": {
    metro: "Greater Los Angeles area",
    county: "Los Angeles County, CA",
    suburbs: ["Long Beach, CA", "Pasadena, CA", "Burbank, CA", "Glendale, CA", "Santa Monica, CA"],
  },
  "san francisco, ca": {
    metro: "San Francisco Bay Area",
    county: "San Francisco County, CA",
    suburbs: ["Oakland, CA", "San Jose, CA", "Berkeley, CA", "Palo Alto, CA", "Mountain View, CA"],
  },
  "san diego, ca": {
    metro: "San Diego metro area",
    county: "San Diego County, CA",
    suburbs: ["Chula Vista, CA", "Carlsbad, CA", "Escondido, CA", "Oceanside, CA", "La Jolla, CA"],
  },
  "sacramento, ca": {
    metro: "Sacramento metro area",
    county: "Sacramento County, CA",
    suburbs: ["Roseville, CA", "Elk Grove, CA", "Folsom, CA", "Rancho Cordova, CA", "Davis, CA"],
  },
  "seattle, wa": {
    metro: "Seattle metro area",
    county: "King County, WA",
    suburbs: ["Bellevue, WA", "Redmond, WA", "Kirkland, WA", "Renton, WA", "Tacoma, WA"],
  },
  "portland, or": {
    metro: "Portland metro area",
    county: "Multnomah County, OR",
    suburbs: ["Beaverton, OR", "Hillsboro, OR", "Gresham, OR", "Tigard, OR", "Lake Oswego, OR"],
  },
  "boston, ma": {
    metro: "Greater Boston area",
    county: "Suffolk County, MA",
    suburbs: ["Cambridge, MA", "Quincy, MA", "Newton, MA", "Waltham, MA", "Somerville, MA"],
  },
  "washington, dc": {
    metro: "Washington DC metro area",
    county: "District of Columbia",
    suburbs: ["Arlington, VA", "Alexandria, VA", "Bethesda, MD", "Tysons, VA", "Reston, VA"],
  },
  "philadelphia, pa": {
    metro: "Philadelphia metro area",
    county: "Philadelphia County, PA",
    suburbs: ["King of Prussia, PA", "Cherry Hill, NJ", "Bensalem, PA", "Wilmington, DE", "Conshohocken, PA"],
  },
  "minneapolis, mn": {
    metro: "Twin Cities metro area",
    county: "Hennepin County, MN",
    suburbs: ["St. Paul, MN", "Bloomington, MN", "Eden Prairie, MN", "Plymouth, MN", "Edina, MN"],
  },
  "detroit, mi": {
    metro: "Metro Detroit",
    county: "Wayne County, MI",
    suburbs: ["Troy, MI", "Dearborn, MI", "Ann Arbor, MI", "Warren, MI", "Sterling Heights, MI"],
  },
  "salt lake city, ut": {
    metro: "Salt Lake City metro area",
    county: "Salt Lake County, UT",
    suburbs: ["West Valley City, UT", "Sandy, UT", "Provo, UT", "Lehi, UT", "Draper, UT"],
  },
  "indianapolis, in": {
    metro: "Indianapolis metro area",
    county: "Marion County, IN",
    suburbs: ["Carmel, IN", "Fishers, IN", "Noblesville, IN", "Greenwood, IN", "Plainfield, IN"],
  },
  "columbus, oh": {
    metro: "Columbus metro area",
    county: "Franklin County, OH",
    suburbs: ["Dublin, OH", "Westerville, OH", "Hilliard, OH", "Grove City, OH", "Worthington, OH"],
  },
  "cincinnati, oh": {
    metro: "Cincinnati metro area",
    county: "Hamilton County, OH",
    suburbs: ["Mason, OH", "West Chester, OH", "Florence, KY", "Covington, KY", "Blue Ash, OH"],
  },
  "cleveland, oh": {
    metro: "Cleveland metro area",
    county: "Cuyahoga County, OH",
    suburbs: ["Lakewood, OH", "Parma, OH", "Westlake, OH", "Mentor, OH", "Strongsville, OH"],
  },
  "pittsburgh, pa": {
    metro: "Pittsburgh metro area",
    county: "Allegheny County, PA",
    suburbs: ["Cranberry Township, PA", "Monroeville, PA", "Bethel Park, PA", "Robinson Township, PA"],
  },
  "kansas city, mo": {
    metro: "Kansas City metro area",
    county: "Jackson County, MO",
    suburbs: ["Overland Park, KS", "Olathe, KS", "Lee's Summit, MO", "Independence, MO", "Shawnee, KS"],
  },
  "st. louis, mo": {
    metro: "St. Louis metro area",
    county: "St. Louis County, MO",
    suburbs: ["Chesterfield, MO", "St. Charles, MO", "Clayton, MO", "Kirkwood, MO", "O'Fallon, MO"],
  },
  "las vegas, nv": {
    metro: "Las Vegas metro area",
    county: "Clark County, NV",
    suburbs: ["Henderson, NV", "North Las Vegas, NV", "Summerlin, NV", "Paradise, NV"],
  },
  "new orleans, la": {
    metro: "New Orleans metro area",
    county: "Orleans Parish, LA",
    suburbs: ["Metairie, LA", "Kenner, LA", "Slidell, LA", "Gretna, LA", "Mandeville, LA"],
  },
  "memphis, tn": {
    metro: "Memphis metro area",
    county: "Shelby County, TN",
    suburbs: ["Germantown, TN", "Collierville, TN", "Bartlett, TN", "Southaven, MS", "Olive Branch, MS"],
  },
  "louisville, ky": {
    metro: "Louisville metro area",
    county: "Jefferson County, KY",
    suburbs: ["Jeffersonville, IN", "New Albany, IN", "St. Matthews, KY", "Prospect, KY"],
  },
  "birmingham, al": {
    metro: "Birmingham metro area",
    county: "Jefferson County, AL",
    suburbs: ["Hoover, AL", "Vestavia Hills, AL", "Homewood, AL", "Mountain Brook, AL", "Trussville, AL"],
  },
  "richmond, va": {
    metro: "Richmond metro area",
    county: "Henrico County, VA",
    suburbs: ["Henrico, VA", "Glen Allen, VA", "Midlothian, VA", "Mechanicsville, VA", "Short Pump, VA"],
  },
  "hartford, ct": {
    metro: "Hartford metro area",
    county: "Hartford County, CT",
    suburbs: ["West Hartford, CT", "Manchester, CT", "Glastonbury, CT", "Farmington, CT", "Bristol, CT"],
  },
};

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

export interface ExpandedGeo {
  city: GeoEntry;
  suburbs: GeoEntry[];
  county: GeoEntry | null;
  metro: GeoEntry | null;
  state: GeoEntry;
}

export function expandGeo(city: string, stateAbbr: string): ExpandedGeo {
  const key = `${city.trim().toLowerCase()}, ${stateAbbr.trim().toLowerCase()}`;
  const def = METRO_TABLE[key];
  const stateName = STATE_NAMES[stateAbbr.trim().toUpperCase()] || stateAbbr;

  return {
    city: { label: `${city}, ${stateAbbr}`, scope: "city" },
    suburbs: (def?.suburbs ?? []).map((s) => ({ label: s, scope: "suburb" as const })),
    county: def?.county ? { label: def.county, scope: "county" } : null,
    metro: def?.metro ? { label: def.metro, scope: "metro" } : null,
    state: { label: stateName, scope: "state" },
  };
}

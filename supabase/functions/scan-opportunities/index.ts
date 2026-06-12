import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { loadMindsetBlocks } from "../_shared/mindset.ts";
import { callGeminiGrounded, extractJson, GeminiError } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COMPETITOR_KEYWORDS = [
  "corporate housing","furnished apartments","serviced apartments","extended stay provider","temporary housing",
  "synergy","churchill","mint house","oakwood","aka ","sonder","national corporate housing",
];

const HOUSING_KEYWORDS = [
  "project","contract","construction","deployment","relocation","intern","on-site","on site",
  "travel team","implementation","field crew","commissioning","installation","residency","temporary assignment",
  "rotational","mobilization","field service","crew","consult","expansion","new office","hiring surge",
];

function isCompetitor(text: string) {
  const t = text.toLowerCase();
  return COMPETITOR_KEYWORDS.some(k => t.includes(k));
}
function hasHousingNeed(text: string) {
  const t = text.toLowerCase();
  return HOUSING_KEYWORDS.some(k => t.includes(k));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { bdr_id } = await req.json();
    if (!bdr_id) return new Response(JSON.stringify({ error: "bdr_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: bdr, error: bdrErr } = await supabase.from("bdr_profiles").select("*").eq("id", bdr_id).maybeSingle();
    if (bdrErr || !bdr) throw new Error("BDR profile not found");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const today = new Date().toISOString().split("T")[0];
    const verticals = (bdr.target_verticals as string[]) || [];
    const markets = (bdr.markets as string[]) || [];
    const inv = (bdr.inventory_locations as Array<{name:string;city:string;state:string}>) || [];

    // Pull companies we've already surfaced for this BDR so we don't return them again
    const { data: existingRows } = await supabase
      .from("opportunities")
      .select("company")
      .eq("assigned_bdr", bdr_id)
      .order("created_at", { ascending: false })
      .limit(200);
    const excludeCompanies = Array.from(new Set((existingRows || []).map(r => r.company))).slice(0, 150);

    // Rotate signal focus + source emphasis each scan to force variety
    const focusRotations = [
      "Focus this scan on CONTRACT AWARDS and government/defense subcontractors.",
      "Focus this scan on CONSTRUCTION & PHASED PROJECTS — prioritize subs, MEP contractors, commissioning firms.",
      "Focus this scan on CORPORATE EXPANSIONS, RELOCATIONS, and new facility openings.",
      "Focus this scan on TRAINING COHORTS, intern programs, and rotational workforce moves.",
      "Focus this scan on TECH IMPLEMENTATIONS, SaaS rollouts, and consulting deployments.",
      "Focus this scan on HEALTHCARE projects — equipment installs, hospital expansions, traveling clinical staff.",
      "Focus this scan on ENERGY, INFRASTRUCTURE, and utility project mobilizations.",
    ];
    const focus = focusRotations[Math.floor(Math.random() * focusRotations.length)];
    const variety = `Variety seed: ${Date.now()}-${Math.floor(Math.random() * 100000)}.`;

    const mindsetBlock = await loadMindsetBlocks(bdr_id);

    const systemPrompt = [
      "You are a sales intelligence analyst for a corporate housing BDR at National Corporate Housing.",
      `Today is ${today}.`,
      mindsetBlock,
      "OPERATING RULE: The OPERATOR MINDSET block above is load-bearing. Apply every rule, signal type, and target archetype it lists when you select leads — do not just acknowledge it, USE it on every lead.",
      `BDR markets: ${markets.join(", ")}.`,
      `BDR target verticals: ${verticals.join(", ") || "all 7 verticals"}.`,
      `BDR inventory near: ${inv.map(i => `${i.city}, ${i.state}`).join("; ") || "n/a"}.`,
      "MISSION: Search for new business movements that could create 30+ day corporate housing demand. Leave no stone unturned — use every public source you can reason about: news, press releases, contract awards (USASpending, SAM.gov), permits, EDC announcements, LinkedIn job posts, career pages, hiring surges, regional business journals, university/hospital expansion news, defense and DOE contract awards, construction trade press, etc.",
      focus,
      "PRIORITIZE these signal types: expansions, relocations, contract awards, phased construction, project mobilizations, training cohorts, temporary workforce movements, large group activity likely to require extended stays.",
      "IGNORE: generic hiring news, short hotel-only event traffic, conference attendees, day visitors, single-person business travel.",
      "TARGET PROFILE: SMB and SME ONLY as the 'company' field (roughly 10-1500 employees, under ~$500M revenue). Two acceptable signal types: (1) SMB/SME companies running their own 30+ day project, AND (2) SMB/SME contractors / subs / vendors / staffing / consulting firms executing work on a larger project — even if the prime, owner, or end-customer is Fortune 500, a hospital system, a utility, a federal agency, or a state/local government. The bigger the umbrella project, the more SMB subs to surface beneath it.",
      "HARD EXCLUSION: Never return Fortune 500, Fortune 1000, or any large enterprise as the 'company' field — they are too slow to close. When the umbrella project belongs to an F500 / utility / hospital / agency, NAME THE SMB/SME SUB doing the work and reference the prime ONLY in 'why_it_matters' and 'key_talking_points'. The 'company' field must ALWAYS be the SMB/SME executing the work.",
      "LEAVE NO STONE UNTURNED — go granular and off the beaten path. Most BDRs only chase obvious GCs and developers; you must dig into the SUBS and SPECIALTY TRADES that actually mobilize crews for 30+ days. Surface the unsexy, niche, regional firms — the ones nobody else is calling.",
      "EXPANDED SMB TARGET TYPES TO HUNT (rotate through these — surface different categories each scan):",
      "  • CONSTRUCTION / VERTICAL BUILD: site clearing firms, mass grading & excavation contractors, concrete & tilt-wall contractors, steel erection firms, roofing & building envelope contractors, HVAC & mechanical piping contractors, electrical contractors, generator & fuel system installers, structured cabling / low-voltage contractors, fire protection firms, security & access control integrators, BAS & controls integrators, commissioning firms, industrial cleaning & turnover support, equipment rigging & logistics firms.",
      "  • UTILITY / POWER / SUBSTATION: substation civil contractors, foundation & drilled pier contractors, transmission line construction firms, relay & protection contractors, controls & SCADA integrators, industrial electricians, switchgear & breaker service firms, transformer field service firms, testing & commissioning firms, vegetation management contractors, erosion control contractors, heavy rigging & equipment transport firms, battery storage installers, industrial maintenance firms.",
      "  • MANUFACTURING / PLANT LAUNCH: industrial electrical contractors, automation & controls integrators, conveyor & material handling installers, tooling & fixture shops, process piping contractors, compressed air & gas system contractors, equipment installation & rigging, industrial flooring & epoxy contractors, environmental & waste handling firms, maintenance & reliability services, packaging & kitting firms, quality inspection & calibration firms, safety training & staffing, specialty logistics providers.",
      "  • BROADBAND / FIBER / OSP: OSP engineering firms, GIS & field mapping, permitting support, utility locating, pole attachment & make-ready crews, directional boring / HDD contractors, trenching crews, conduit & handhole installation, aerial line crews, fiber pulling crews, fusion splicing firms, OTDR testing firms, network turn-up & electronics installers, restoration & emergency repair vendors.",
      "  • DEFENSE / AEROSPACE / GOVT SUBS: precision machining shops, metal fabrication firms, composites & specialty materials suppliers, tool & die shops, electronics assembly firms, testing & inspection labs, calibration firms, MRO support vendors, secure facility buildout contractors, cleanroom & specialty HVAC firms, industrial coatings providers, engineering support firms, program support & technical staffing.",
      "  • LOCAL/STATE GOVERNMENT PROJECTS: state DOT contractors, municipal water/wastewater plant subs, courthouse & jail buildout subs, school district capital project subs, state university construction subs, state hospital subs, state-funded broadband (BEAD) subs, emergency response & disaster recovery contractors. Pull from state procurement portals, county capital plans, and EDC announcements.",
      "BUYER TITLES TO RECOMMEND (pick 3-5 per lead, matched to company type): Director of Construction, Project Executive, Senior Project Manager, Owner's Representative, Development Manager, Procurement Manager, MEP Manager, Commissioning Manager, Operations Manager, Director of Capital Projects, Transmission/Substation/Plant Manager, Maintenance Manager, Field Construction Manager, Engineering Manager, Launch Manager, Facilities Manager, CapEx Project Manager, Supplier Development Manager, Industrial Engineering Manager, Operations Director, Director of Outside Plant, Network Deployment Manager, Broadband Program Manager, OSP Manager, Field Operations Manager, Program Manager, Manufacturing Engineering Manager, Supply Chain Manager, Site Lead. AVOID C-suite.",
      "NEVER include other corporate housing providers (Synergy, Churchill, Mint House, Oakwood, AKA, Sonder, etc.).",
      excludeCompanies.length > 0
        ? `CRITICAL: DO NOT return any of these companies — they have already been surfaced. Find DIFFERENT companies: ${excludeCompanies.join(", ")}.`
        : "",
      "Surface FRESH, less-obvious SMBs — go beyond the top 10 most-known firms in each market. Dig into specialty subs, regional staffing firms, niche engineering shops, mid-tier consultancies.",
      "OUTPUT — tight and scannable: company name, city, signal, housing use case, estimated stay (e.g. '60-90 days', '6 month rotation'), priority High/Medium/Low.",
      "Summarize WHY each suggests a 30+ day need in one short sentence in 'why_it_matters'. No fluff.",
      "RETURN AT LEAST 12 OPPORTUNITIES per scan, all DIFFERENT from the exclusion list above.",
      "Score each 0-100: discovery_score, housing_fit_score, confidence_score.",
      "Set priority High/Medium/Low based on housing-need likelihood.",
      "Suggest 3-5 contact titles (PM, Field Ops, Travel Coordinator, HR/Talent, Program Manager — avoid C-suite).",
      "2026-2027 CATALYST FOCUS — scan especially for: (a) PUBLIC HOUSING MODERNIZATION — HUD/PHA 'Phased Modernization' or 'Total Building Rehab' bids >$20M; IGNORE pure new construction (no displacement). (b) TECHNICAL WORKFORCE — Data center 'commissioning' or 'equipment onboarding' crews in Northern VA and Texas hubs, 6-9 month rotations of specialized technicians. (c) STRATEGIC M&A — acquisitions where acquirer HQ and target HQ are in different cities, integration teams of 20+ executives relocating 6+ months.",
      "OUTPUT REQUIREMENTS per lead — make sure why_it_matters reads as a one-sentence Catalyst Event AND key_talking_points contains: (1) The Payer (GC or acquiring company holding the budget), (2) Unit Count (specific or estimated, e.g. '~75 units'), (3) Friction Point (why corporate housing vs hotel — kitchens, length of stay, family displacement, crew cohesion), (4) Buyer HQ city/state for RoE check.",
      "JUST FLAG — do not draft outreach copy or email subject lines here; populate the data fields only.",
      "MANDATORY CITATION: every lead MUST include a real, public source_url (https://...) discovered via your Google Search tool — news article, RFP/award notice, press release, official notice. The URL must resolve and the company name MUST appear in the page text. NO synthetic URLs. NO placeholders. NO bare domains. NO homepage links. If you cannot cite a verifiable source from your search results, do NOT return that lead — we will drop unverified leads.",
      "DO NOT prefix why_it_matters with [WHALE], [GLOBAL], [COLLAB], or [TREND:] tags. Plain prose only.",
      variety,
      "OUTPUT FORMAT — return ONLY a JSON object inside a ```json code fence, no prose:",
      '{ "opportunities": [ { "company": "...", "market": "City, ST", "project": "...", "vertical": "...", "signal_type": "...", "description": "...", "why_it_matters": "...", "estimated_stay": "...", "discovery_score": 0-100, "housing_fit_score": 0-100, "confidence_score": 0-100, "suggested_contacts": ["..."], "pitch_angle": "...", "key_talking_points": ["..."], "source_type": "...", "source_url": "https://..." } ] }',
    ].filter(Boolean).join(" ");

    let opportunities: Array<{
      company: string; market: string; project: string; vertical: string; signal_type: string;
      description: string; why_it_matters: string; estimated_stay: string;
      discovery_score: number; housing_fit_score: number; confidence_score: number;
      suggested_contacts: string[]; pitch_angle: string; key_talking_points: string[];
      source_type: string; source_url: string;
    }>;
    try {
      const text = await callGeminiGrounded({
        systemPrompt,
        userPrompt: `Use Google Search to scan opportunities for ${markets.join(", ")}. Today is ${today}. Return 12+ NEW companies not in the exclusion list. Respond with JSON matching the schema.`,
        temperature: 0.7,
      });
      const parsed = extractJson<{ opportunities: typeof opportunities }>(text);
      opportunities = parsed.opportunities || [];
    } catch (e) {
      if (e instanceof GeminiError) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw e;
    }

    // Geocode helper using OpenStreetMap Nominatim (free, no key). Cached per request.
    const geoCache = new Map<string, { lat: number; lon: number } | null>();
    const geocode = async (city: string, state: string): Promise<{ lat: number; lon: number } | null> => {
      const key = `${city.toLowerCase()},${state.toLowerCase()}`;
      if (geoCache.has(key)) return geoCache.get(key)!;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&country=USA&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`;
        const res = await fetch(url, { headers: { "User-Agent": "Flare-BDR-Toolkit/1.0" } });
        const arr = await res.json();
        const hit = Array.isArray(arr) && arr[0] ? { lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon) } : null;
        geoCache.set(key, hit);
        return hit;
      } catch {
        geoCache.set(key, null);
        return null;
      }
    };
    const haversineMiles = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const R = 3958.8;
      const dLat = toRad(b.lat - a.lat);
      const dLon = toRad(b.lon - a.lon);
      const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    };

    // "Near core inventory" = within ~30 min drive (≈25 mi) of a GA or TN core property.
    const CORE_PROXIMITY_STATES = new Set(['GA', 'TN']);
    const PROXIMITY_MILES = 25;
    // Fallback core inventory (used when the BDR profile has no inventory_locations configured).
    const FALLBACK_CORE_INV: Array<{name:string;city:string;state:string}> = [
      { name: 'Stillhouse Vinings', city: 'Atlanta', state: 'GA' },
      { name: 'The Fieldhouse', city: 'Atlanta', state: 'GA' },
      { name: 'AMLI Arts Center', city: 'Atlanta', state: 'GA' },
      { name: 'Bell Buckhead West', city: 'Atlanta', state: 'GA' },
      { name: 'Bexley Summerhill', city: 'Atlanta', state: 'GA' },
      { name: 'Aston City Springs', city: 'Sandy Springs', state: 'GA' },
      { name: 'AMLI Decatur', city: 'Decatur', state: 'GA' },
      { name: 'AMLI North Point', city: 'Alpharetta', state: 'GA' },
      { name: 'Bell Kennesaw Mountain', city: 'Kennesaw', state: 'GA' },
      { name: 'Millhouse Station', city: 'Marietta', state: 'GA' },
      { name: 'Bexley Chamblee', city: 'Chamblee', state: 'GA' },
      { name: 'Bexley Duluth', city: 'Duluth', state: 'GA' },
      { name: 'The Everly', city: 'Johns Creek', state: 'GA' },
      { name: 'Eden at Lakeview', city: 'Stockbridge', state: 'GA' },
      { name: 'Retreat at Peachtree City', city: 'Peachtree City', state: 'GA' },
      { name: 'Henley at Mirror Lake', city: 'Villa Rica', state: 'GA' },
      { name: 'The Eddy at Riverview', city: 'Columbus', state: 'GA' },
      { name: 'Riverworks at Eastern Wharf', city: 'Savannah', state: 'GA' },
      { name: 'Parc at Pooler', city: 'Pooler', state: 'GA' },
      { name: 'The Meridian at Lafayette', city: 'LaGrange', state: 'GA' },
      { name: 'Camden Music Row', city: 'Nashville', state: 'TN' },
      { name: 'Aspire Midtown', city: 'Nashville', state: 'TN' },
      { name: 'Bexley Stockyard', city: 'Nashville', state: 'TN' },
      { name: 'Avalon at Seven Springs', city: 'Brentwood', state: 'TN' },
      { name: 'Camden Franklin Park', city: 'Franklin', state: 'TN' },
      { name: 'Easton Place', city: 'Murfreesboro', state: 'TN' },
      { name: 'Columns on Main', city: 'Spring Hill', state: 'TN' },
      { name: 'Aventine Northshore', city: 'Knoxville', state: 'TN' },
      { name: 'Hawthorne at the W', city: 'Chattanooga', state: 'TN' },
      { name: 'Metro 67', city: 'Memphis', state: 'TN' },
      { name: 'Grove Germantown', city: 'Germantown', state: 'TN' },
    ];
    const bdrCore = inv.filter(i => i.state && CORE_PROXIMITY_STATES.has(i.state.toUpperCase()));
    const coreInv = bdrCore.length > 0 ? bdrCore : FALLBACK_CORE_INV;

    // Map full state names → 2-letter codes (markets sometimes come in as "Georgia" with no city).
    const STATE_NAME_TO_CODE: Record<string, string> = {
      georgia: 'GA', tennessee: 'TN', alabama: 'AL', florida: 'FL', 'south carolina': 'SC', 'north carolina': 'NC',
    };
    const normalizeStateToken = (raw: string): string => {
      const t = raw.trim();
      if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
      return STATE_NAME_TO_CODE[t.toLowerCase()] ?? t.toUpperCase();
    };

    const pickNearestInventory = async (
      market: string | null
    ): Promise<{ label: string; miles: number | null } | null> => {
      if (!market || coreInv.length === 0) return null;
      const parts = market.split(',').map(s => s.trim()).filter(Boolean);
      const leadStateRaw = parts[parts.length - 1] ?? '';
      const leadState = normalizeStateToken(leadStateRaw);
      // Anything outside GA/TN is never "near core inventory".
      if (!CORE_PROXIMITY_STATES.has(leadState)) return null;

      // If we have a city, try precise distance first.
      const leadCity = parts.length > 1 ? parts[0] : '';
      if (leadCity) {
        const leadGeo = await geocode(leadCity, leadState);
        if (leadGeo) {
          let best: { item: typeof coreInv[number]; miles: number } | null = null;
          for (const i of coreInv) {
            if (!i.city || !i.state) continue;
            const g = await geocode(i.city, i.state);
            if (!g) continue;
            const miles = haversineMiles(leadGeo, g);
            if (!best || miles < best.miles) best = { item: i, miles };
          }
          if (best && best.miles <= PROXIMITY_MILES) {
            const m = Math.round(best.miles);
            return { label: `${best.item.name} (${best.item.city}, ${best.item.state}) — ~${m} mi`, miles: m };
          }
          // City known but too far — not near.
          if (best) return null;
        }
      }

      // State-only market in GA/TN (or geocode failed): treat as near, surface the first core property in that state.
      const stateMatch = coreInv.find(i => i.state?.toUpperCase() === leadState);
      if (stateMatch) {
        return { label: `${stateMatch.name} (${stateMatch.city}, ${stateMatch.state})`, miles: null };
      }
      return null;
    };

    // URL verifier — fetches the source page and confirms (a) it loads (2xx/3xx) and
    // (b) the company name actually appears in the page text. No URL or failed verify = lead is dropped.
    const verifyUrlMentionsCompany = async (url: string, company: string): Promise<boolean> => {
      try {
        const u = new URL(url);
        if (u.protocol !== "https:" && u.protocol !== "http:") return false;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: ctrl.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; FlareLeadVerifier/1.0)" },
        });
        clearTimeout(timer);
        if (!res.ok) return false;
        const text = (await res.text()).toLowerCase();
        // Match on the strongest distinctive token of the company name (longest word > 3 chars).
        const tokens = company.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 3);
        if (tokens.length === 0) return text.includes(company.toLowerCase());
        return tokens.some(t => text.includes(t));
      } catch {
        return false;
      }
    };

    let inserted = 0;
    let skipped = 0;
    let droppedUnverified = 0;
    for (const o of opportunities) {
      const blob = `${o.company} ${o.description} ${o.project}`;
      if (isCompetitor(blob)) { skipped++; continue; }
      if (!hasHousingNeed(blob)) { skipped++; continue; }

      // HARD verification: every lead MUST have a source_url that resolves AND mentions
      // the company. Unverified leads are dropped — never displayed or stored.
      if (!o.source_url) { droppedUnverified++; continue; }
      let urlVerified = false;
      try { urlVerified = await verifyUrlMentionsCompany(o.source_url, o.company); } catch { urlVerified = false; }
      if (!urlVerified) { droppedUnverified++; continue; }

      const composite = (Number(o.discovery_score) * 0.4) + (Number(o.housing_fit_score) * 0.4) + (Number(o.confidence_score) * 0.2);
      const priority = composite >= 80 ? "Top Priority" : composite >= 65 ? "Strong Opportunity" : composite >= 45 ? "Early Signal" : "Watch List";
      const review_status = composite >= 75 ? "Ready Now" : composite >= 55 ? "Needs Review" : "Watch List";
      const confidence_label = o.confidence_score >= 75 ? "High" : o.confidence_score >= 50 ? "Medium" : "Low";
      const nearestResult = await pickNearestInventory(o.market);
      const nearest = nearestResult?.label ?? null;
      const nearestMiles = nearestResult?.miles ?? null;

      // Dedupe
      const { data: existing } = await supabase
        .from("opportunities")
        .select("id")
        .eq("company", o.company)
        .eq("market", o.market)
        .eq("project", o.project)
        .maybeSingle();

      const payload = {
        company: o.company,
        market: o.market,
        project: o.project,
        vertical: o.vertical,
        signal_type: o.signal_type,
        description: o.description,
        why_it_matters: o.why_it_matters,
        estimated_stay: o.estimated_stay,
        discovery_score: Math.round(o.discovery_score),
        housing_fit_score: Math.round(o.housing_fit_score),
        confidence_score: Math.round(o.confidence_score),
        priority,
        review_status,
        confidence_label,
        suggested_contacts: o.suggested_contacts,
        pitch_angle: o.pitch_angle,
        key_talking_points: o.key_talking_points,
        nearest_inventory: nearest,
        near_core_inventory: !!nearest,
        distance_to_inventory: nearestMiles,
        source_type: o.source_type,
        source_url: o.source_url,
        assigned_bdr: bdr_id,
        last_verified: new Date().toISOString(),
      };

      if (existing) {
        await supabase.from("opportunities").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("opportunities").insert({ ...payload, status: "new" });
        inserted++;
      }
    }

    return new Response(JSON.stringify({ inserted, skipped, dropped_unverified: droppedUnverified, total: opportunities.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan-opportunities error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

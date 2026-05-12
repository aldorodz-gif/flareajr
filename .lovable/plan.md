## 1. Mirror the +Pipeline flow on the AI Daily tab

Today AI Daily (`OpportunitiesTab.tsx`) just flips `saved_by_bdr` and shows "✓ In pipeline." Market Heat (`LeadFeed.tsx`) opens a side sheet that lets the BDR pick a target title, pick a tone, AI-generate Email 1, and auto-schedule the 5-touch sequence (Day 1/3/7/14/21).

We'll give AI Daily the same flow with matching button styling.

**Refactor:** Extract the existing pipeline sheet from `LeadFeed.tsx` into a new shared component:

- `src/components/guide/AddToPipelineSheet.tsx`
  - Props: `open`, `onClose`, `onSaved`, and a normalized `lead` object with `company_name`, `vertical`, `signal_type`, `signal_detail`, `why_housing` (or equivalent), `recommended_titles`.
  - Same UI/copy/colors as today's sheet (title chips → custom title input → tone chips → Generate Email 1 → editable subject/body → 5-touch cadence preview → Save button).
  - Calls `email-generator`, then inserts into `pipeline_items` and 5 rows into `tasks` exactly like today, and dispatches `flare:tasks-updated`.
  - `LeadFeed.tsx` imports it (replaces inlined sheet) so we have a single source of truth.

**AI Daily wiring (`OpportunitiesTab.tsx`):**

- Add local state `pipeOpp: Opportunity | null`.
- Replace the current `+ Pipeline` button (line 317) with one that opens the sheet, mapped from the `Opportunity` row:
  - `company_name` ← `o.company`
  - `vertical` ← `o.vertical`
  - `signal_type` ← `o.signal_type`
  - `signal_detail` ← `o.why_it_matters` (fallback `o.description`)
  - `why_housing` ← `o.why_it_matters` (or `o.estimated_stay`)
  - `recommended_titles` ← `o.suggested_contacts` (already on the row)
- On save, also keep current behavior: update opportunities row with `saved_by_bdr = selected.id, status = 'working'` so the existing "✓ In pipeline" indicator still works.

**Button color match (AI Daily → Market Heat):**

Replace shadcn `<Button>` markup at lines 313–320 with the same hand-styled buttons used in `LeadFeed`:

- `+ Pipeline`: dark navy `#0e1e3a` bg, white text, 11px bold uppercase.
- `✓ In pipeline` (saved state): teal-tinted bg `rgba(16,185,129,.15)`, text `#14b8a6`.
- `Archive`: convert to the same ghost-pill style used for the secondary action in LeadFeed (`rgba(251,146,60,.12)` bg, `#ec4899` text, magenta border) so the row reads consistently with Market Heat.

No DB schema changes — `pipeline_items` and `tasks` already support everything.

## 2. Fix "Near core inventory" so it only fires for true GA/TN proximity

Right now `supabase/functions/scan-opportunities/index.ts` (lines 240–272) sets `near_core_inventory = !!nearest`, and `pickNearestInventory` falls back to **state-only matching with no distance** (lines 220–224). That makes any lead in any state where we have inventory show "📍 Near …" — which is why GA leads that really are close still look indistinguishable from far ones, and non-GA/TN leads also light up.

**Rule:** A lead is "Near core inventory" only if it is within ~30 min drive (≈ 25 miles straight-line) of a core inventory property in **GA or TN**.

Edits in `scan-opportunities/index.ts`:

1. Add `const CORE_PROXIMITY_STATES = new Set(['GA', 'TN']);` and `const PROXIMITY_MILES = 25;` (≈30-40 min).
2. In `pickNearestInventory`:
  - Filter `inv` to `CORE_PROXIMITY_STATES` before scanning.
  - Require a real geocoded distance — drop the city-name and state-name fallbacks that returned `miles: null`.
  - Only return a result when `best.miles <= PROXIMITY_MILES`; otherwise return `null`.
3. The existing `near_core_inventory: !!nearest` line then becomes correct (true ⇔ within 25 mi of a GA/TN property).
4. Keep storing `nearest_inventory` label and `distance_to_inventory` so the existing pill `📍 Near {name} · ~{n} mi` keeps rendering.

Frontend: no changes needed. The "Near inventory" filter (`OpportunitiesTab.tsx` line 191) and pill (line 286) already key off `near_core_inventory`, so they'll automatically tighten once the function is redeployed.

Existing `opportunities` rows that were mis-flagged will correct themselves on the next scan (each row is upserted by `(company, market, project)` and `near_core_inventory` is overwritten in the payload).

## Files touched

- new: `src/components/guide/AddToPipelineSheet.tsx`
- edit: `src/components/guide/LeadFeed.tsx` (use shared sheet)
- edit: `src/components/guide/OpportunitiesTab.tsx` (open sheet, restyle buttons)
- edit: `supabase/functions/scan-opportunities/index.ts` (GA/TN + 25mi gate)
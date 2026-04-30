
## Scope lock — only these changes will be made

Confirming the merge plan is **strictly limited** to adding one new Dashboard tab. Nothing else in the app changes.

---

## ✅ What WILL change

### 1. New tab registration
- `src/components/guide/types.ts` — add `{ id: 'dashboard', icon: '🏠', label: 'Dashboard' }` as the **first** entry in `TAB_ORDER`.
- `src/pages/Index.tsx` — import `DashboardTab`, add a `case 'dashboard'` to the switch, change initial `activeTab` from `'workflow'` to `'dashboard'`.

### 2. New files (created, no existing files touched)
- `src/components/guide/DashboardTab.tsx` — the dashboard page
- `src/components/guide/MarketSelector.tsx` — State + City + Vertical dropdowns + 🔄 Refresh / Scan button
- `src/components/guide/GoalsVsPace.tsx` — placeholder widget (Outreach / Meetings / Pipeline $ progress bars + on-track/behind label)
- `src/components/guide/TopVerticals.tsx` — ranked list of the 7 canonical verticals most active in the chosen market
- `src/components/guide/LeadFeed.tsx` — Flare-styled cards listing leads pulled from the scan
- `src/components/guide/InventoryMap.tsx` — Leaflet map of Core Inventory properties for the chosen city
- `src/components/guide/inventoryData.ts` — seed inventory properties (a few demo markets)

### 3. New edge function
- `supabase/functions/dashboard-scan/index.ts` — accepts `{ state, city, vertical }`, calls Lovable AI (`google/gemini-2.5-flash`), returns `{ leads: [...], topVerticals: [...] }`. Uses existing `LOVABLE_API_KEY` — no new secrets.

### 4. Database migration (additive only)
Add columns to existing `user_settings` table — no new tables, no changes to existing columns:
```text
home_state           text     default ''
home_city            text     default ''
home_vertical        text     default 'all'
weekly_goal_outreach int      default 25
weekly_goal_meetings int      default 5
weekly_goal_pipeline int      default 100000
last_scan_at         timestamptz
```
Leads from the scan write into the existing `prospects` table (already has the right columns). "Add to Pipeline" writes to existing `pipeline_items`. No schema changes there.

### 5. Dependencies
- Add `leaflet`, `react-leaflet`, `@types/leaflet` for the map. No other deps added.

---

## ❌ What WILL NOT change

- ❌ No edits to any other tab (Overview, Setup, Prompt Builder, Score Signals, Who to Call, Write Outreach, Level Up, Find Events, LinkedIn Strategy)
- ❌ No edits to `verticalsData.ts` — the new components import from it, they don't modify it
- ❌ No edits to `TabBar.tsx`, `Header.tsx`, `ProgressBar.tsx`, `WelcomeModal.tsx`, `AiToolCard.tsx`, `Eyebrow.tsx`, or any shared component
- ❌ No edits to any existing edge function (`email-generator`, `event-finder`, `signal-scorer`, `prompt-builder`, `linkedin-strategy`, `article-scraper`)
- ❌ No design system changes — uses the existing dark navy/orange Flare palette, `AiToolCard` shell, and `Eyebrow` tags
- ❌ Nothing from the uploaded HTML prototype's cream/teal styling is imported
- ❌ No new auth flow, no new RLS rewrites — the migration only adds columns to a table that already has RLS
- ❌ No new "Today" tab, no new "Pipeline" tab, no new "Inventory" tab — the map lives **inside** the Dashboard tab

---

## Build order (one pass)
1. Migration: add columns to `user_settings`
2. Edge function: `dashboard-scan`
3. Add deps: leaflet + react-leaflet
4. Create the 7 new component files + seed inventory data
5. Register the tab in `types.ts` and `Index.tsx`

If this scope is right, approve and I'll execute exactly this — nothing more.

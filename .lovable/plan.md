# Merge Market Heat into AI Daily Lead Feed

Since BDRs only ever scan their own territory, two tabs is friction. Fold the valuable visuals from Market Heat (Top Verticals + Inventory Map) into the Daily Feed tab and delete the standalone tab.

## End-state UX

One tab — **AI Daily Lead Feed** — scoped automatically to the active BDR's market(s):

```
┌─ AI Daily Lead Feed ───────────────────────────────────┐
│ Header: BDR name · markets · "⚡ Refresh Scan" button  │
├────────────────────────────────────────────────────────┤
│ ▼ Market Pulse (collapsible, open by default)          │
│   ┌──────────────────┬──────────────────────────────┐  │
│   │ Top Verticals    │ Inventory Map (mini)         │  │
│   │ (bar list)       │ (pins for BDR's footprint)   │  │
│   └──────────────────┴──────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│ Filters: All · 🔥 Top · 📍 Near Inventory · ⭐ Saved   │
│ Territory-filter banner (only when leads are hidden)   │
├────────────────────────────────────────────────────────┤
│ Lead cards (existing UI, unchanged)                    │
└────────────────────────────────────────────────────────┘
```

## Changes

### 1. `src/components/guide/OpportunitiesTab.tsx`
- Add a **"Market Pulse"** collapsible section above the filter pills.
- Inside it: render `<TopVerticals>` (left) + `<InventoryMap>` (right) in a 2-column grid (stacks on mobile).
- Derive `topVerticals` locally from the loaded `opportunities` (group by `vertical`, compute share %, pick a driver from the most common `signal_type`). No new edge-function call needed — reuse data already in memory.
- Pass the BDR's first market's city/state to `<InventoryMap>` so the map centers correctly.
- Remember collapsed/expanded state in `localStorage` so power users can hide it.

### 2. `src/components/guide/types.ts`
- Remove the `market` tab entry from `TAB_ORDER`.

### 3. `src/pages/Index.tsx` (or wherever tabs are routed)
- Remove the `MarketHeatTab` import and route case.
- Update the `'flare:navigate-tab'` listener: when something dispatches `'market'` (e.g. the "Near Inventory" pill in lead cards), redirect to `'opportunities'` and scroll to the Market Pulse section / set the inventory focus.

### 4. `src/components/guide/OpportunitiesTab.tsx` — inventory click handler
- The existing `openInventoryContext` writes `flare.marketHeatRoute` to sessionStorage and dispatches `navigate-tab → market`. Replace with: scroll to the embedded `<InventoryMap>` and set its `focusInventory` prop directly via local state.

### 5. Delete `src/components/guide/MarketHeatTab.tsx`
- No longer referenced.

### 6. Onboarding / WelcomeModal copy
- If any onboarding text says "Market Heat", change to "Market Pulse (inside AI Daily Lead Feed)".
- Update the `mem://features/onboarding` memory to reflect the new tab structure.

## What stays the same

- `dashboard-scan` edge function — kept (still used by the Dashboard tab, if applicable). Verify with grep before deleting.
- `scan-opportunities` edge function — unchanged. The Whale Directive still drives the feed.
- BDR market sync logic — unchanged; one tab now means one scan trigger.
- Save / Archive / scoring / "Near Inventory" pill — unchanged.

## What gets removed

- The "🔥 Market Heat" tab in the nav.
- Duplicate scan path: clicking through tabs no longer triggers `dashboard-scan` separately from `scan-opportunities`.
- The cross-tab `flare.marketHeatRoute` sessionStorage handoff.

## Risks / things to confirm during build

- Confirm `dashboard-scan` isn't referenced anywhere else before considering its removal (likely keep it for safety).
- `<InventoryMap>` currently expects a single city/state; for BDRs with multiple markets we'll center on the first market and show all `inventory_locations` pins.
- Top Verticals derived locally will only reflect the loaded 100 opportunities. That's actually more honest than a separate scan — the user sees the mix of what's actually in their feed.
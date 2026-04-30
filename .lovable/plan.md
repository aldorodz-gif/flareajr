## Plan: BDR Scoreboard on the Dashboard (from your Excel Calculator)

### What you'll see
A new **"BDR Scoreboard"** card at the top of the Dashboard with:
- A **BDR dropdown**: Hallie Bellack / Matthew Griffith (more BDRs added later by editing one file)
- A **Year + Month** selector (defaults to current month, 2026)
- A clean grid of the Calculator's KPIs for that BDR / month, using the **exact labels from your sheet**:
  - Monthly GP Goal
  - Actual GP Standings
  - Act Variance $ to Goal
  - Act Variance % to Goal
  - Act # Days Needed to Goal
  - Act # Full Month Bookings to Goal
  - GP in Group Pipeline
  - Total Pipeline
  - Actual + Pipeline GP
  - Exp Variance $ to Goal
  - Exp Variance % to Goal
  - Remaining Pipeline Need
  - Commission Earned
  - Commission Forecast – Pipeline
  - Total Monthly Commission Prediction
- A **Quarter rollup row** ("Q1 / Q2 / Q3 / Q4 / Year") with totals matching your sheet's summary rows (rows 16, 19–22, 50–55).
- Color cues using your Flare palette: green when "Actual ≥ Goal", orange when behind, navy labels on warm tan card.

### Data source (this round = static snapshot from your file)
Because you said "use the labels in the Excel doc" and only Hallie + Matt for now, the cleanest first step is a **typed snapshot** of the Calculator data, not a live OneDrive sync. The data lives in:

- `src/components/guide/bdrCalculatorData.ts` — one constant per BDR with the same column headers as row 2 of the Calculator sheet, and one row per month for 2025 and 2026 (plus quarter and "All" rollups).

Hallie's numbers are pulled directly from the file you uploaded (rows 3–14 = 2025 monthly, row 16 = 2025 All, rows 19–22 = 2025 quarterly, rows 34–45 = 2026 monthly, row 50 = 2026 All, rows 52–55 = 2026 quarterly).

Matt (Griffith, Matthew) is **not in the Calculator sheet** of your file — only Hallie is. His numbers are derived from the **"2026 Goals Firm"** tab (rows 20–21 give his monthly Revenue + GP goals) and the **"% of BDRs to Goal"** tab (his monthly GP Actual). For fields the Calculator computes (variance %, days-needed, commission), I'll apply the **same formulas** the Calculator uses so labels and math stay consistent.

If later you want true live sync from OneDrive, that's a separate (already-scoped) follow-up — I'll note it but not build it now.

### Files

**New**
- `src/components/guide/bdrCalculatorData.ts` — `BDRS` array + `getCalculatorRow(bdrId, year, period)` helper. Periods: `'2025-Jan' … '2026-Dec'`, `'2025-Q1' … '2026-Q4'`, `'2025-All'`, `'2026-All'`.
- `src/components/guide/BdrScoreboard.tsx` — the card component: BDR dropdown + Year/Month selector + KPI grid + quarter rollup strip.

**Edited**
- `src/components/guide/DashboardTab.tsx` — render `<BdrScoreboard />` directly under the existing "Your Market Dashboard" header card, above the Goals vs Pace / Top Verticals row.

**Not touched**
- No DB migration, no edge function, no schema change.
- `GoalsVsPace`, `MarketSelector`, `TopVerticals`, `LeadFeed`, `InventoryMap` stay exactly as they are.

### UI sketch
```text
┌──────────────────────────────────────────────────────────────┐
│ BDR Scoreboard                  [BDR: Hallie ▾]  [Mar 2026 ▾]│
│──────────────────────────────────────────────────────────────│
│ Monthly GP Goal     $5,022     Act Variance $   −$2,196     │
│ Actual GP Standings $2,826     Act Variance %   56.3%       │
│ Days Needed to Goal 73.2       Bookings to Goal 2.4         │
│ GP in Group Pipe    $100       Total Pipeline   $100        │
│ Actual + Pipeline   $2,926     Exp Variance     −$2,096     │
│ Commission Earned   $141.31    Comm Forecast    $5.00       │
│                              Total Comm Prediction  $146.31  │
│──────────────────────────────────────────────────────────────│
│ 2026 Quarters: Q1 $11,337 · Q2 $9,984 · Q3 $6,592 · Q4 $5,108│
└──────────────────────────────────────────────────────────────┘
```

### Technical notes
- Numbers stored as `number | null`; renderer formats `$#,##0` for money, `0.0%` for percentages, `0.0` for day/booking counts. `null` shows as `—`.
- "Achieving goal" badge: green when `Actual GP ≥ Monthly GP Goal`, orange otherwise — matches your Flare palette (`#10B981` / `#fb923c`).
- Adding a third BDR later = append one entry to `BDRS` in `bdrCalculatorData.ts`. No other file changes.

### Out of scope (this round)
- Live OneDrive/Excel sync (the earlier-approved Goals vs Pace plan). I'll keep that on the shelf — say the word and I'll wire it up after this lands.
- Editing values in the app (read-only display).
- Pulling the GP-by-BDRs deal-level table or the Pipeline tabs.

Approve and I'll build exactly this.
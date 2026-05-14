## Current Dashboard

```text
┌─ Your Dashboard (BDR selector) ──────────────────────┐
├─ Daily Briefing (purple gradient banner) ────────────┤
│  • Today's Leads | Due Today | Overdue | Meetings    │
│  • Top picks chips                                   │
└──────────────────────────────────────────────────────┘
```

That's it now that the scoreboard is gone — feels thin.

## What I'd add (pick any combination)

**1. Today's Action Queue** (most useful — turns dashboard into a launch pad)
A short list (5–8 rows) of the most urgent items, each clickable:
- Overdue email touches with company + days late + "Open"
- Meetings booked this week with date + "Prep notes"
- Top 3 high-priority new leads with vertical + "Add to pipeline"

**2. Pipeline Health Strip** (one row, 4 mini-cards)
- Active pipeline count
- This week's new adds
- Stalled (no touch in 7 days)
- Conversion rate (added → meeting)

**3. Streak / Momentum Card** (motivational, not competitive)
- Days in a row with at least 1 outreach sent
- Touches this week vs. weekly goal (from `user_settings.weekly_goal_outreach`)
- Pipeline value vs. `weekly_goal_pipeline`
Personal-only — no other BDRs shown, since we just removed comparison.

**4. Fresh Signal Ticker** (horizontal scroll)
Last 5 signals Perplexity surfaced for the BDR's market — company, signal type, time. Click → Opportunities tab filtered to that lead.

**5. Quick Launch Row** (3 big buttons)
- "Scan my market now"
- "Write today's emails"
- "Find an event"
Shortcuts to the 3 tabs people open most.

## Recommendation

Add **#1 Action Queue** + **#2 Pipeline Health** + **#3 Streak**, in that order down the page. That keeps the dashboard personal (no team comparison), under 30-min daily, and answers the only 3 questions a BDR asks at 8am: *what do I owe today, what's in flight, am I on pace?*

Skip #4 (already on Opportunities tab) and #5 (TabBar already does that).

## Questions before I build

1. Confirm the 3 sections above — or trim/swap any?
2. For the Streak card, should "1 outreach" = task marked sent, or any pipeline activity (new add, stage change, etc.)?
3. Order: Briefing → Action Queue → Pipeline Health → Streak — good?
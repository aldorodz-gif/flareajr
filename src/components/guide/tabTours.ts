export type TourPreviewKind =
  | 'pipelineSequence'    // mock 5-touch grid showing what auto-schedule produces
  | 'connectionPills'     // mock connection-type chips toggled on
  | 'meetingBooked'       // mock booked-meeting badge with undo + follow-up
  | 'followupChip'        // mock follow-up counter chip
  | 'archiveCollapse'     // mock archive toggle row
  | 'manualAdd'           // mock manual-add success toast
  | 'leadCard'            // mock auto-built daily lead card
  | 'scoreBadge'          // mock score chip
  | 'celebration';        // mini celebration disco/handshake

export interface TourStep {
  /** CSS selector to spotlight. If missing or not found, step renders centered. */
  target?: string;
  title: string;
  body: string;
  /** Why this matters — one short line. */
  why?: string;
  /** Optional interactive-result preview shown beneath the body. */
  preview?: TourPreviewKind;
}

export interface TabTour {
  tabId: string;
  intro: string;        // one-line "what this tab is for"
  example: string;      // shown when "See an example" clicked
  steps: TourStep[];
}

export const TAB_TOURS: Record<string, TabTour> = {
  dashboard: {
    tabId: 'dashboard',
    intro: 'Your morning command center — a snapshot of today before you do anything else.',
    example:
      'Example: You log in at 8:02am. Dashboard shows "3 emails due today, 1 overdue follow-up with Acme Relocation, 2 fresh leads in Phoenix." You click straight into Today\'s Leads and start working — no thinking required.',
    steps: [
      { title: 'Welcome to your Dashboard', body: 'This is the first thing you should look at every morning. It tells you what\'s due, what\'s hot, and where to start.', why: 'Less decision-making = faster start.' },
      { title: 'Pick your BDR / market', body: 'The market selector at the top scopes every other tab to your territory. Change it once and the whole app follows.', why: 'No re-filtering on each tab.' },
      { title: 'Daily briefing toast', body: 'A floating summary appears with overdue, due-today, and fresh-lead counts. Click any pill to jump to that work.', why: 'Triage in 5 seconds.' },
    ],
  },

  opportunities: {
    tabId: 'opportunities',
    intro: '⚡ Today\'s Leads — your auto-built morning list. Scanned overnight, scored, ready.',
    example:
      'Example: 7 leads waiting. "Acme Corp · Phoenix · expanded HQ" scores 92. You click "Add to pipeline", pick the title, and a 5-touch sequence is scheduled. 30 seconds per lead.',
    steps: [
      { title: 'These are pre-built for you', body: 'Every lead here was auto-scanned and scored overnight against your market. You don\'t request them — they\'re ready when you arrive.', why: 'Mornings start with action, not searching.', preview: 'leadCard' },
      { title: 'Score = how strong the signal is', body: 'Higher score = fresher signal + better fit (SMB/SME only — no F500). Work top-down.', why: 'Best ROI on your first hour.', preview: 'scoreBadge' },
      { title: 'Add to pipeline = full sequence', body: 'One click drafts Email 1 and schedules a 5-touch cadence over 21 days. The lead moves to Prospects automatically.', why: 'No manual cadence math.', preview: 'pipelineSequence' },
    ],
  },

  market: {
    tabId: 'market',
    intro: '🔥 Scan a Market — on-demand territory pull when you want to dig deeper than the daily list.',
    example:
      'Example: Your daily list is light. You pick "Healthcare" + "Denver" and click Scan. Live, you see 12 SMB clinics with relocation/expansion signals — pick the strongest 3.',
    steps: [
      { title: 'Different from Today\'s Leads', body: 'Today\'s Leads = auto-built morning feed. This tab = a live radar you fire on demand when you want a specific cut.', why: 'Use this for deep-dives, not daily flow.' },
      { title: 'Pick a vertical + market', body: 'Choose any of the 7 verticals and one or more markets. Scan returns fresh SMB/SME signals only — no enterprise.', why: 'Stay on-ICP without filtering.' },
      { title: 'Add the best ones to pipeline', body: 'Same one-click flow as Today\'s Leads — sequence scheduled, lead lands in Prospects.', why: 'Consistent across tabs.' },
    ],
  },

  prospects: {
    tabId: 'prospects',
    intro: '🎯 Prospects — every lead you\'re actively working, with their 5-touch sequence visible.',
    example:
      'Example: Acme Corp shows ☑ Email 1 sent, ☑ Email 2 sent, ⏰ Day-7 LinkedIn due today, 📅 Day-14 scheduled. You log a LinkedIn connect, add a note, and you\'re done in 20 seconds.',
    steps: [
      { title: 'Your active pipeline lives here', body: 'Each card is one prospect with a 5-touch cadence over 21 days. Color-coded: green = sent, pink = today, red = overdue.', why: 'You see the whole journey at a glance.', preview: 'pipelineSequence' },
      { title: 'Sequence Journey panel', body: 'Top of the tab: totals per step + due-today + overdue + a reminder for the oldest miss.', why: 'Catch slipping touches before they go cold.' },
      { title: 'Add a lead manually', body: 'Got a referral or self-sourced a name? Hit "+ Add Lead Manually" — pick how you found them and we schedule the sequence the same way.', why: 'Your best leads aren\'t always in the auto feed.', preview: 'manualAdd' },
      { title: 'Log how you connected', body: 'On each card pick LinkedIn / Email / Phone / In-person / Referral. Add notes about what was said.', why: 'Future-you will thank present-you.', preview: 'connectionPills' },
      { title: 'Book the meeting', body: '"Book Disco Call" or "In-person" triggers a celebration and tags the lead with a badge. Made a mistake? Hit ↶ undo on the badge.', why: 'Wins should feel like wins.', preview: 'meetingBooked' },
      { title: 'Log follow-ups after the meeting', body: 'Once a meeting is booked, a "🔁 Log follow-up" button appears. Each tap timestamps it and adds to the follow-up counter on the card.', why: 'Stay on top of post-meeting nurture.', preview: 'followupChip' },
      { title: 'Archive when done', body: 'Closed-won, closed-lost, or paused — archive the card. It hides under the collapsible Archive section, restorable anytime.', why: 'Keep the working list clean.', preview: 'archiveCollapse' },
    ],
  },

  events: {
    tabId: 'events',
    intro: '🎪 Find Events — verified conferences and meetups where your buyers will actually be.',
    example:
      'Example: You search "Healthcare · Phoenix · next 60 days" and get 4 verified events with dates, venues, and a "who attends" line so you know if it\'s worth the trip.',
    steps: [
      { title: 'Verified events only', body: 'Every event is health-checked — no dead links, no ghost conferences. Filtered to the markets and verticals you care about.', why: 'No more wasted prep time.' },
      { title: 'Use it to time outreach', body: 'See an event your buyer attends? Reference it in your email. Conference relevance = open rate.', why: 'Specificity beats spray-and-pray.' },
    ],
  },

};

export const tourStorageKey = (tabId: string, bdrId?: string | null) =>
  `flare:tour:seen:${bdrId || 'global'}:${tabId}`;
export const exampleStorageKey = (tabId: string, bdrId?: string | null) =>
  `flare:example:open:${bdrId || 'global'}:${tabId}`;

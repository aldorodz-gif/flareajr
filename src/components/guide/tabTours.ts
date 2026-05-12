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
      { title: 'Your active pipeline lives here', body: 'Each card is one prospect with a 5-touch cadence over 21 days. Color-coded: green = sent, pink = today, red = overdue.', why: 'You see the whole journey at a glance.' },
      { title: 'Sequence Journey panel', body: 'Top of the tab: totals per step + due-today + overdue + a reminder for the oldest miss.', why: 'Catch slipping touches before they go cold.' },
      { title: 'Log how you connected', body: 'On each card pick LinkedIn / Email / Phone / In-person / Referral. Add notes about what was said.', why: 'Future-you will thank present-you.' },
      { title: 'Book the meeting', body: '"Book Disco Call" or "In-person" triggers a celebration and tags the lead. Made a mistake? Hit ↶ undo on the badge.', why: 'Wins should feel like wins.' },
      { title: 'Archive when done', body: 'Closed-won, closed-lost, or paused — archive the card. It hides under the collapsible Archive section, restorable anytime.', why: 'Keep the working list clean.' },
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

  tracker: {
    tabId: 'tracker',
    intro: '📡 Prompt Builder — assemble high-quality prompts for any AI tool, with the right context baked in.',
    example:
      'Example: You pick "Find expansion signals" + Healthcare + Phoenix. The builder produces a 6-line prompt you can paste into ChatGPT/Claude with vertical, market, ICP, and signal types pre-filled.',
    steps: [
      { title: 'Stop guessing prompts', body: 'Pick a goal, a vertical, a market — the builder constructs a prompt that includes the right framing, ICP, and constraints.', why: 'Better prompt in = better lead out.' },
      { title: 'Copy and paste anywhere', body: 'Use the output in any AI tool. Or come back here when you need a sharper variant.', why: 'Reusable across your stack.' },
    ],
  },

  signals: {
    tabId: 'signals',
    intro: '📋 Score Signals — paste a news headline or article and find out if it\'s a buying signal worth chasing.',
    example:
      'Example: You paste "Acme Corp opens new Phoenix office, hiring 40." Scorer returns 88/100, flags it as a relocation/expansion signal, and suggests targeting HR + Facilities titles.',
    steps: [
      { title: 'Triage signals fast', body: 'Drop in any article URL or headline. The scorer rates fit, freshness, and gives a reason in plain English.', why: '5-second go/no-go decision.' },
      { title: 'Auto-suggested next step', body: 'High-score signals show recommended buyer titles and a one-click path to draft outreach.', why: 'No "what do I do with this?" gap.' },
    ],
  },

  outreach: {
    tabId: 'outreach',
    intro: '✉️ Write Outreach — generate emails grounded in a real signal, in your tone.',
    example:
      'Example: Paste their company URL + the signal. Pick "Director of Operations" and tone "consultative". You get a 90-word email that mentions the signal, why housing matters, and a soft CTA.',
    steps: [
      { title: 'Signal-grounded emails', body: 'Tools here scrape the company, extract the signal, and suggest a buyer title before drafting. The email writes itself around real context.', why: 'Generic AI emails get ignored — these don\'t.' },
      { title: 'Pick a tone', body: 'Direct, warm, analytical, consultative, bold. Match the buyer, not your default.', why: 'Tone fit = reply rate.' },
      { title: 'One-click to pipeline', body: 'Save the draft and the lead lands in Prospects with a full 5-touch cadence scheduled.', why: 'Outreach → pipeline in one move.' },
    ],
  },
};

export const tourStorageKey = (tabId: string) => `flare:tour:seen:${tabId}`;
export const exampleStorageKey = (tabId: string) => `flare:example:open:${tabId}`;

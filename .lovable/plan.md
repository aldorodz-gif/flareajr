
## Full Flare Guide Review

### What's Already Strong ✅
- **The core thesis is clear and powerful**: "Demand signals are flares — spot them first." This is a genuinely new mental model for most BDRs.
- **Signal Scorer + Email Generator + Prompt Builder**: Three interactive AI tools that let people *do* the thing, not just read about it. This is what keeps people coming back.
- **Score Signals tab**: The pursue/skip table is the single best piece of content in the guide. It teaches pattern recognition fast.
- **Outreach tab**: The 4-sentence framework with good/bad examples is outstanding. The mobile hack is a great practical touch.
- **Mindset tab "What experienced reps miss"**: This section alone justifies the tab. It challenges assumptions without being preachy.
- **Contact tab buyer map**: Practical, actionable, organized by vertical. Strong.

### What Needs Work 🔧

**1. DeeperTab is orphaned — not in the tab bar or tour**
`DeeperTab.tsx` exists with a company research prompt but it's NOT in `TAB_ORDER` or the navigation. It's dead code. The company research prompt is one of the most valuable pieces — it should be accessible.

**Fix**: Either add it as its own tab or merge the research prompt into the ResultsTab (Work Your List) where it logically belongs — "you've triaged the signal, now research the company."

**2. Overview tab tries to do too much**
It explains what Flare is, lists the tools, shows service lines, AND walks through the 6-step flow. First-time users get overwhelmed. The "How to use it" box at the top duplicates what the guided tour already does.

**Fix**: Remove the "How to use it" box (the tour covers this now). Keep the service lines reference and the step-by-step flow — those earn re-reads.

**3. Mindset tab is positioned wrong**
It's tab 7 of 8. Most people will never scroll that far. But "What experienced reps miss" is the content that changes behavior. The "Simple framework" section (01-06) duplicates the Overview tab's step-by-step.

**Fix**: Remove the duplicated 6-step framework from Mindset (it's already in Overview). Keep the "real examples" and "what experienced reps miss" sections — those are the high-value content. Consider moving Mindset earlier in the tab order (after Setup, before Prompt Builder) so people see it before they start prospecting.

**4. Setup tab is instruction-heavy but has no "why should I care" hook**
It jumps straight into "Click + → More → Agent Mode" without establishing why Agent Mode matters. Someone who's never used it has no motivation to follow 5 steps.

**Fix**: Add a 1-sentence hook at the top: "Agent Mode turns ChatGPT into a live research assistant that searches the web for you in real time. Normal ChatGPT can't do this." Then the 5 steps feel worth following.

**5. ResultsTab is missing the company research prompt**
After triaging signals, the next natural step is "research the company before you call." But the DeeperTab prompt isn't accessible. The ResultsTab tells users to "Run the prompt on every HIGH account" but doesn't show which prompt.

**Fix**: Add the company research prompt from DeeperTab into the ResultsTab, right after the triage framework. This makes the flow: triage → research → call/email.

**6. No "what's new" or changelog mechanism**
The user asked if this will keep people engaged for updates. Right now there's no way for users to know when new content is added. They see the tour once, then it's dismissed.

**Fix**: Add a small "What's New" badge or section — could be a simple collapsible at the top of Overview that lists recent additions (e.g., "🆕 Theater vertical added", "🆕 Mobile email hack"). This gives returning users a reason to re-engage.

### Proposed Changes

1. **Merge DeeperTab research prompt into ResultsTab** — add it after the triage section
2. **Remove "How to use it" box from Overview** — tour handles this now
3. **Remove duplicated 6-step framework from Mindset** — already in Overview
4. **Add "why Agent Mode matters" hook to Setup tab**
5. **Move Mindset earlier in tab order** — after Setup (position 3)
6. **Add "What's New" section to Overview** — keeps returning users engaged
7. **Delete DeeperTab.tsx** — content merged into ResultsTab

### Impact
These changes make the guide tighter, less repetitive, and more actionable. The flow becomes: Tour → Overview (what + service lines) → Setup (get started) → Mindset (think differently) → Prompt Builder → Work Your List (with research built in) → Who to Call → Write Outreach → Score Signals.

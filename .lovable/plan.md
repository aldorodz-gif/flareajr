

# Make Flare Immediately Understandable to New Users

## The Problem
People open Flare and don't understand: **what is this**, **who is it for**, and **how does it help me**. The welcome modal says "demand signals are flares" — which means nothing to someone who hasn't used it. The header is equally vague. There's no clear value proposition.

## The Fix — Three Changes

### 1. Rewrite the Header to explain the value in plain English
**Current**: Giant "FLARE" wordmark + "Demand signals are flares — spot them first" + "Built for the NCH sales team"

**New**: Keep the FLARE wordmark but add a clear one-liner underneath:
- **Subtitle**: "The NCH BDR Prospecting Toolkit"
- **Value prop**: "Find companies that need housing now. Know who to call. Send the right message. Every morning in under 30 minutes."
- **What's inside**: A compact row of 5 tool badges — Prompt Builder, Signal Scorer, Email Generator, Event Finder, LinkedIn Strategy

This immediately tells someone: this is for BDRs, it helps with prospecting, and here are the tools.

### 2. Rewrite the Welcome Modal first slide to be concrete
**Current first slide**: "Your daily prospecting engine" / "Demand signals are flares..."

**New first slide**:
- **Title**: "Welcome to Flare"
- **Subtitle**: "5 AI tools to fill your pipeline"
- **Description**: "Flare helps NCH BDRs find companies with active housing needs, identify the right buyer, and send signal-specific outreach — without spending hours researching."
- **Detail**: "This 30-second walkthrough shows you each tool and how they connect into a daily routine."

### 3. Add a "What You'll Do Each Day" block to the Overview tab
Replace the current abstract intro with a concrete daily routine summary at the top:

> **Your daily routine with Flare (under 30 min)**
> 1. Check your overnight Prompt Builder results for new signals
> 2. Score them HIGH / MEDIUM / LOW in seconds
> 3. Find the right buyer title for each company
> 4. Send a signal-specific email or make the call
>
> **Weekly**: Find networking events. Post on LinkedIn.

This gives a BDR an immediate mental model of how this fits into their day.

## Files Changed
- `src/components/guide/Header.tsx` — Add subtitle, value prop line, and tool badges
- `src/components/guide/WelcomeModal.tsx` — Rewrite first tour step copy
- `src/components/guide/OverviewTab.tsx` — Add "Your daily routine" block above the current content

## What stays the same
Everything else — the tabs, tools, workflow steps, service lines reference. This is purely about the first 10 seconds of the experience.



## Problem
The Setup page has 5 dense step cards stacked vertically, each with gradient headers, mockup visuals, and paragraph-length descriptions. It feels like a wall of content — too much noise, hard to scan, and intimidating for someone just getting started.

## Plan: Make it warm, clean, and easy to follow

### 1. Add a friendly welcome intro
Replace the dry "Follow these 5 steps exactly" instruction with a warm, reassuring message: "This takes about 2 minutes. You'll do it once and never again." Frame it as easy, not technical.

### 2. Simplify the step cards
- **Reduce visual weight**: Swap the heavy gradient headers for clean, minimal numbered steps with a single accent color
- **Shorten copy**: Trim each step description to 1 sentence max — action-oriented, no fluff
- **Use a vertical timeline layout** instead of heavy bordered cards — a thin connecting line with numbered dots feels lighter and more progressive

### 3. Keep mockups but make them optional
- Collapse mockups into expandable "See what this looks like" toggles so the page isn't dominated by screenshots
- Step 1 mockup stays visible by default (it's the most important), others collapse

### 4. Add a confidence booster at the bottom
A small callout: "That's it — you're set up. Head to the Prompt Builder to build your first search." with a button to navigate there.

### Files changed
- `src/components/guide/SetupTab.tsx` — full redesign of layout, copy, and visual hierarchy

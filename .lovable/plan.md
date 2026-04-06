

## Analysis

The screenshot shows the static prompt box ("Your Market — Paste into Agent Mode") sitting at the top of the page. This is **redundant** — the interactive Custom Prompt Builder below does the same thing but better, generating a tailored version automatically. Having both creates confusion and the static block looks flat compared to the premium AI tool below it.

## Plan: Restructure the Tracker Tab

### 1. Remove the static prompt box
Delete the raw `[YOUR CITY, STATE]` prompt box and the "Replace [YOUR CITY, STATE]" helper text (lines 79-83). Users should use the builder instead.

### 2. Move the Prompt Builder to the top
Make the interactive AI tool the first thing users see after the page header. It's the hero of this step — it should lead.

### 3. Fold market examples into the builder as quick-select chips
Instead of a separate collapsible section with full prompt boxes, add clickable city chips (Huntsville, Nashville, Atlanta) inside the builder that auto-fill the city field. This keeps the examples useful without the boring collapsible block.

### 4. Move the schedule prompt below the builder
Keep the "Set your schedule" instruction and its prompt box after the builder, styled as a lightweight follow-up step (e.g., a small card or callout) rather than a standalone section.

### Files changed
- `src/components/guide/TrackerTab.tsx` — restructure layout, remove static prompt, add city preset chips to builder, reorder sections


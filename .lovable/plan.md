
# Redesign: Who to Call Tab

## Problems
1. **Feels like a PDF** — dense text blocks, flat white cards, everything the same visual weight
2. **Vertical titles section is a wall** — 8 verticals × 4 lines each = massive scroll of small text
3. **Discovery Tree examples are static paragraphs** — no interactivity, hard to scan
4. **No visual rhythm** — header → text → cards → text → cards → text with no variation

## Fixes

### 1. POC Finder Prompt → Hero treatment
Move the AI prompt into a styled card matching the AiToolCard pattern (dark gradient, LIVE indicator). It's the most actionable thing on the page — make it feel like a tool, not a text block.

### 2. Discovery Tree → Interactive accordion
Convert the 4 levels into an accordion — each level expands to show the description and hints. Compact by default, interactive to explore. The worked examples become expandable too.

### 3. Vertical titles → Tabbed/filterable cards
Instead of showing all 8 verticals at once, let users **click a vertical** to see its titles. Show a row of icon buttons (🔨 🛡️ 🏭 ⚡ 🏥 💻 🏀 🎭) and only display the selected vertical's card. Cuts visible content by 87%.

### 4. Visual variety
- Add the orange left-border accent on the "rule" callout
- Use icon pill backgrounds on the prioritization steps
- Add hover/transition effects on interactive elements

## Files changed
- `src/components/guide/ContactTab.tsx` — full restructure

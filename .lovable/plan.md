
# Redesign: Work Your List Tab

## Problems
1. **Flat layout** — everything is the same visual weight: white cards, light borders, text blocks
2. **Too much reading** — the morning routine steps are paragraph-heavy; the sample result is a plain table
3. **No visual hierarchy** — your eye doesn't know where to start or what matters most

## Fixes

### 1. Morning routine → Visual timeline with icons
Replace the 3 text-heavy numbered steps with a horizontal (desktop) / vertical (mobile) **visual timeline** using large icons and short action phrases instead of paragraphs:
- 📥 **Scan** → Pull HIGH signals
- 📝 **Log** → CRM: company + signal + service line  
- 🔍 **Research** → Run the prompt below

One line each. No paragraphs. The detail lives in the rest of the tab.

### 2. Sample result → More visual, less table
Add color-coded priority badge styling, a subtle gradient left-border accent, and break the dense table into a cleaner card with the signal as the hero element (larger text, highlighted).

### 3. Research prompt section → Collapsible
Keep the research prompt but wrap it in an expandable section so the page feels shorter on first load. The tip boxes stay inside.

### 4. Cross-reference cards → Add subtle icons and hover lift
Already decent but need slightly more visual pop — add colored icon backgrounds.

## Files changed
- `src/components/guide/ResultsTab.tsx` — restructure layout

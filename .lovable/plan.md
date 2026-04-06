## Outreach Tab Redesign

### Problems
1. **Too dense** — Call frameworks + email generator + email rules + examples all stacked without breathing room
2. **Competing visual patterns** — dark gradient blocks, white cards, gray stats bar, colored number pills all fighting for attention
3. **No clear two-act structure** — "Calling" and "Emailing" should feel like two distinct chapters, not a continuous scroll
4. **Stats bar is flat** — the email rules section (stats, tone rule, mobile hack, 4-part structure) blends into generic content
5. **Micro-closes and BANT look the same** — both are card stacks, making them blur together

### Redesign approach

**1. Two-chapter toggle layout**
- Replace the long scroll with a prominent **📞 Calling / ✉️ Emailing** toggle at the top
- Each chapter gets full focus when selected — no scrolling past content you're not using right now
- This cuts perceived page length in half

**2. Call chapter cleanup**
- Micro-closes: convert from heavy gradient-header cards to a clean **accordion** style — numbered steps that expand on click, showing the phrase and explanation
- BANT: keep the 2×2 grid but soften it — use the warm tan/gold palette instead of dark purple gradients
- Add a brief intro explaining "these aren't scripts — they're frameworks"

**3. Email chapter cleanup**
- Keep the AI generator as the hero (it's the star)
- Merge the stats bar, tone rule, and mobile hack into a single **"Email Rules"** expandable card below the generator — clean and tucked away until needed
- The 4-part email structure stays visible but uses the timeline/step style from the new Setup tab for consistency

**4. Visual consistency**
- Use the design system colors (warm tan `#D7CFC5`, gold `#D6B07A`, navy `#2F4858`) for structural elements
- Reserve dark gradient only for the AI generator tool
- Warm white `#FAF7F2` cards for content sections

### Files changed
- `src/components/guide/OutreachTab.tsx` — full restructure with toggle, accordion micro-closes, cleaner email rules

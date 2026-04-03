

## Vetting Theater / Performing Arts Content

### What's Already Good
- **Score Signals tab**: The pursue/skip row is accurate — LORT theaters and 30+ day runs vs. single-night touring stops is the right filter
- **Who to Call tab**: Company Manager as primary contact is correct for LORT theaters; GM and Production Manager are strong secondaries
- **Prompt Builder tab**: Theater is listed as a vertical option
- **Work Your List tab**: The signal, buyer, angle, and sample email are structurally solid

### Issues Found

**1. ResultsTab sample email — too generic, misses the user's real selling points**
The current email doesn't mention the specific housing categories the user actually sells into: cast, directors, creative teams, production/technical crew, touring staff. The user's own email (uploaded) lists these explicitly and they matter — theater buyers think in those terms.

**2. ResultsTab signal description — could be more specific**
"3 productions this spring/summer" is fine but doesn't mention rehearsal periods, which often start 3-4 weeks before opening and are a separate housing need.

**3. ContactTab non-traditional titles — missing key roles**
Missing "Housing Coordinator" (some LORT theaters have this dedicated role) and "Artistic Director" (at smaller companies, they often make housing decisions).

**4. Signal-scorer edge function — no theater-specific context**
The system prompt is generic. It works but doesn't know that theater productions = 30+ day runs = HIGH signal. A theater signal like "Cleveland Playhouse announces spring season" might score MEDIUM when it should score HIGH.

**5. Email-generator edge function — reference email is only sports**
The reference email (Cedrick's NBA outreach) is great for sports but the AI has no theater-specific reference for tone. Adding a brief theater reference would improve output quality.

**6. TrackerTab SIGNAL_TYPES — no theater-relevant option**
Options like "Contract award" and "Office relocation" don't map to theater. Should add "Production season / touring" or similar.

**7. ResultsTab angle text — "one relationship solves housing across the full season"**
This is the strongest value prop for theater and it's buried in a small card. The email should lead with the recurring/seasonal angle more explicitly.

### Plan

1. **Update ResultsTab theater vertical data**
   - Revise signal body to mention rehearsal periods as separate housing window
   - Revise email to reference specific housing categories (cast, crew, creative teams) matching user's real pitch
   - Strengthen the angle to emphasize "one partner across the full season"

2. **Update ContactTab theater non-traditional titles**
   - Add Housing Coordinator and Artistic Director

3. **Update TrackerTab SIGNAL_TYPES**
   - Add "Production season or touring" as an option

4. **Update signal-scorer edge function**
   - Add theater/performing arts context to the system prompt so production seasons score correctly

5. **Update email-generator edge function**
   - Add a brief theater-specific reference alongside the sports one so the AI generates better theater emails

### Technical Details
- Files modified: `ResultsTab.tsx`, `ContactTab.tsx`, `TrackerTab.tsx`, `signal-scorer/index.ts`, `email-generator/index.ts`
- Edge functions will auto-deploy after changes


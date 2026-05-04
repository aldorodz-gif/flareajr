## Why the breakdown is still empty

- The Supabase query `select * from bdr_snapshots` returns `[]` — nothing has ever been saved to the backend.
- The previous change made parsing work without sign-in, but only stored results in React state. On every reload, that state resets to empty, so `overrides['__members']` is undefined and the table renders the "click Refresh" empty state.
- The user is not signed in, so the conditional `supabase.from('bdr_snapshots').upsert(...)` never runs.

## Fix

1. **Persist parsed snapshot to `localStorage`** in `BdrScoreboard.tsx`:
   - On successful parse, write `{ overrides, meta }` to `localStorage['bdr_snapshot_v1']`.
   - On mount, hydrate state from `localStorage` first, then overlay any backend rows (so signed-in users still get the latest server copy).

2. **Surface what parsed** so we can diagnose mismatches:
   - In the success toast, include `parsed.diagnostics.memberCount` and the count of unique regions found.
   - If `memberCount === 0`, show a destructive toast listing the sheet names that were inspected and the first row of the standings sheet, so we can tell whether the workbook layout changed.

3. **Make the breakdown render even when the standings mapping is missing**:
   - Today, members get `region: ''` if `2026 Standings` doesn't list them; the Southeast/NYC filters then exclude them silently.
   - For the **Full Team** view, region doesn't matter — list every member regardless.
   - For region views, fall back to a name-based mapping for the two known BDRs (Hallie → Southeast, Matt → Northeast) so at least those always appear.

4. **Tiny UX nudge**: when `__members` is missing on initial load (no localStorage, no backend row), keep the existing "click Refresh" message but also prompt the user to upload directly from that empty state via a button.

## Files touched

- `src/components/guide/BdrScoreboard.tsx` — add `localStorage` hydrate + persist, expand toast diagnostics, add inline upload button in the empty breakdown state, and the Full Team fallback.
- `src/components/guide/bdrXlsxParser.ts` — when a member name isn't found in `2026 Standings`, infer region from a small built-in map so region rollups still aggregate them.

## Out of scope

- No schema changes; `bdr_snapshots` stays as-is.
- No auth changes; sign-in still optional.

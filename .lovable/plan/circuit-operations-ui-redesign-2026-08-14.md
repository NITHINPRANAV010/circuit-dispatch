# CIRCUIT — Operations UI Redesign

Port the existing CIRCUIT app (vanilla HTML/CSS/JS repo) into this React + TanStack Start project, keeping every piece of business logic byte-for-byte, and rebuild only the view layer in the new industrial "logistics control center" design.

## What stays untouched

These four modules move over verbatim (only an `export` line added at the bottom, no formula or data edits):

- `data.js` — demo seed (Truck #42, 10T/4T, Chennai→Bangalore; Demand #1001, 4T, ₹8,000)
- `matching-engine.js` — weighted scoring (0.30 capacity, 0.25 route, 0.20 time, 0.10 price, 0.10 distance, 0.05 reliability → ~93 for the golden pair, computed not hardcoded)
- `opportunity-predictor.js` — opportunity probability + estimated value
- `state.js` — localStorage store (`circuit_v2_state`), login, capacities, demands, matches, transactions, accept/reject, metrics

The React layer only calls these; it never re-implements a calculation.

## What gets rebuilt

The vanilla router, `components.js`, `app.js` shell and all `js/pages/*` render functions are replaced by React routes/components that render the same data through the same State calls.

Routes (mapping old hash routes to real URLs):

```text
/                 landing (story scroll)
/login            login / register
/dashboard        operations overview
/capacity         capacity list + new entry (manifest form) + CIRCUIT analysis panel
/demand           demand list + new request ticket
/matches          match engine results
/matches/$id      match detail (route-first) + accept
/transactions     ledger
/analytics        utilization report
/network          SVG capacity network (was map)
```

Auth guard mirrors the existing `sessionStorage` user behaviour; unauthenticated app routes redirect to `/login`.

## Design system

Dark industrial tokens in `src/styles.css` (oklch equivalents of):
bg `#080A0C`, surface `#101417`, elevated `#151A1D`, border `#273035`, text `#E9EEF0` / `#7D898F`, signals green `#B7F34A`, cyan `#62D8D3`, amber `#F2B84B`, red `#FF6259`.
Radii 4 / 8 / 12px only. Inter for prose, JetBrains Mono for all IDs, tonnages, scores, distances, times, statuses. Thin borders and spacing carry hierarchy — no glass, no gradients, no glow, no oversized shadows.

Signature components built once and reused:

- **Capacity Rail** — segmented 10-cell bar (loaded vs open) with truck ID, totals; replaces every progress bar.
- **Route Line** — node ━━ node with distance, open tonnage, direction motion.
- **Match Index** — `93 / 100 EXCELLENT` plus six labelled ASCII-style score bars.
- **Signal Panel** — `⚡ OPPORTUNITY DETECTED` operational alert (not an AI card).
- **Ledger Table** — monospace rows for transactions.
- Loading state = match-engine console (`Comparing 128 capacity signals…`); empty state = `NO ACTIVE OPPORTUNITIES / CIRCUIT is monitoring…`.

Sidebar: compact `CIRCUIT` + OPERATIONS / FINANCE / SYSTEM groups, line icons, collapses to a drawer on mobile. Dashboard header shows `OPERATIONS / OVERVIEW`, day · date · time, `● CIRCUIT MONITORING`.

Dashboard layout: network visualization as the centerpiece, KPI strip (potential revenue, capacity recovered, active vehicles, matches, estimated CO₂ marked as a demo estimate) integrated as a bordered rail rather than floating cards, opportunity signal panel and utilization block beneath.

Landing page: hero `6 TONNES ARE LEAVING EMPTY.` with the TRK-042 rail, then a scroll story — unused → detected → demand → connected → 40%→80% → model → `ENTER CIRCUIT →`.

Motion: CSS/SVG only (route dash movement, count-up, rail fill, score reveal, status pulse). No animation library, no confetti.

## Build order

1. Tokens, fonts, shell + sidebar, shared primitives (rail, route line, match index, panels).
2. Logic modules ported and wired to a React State hook.
3. Golden-path screens: landing → login → dashboard → capacity → demand → matches → match detail → accept → transactions → analytics.
4. Network SVG view.
5. Per-route `head()` metadata.

## Validation

Drive the full golden path in a headless browser: landing → login → dashboard → add capacity → opportunity detected → create demand → run match engine → match detail (~93) → accept → transaction created → dashboard + analytics updated → reload and confirm localStorage state persists, with a clean console.

## Technical notes

- Logic modules land in `src/lib/circuit/` as ES modules; browser-only APIs (localStorage/sessionStorage) are read inside effects so SSR/prerender stays safe.
- No backend, no Cloud: state stays in localStorage exactly as today.
- No new runtime dependencies; charts are hand-rolled SVG/CSS so nothing can fail to load.

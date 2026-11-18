# Visual upgrade plan — Forma software factory

Scope: polish only. No new features, sections, data or behaviors. Keep the dark industrial direction, frontend-only scope and existing layout (chat left, preview right).

## 1. Design foundation
- Refine the token set in the stylesheet: a layered graphite scale (base, panel, raised, inset), one acid-lime accent plus muted amber/red/cyan status tones, consistent borders and hairlines.
- Add texture: subtle noise/grain overlay, faint dot-grid only on canvas areas, stamped corner marks on key panels for a "machined plate" feel.
- Typography: tighten the scale (display, heading, body, mono label), uppercase tracked micro-labels, tabular numbers for counters and metrics.
- Unify spacing, 4px radii, focus rings and shadow/inset depth across all surfaces.

## 2. Workspace shell
- Rail and header: clearer active states, accent indicator bar, compact project/status badge with live run pulse.
- Resizable-looking split with a textured divider; consistent panel headers (title, meta, actions).
- Better empty, loading and reduced-motion states.

## 3. Chat panel
- Message styling: distinct user plate vs agent output, timestamps and role labels in mono.
- Tool disclosures: status-colored left edge, icon per state, smoother open/close.
- Streaming: refined cursor, softer word fade-in, shimmer for thinking/working phases, run bar as a slim progress strip.
- Composer: raised plate, clearer attachment chips, stronger send/stop states; suggestion chips restyled as tactile keys.

## 4. Infrastructure preview
- File tree: indent guides, folder/file icons by type, changed-file glow, compact +/- pills, sticky root header.
- Diff view: gutter shading, word-level emphasis contrast, hunk separators, sticky file header with stats bar.
- Source view: line-number gutter and current-line highlight.

## 5. Frontend preview and other renderers
- Device frame: industrial bezel, cleaner device toggle segment.
- Dispatch console, API, data, terminal, document views: consistent card headers, status chips, sparkline-style metric styling, CRT-like terminal tint.

## 6. Review window
- Stronger window chrome and header with revision, approval and merge status as a step track.
- Explanation report: better image framing with captions, cleaner change graph (colors match diff tones), numbered breakdown cards.
- Merge area: clear disabled/ready/merged states; keep "simulated" label visible.

## 7. Motion and responsiveness
- Shared easing/duration tokens; staggered panel entrance, tab underline slide, hover lift on interactive plates.
- Respect reduced motion everywhere.
- Verify mobile and tablet layouts don't overflow; stack panels cleanly.

## Technical notes
- Changes live mainly in `src/styles.css` (semantic OKLCH tokens) and presentational markup in `src/components/workspace/*`; no changes to `chat-demo.ts`, `infrastructure.ts`, `task-review.ts` logic or the conversation hook.
- Run existing Vitest suites and Playwright screenshots (desktop 1280, mobile) to confirm nothing regresses.

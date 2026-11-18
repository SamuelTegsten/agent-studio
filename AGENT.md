# Agent implementation guide

Read `AGENTS.md` first. It contains repository rules, including the platform-managed section. This guide describes the current frontend and the boundaries future development must preserve.

## Product and scope

Forma is an agentic-development workspace. Its initial project is the fictional Dispatch job orchestration system. The application is deliberately **frontend only**: there are no model calls, accounts, remote file operations, persistence, deployments, or actual project editing. Never make a demo result sound like executed work.

The user selected one conversation with no persistence. State resets on refresh. Do not add conversation threads or browser storage without a new request.

## Implementation map

- `src/routes/index.tsx`: the home page and leaf-specific social metadata.
- `src/routes/__root.tsx`: document shell, font links, shared stylesheet, error boundaries, and QueryClient provider.
- `src/components/workspace/development-workspace.tsx`: the workspace shell, chat state, attachment controls, preview tabs, screen sizes, menus, and dialogs.
- `src/components/workspace/brand.tsx`: the Forma identity mark.
- `src/components/workspace/studio-preview.tsx`: optional legacy architectural fixture.
- `src/lib/chat-demo.ts`: AI SDK-compatible sample messages and deterministic demo responses.
- `src/components/ai-elements/`: installed chat primitives. Use these for conversation, markdown, input, activity tools, and loading states.
- `src/components/ui/`: shared shadcn/Radix controls.
- `src/styles.css`: all visual tokens, typography, workspace layout, preview styling, animations, and breakpoints.
- `src/assets/architecture.asset.json`: uploaded asset pointer; use its URL rather than an external image hotlink.

## Message and interaction contracts

Messages are `UIMessage[]`, rendered from `parts`. Text goes through `MessageResponse`; tools use `Tool`, default closed, inside assistant messages. User bubbles use a deliberate semantic background/foreground pair. Assistant messages are unfilled.

Sending appends the user message immediately. `use-demo-conversation` runs thinking, progressive text, and simulated tool phases using one cancellable timer. Stop preserves partial text and removes unfinished tool fixtures. Replay runs three typed sample turns, with a pause between checkpoints. Reduced motion reveals complete text without word animation. These delays are simulation, not inference retries or timeouts. Clear them on reset/unmount and never allow concurrent sends. Keep textarea focus after normal sending and stop, but not while a dialog owns focus.

Attachments use AI Elements' validated local attachment context. They remain local to the session and are not uploaded or processed. Export creates a Markdown download. Clipboard and fullscreen actions catch browser restrictions. Preview refresh remounts the preview, not the page. Build/Plan changes only the demo response, not the project.

## Design and accessibility

Use OKLCH semantic tokens in `src/styles.css`; no raw colors in feature JSX. Use DM Sans and Manrope with IBM Plex Mono for industrial labels. Keep the shell dark, graphite, and sharply framed with acid-lime action accents. Do not add a theme toggle. Use shared Button controls and Radix menus/dialogs. Icon actions need accessible names and tooltips. Respect reduced motion, maintain keyboard navigation, and avoid nested interactive elements.

Desktop has navigation, chat, and preview columns. On small screens, the navigation switches between chat and preview. The mobile-preview control changes the inner preview width independently of the outer viewport. Avoid horizontal overflow and text/control overlap.

## Verification

Run focused Vitest tests with `bunx vitest run`. Run lint on touched source. The managed preview runs builds/typechecks automatically; do not manually run application builds. Check `/tmp/observability/build-errors.log` and use Playwright against `http://localhost:8080` to verify send, stop, tools, attachments, menus, download, reset, and desktop/mobile layout. Keep temporary scripts/screenshots outside the repository.

## Future integrations

Backend work requires explicit scope expansion. Enable Lovable Cloud before persistence, authentication, or external API execution. Keep inference and secrets server-side and follow the installed Gateway SDK contract. Use TanStack Start server functions for internal actions. Never replace the fixed router or hand-edit generated route/model files.

## Adaptive software outputs

`src/lib/artifacts.ts` defines the typed artifact catalog, per-kind sample source, job fixtures, and deterministic API simulator. `src/components/workspace/artifact-preview.tsx` owns the renderer registry for web, API, data, terminal, and document outputs. Selecting an artifact changes the renderer, address, kind, and source together. Add new kinds through the catalog, source map, and renderer registry, not ad hoc page switches.

API Send simulates GET /v1/jobs and /v1/health, returning 404 for unknown paths and 405 for unsupported methods. Data supports local filtering and schema inspection. Terminal accepts only fixture commands (help, status, jobs, clear); never execute user commands on the host. Documents render a local blueprint. Device framing applies only to the web output. All execution remains simulated; the product may build full-stack software in the future, but this delivery implements only the frontend.

## Infrastructure-first preview

The primary preview sections are Infrastructure (default) and Frontend (conditional on `projectCapabilities.hasFrontend`). `infrastructure.ts` owns sample before/after code, diff computation using the diff package, change counts, section availability, and the complete sample file manifest/tree. `infrastructure-preview.tsx` renders the project root and all folders expanded initially, with selectable unchanged files, changed-file addition/deletion counters, unified diffs, line numbers, and proposed source. Folder expansion and file selection are ephemeral. Selecting a changed file opens Changes; unchanged files open Source. Diffs are labeled sample changes and are not actual filesystem edits. Frontend renders the web artifact only; device controls belong to that section.

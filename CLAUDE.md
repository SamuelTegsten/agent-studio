# Claude project guide

## Start here

Read `AGENTS.md` for repository/platform rules and `AGENT.md` for the full implementation map. Do not duplicate or override the platform-managed block.

This is a React 19 + TanStack Start/Router + Tailwind CSS v4 frontend. Bun is the package manager. Shared UI uses shadcn/Radix; chat uses installed AI Elements and the AI SDK `UIMessage` shape. It is not a Next.js app and has no `App.tsx` switcher.

## Non-negotiable scope

- Frontend only. Do not add an API, model inference, authentication, database, analytics, or deployment integration for a visual request.
- One conversation, reset on refresh. No localStorage, IndexedDB, cookies, or thread list for chat history.
- Replies are deterministic demo output. Keep the simulation label visible; do not claim chat changed code or published a site.
- Dispatch and its job/service records are sample fixtures, not running services.

## Development patterns

1. Read the files you will change and preserve existing boundaries.
2. Add dependencies before importing them. Keep generated files untouched.
3. Use `src/styles.css` for colors, fonts, shadows, layout, and animation. Define tokens before referencing them.
4. Use shared Button and accessible menus/dialogs, and AI Elements for chat surfaces. Do not hand-roll duplicate chat/composer/tool primitives.
5. Keep tools collapsed. Render text from message parts using `MessageResponse`.
6. Keep local UI state in the workspace. The demo helper owns sample content and response behavior; the portfolio component owns the inner preview.
7. Avoid TypeScript non-null assertions, untyped escape hatches, and render-time browser storage. Browser APIs belong in effects or event handlers.
8. Every content route gets its own descriptive head metadata. Root metadata is not a substitute.

## Useful commands

```sh
bun install
bunx vitest run src/test/app-routing.test.tsx src/test/chat-demo.test.ts
bun run lint
```

The development server is platform-supervised on port 8080. Source edits refresh it. Do not restart it, edit generated route output, or run app builds/typechecks manually; the platform handles those checks. Inspect the newest build log after edits. Do not suppress failures to get a green result.

## Acceptance checklist

- Chat appends real input, indicates pending state, supports cancellation, and returns an honest demo response.
- Attachment names appear and can be removed; files are not sent remotely.
- Preview and code tabs work, the device control changes framing, and refresh does not reset chat.
- Tool disclosures start closed and open with keyboard or pointer.
- Clipboard/export and reset actions have actual outcomes.
- Desktop/mobile layouts remain readable and do not overflow.
- No secrets, backend calls, storage, or unintended new routes were introduced.
- Tests pass and the current preview has no build/runtime errors.

When extending architecture, update `AGENTS.md` with one concise rule and why, and update these guides only where the actual implementation changed.

## Adaptive software outputs

`src/lib/artifacts.ts` defines the typed artifact catalog, per-kind sample source, job fixtures, and deterministic API simulator. `src/components/workspace/artifact-preview.tsx` owns the renderer registry for web, API, data, terminal, and document outputs. Selecting an artifact changes the renderer, address, kind, and source together. Add new kinds through the catalog, source map, and renderer registry, not ad hoc page switches.

API Send simulates GET /v1/jobs and /v1/health, returning 404 for unknown paths and 405 for unsupported methods. Data supports local filtering and schema inspection. Terminal accepts only fixture commands (help, status, jobs, clear); never execute user commands on the host. Documents render a local blueprint. Device framing applies only to the web output. All execution remains simulated; the product may build full-stack software in the future, but this delivery implements only the frontend.

# Upgrade plan for Claude Code (embedding Forma into a host project)

This project is a frontend-only, embeddable agentic-development workspace: a chat panel (left) and a preview panel (right), plus a review window. It has no app navigation, header or sidebar — the host project owns those.

## 1. What to import

| Keep | Path | Purpose |
| --- | --- | --- |
| Workspace | `src/components/workspace/development-workspace.tsx` | Chat + preview layout (root component `DevelopmentWorkspace`) |
| Preview | `src/components/workspace/infrastructure-preview.tsx`, `artifact-preview.tsx`, `studio-preview.tsx` | Infrastructure diff tree, Frontend renderer, other output kinds |
| Review | `src/components/workspace/task-review.tsx`, `src/lib/task-review.ts` | Review window, revision model, simulated merge |
| Demo logic | `src/hooks/use-demo-conversation.ts`, `src/lib/chat-demo.ts`, `src/lib/infrastructure.ts`, `src/lib/artifacts.ts` | Simulated conversation, fixtures, diffs |
| UI kit | `src/components/ai-elements/*`, `src/components/ui/*` | AI Elements + shadcn primitives |
| Styles | `src/styles.css` | All tokens, layout and motion |
| Tests | `src/test/*` | Behavior tests to keep green |

Do not import `src/routes/*` as-is; mount `<DevelopmentWorkspace />` in a host route instead.

## 2. Integration steps

1. Install dependencies used here: `diff`, `ai`, `streamdown`, `lucide-react`, Radix/shadcn packages (see `package.json`).
2. Copy the files above, preserving the `@/` alias.
3. Merge `src/styles.css`: copy the `:root` tokens, `@theme inline` map and the component class blocks. Rename tokens if the host already defines `--primary` etc. Note `.workspace` uses `height: 100dvh` — change to `height: 100%` when mounting inside a host shell.
4. Load fonts (DM Sans, Manrope, IBM Plex Mono) via the host's `<link>` tags.
5. Render the workspace inside the host layout area that should hold chat + preview.
6. Run `bunx vitest run src/test` in the host.

## 3. Replace simulation with real behavior (in order)

1. **Conversation:** swap `use-demo-conversation` for the AI SDK `useChat` hook; messages already use the `UIMessage` shape, so `MessageResponse` and tool parts render unchanged. Keep the stop/cancel and phase states.
2. **Tools:** map real tool calls to the existing `Tool` disclosure states (`input-available`, `output-available`, `output-error`).
3. **Infrastructure:** replace fixtures in `src/lib/infrastructure.ts` with the host's file manifest and before/after contents; `fileDiff()` and `diffStats()` work on any strings.
4. **Frontend preview:** replace the web artifact renderer with an iframe of the real preview URL, keeping device controls.
5. **Review & merge:** back `src/lib/task-review.ts` with real revisions; wire "Merge into master" to the host's Git/PR service. Keep approval bound to the latest revision.
6. Remove the "simulated" labels only once each surface is backed by real data.

## 4. Visual polish backlog (no new features)

- Draggable split between chat and preview (currently fixed widths).
- Syntax highlighting in diff/source views (e.g. Shiki) while keeping diff tones.
- Virtualized file tree and diff for large projects.
- Light theme variant via the existing token set.
- Visual regression screenshots for desktop and mobile.

## 5. Constraints to preserve

- Tokens only in `src/styles.css`; no hardcoded colors in components.
- Tool disclosures start collapsed; reduced-motion respected.
- Never execute user terminal input on a host; never claim a merge happened without a real backend.
- Mobile (<760px) shows one panel at a time with the in-panel toggle buttons.

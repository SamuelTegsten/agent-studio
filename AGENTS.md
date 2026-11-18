<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.

<!-- LOVABLE:END -->

## Project architecture

- Keep the application frontend-only with ephemeral single-conversation state; this preserves the requested scope and refresh behavior.
- Compose the workspace in `src/components/workspace` and keep demo messages/replies in `src/lib/chat-demo.ts`; separating simulation from presentation makes the lack of inference explicit.
- Use installed AI Elements for transcript, message Markdown, composer, and tool disclosures; this preserves accessible, SDK-compatible chat foundations.
- Keep all visual design in `src/styles.css` through semantic OKLCH tokens; one design source keeps workspace and preview styling consistent.
- Use TanStack file routes and leaf head metadata, with the workspace on `/`; this preserves the platform router and usable entry page.
- Store app imagery through asset JSON pointers rather than external hotlinks; this keeps media in the project asset flow.

- Define output kinds in a typed catalog and renderer registry, with matching per-kind source previews; this allows software artifacts beyond browser pages without coupling their UI state.

- Keep simulated conversation timing and cancellation in `use-demo-conversation`, with typed scenarios in `chat-demo.ts`; one scheduler preserves partial output and prevents replay/send races.

- Default the preview to Infrastructure and expose Frontend only for projects with UI; use the diff library on before/after fixtures so changes and proposed source stay consistent.
- Derive the expanded project explorer from a complete sample file manifest, with per-file revisions and optional artifact links; this keeps unchanged files browsable and changed-file counters aligned with the selected diff.
- Keep task reviews in an ephemeral revision model with an independent AI Elements conversation using the shared demo scheduler; approval applies only to the latest revision and merge is explicitly simulated, preventing real repository claims.
- Ship the workspace as an embeddable chat + preview surface without app navigation chrome; host projects own navigation, see docs/UPGRADE_PLAN.md.
- Ship shared-session presence and single-driver control as local fixtures in src/lib/collaboration.ts; one driver per agent run prevents conflicting instructions, and nothing is synced.
- Keep QA execution and system topology in deterministic fixture models with explicit simulation labels; this provides trust and architecture inspection without claiming tests ran or services were discovered.

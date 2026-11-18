import type { UIMessage } from "ai";
import type { DemoScenario } from "./chat-demo";
import { projectFiles, sourceDiff, type ProjectFile } from "./infrastructure";

export type ReviewState = {
  files: ProjectFile[];
  revision: number;
  approvedRevision: number | null;
  mergedRevision: number | null;
};
export function initialReview(): ReviewState {
  return {
    files: projectFiles.map((file) => ({ ...file })),
    revision: 1,
    approvedRevision: null,
    mergedRevision: null,
  };
}
export function canMerge(state: ReviewState, busy: boolean) {
  return !busy && state.approvedRevision === state.revision && state.mergedRevision === null;
}
export function mergeReview(state: ReviewState, busy: boolean): ReviewState {
  return canMerge(state, busy) ? { ...state, mergedRevision: state.revision } : state;
}
export function applyReviewRequest(state: ReviewState, input: string): ReviewState {
  if (state.mergedRevision !== null || !/add\s+`?updated_at`?/i.test(input)) return state;
  const schema = state.files.find((file) => file.path === "database/schema.sql");
  if (!schema || schema.after.includes("updated_at")) return state;
  return {
    ...state,
    revision: state.revision + 1,
    approvedRevision: null,
    files: state.files.map((file) =>
      file === schema
        ? {
            ...file,
            after: file.after.replace(
              "  created_at timestamptz NOT NULL DEFAULT now(),",
              "  created_at timestamptz NOT NULL DEFAULT now(),\n  updated_at timestamptz NOT NULL DEFAULT now(),",
            ),
          }
        : file,
    ),
  };
}
export function reviewChanges(files: ProjectFile[]) {
  return files
    .filter((file) => file.before !== file.after)
    .map((file) => {
      const lines = sourceDiff(file.before, file.after);
      return {
        file,
        lines,
        additions: lines.filter((line) => line.type === "added").length,
        deletions: lines.filter((line) => line.type === "removed").length,
      };
    });
}
export const reviewMessages: UIMessage[] = [
  {
    id: "review-intro",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "**Ready for your review.** The sample revision tightens the job schema, documents API errors, and makes worker failures visible.\n\nAsk about a file, or request **Add updated_at to the schema** to see a local revision update. Nothing is connected to a repository.",
      },
    ],
  },
];
export function reviewResponse(input: string): DemoScenario {
  const text = /add\s+`?updated_at`?/i.test(input)
    ? "I’ve prepared `updated_at timestamptz NOT NULL DEFAULT now()` in the local schema proposal. If it is already present, no new revision is needed.\n\nThis records an initial value only; automatic updates would need a trigger or application write. Inspect the schema diff and approve the latest revision before the demo merge. No migration was executed."
    : /risk|safe|test/i.test(input)
      ? "### What still needs checking\n\n- Existing job states must satisfy the new constraint.\n- Confirm that failure recording cannot hide the original worker error.\n- Add contract tests for the documented API response.\n\n**No checks were executed.** This review contains sample source, not a production readiness verdict."
      : /schema|data|updated/i.test(input)
        ? "The schema proposal limits status values and adds an attempt counter and creation timestamp. This makes jobs easier to trace.\n\nRequest **Add updated_at to the schema** to extend the sample diff. Other changes are discussion only in this frontend demo."
        : "### Changes in plain language\n\n1. **API:** documents success and not-found responses for the jobs endpoint.\n2. **Data:** adds allowed statuses, attempts, and creation time.\n3. **Worker:** catches execution failures and records them for review.\n4. **Docs:** adds an operator-review checkpoint.\n\nYour request stays in this review conversation. Arbitrary code changes are not executed; the supported sample alteration is **Add updated_at to the schema**.";
  return {
    title: "Review revision",
    artifact: "data",
    prompt: input,
    parts: [{ type: "text", text }],
    suggestions: ["What are the risks?", "Add updated_at to the schema"],
  };
}

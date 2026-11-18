import { diffLines } from "diff";
import { artifactCode, type ArtifactKind } from "./artifacts";

export type PreviewSection = "infrastructure" | "frontend";
export const projectCapabilities = { hasFrontend: true };
export function availableSections(hasFrontend: boolean): PreviewSection[] {
  return hasFrontend ? ["infrastructure", "frontend"] : ["infrastructure"];
}
export const infrastructureFiles = [
  { kind: "api", path: "services/jobs.openapi.json", label: "Jobs API" },
  { kind: "data", path: "database/schema.sql", label: "Job store" },
  { kind: "terminal", path: "workers/queue.ts", label: "Queue worker" },
  { kind: "document", path: "docs/architecture.md", label: "Blueprint" },
] as const;
export const revisedCode: Record<ArtifactKind, string> = {
  ...artifactCode,
  api: artifactCode.api.replace(
    '"summary": "List jobs"',
    '"summary": "List jobs", "responses": {"200": {"description": "Success"}, "404": {"description": "Not found"}}',
  ),
  data: artifactCode.data.replace(
    "  status text NOT NULL,",
    "  status text NOT NULL CHECK (status IN ('queued', 'running', 'passed', 'failed')),\n  attempt_count integer NOT NULL DEFAULT 0,\n  created_at timestamptz NOT NULL DEFAULT now(),",
  ),
  terminal:
    'async function processQueue(queue: Queue) {\n  for await (const job of queue) {\n    try {\n      await execute(job);\n      console.log("completed", job.id);\n    } catch (error) {\n      await recordFailure(job.id, error);\n      console.error("review_required", job.id);\n    }\n  }\n}\n\n// Illustrative worker source; not executed.',
  document: artifactCode.document.replace(
    "Contract tests → Build → Health checks",
    "Contract tests → Build → Health checks → Operator review\n\nUnknown outcomes require review before replay.",
  ),
};
export function fileDiff(kind: ArtifactKind) {
  let oldLine = 1;
  let newLine = 1;
  return diffLines(artifactCode[kind], revisedCode[kind]).flatMap((change) => {
    const lines = change.value.split("\n");
    if (lines.at(-1) === "") lines.pop();
    return lines.map((content) => ({
      content,
      type: change.added
        ? ("added" as const)
        : change.removed
          ? ("removed" as const)
          : ("context" as const),
      oldLine: change.added ? null : oldLine++,
      newLine: change.removed ? null : newLine++,
    }));
  });
}
export function diffStats(kind: ArtifactKind) {
  const lines = fileDiff(kind);
  return {
    additions: lines.filter((line) => line.type === "added").length,
    deletions: lines.filter((line) => line.type === "removed").length,
  };
}

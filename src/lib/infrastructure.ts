import { diffLines } from "diff";
import { artifactCode, type ArtifactKind } from "./artifacts";

export type PreviewSection = "infrastructure" | "qa" | "topology" | "frontend";
export const projectCapabilities = { hasFrontend: true };
export function availableSections(hasFrontend: boolean): PreviewSection[] {
  return hasFrontend
    ? ["infrastructure", "qa", "topology", "frontend"]
    : ["infrastructure", "qa", "topology"];
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
  return sourceDiff(artifactCode[kind], revisedCode[kind]);
}
export function sourceDiff(before: string, after: string) {
  let oldLine = 1;
  let newLine = 1;
  return diffLines(before, after).flatMap((change) => {
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

export type ProjectFile = {
  path: string;
  kind?: ArtifactKind;
  before: string;
  after: string;
};
function unchanged(path: string, source: string): ProjectFile {
  return { path, before: source, after: source };
}
export const projectFiles: ProjectFile[] = [
  unchanged(".gitignore", "node_modules/\ndist/\n.env\n"),
  unchanged(
    "README.md",
    "# Dispatch\n\nJob orchestration workspace.\n\nThis project tree is a local sample; services are not running.\n",
  ),
  unchanged(
    "package.json",
    '{\n  "name": "dispatch",\n  "private": true,\n  "scripts": {"dev": "vite", "test": "vitest run"}\n}\n',
  ),
  unchanged("tsconfig.json", '{\n  "compilerOptions": {"strict": true, "jsx": "react-jsx"}\n}\n'),
  unchanged("frontend/src/dispatch.tsx", artifactCode.web),
  unchanged(
    "frontend/src/components/job-dashboard.tsx",
    "export function JobDashboard({ jobs }: JobDashboardProps) {\n  return <JobTable rows={jobs} />;\n}\n",
  ),
  unchanged("frontend/src/styles.css", ":root {\n  color-scheme: dark;\n}\n"),
  unchanged("frontend/public/robots.txt", "User-agent: *\nDisallow: /\n"),
  unchanged(
    "services/routes/health.ts",
    'export const health = () => ({ status: "healthy" });\n\n// Sample handler; not executed.\n',
  ),
  unchanged("database/migrations/001_jobs.sql", artifactCode.data),
  unchanged("workers/lib/retry.ts", "export const retryPolicy = { attempts: 3, delayMs: 1000 };\n"),
  unchanged(
    "docs/runbooks/recovery.md",
    "# Recovery\n\nInspect failed jobs before replaying a queue.\n",
  ),
  unchanged(
    "tests/contracts/jobs.test.ts",
    "// Contract test blueprint\n// Check the jobs response against services/jobs.openapi.json.\n",
  ),
  ...infrastructureFiles.map((file) => ({
    path: file.path,
    kind: file.kind,
    before: artifactCode[file.kind],
    after: revisedCode[file.kind],
  })),
];
export type ProjectNode =
  | { type: "folder"; name: string; path: string; children: ProjectNode[] }
  | { type: "file"; name: string; path: string; file: ProjectFile };
export function buildProjectTree(files: ProjectFile[]): ProjectNode {
  const root: Extract<ProjectNode, { type: "folder" }> = {
    type: "folder",
    name: "dispatch",
    path: "dispatch",
    children: [],
  };
  for (const file of files) {
    const segments = file.path.split("/");
    let parent = root;
    for (const [index, name] of segments.entries()) {
      const path = segments.slice(0, index + 1).join("/");
      if (index === segments.length - 1) {
        parent.children.push({ type: "file", name, path, file });
      } else {
        const existing = parent.children.find((node) => node.path === path);
        if (existing?.type === "folder") {
          parent = existing;
        } else {
          const folder: Extract<ProjectNode, { type: "folder" }> = {
            type: "folder",
            name,
            path,
            children: [],
          };
          parent.children.push(folder);
          parent = folder;
        }
      }
    }
  }
  function sort(node: ProjectNode) {
    if (node.type !== "folder") return;
    node.children.sort((a, b) =>
      a.type !== b.type ? (a.type === "folder" ? -1 : 1) : a.name.localeCompare(b.name),
    );
    node.children.forEach(sort);
  }
  sort(root);
  return root;
}
export const projectTree = buildProjectTree(projectFiles);

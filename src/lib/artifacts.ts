export const artifacts = [
  {
    id: "web",
    label: "Web app",
    file: "dispatch.tsx",
    address: "dispatch.local / overview",
    title: "Dispatch console",
    kind: "Application",
  },
  {
    id: "api",
    label: "API",
    file: "jobs.openapi.json",
    address: "api.local / v1 / jobs",
    title: "Jobs API",
    kind: "Service",
  },
  {
    id: "data",
    label: "Data",
    file: "schema.sql",
    address: "factory / public / jobs",
    title: "Job store",
    kind: "Database",
  },
  {
    id: "terminal",
    label: "Terminal",
    file: "worker.ts",
    address: "worker-01 / stdout",
    title: "Queue worker",
    kind: "Process",
  },
  {
    id: "document",
    label: "Document",
    file: "architecture.md",
    address: "docs / architecture.md",
    title: "System blueprint",
    kind: "Document",
  },
] as const;
export type ArtifactKind = (typeof artifacts)[number]["id"];
export const jobs = [
  {
    id: "JOB-1042",
    task: "Compile production bundle",
    agent: "Builder / 01",
    status: "Running",
    duration: "12s",
  },
  {
    id: "JOB-1041",
    task: "Validate service contracts",
    agent: "Inspector / 02",
    status: "Passed",
    duration: "8s",
  },
  {
    id: "JOB-1040",
    task: "Apply data migration",
    agent: "Builder / 01",
    status: "Passed",
    duration: "4s",
  },
  {
    id: "JOB-1039",
    task: "Generate system blueprint",
    agent: "Architect / 03",
    status: "Passed",
    duration: "6s",
  },
  {
    id: "JOB-1038",
    task: "Check worker health",
    agent: "Inspector / 02",
    status: "Queued",
    duration: "—",
  },
];
export function simulateApi(method: string, path: string) {
  if (method !== "GET")
    return { status: 405, body: { error: "method_not_allowed", allowed: ["GET"] } };
  if (path === "/v1/health")
    return { status: 200, body: { status: "healthy", services: 3, environment: "simulation" } };
  if (path === "/v1/jobs")
    return { status: 200, body: { data: jobs, total: jobs.length, environment: "simulation" } };
  return { status: 404, body: { error: "not_found", path } };
}
export const artifactCode: Record<ArtifactKind, string> = {
  web: "export function DispatchConsole() {\n  return <JobDashboard jobs={jobs} />;\n}\n\n// Local frontend fixture. No live execution.",
  api: '{\n  "openapi": "3.1.0",\n  "info": {"title": "Jobs API", "version": "1.0.0"},\n  "paths": {\n    "/v1/jobs": {"get": {"summary": "List jobs"}},\n    "/v1/health": {"get": {"summary": "Service health"}}\n  }\n}',
  data: "CREATE TABLE jobs (\n  id text PRIMARY KEY,\n  task text NOT NULL,\n  agent text NOT NULL,\n  status text NOT NULL,\n  duration text\n);\n\n-- Schema preview only; not applied to a database.",
  terminal:
    'async function processQueue(queue: Queue) {\n  for await (const job of queue) {\n    await execute(job);\n    console.log("completed", job.id);\n  }\n}\n\n// Illustrative worker source; not executed.',
  document:
    "# Dispatch / System blueprint\n\n## Runtime topology\nConsole → Jobs API → Queue → Worker\n\n## Data ownership\nJobs API owns job records.\nWorkers report state transitions.\n\n## Delivery gates\nContract tests → Build → Health checks\n\nAll displayed services are local fixtures.",
};

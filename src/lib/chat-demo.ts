import type { UIMessage } from "ai";
import type { ArtifactKind } from "./artifacts";

type Part = UIMessage["parts"][number];
export type DemoScenario = {
  title: string;
  artifact: ArtifactKind;
  prompt: string;
  parts: Part[];
  suggestions: string[];
};
const text = (value: string): Part => ({ type: "text", text: value });
const tool = (name: string, input: Record<string, unknown>, output: string): Part => ({
  type: "dynamic-tool",
  toolName: name,
  toolCallId: name,
  state: "output-available",
  input,
  output,
});
export const demoScenarios: [DemoScenario, DemoScenario, DemoScenario] = [
  {
    title: "Inspect the API",
    artifact: "api",
    prompt: "Check the jobs API. What happens when a request fails?",
    parts: [
      text(
        "I’ll trace the request boundary first. A failed request should be predictable—not disappear into a generic error.",
      ),
      tool(
        "inspect-contract",
        { endpoints: ["GET /v1/jobs", "GET /v1/health"] },
        "Sample contract inspected: 200 for supported reads, 404 for unknown paths, 405 for unsupported methods.",
      ),
      text(
        "**Three outcomes, one consistent contract.**\n\n- `200` — a successful read returns structured data.\n- `404` — an unknown path returns a named error.\n- `405` — unsupported writes return the allowed methods.\n\nThe API inspector has each outcome available as a local fixture. No service was called.",
      ),
    ],
    suggestions: ["Review the job schema", "Trace a worker failure"],
  },
  {
    title: "Review the data model",
    artifact: "data",
    prompt: "Review the job schema and identify what we need before production.",
    parts: [
      text(
        "The sample schema covers the basics. I’d tighten the lifecycle before letting workers write to it.",
      ),
      tool(
        "review-schema",
        { table: "public.jobs", columns: 5 },
        "Fixture reviewed. Recommended additions: timestamps, constrained states, attempt count, and an idempotency key.",
      ),
      text(
        "### Recommended next pass\n\n1. Add `created_at` and `updated_at` for traceability.\n2. Constrain state transitions: `queued → running → passed / failed`.\n3. Store `attempt_count` and `last_error` for recovery.\n4. Give each request an idempotency key.\n\n**Nothing has been migrated.** This is a design review of the local sample.",
      ),
    ],
    suggestions: ["Trace a worker failure", "Plan delivery checks"],
  },
  {
    title: "Trace the worker",
    artifact: "terminal",
    prompt: "Trace a worker failure and show a safe recovery path.",
    parts: [
      text(
        "Let’s separate a retryable failure from an unknown outcome. Replaying a job blindly can duplicate its effects.",
      ),
      tool(
        "trace-worker",
        { job: "JOB-1042", worker: "worker-01", environment: "simulation" },
        "Sample trace: accepted → running → interrupted. No real worker or system command executed.",
      ),
      text(
        "**Recovery checkpoint**\n\n- Preserve the job ID and last known state.\n- Check whether the output already exists.\n- Retry only when the operation is safe to replay.\n- Route unknown outcomes to operator review.\n\nThe terminal preview contains local logs to inspect. Next, I’d turn these checkpoints into delivery gates.",
      ),
    ],
    suggestions: ["Plan delivery checks", "Inspect the API"],
  },
];
export const toolTitles: Record<string, string> = {
  "read-files": "Reviewed system boundaries",
  "edit-files": "Prepared sample artifacts",
  "inspect-contract": "Inspecting API contract",
  "review-schema": "Reviewing job schema",
  "trace-worker": "Tracing worker lifecycle",
  "plan-delivery": "Mapping delivery gates",
};
export const initialMessages: UIMessage[] = [
  {
    id: "brief",
    role: "user",
    parts: [
      text(
        "Build a job orchestration system: an operator console, jobs API, data store, and queue worker. Make the whole delivery pipeline observable.",
      ),
    ],
  },
  {
    id: "response",
    role: "assistant",
    parts: [
      text("**Dispatch is mapped out.** Five artifacts, each with a clear boundary."),
      tool(
        "read-files",
        { boundaries: ["console", "api", "data", "worker", "blueprint"] },
        "Five local sample artifacts available for inspection.",
      ),
      text(
        "The console observes. The API validates. The store persists. Workers execute.\n\nStart with the request contract, then follow a job through the system. I’ll flag the risks as we go.",
      ),
    ],
  },
];
export function chooseScenario(input: string): DemoScenario {
  const normalized = input.toLowerCase();
  if (/schema|data|record|migration/.test(normalized)) return demoScenarios[1] ?? demoScenarios[0];
  if (/worker|failure|queue|retry/.test(normalized)) return demoScenarios[2] ?? demoScenarios[0];
  return demoScenarios[0];
}
export function demoReply(input: string, mode: "build" | "plan"): string {
  if (mode === "plan")
    return `### Delivery plan\n\n1. Define the acceptance criteria for “${input}”.\n2. Review the service and data boundaries.\n3. Test success, failure, and recovery paths.\n4. Inspect the outputs before release.\n\nThis is a local planning example. No code has been changed.`;
  return `I’ll treat “${input}” as the next design checkpoint.\n\n**Before implementation:** confirm the input contract, identify the affected artifact, and make the failure path explicit.\n\nThis session simulates an agent’s workflow. No code, services, or data were changed.`;
}
export function responseFor(input: string, mode: "build" | "plan"): DemoScenario {
  if (mode === "plan")
    return {
      title: "Plan delivery checks",
      artifact: "document",
      prompt: input,
      parts: [text(demoReply(input, mode))],
      suggestions: ["Inspect the API", "Review the job schema"],
    };
  if (
    /api|contract|schema|data|record|migration|worker|failure|queue|retry/.test(input.toLowerCase())
  )
    return chooseScenario(input);
  return {
    title: "Review next checkpoint",
    artifact: "document",
    prompt: input,
    parts: [text(demoReply(input, mode))],
    suggestions: ["Inspect the API", "Trace a worker failure"],
  };
}
export function revealWords(value: string, count: number): string {
  return (
    value
      .match(/\S+\s*/g)
      ?.slice(0, count)
      .join("") ?? ""
  );
}

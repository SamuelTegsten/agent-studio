import { useState } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  ChevronDown,
  Circle,
  Database,
  FileText,
  Globe,
  Layers,
  Play,
  Search,
  Server,
  Terminal,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { artifacts, jobs, simulateApi, type ArtifactKind } from "@/lib/artifacts";
import architecture from "@/assets/architecture.asset.json";

const artifactIcons = {
  web: Globe,
  api: Server,
  data: Database,
  terminal: Terminal,
  document: FileText,
};
export function ArtifactSelector({
  value,
  onChange,
}: {
  value: ArtifactKind;
  onChange: (value: ArtifactKind) => void;
}) {
  return (
    <div className="artifact-strip" role="tablist" aria-label="Artifact types">
      {artifacts.map((artifact) => {
        const Icon = artifactIcons[artifact.id];
        return (
          <Button
            role="tab"
            aria-selected={value === artifact.id}
            key={artifact.id}
            variant="ghost"
            size="sm"
            onClick={() => onChange(artifact.id)}
            className={`artifact-tab ${value === artifact.id ? "active" : ""}`}
          >
            <Icon className="size-3.5" />
            {artifact.label}
          </Button>
        );
      })}
    </div>
  );
}
function JobTable({ filter = "" }: { filter?: string }) {
  const rows = jobs.filter((job) =>
    `${job.id} ${job.task} ${job.status}`.toLowerCase().includes(filter.toLowerCase()),
  );
  return (
    <div className="factory-table-wrap">
      <table className="factory-table">
        <thead>
          <tr>
            <th>JOB ID</th>
            <th>TASK</th>
            <th>AGENT</th>
            <th>STATE</th>
            <th>TIME</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((job) => (
            <tr key={job.id}>
              <td className="font-mono text-muted-foreground">{job.id}</td>
              <td>{job.task}</td>
              <td className="text-muted-foreground">{job.agent}</td>
              <td>
                <span className={`job-state ${job.status.toLowerCase()}`}>
                  <Circle className="size-1.5 fill-current" />
                  {job.status}
                </span>
              </td>
              <td className="font-mono text-muted-foreground">{job.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="p-6 text-center text-xs text-muted-foreground">No matching jobs.</p>
      )}
    </div>
  );
}
function WebPreview() {
  const [filter, setFilter] = useState("");
  return (
    <div className="dispatch-app">
      <nav className="dispatch-nav">
        <div className="flex items-center gap-2 font-display text-sm font-bold">
          <Box className="size-5 text-primary" />
          DISPATCH<span className="session-pill">OS / 01</span>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="status-dot" />
          SANDBOX
        </span>
      </nav>
      <div className="dispatch-content">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">CONTROL ROOM / OVERVIEW</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Production overview<span className="text-primary">.</span>
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Every job. Every agent. One assembly line.
            </p>
          </div>
          <span className="factory-stamp">
            LOCAL
            <br />
            FIXTURE
          </span>
        </div>
        <div className="metrics-grid">
          {[
            { label: "JOBS COMPLETED", value: "128", detail: "+24 this cycle", icon: Layers },
            { label: "ACTIVE AGENTS", value: "03", detail: "All workers healthy", icon: Activity },
            { label: "PASS RATE", value: "99.2", detail: "Quality gate nominal", icon: Check },
          ].map(({ label, value, detail, icon: Icon }) => (
            <div className="factory-metric" key={label}>
              <div className="flex items-center justify-between">
                <span className="eyebrow">{label}</span>
                <Icon className="size-3.5 text-muted-foreground" />
              </div>
              <p className="my-4 font-mono text-4xl">
                {value}
                <span className="text-sm text-muted-foreground">
                  {label === "PASS RATE" ? "%" : ""}
                </span>
              </p>
              <span className="text-[10px] text-success">{detail}</span>
            </div>
          ))}
        </div>
        <section className="pipeline-section">
          <div className="factory-section-heading">
            <h3>ASSEMBLY PIPELINE</h3>
            <span>RUN / 0042</span>
          </div>
          <div className="pipeline">
            {["Specification", "Implementation", "Validation", "Delivery"].map((step, i) => (
              <div className={`pipeline-step ${i === 2 ? "current" : ""}`} key={step}>
                <span className="font-mono text-[10px] text-muted-foreground">0{i + 1}</span>
                <div className="my-4">
                  {i < 2 ? (
                    <Check className="size-5 text-success" />
                  ) : i === 2 ? (
                    <Workflow className="size-5 text-primary" />
                  ) : (
                    <Box className="size-5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs">{step}</p>
                <p className="mt-2 font-mono text-[9px] text-muted-foreground">
                  {i < 2 ? "COMPLETE" : i === 2 ? "IN PROGRESS" : "WAITING"}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <div className="factory-section-heading">
            <h3>RECENT JOBS</h3>
            <span>5 RECORDS</span>
          </div>
          <JobTable />
        </section>
        <div className="factory-output">
          <img src={architecture.url} alt="Architectural portfolio output thumbnail" />
          <div>
            <p className="eyebrow">UPSTREAM ARTIFACT</p>
            <p className="mt-2 text-xs">Studio North / portfolio asset</p>
          </div>
          <span className="ml-auto font-mono text-[10px] text-success">
            VERIFIED <Check className="ml-1 inline size-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
function ApiPreview() {
  const [path, setPath] = useState("/v1/jobs");
  const [method, setMethod] = useState("GET");
  const [result, setResult] = useState<ReturnType<typeof simulateApi> | null>(null);
  return (
    <div className="artifact-content">
      <p className="eyebrow">SERVICE / JOBS API</p>
      <h2 className="artifact-title">Request inspector</h2>
      <div className="api-request">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger aria-label="HTTP method" className="w-24 shrink-0 font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
          </SelectContent>
        </Select>
        <Input
          aria-label="API path"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="min-w-0 font-mono text-xs"
        />
        <Button size="sm" onClick={() => setResult(simulateApi(method, path))}>
          <Play className="size-3" />
          Send
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 py-5">
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-[10px]"
          onClick={() => setPath("/v1/jobs")}
        >
          /v1/jobs
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-[10px]"
          onClick={() => setPath("/v1/health")}
        >
          /v1/health
        </Button>
        <span className="ml-auto self-center text-[10px] text-muted-foreground">
          Local simulation · no network requests
        </span>
      </div>
      <div className="factory-section-heading">
        <h3>RESPONSE BODY</h3>
        <span className={result?.status === 200 ? "text-success" : "text-muted-foreground"}>
          {result ? `${result.status} / application/json` : "AWAITING REQUEST"}
        </span>
      </div>
      <pre className="response-code">
        {result
          ? JSON.stringify(result.body, null, 2)
          : "// Select an endpoint and send a simulated request."}
      </pre>
    </div>
  );
}
function DataPreview() {
  const [filter, setFilter] = useState("");
  const [schema, setSchema] = useState(false);
  return (
    <div className="artifact-content">
      <p className="eyebrow">DATA / PUBLIC.JOBS</p>
      <h2 className="artifact-title">Job store</h2>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="relative min-w-0 max-w-64 flex-1">
          <Search className="absolute left-3 top-3 size-3 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter jobs"
            placeholder="Filter records…"
            className="pl-8 text-xs"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setSchema(!schema)}>
          <Database className="size-3" />
          {schema ? "Records" : "Schema"}
        </Button>
      </div>
      {schema ? (
        <div className="schema-grid">
          {[
            "id / text / primary key",
            "task / text / required",
            "agent / text / required",
            "status / text / required",
            "duration / text / nullable",
          ].map((field) => (
            <div className="border-b p-4 font-mono text-xs" key={field}>
              {field}
            </div>
          ))}
        </div>
      ) : (
        <JobTable filter={filter} />
      )}
      <p className="mt-5 font-mono text-[10px] text-muted-foreground">
        5 fixture records · Read-only · No database connected
      </p>
    </div>
  );
}
function TerminalPreview() {
  const [lines, setLines] = useState([
    "[05:41:02] boot / worker-01 initialized",
    "[05:41:02] queue / connected to local fixture",
    "[05:41:03] job / JOB-1040 migration validated",
    "[05:41:07] job / JOB-1041 contracts passed",
    "[05:41:08] build / JOB-1042 bundle started",
    "[05:41:09] health / 3 workers nominal",
  ]);
  const [command, setCommand] = useState("");
  function run() {
    const cmd = command.trim();
    if (!cmd) return;
    const output =
      cmd === "help"
        ? "Available: help, status, jobs, clear"
        : cmd === "status"
          ? "worker-01: healthy | queue: 2 | environment: simulation"
          : cmd === "jobs"
            ? jobs.map((j) => `${j.id}  ${j.status}`).join("\n")
            : "Command unavailable in simulation. Try help.";
    setLines((current) => (cmd === "clear" ? [] : [...current, `$ ${cmd}`, output]));
    setCommand("");
  }
  return (
    <div className="terminal-preview">
      <div className="factory-section-heading">
        <h3>WORKER-01 / STDOUT</h3>
        <Button variant="ghost" size="sm" onClick={() => setLines([])} className="h-6 text-[10px]">
          Clear
        </Button>
      </div>
      <div className="terminal-lines" role="log" aria-label="Worker logs">
        {lines.map((line, i) => (
          <pre
            key={i}
            className={
              line.includes("passed") || line.includes("healthy")
                ? "text-success"
                : "text-muted-foreground"
            }
          >
            {line}
          </pre>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="terminal-command"
      >
        <span className="text-primary">❯</span>
        <Input
          aria-label="Terminal command"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="help"
          className="border-0 bg-transparent font-mono text-xs shadow-none"
        />
        <Button type="submit" size="icon-sm" variant="ghost" aria-label="Run command">
          <ArrowRight />
        </Button>
      </form>
      <p className="p-4 font-mono text-[10px] text-muted-foreground">
        SIMULATED SHELL / NO SYSTEM COMMANDS EXECUTED
      </p>
    </div>
  );
}
function DocumentPreview() {
  return (
    <article className="artifact-content document-preview">
      <p className="eyebrow">BLUEPRINT / REVISION 01</p>
      <h2 className="artifact-title">A system, not just a screen.</h2>
      <p className="leading-relaxed text-muted-foreground">
        Dispatch coordinates the full delivery cycle: an operator console, a jobs service, a durable
        store, and a queue worker.
      </p>
      <div className="document-topology">
        {["Console", "Jobs API", "Queue", "Worker"].map((item, i) => (
          <div key={item} className="flex items-center gap-3">
            <span>{item}</span>
            {i < 3 && <ArrowRight className="size-3 text-primary" />}
          </div>
        ))}
      </div>
      <h3>01 / Service boundaries</h3>
      <p>
        The console observes. The API validates. The store persists. Workers execute. Each boundary
        has a clear input and a testable output.
      </p>
      <h3>02 / Delivery gates</h3>
      <ul>
        <li>Validate the request contract.</li>
        <li>Run the test suite and compile artifacts.</li>
        <li>Verify service health before release.</li>
      </ul>
      <h3>03 / Current environment</h3>
      <p>
        All previews use local fixtures. No services are deployed, and no data or commands leave
        this frontend session.
      </p>
      <footer className="mt-10 border-t pt-4 font-mono text-[10px] text-muted-foreground">
        DISPATCH / SYSTEM ARCHITECTURE / SAMPLE DOCUMENT
      </footer>
    </article>
  );
}
const renderers = {
  web: WebPreview,
  api: ApiPreview,
  data: DataPreview,
  terminal: TerminalPreview,
  document: DocumentPreview,
};
export function ArtifactPreview({ kind }: { kind: ArtifactKind }) {
  const Renderer = renderers[kind];
  return <Renderer />;
}

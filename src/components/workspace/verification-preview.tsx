import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  FileCode2,
  FlaskConical,
  LoaderCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  advanceVerificationRun,
  beginVerificationRun,
  initialVerificationRun,
  stopVerificationRun,
  suiteLabels,
  verificationSummary,
  type VerificationStatus,
  type VerificationSuite,
  type VerificationTest,
} from "@/lib/verification";

type Filter = "all" | "failed" | VerificationSuite;

function StatusIcon({ status }: { status: VerificationStatus }) {
  if (status === "passed") return <CheckCircle2 className="text-success" />;
  if (status === "failed") return <XCircle className="text-destructive" />;
  if (status === "running") return <LoaderCircle className="verification-spin text-primary" />;
  if (status === "skipped") return <CircleDashed className="text-muted-foreground" />;
  return <CircleDashed className="text-muted-foreground" />;
}

export function VerificationPreview({ onReview }: { onReview: () => void }) {
  const [tests, setTests] = useState<VerificationTest[]>(initialVerificationRun);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState("integration-retry-backoff");
  const running = tests.some((test) => test.status === "queued" || test.status === "running");
  const summary = verificationSummary(tests);
  const visibleTests = useMemo(
    () =>
      tests.filter((test) => {
        if (filter === "all") return true;
        if (filter === "failed") return test.outcome === "failed";
        return test.suite === filter;
      }),
    [filter, tests],
  );
  const selected = tests.find((test) => test.id === selectedId) ?? tests[0];

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setTests((current) => advanceVerificationRun(current));
    }, 260);
    return () => window.clearTimeout(timer);
  }, [running, tests]);

  function changeFilter(next: Filter) {
    setFilter(next);
    const first = tests.find((test) => {
      if (next === "all") return true;
      if (next === "failed") return test.outcome === "failed";
      return test.suite === next;
    });
    if (first) setSelectedId(first.id);
  }

  if (!selected) return null;
  return (
    <div className="verification-preview">
      <header className="verification-header">
        <div>
          <p className="eyebrow">QUALITY GATE / ASSEMBLY 0042</p>
          <h2>Verification, before review.</h2>
          <p>Unit, integration, and API contract fixtures for the proposed revision.</p>
        </div>
        <div className="verification-actions">
          {summary.failed > 0 && !running && (
            <Button variant="outline" size="sm" onClick={onReview}>
              Review failure
              <ArrowUpRight />
            </Button>
          )}
          <Button
            size="sm"
            variant={running ? "outline" : "default"}
            onClick={() =>
              setTests((current) =>
                running ? stopVerificationRun(current) : beginVerificationRun(current),
              )
            }
          >
            {running ? <Square /> : <RotateCcw />}
            {running ? "Stop run" : "Run all again"}
          </Button>
        </div>
      </header>

      <div className="verification-metrics" aria-label="Test run summary">
        <div className="verification-metric">
          <span>PASSING</span>
          <strong className="text-success">
            {summary.passed}
            <small> / {summary.total}</small>
          </strong>
          <p>{summary.assertions} assertions</p>
        </div>
        <div className="verification-metric">
          <span>FAILED</span>
          <strong className={summary.failed ? "text-destructive" : "text-success"}>
            {String(summary.failed).padStart(2, "0")}
          </strong>
          <p>{summary.failed ? "Requires attention" : "Quality gate clear"}</p>
        </div>
        <div className="verification-metric">
          <span>PASS RATE</span>
          <strong>
            {summary.passRate}
            <small>%</small>
          </strong>
          <p>
            {summary.complete} completed · {summary.skipped} skipped
          </p>
        </div>
        <div className="verification-metric">
          <span>DURATION</span>
          <strong>
            {(summary.durationMs / 1000).toFixed(2)}
            <small>s</small>
          </strong>
          <p>Deterministic fixture time</p>
        </div>
      </div>

      <div
        className="verification-progress"
        aria-label={`${summary.complete} of ${summary.total} tests complete`}
      >
        <span style={{ width: `${(summary.complete / summary.total) * 100}%` }} />
      </div>

      <div className="verification-workspace">
        <section className="verification-list" aria-label="Verification tests">
          <div className="verification-filters" aria-label="Filter tests">
            {(["all", "unit", "integration", "contract", "failed"] as Filter[]).map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                aria-pressed={filter === item}
                onClick={() => changeFilter(item)}
              >
                {item === "all" ? "All" : item === "failed" ? "Failed" : suiteLabels[item]}
              </Button>
            ))}
          </div>
          <div className="verification-test-list">
            {visibleTests.map((test) => (
              <Button
                key={test.id}
                variant="ghost"
                className={`verification-test ${selected.id === test.id ? "selected" : ""}`}
                aria-pressed={selected.id === test.id}
                onClick={() => setSelectedId(test.id)}
              >
                <StatusIcon status={test.status} />
                <span className="verification-test-copy">
                  <span>{test.title}</span>
                  <small>
                    {suiteLabels[test.suite]} · {test.assertions} assertions
                  </small>
                </span>
                <span className="verification-test-time">
                  {test.status === "running"
                    ? "RUN"
                    : test.status === "queued"
                      ? "QUEUED"
                      : test.status === "skipped"
                        ? "SKIP"
                        : `${test.durationMs}ms`}
                </span>
                <ChevronRight />
              </Button>
            ))}
          </div>
          <footer className="verification-list-footer">
            <FlaskConical />
            LOCAL FIXTURES / NO TEST PROCESS SPAWNED
          </footer>
        </section>

        <section className="verification-detail" aria-label="Selected test details">
          <div className="verification-detail-heading">
            <div className={`verification-detail-icon ${selected.status}`}>
              <StatusIcon status={selected.status} />
            </div>
            <div>
              <p className="eyebrow">
                {suiteLabels[selected.suite]} / {selected.status}
              </p>
              <h3>{selected.title}</h3>
            </div>
          </div>
          <p className="verification-description">{selected.description}</p>
          <div className="verification-file">
            <FileCode2 />
            <code>{selected.file}</code>
          </div>

          {selected.status === "failed" && selected.failure ? (
            <div className="verification-failure">
              <div className="verification-failure-title">
                <AlertTriangle />
                <div>
                  <strong>Assertion mismatch</strong>
                  <p>{selected.failure.summary}</p>
                </div>
              </div>
              <div
                className="verification-diff"
                role="table"
                aria-label="Expected and actual values"
              >
                <div className="verification-diff-head" role="row">
                  <span role="columnheader">EXPECTED</span>
                  <span role="columnheader">ACTUAL</span>
                </div>
                {selected.failure.expected.map((line, index) => {
                  const actual = selected.failure?.actual[index] ?? "";
                  const changed = line !== actual;
                  return (
                    <div className="verification-diff-row" role="row" key={line}>
                      <code role="cell" className={changed ? "expected" : ""}>
                        {line}
                      </code>
                      <code role="cell" className={changed ? "actual" : ""}>
                        {actual}
                      </code>
                    </div>
                  );
                })}
              </div>
              <div className="verification-failure-actions">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={running}
                  onClick={() => setTests((current) => beginVerificationRun(current, true))}
                >
                  <Play />
                  Re-run failed
                </Button>
                <Button variant="ghost" size="sm" onClick={onReview}>
                  Open review
                  <ArrowUpRight />
                </Button>
              </div>
            </div>
          ) : selected.status === "passed" ? (
            <div className="verification-passed">
              <ShieldCheck />
              <div>
                <strong>All assertions passed</strong>
                <p>
                  {selected.assertions} checks completed in {selected.durationMs}ms.
                </p>
              </div>
              <Check />
            </div>
          ) : (
            <div className="verification-pending">
              <Clock3 />
              <p>
                {selected.status === "running"
                  ? "Running this deterministic fixture…"
                  : selected.status === "skipped"
                    ? "This fixture was skipped when the run stopped."
                    : "Waiting for the previous fixture to finish."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

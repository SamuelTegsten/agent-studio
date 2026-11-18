export type VerificationSuite = "unit" | "integration" | "contract";
export type VerificationStatus = "passed" | "failed" | "queued" | "running" | "skipped";

export type VerificationFailure = {
  summary: string;
  expected: string[];
  actual: string[];
};

export type VerificationTest = {
  id: string;
  suite: VerificationSuite;
  title: string;
  file: string;
  description: string;
  assertions: number;
  durationMs: number;
  outcome: "passed" | "failed";
  status: VerificationStatus;
  failure?: VerificationFailure;
};

const fixtures: Omit<VerificationTest, "status">[] = [
  {
    id: "unit-diff-counters",
    suite: "unit",
    title: "Diff counters reconstruct both revisions",
    file: "tests/unit/infrastructure.test.ts",
    description:
      "Checks that highlighted additions and removals preserve the base and proposed source.",
    assertions: 4,
    durationMs: 42,
    outcome: "passed",
  },
  {
    id: "unit-project-tree",
    suite: "unit",
    title: "Project manifest includes every nested file",
    file: "tests/unit/project-tree.test.ts",
    description:
      "Verifies the complete project tree, including hidden files and deeply nested folders.",
    assertions: 6,
    durationMs: 55,
    outcome: "passed",
  },
  {
    id: "unit-api-methods",
    suite: "unit",
    title: "Unsupported API methods return 405",
    file: "tests/unit/api-methods.test.ts",
    description: "Guards the local Jobs API method contract and allowed-method response.",
    assertions: 3,
    durationMs: 38,
    outcome: "passed",
  },
  {
    id: "integration-migration",
    suite: "integration",
    title: "Invalid job states are rejected by the schema",
    file: "tests/integration/job-schema.test.ts",
    description:
      "Applies the sample migration and checks the status constraint and default timestamps.",
    assertions: 5,
    durationMs: 310,
    outcome: "passed",
  },
  {
    id: "integration-failure-record",
    suite: "integration",
    title: "Worker records a failed job for operator review",
    file: "tests/integration/worker-failure.test.ts",
    description:
      "Traces an execution error through recordFailure and the review_required log event.",
    assertions: 4,
    durationMs: 284,
    outcome: "passed",
  },
  {
    id: "integration-retry-backoff",
    suite: "integration",
    title: "Worker waits before retrying a failed job",
    file: "tests/integration/worker-retry.test.ts",
    description: "Compares the observed retry delay with the policy in workers/lib/retry.ts.",
    assertions: 3,
    durationMs: 401,
    outcome: "failed",
    failure: {
      summary:
        "The second attempt started immediately instead of observing the configured backoff.",
      expected: ["attempt: 2", "delayMs: 1000", "state: queued"],
      actual: ["attempt: 2", "delayMs: 0", "state: queued"],
    },
  },
  {
    id: "contract-list-jobs",
    suite: "contract",
    title: "GET /v1/jobs matches the OpenAPI response",
    file: "tests/contracts/jobs.test.ts",
    description: "Validates the response envelope, job records, and documented success response.",
    assertions: 8,
    durationMs: 190,
    outcome: "passed",
  },
  {
    id: "contract-health",
    suite: "contract",
    title: "GET /v1/health reports service health",
    file: "tests/contracts/health.test.ts",
    description: "Checks the health payload and its declared service count.",
    assertions: 4,
    durationMs: 168,
    outcome: "passed",
  },
  {
    id: "contract-not-found",
    suite: "contract",
    title: "Unknown routes return the documented 404",
    file: "tests/contracts/not-found.test.ts",
    description: "Verifies the error code and path echoed by an unknown API route.",
    assertions: 3,
    durationMs: 224,
    outcome: "passed",
  },
];

export const suiteLabels: Record<VerificationSuite, string> = {
  unit: "Unit",
  integration: "Integration",
  contract: "API contracts",
};

export function initialVerificationRun(): VerificationTest[] {
  return fixtures.map((test) => ({ ...test, status: test.outcome }));
}

export function beginVerificationRun(
  tests: VerificationTest[],
  onlyFailed = false,
): VerificationTest[] {
  return tests.map((test) =>
    !onlyFailed || test.outcome === "failed" ? { ...test, status: "queued" } : test,
  );
}

/** Advance one deterministic fixture step: settle the active test and start the next. */
export function advanceVerificationRun(tests: VerificationTest[]): VerificationTest[] {
  let startNext = false;
  let started = false;
  return tests.map((test) => {
    if (test.status === "running") {
      startNext = true;
      return { ...test, status: test.outcome };
    }
    if (
      test.status === "queued" &&
      (!tests.some((entry) => entry.status === "running") || startNext) &&
      !started
    ) {
      started = true;
      return { ...test, status: "running" };
    }
    return test;
  });
}

export function stopVerificationRun(tests: VerificationTest[]): VerificationTest[] {
  return tests.map((test) =>
    test.status === "queued" || test.status === "running" ? { ...test, status: "skipped" } : test,
  );
}

export function verificationSummary(tests: VerificationTest[]) {
  const passed = tests.filter((test) => test.status === "passed").length;
  const failed = tests.filter((test) => test.status === "failed").length;
  const skipped = tests.filter((test) => test.status === "skipped").length;
  const complete = passed + failed;
  return {
    passed,
    failed,
    skipped,
    complete,
    total: tests.length,
    assertions: tests.reduce((sum, test) => sum + test.assertions, 0),
    durationMs: tests.reduce(
      (sum, test) =>
        sum + (test.status === "passed" || test.status === "failed" ? test.durationMs : 0),
      0,
    ),
    passRate: complete ? ((passed / complete) * 100).toFixed(1) : "0.0",
  };
}

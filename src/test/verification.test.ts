import { describe, expect, it } from "vitest";
import {
  advanceVerificationRun,
  beginVerificationRun,
  initialVerificationRun,
  stopVerificationRun,
  verificationSummary,
} from "@/lib/verification";

describe("verification fixtures", () => {
  it("reports eight passing tests and one retry-backoff failure", () => {
    const summary = verificationSummary(initialVerificationRun());
    expect(summary).toMatchObject({ total: 9, passed: 8, failed: 1, passRate: "88.9" });
  });

  it("runs queued fixtures sequentially to their deterministic outcomes", () => {
    let tests = beginVerificationRun(initialVerificationRun());
    for (let step = 0; step < 20; step += 1) tests = advanceVerificationRun(tests);
    expect(verificationSummary(tests)).toMatchObject({ total: 9, passed: 8, failed: 1 });
    expect(tests.some((test) => test.status === "queued" || test.status === "running")).toBe(false);
  });

  it("marks unfinished tests skipped when a run is stopped", () => {
    let tests = beginVerificationRun(initialVerificationRun());
    tests = advanceVerificationRun(tests);
    tests = stopVerificationRun(tests);
    expect(tests.filter((test) => test.status === "skipped")).toHaveLength(9);
  });

  it("re-runs only the failed retry test when requested", () => {
    const tests = beginVerificationRun(initialVerificationRun(), true);
    expect(tests.filter((test) => test.status === "queued")).toHaveLength(1);
    expect(tests.find((test) => test.status === "queued")?.id).toBe("integration-retry-backoff");
  });
});

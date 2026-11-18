import { describe, expect, it } from "vitest";
import {
  applyReviewRequest,
  canMerge,
  initialReview,
  mergeReview,
  reviewChanges,
} from "@/lib/task-review";

describe("task review", () => {
  it("includes every changed file with both diff counts", () => {
    const changes = reviewChanges(initialReview().files);
    expect(changes.map((change) => change.file.path).sort()).toEqual([
      "database/schema.sql",
      "docs/architecture.md",
      "services/jobs.openapi.json",
      "workers/queue.ts",
    ]);
    const schema = changes.find((change) => change.file.path === "database/schema.sql");
    expect(schema?.additions).toBe(3);
    expect(schema?.deletions).toBe(1);
  });
  it("requires approval of the current revision and completed work to merge into master", () => {
    const state = initialReview();
    expect(canMerge(state, false)).toBe(false);
    expect(mergeReview(state, false).mergedRevision).toBeNull();
    const approved = { ...state, approvedRevision: 1 };
    expect(canMerge(approved, true)).toBe(false);
    expect(mergeReview(approved, true).mergedRevision).toBeNull();
    expect(canMerge(approved, false)).toBe(true);
    const merged = mergeReview(approved, false);
    expect(merged.mergedRevision).toBe(1);
    expect(canMerge(merged, false)).toBe(false);
  });
  it("adds the requested sample alteration to the revision and invalidates previous approval", () => {
    const state = { ...initialReview(), approvedRevision: 1 };
    const revised = applyReviewRequest(state, "Add updated_at to the schema");
    expect(revised.revision).toBe(2);
    expect(revised.approvedRevision).toBeNull();
    expect(canMerge(revised, false)).toBe(false);
    expect(revised.files.find((file) => file.path === "database/schema.sql")?.after).toContain(
      "updated_at timestamptz NOT NULL DEFAULT now(),",
    );
    expect(
      reviewChanges(revised.files).find((change) => change.file.path === "database/schema.sql")
        ?.additions,
    ).toBe(4);
    expect(applyReviewRequest(revised, "Add updated_at to the schema")).toBe(revised);
  });
  it("does not pretend arbitrary requests edit files or alter a merged revision", () => {
    const state = initialReview();
    expect(applyReviewRequest(state, "What are the risks?")).toBe(state);
    const merged = mergeReview({ ...state, approvedRevision: 1 }, false);
    expect(applyReviewRequest(merged, "Add updated_at to the schema")).toBe(merged);
  });
});

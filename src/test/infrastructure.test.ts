import { describe, it, expect } from "vitest";
import { availableSections, fileDiff, revisedCode } from "@/lib/infrastructure";
import { artifactCode } from "@/lib/artifacts";
describe("infrastructure preview", () => {
  it("defaults to infrastructure with a frontend section for UI projects", () => {
    expect(availableSections(true)).toEqual(["infrastructure", "frontend"]);
  });
  it("omits frontend for projects without UI", () => {
    expect(availableSections(false)).toEqual(["infrastructure"]);
  });
  it("reconstructs both revisions from highlighted changes", () => {
    const diff = fileDiff("data");
    expect(
      diff
        .filter((line) => line.type !== "added")
        .map((line) => line.content)
        .join("\n"),
    ).toBe(artifactCode.data);
    expect(
      diff
        .filter((line) => line.type !== "removed")
        .map((line) => line.content)
        .join("\n"),
    ).toBe(revisedCode.data);
  });
});

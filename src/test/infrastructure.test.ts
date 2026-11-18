import { describe, it, expect } from "vitest";
import {
  availableSections,
  fileDiff,
  revisedCode,
  projectFiles,
  projectTree,
  sourceDiff,
  type ProjectNode,
} from "@/lib/infrastructure";
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
  it("includes the project root and every file under its complete subfolder hierarchy", () => {
    expect(projectTree.name).toBe("dispatch");
    const paths: string[] = [];
    const folders: string[] = [];
    function visit(node: ProjectNode) {
      if (node.type === "file") paths.push(node.path);
      else {
        folders.push(node.path);
        node.children.forEach(visit);
      }
    }
    visit(projectTree);
    expect(paths.sort()).toEqual(projectFiles.map((file) => file.path).sort());
    expect(folders).toContain("frontend/src/components");
    expect(folders).toContain("database/migrations");
    expect(paths).toContain(".gitignore");
  });
  it("derives both diff counters and selectable revisions for changed and unchanged files", () => {
    const file = projectFiles.find((entry) => entry.path === "database/schema.sql");
    expect(file).toBeDefined();
    if (!file) throw new Error("Missing schema fixture");
    const lines = sourceDiff(file.before, file.after);
    expect(lines.filter((line) => line.type === "added")).toHaveLength(3);
    expect(lines.filter((line) => line.type === "removed")).toHaveLength(1);
    expect(
      lines
        .filter((line) => line.type !== "removed")
        .map((line) => line.content)
        .join("\n"),
    ).toBe(file.after);
    const unchanged = projectFiles.find((entry) => entry.path === "package.json");
    expect(unchanged).toBeDefined();
    if (!unchanged) throw new Error("Missing root fixture");
    expect(
      sourceDiff(unchanged.before, unchanged.after).every((line) => line.type === "context"),
    ).toBe(true);
  });
});

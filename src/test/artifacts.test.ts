import { describe, expect, it } from "vitest";
import { artifacts, artifactCode, simulateApi } from "@/lib/artifacts";
describe("artifact contracts", () => {
  it("provides source for every supported output kind", () => {
    expect(artifacts.map((a) => a.id)).toEqual(["web", "api", "data", "terminal", "document"]);
    for (const artifact of artifacts) expect(artifactCode[artifact.id].length).toBeGreaterThan(0);
  });
  it("returns all five fixture jobs for the jobs endpoint", () => {
    const response = simulateApi("GET", "/v1/jobs");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ total: 5 });
  });
  it("returns 404 for unsupported paths", () => {
    expect(simulateApi("GET", "/v1/missing").status).toBe(404);
  });
  it("does not simulate writes", () => {
    expect(simulateApi("POST", "/v1/jobs").status).toBe(405);
  });
});

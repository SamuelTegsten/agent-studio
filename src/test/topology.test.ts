import { describe, expect, it } from "vitest";
import {
  nodeConnections,
  topologyDrift,
  topologyEdges,
  topologyNodes,
  topologyStats,
} from "@/lib/topology";

describe("system topology fixtures", () => {
  it("highlights three changed services and three changed connections", () => {
    expect(topologyStats()).toMatchObject({ nodes: 5, changedNodes: 3, changedEdges: 3 });
  });

  it("flags only the new worker database write as undocumented drift", () => {
    expect(topologyDrift().map((edge) => edge.id)).toEqual(["worker-database"]);
    expect(topologyStats().undocumented).toBe(1);
  });

  it("keeps every connection attached to declared nodes", () => {
    const ids = new Set(topologyNodes.map((node) => node.id));
    expect(topologyEdges.every((edge) => ids.has(edge.from) && ids.has(edge.to))).toBe(true);
    expect(nodeConnections("api").map((edge) => edge.id)).toEqual([
      "console-api",
      "api-database",
      "api-queue",
    ]);
  });
});

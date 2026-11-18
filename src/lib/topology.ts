import type { ArtifactKind } from "./artifacts";

export type TopologyNode = {
  id: string;
  label: string;
  technology: string;
  description: string;
  x: number;
  y: number;
  revision: "changed" | "unchanged";
  file?: string;
  artifact?: ArtifactKind;
};

export type TopologyEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
  path: string;
  labelX: number;
  labelY: number;
  changed: boolean;
  documented: boolean;
};

export const topologyNodes: TopologyNode[] = [
  {
    id: "console",
    label: "Operator console",
    technology: "React / Browser",
    description: "Displays job health and sends operator requests to the Jobs API.",
    x: 28,
    y: 164,
    revision: "unchanged",
    file: "frontend/src/dispatch.tsx",
  },
  {
    id: "api",
    label: "Jobs API",
    technology: "REST / OpenAPI 3.1",
    description: "Validates requests, owns job reads, and publishes work to the queue.",
    x: 302,
    y: 164,
    revision: "changed",
    file: "services/jobs.openapi.json",
    artifact: "api",
  },
  {
    id: "database",
    label: "PostgreSQL",
    technology: "Data / public.jobs",
    description: "Stores job state with the revised status constraint and audit timestamps.",
    x: 600,
    y: 30,
    revision: "changed",
    file: "database/schema.sql",
    artifact: "data",
  },
  {
    id: "queue",
    label: "RabbitMQ",
    technology: "Queue / jobs.pending",
    description: "Buffers pending jobs between the API and available queue workers.",
    x: 302,
    y: 316,
    revision: "unchanged",
  },
  {
    id: "worker",
    label: "Queue worker",
    technology: "Process / worker-01",
    description: "Executes jobs and now records failures for operator review.",
    x: 600,
    y: 296,
    revision: "changed",
    file: "workers/queue.ts",
    artifact: "terminal",
  },
];

export const topologyEdges: TopologyEdge[] = [
  {
    id: "console-api",
    from: "console",
    to: "api",
    label: "HTTPS",
    path: "M 182 201 H 294",
    labelX: 238,
    labelY: 190,
    changed: false,
    documented: true,
  },
  {
    id: "api-database",
    from: "api",
    to: "database",
    label: "SQL / read",
    path: "M 454 174 C 520 174 526 86 592 78",
    labelX: 523,
    labelY: 116,
    changed: true,
    documented: true,
  },
  {
    id: "api-queue",
    from: "api",
    to: "queue",
    label: "publish",
    path: "M 379 242 V 308",
    labelX: 391,
    labelY: 280,
    changed: false,
    documented: true,
  },
  {
    id: "queue-worker",
    from: "queue",
    to: "worker",
    label: "consume",
    path: "M 456 353 C 520 353 528 342 592 337",
    labelX: 523,
    labelY: 367,
    changed: true,
    documented: true,
  },
  {
    id: "worker-database",
    from: "worker",
    to: "database",
    label: "write result",
    path: "M 677 288 V 112",
    labelX: 690,
    labelY: 204,
    changed: true,
    documented: false,
  },
];

export const documentedEdgeIds = ["console-api", "api-database", "api-queue", "queue-worker"];

export function topologyDrift() {
  return topologyEdges.filter((edge) => !documentedEdgeIds.includes(edge.id));
}

export function topologyStats() {
  return {
    nodes: topologyNodes.length,
    changedNodes: topologyNodes.filter((node) => node.revision === "changed").length,
    changedEdges: topologyEdges.filter((edge) => edge.changed).length,
    undocumented: topologyDrift().length,
  };
}

export function nodeConnections(nodeId: string) {
  return topologyEdges.filter((edge) => edge.from === nodeId || edge.to === nodeId);
}

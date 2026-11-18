import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  Cog,
  Database,
  GitCompareArrows,
  ListOrdered,
  Monitor,
  Network,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArtifactKind } from "@/lib/artifacts";
import {
  nodeConnections,
  topologyDrift,
  topologyEdges,
  topologyNodes,
  topologyStats,
} from "@/lib/topology";

const nodeIcons = {
  console: Monitor,
  api: Server,
  database: Database,
  queue: ListOrdered,
  worker: Cog,
};

export function TopologyPreview({ onInspect }: { onInspect: (artifact: ArtifactKind) => void }) {
  const [selectedId, setSelectedId] = useState("api");
  const selected = topologyNodes.find((node) => node.id === selectedId) ?? topologyNodes[0];
  const stats = topologyStats();
  const drift = topologyDrift();
  if (!selected) return null;
  const SelectedIcon = nodeIcons[selected.id as keyof typeof nodeIcons] ?? Network;
  const selectedConnections = nodeConnections(selected.id);

  return (
    <div className="topology-preview">
      <header className="topology-header">
        <div>
          <p className="eyebrow">SYSTEM MAP / REVISION 01</p>
          <h2>Every service. Every connection.</h2>
          <p>Runtime relationships derived from the local Dispatch architecture fixtures.</p>
        </div>
        <div className="topology-summary" aria-label="Topology change summary">
          <span>
            <GitCompareArrows /> {stats.changedNodes} changed nodes
          </span>
          <span>
            <Braces /> {stats.changedEdges} changed links
          </span>
          <span className={stats.undocumented ? "text-warning" : "text-success"}>
            {stats.undocumented ? <AlertTriangle /> : <Check />}
            {stats.undocumented} drift signal
          </span>
        </div>
      </header>

      <div className="topology-map-wrap">
        <div className="topology-map-toolbar">
          <span>
            <Network /> RUNTIME TOPOLOGY
          </span>
          <div className="topology-legend" aria-label="Map legend">
            <span>
              <i className="unchanged" /> Unchanged
            </span>
            <span>
              <i className="changed" /> Revised
            </span>
            <span>
              <i className="drift" /> Undocumented
            </span>
          </div>
        </div>
        <div className="topology-scroll">
          <div className="topology-canvas">
            <svg viewBox="0 0 784 420" aria-hidden="true">
              <defs>
                <marker
                  id="topology-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              {topologyEdges.map((edge) => {
                const connected = edge.from === selected.id || edge.to === selected.id;
                return (
                  <g
                    key={edge.id}
                    className={`topology-edge ${edge.changed ? "changed" : ""} ${!edge.documented ? "undocumented" : ""} ${connected ? "connected" : "dimmed"}`}
                  >
                    <path d={edge.path} markerEnd="url(#topology-arrow)" />
                    <text x={edge.labelX} y={edge.labelY}>
                      {edge.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            {topologyNodes.map((node) => {
              const Icon = nodeIcons[node.id as keyof typeof nodeIcons] ?? Network;
              const connected =
                node.id === selected.id ||
                selectedConnections.some((edge) => edge.from === node.id || edge.to === node.id);
              return (
                <Button
                  key={node.id}
                  variant="ghost"
                  className={`topology-node ${node.revision} ${selected.id === node.id ? "selected" : ""} ${connected ? "" : "dimmed"}`}
                  style={{ left: node.x, top: node.y }}
                  aria-pressed={selected.id === node.id}
                  onClick={() => setSelectedId(node.id)}
                >
                  <span className="topology-node-icon">
                    <Icon />
                  </span>
                  <span>
                    <strong>{node.label}</strong>
                    <small>{node.technology}</small>
                  </span>
                  <i
                    aria-label={
                      node.revision === "changed" ? "Changed in this revision" : "Unchanged"
                    }
                  />
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="topology-inspector">
        <section className="topology-node-detail" aria-label="Selected service">
          <div className="topology-detail-title">
            <span>
              <SelectedIcon />
            </span>
            <div>
              <p className="eyebrow">SELECTED NODE / {selected.revision}</p>
              <h3>{selected.label}</h3>
            </div>
          </div>
          <p>{selected.description}</p>
          {selected.file && <code>{selected.file}</code>}
          {selected.artifact && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onInspect(selected.artifact as ArtifactKind)}
            >
              Inspect proposed change
              <ArrowUpRight />
            </Button>
          )}
        </section>

        <section className="topology-connections" aria-label="Selected service connections">
          <p className="eyebrow">CONNECTIONS / {selectedConnections.length}</p>
          {selectedConnections.map((edge) => {
            const outgoing = edge.from === selected.id;
            const otherId = outgoing ? edge.to : edge.from;
            const other = topologyNodes.find((node) => node.id === otherId);
            if (!other) return null;
            return (
              <Button key={edge.id} variant="ghost" onClick={() => setSelectedId(other.id)}>
                <span>{outgoing ? "OUT" : "IN"}</span>
                {outgoing ? <ArrowRight /> : <ArrowRight className="rotate-180" />}
                <strong>{other.label}</strong>
                <small>{edge.label}</small>
                {!edge.documented && <AlertTriangle className="text-warning" />}
              </Button>
            );
          })}
        </section>

        <aside className="topology-drift" aria-label="Architecture drift">
          <AlertTriangle />
          <div>
            <p className="eyebrow">ARCHITECTURE DRIFT / 01</p>
            <strong>Worker → PostgreSQL is undocumented.</strong>
            <p>
              The new result write is missing from docs/architecture.md. Update the blueprint before
              merging.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onInspect("terminal")}>
            Inspect worker
            <ArrowUpRight />
          </Button>
          <span className="sr-only">{drift.length} undocumented connection</span>
        </aside>
      </div>
    </div>
  );
}

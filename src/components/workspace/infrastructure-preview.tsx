import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  FileCode2,
  FileDiff,
  Folder,
  FolderOpen,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  infrastructureFiles,
  diffStats,
  projectFiles,
  projectTree,
  sourceDiff,
  type ProjectFile,
  type ProjectNode,
} from "@/lib/infrastructure";
import type { ArtifactKind } from "@/lib/artifacts";

function ProjectTreeNode({
  node,
  selectedPath,
  onSelect,
}: {
  node: ProjectNode;
  selectedPath: string;
  onSelect: (file: ProjectFile) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  if (node.type === "folder") {
    return (
      <li>
        <Button
          variant="ghost"
          className="infra-tree-row infra-tree-folder"
          aria-label={node.path}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown /> : <ChevronRight />}
          {expanded ? <FolderOpen /> : <Folder />}
          <span className="infra-tree-name">{node.name}</span>
        </Button>
        {expanded && (
          <ul className="infra-tree-children">
            {node.children.map((child) => (
              <ProjectTreeNode
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }
  const lines = sourceDiff(node.file.before, node.file.after);
  const additions = lines.filter((line) => line.type === "added").length;
  const deletions = lines.filter((line) => line.type === "removed").length;
  const changed = additions + deletions > 0;
  return (
    <li>
      <Button
        variant="ghost"
        className={`infra-tree-row infra-tree-file ${changed ? "changed" : ""} ${selectedPath === node.path ? "selected" : ""}`}
        aria-label={node.path}
        aria-pressed={selectedPath === node.path}
        title={node.path}
        onClick={() => onSelect(node.file)}
      >
        <FileCode2 />
        <span className="infra-tree-name">{node.name}</span>
        {changed && (
          <span
            className="infra-tree-counts"
            aria-label={`${additions} additions, ${deletions} deletions`}
          >
            <span className="text-success">+{additions}</span>
            <span className="text-destructive">−{deletions}</span>
          </span>
        )}
      </Button>
    </li>
  );
}

export function InfrastructurePreview({
  artifact,
  onSelect,
}: {
  artifact: ArtifactKind;
  onSelect: (kind: ArtifactKind) => void;
}) {
  const [mode, setMode] = useState<"changes" | "source">("changes");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<{ artifact: ArtifactKind; path: string } | null>(null);
  const defaultPath =
    infrastructureFiles.find((file) => file.kind === artifact)?.path ?? infrastructureFiles[0].path;
  const selectedPath = selection?.artifact === artifact ? selection.path : defaultPath;
  const selected = projectFiles.find((file) => file.path === selectedPath) ?? projectFiles[0];
  if (!selected) return null;
  const lines = sourceDiff(selected.before, selected.after);
  const stats = {
    additions: lines.filter((line) => line.type === "added").length,
    deletions: lines.filter((line) => line.type === "removed").length,
  };
  const changed = stats.additions + stats.deletions > 0;
  const total = infrastructureFiles.reduce(
    (sum, file) => {
      const stat = diffStats(file.kind);
      return {
        additions: sum.additions + stat.additions,
        deletions: sum.deletions + stat.deletions,
      };
    },
    { additions: 0, deletions: 0 },
  );
  async function copy() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.after);
      setCopied(true);
    } catch {
      setError("Clipboard unavailable.");
    }
  }
  return (
    <div className="infra-preview">
      <div className="infra-summary">
        <div className="flex items-center gap-2">
          <GitBranch className="size-3.5 text-primary" />
          <span>ASSEMBLY / 0042</span>
          <span className="session-pill">Sample diff</span>
        </div>
        <div className="flex gap-3">
          <span>
            {projectFiles.length} files · {infrastructureFiles.length} changed
          </span>
          <span className="text-success">+{total.additions}</span>
          <span className="text-destructive">−{total.deletions}</span>
        </div>
      </div>
      <div className="infra-layout">
        <aside className="infra-files" aria-label="Infrastructure files">
          <div className="infra-tree-heading">
            <span>PROJECT EXPLORER</span>
            <span>{projectFiles.length}</span>
          </div>
          <div className="infra-tree-scroll">
            <ul className="infra-tree" aria-label="Dispatch project files">
              <ProjectTreeNode
                node={projectTree}
                selectedPath={selected.path}
                onSelect={(file) => {
                  setSelection({ artifact: file.kind ?? artifact, path: file.path });
                  if (file.kind) onSelect(file.kind);
                  setMode(file.before === file.after ? "source" : "changes");
                  setCopied(false);
                  setError("");
                }}
              />
            </ul>
          </div>
          <p className="infra-local-label">
            LOCAL FIXTURE
            <br />
            NOT APPLIED
          </p>
        </aside>
        <section className="infra-editor" aria-label="Infrastructure code">
          <div className="infra-editor-toolbar">
            <span className="truncate font-mono text-[10px]">{selected.path}</span>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={mode === "changes"}
                className={`h-7 px-2 text-[10px] ${mode === "changes" ? "bg-accent text-primary" : "text-muted-foreground"}`}
                onClick={() => setMode("changes")}
              >
                <FileDiff className="size-3" />
                Changes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={mode === "source"}
                className={`h-7 px-2 text-[10px] ${mode === "source" ? "bg-accent text-primary" : "text-muted-foreground"}`}
                onClick={() => setMode("source")}
              >
                <Code2 className="size-3" />
                Source
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={copied ? "Source copied" : "Copy source"}
                title="Copy source"
                onClick={copy}
              >
                {copied ? <Check /> : <Copy />}
              </Button>
            </div>
          </div>
          <div className="infra-revision">
            <span>
              {!changed
                ? "UNCHANGED FILE"
                : mode === "changes"
                  ? "BASE → PROPOSED / UNIFIED DIFF"
                  : "PROPOSED SOURCE"}
            </span>
            <span>
              <span className="text-success">+{stats.additions}</span>
              <span className="ml-3 text-destructive">−{stats.deletions}</span>
            </span>
          </div>
          <div className="diff-scroll">
            {mode === "changes" ? (
              <table className="diff-table" aria-label="Highlighted code changes">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} className={`diff-${line.type}`}>
                      <td className="diff-number">{line.oldLine}</td>
                      <td className="diff-number">{line.newLine}</td>
                      <td className="diff-sign">
                        {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
                      </td>
                      <td className="diff-code">
                        <code>{line.content || " "}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre className="source-lines">
                {selected.after.split("\n").map((line, index) => (
                  <div key={index}>
                    <span>{index + 1}</span>
                    <code>{line || " "}</code>
                  </div>
                ))}
              </pre>
            )}
          </div>
          {error && (
            <p role="status" className="p-3 text-xs text-destructive">
              {error}
            </p>
          )}
          <footer className="infra-footer">
            <span className="status-dot" />
            Sample changes · No project files modified
          </footer>
        </section>
      </div>
    </div>
  );
}

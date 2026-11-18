import { useState } from "react";
import { Check, Code2, Copy, FileCode2, FileDiff, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { infrastructureFiles, fileDiff, diffStats, revisedCode } from "@/lib/infrastructure";
import type { ArtifactKind } from "@/lib/artifacts";

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
  const selected =
    infrastructureFiles.find((file) => file.kind === artifact) ?? infrastructureFiles[0];
  const stats = diffStats(selected.kind);
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
    try {
      await navigator.clipboard.writeText(revisedCode[selected.kind]);
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
          <span>4 files</span>
          <span className="text-success">+{total.additions}</span>
          <span className="text-destructive">−{total.deletions}</span>
        </div>
      </div>
      <div className="infra-layout">
        <aside className="infra-files" aria-label="Infrastructure files">
          <p className="eyebrow px-3 py-4">CHANGED FILES</p>
          {infrastructureFiles.map((file) => {
            const stat = diffStats(file.kind);
            return (
              <Button
                key={file.kind}
                variant="ghost"
                className={`infra-file ${selected.kind === file.kind ? "selected" : ""}`}
                onClick={() => {
                  onSelect(file.kind);
                  setCopied(false);
                }}
              >
                <FileCode2 className="size-3.5 shrink-0" />
                <span className="min-w-0 flex-1 text-left">
                  <span className="block text-[11px]">{file.label}</span>
                  <span className="block truncate font-mono text-[9px] text-muted-foreground">
                    {file.path}
                  </span>
                </span>
                <span className="text-[9px] text-success">+{stat.additions}</span>
              </Button>
            );
          })}
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
            <span>{mode === "changes" ? "BASE → PROPOSED / UNIFIED DIFF" : "PROPOSED SOURCE"}</span>
            <span>
              <span className="text-success">+{stats.additions}</span>
              <span className="ml-3 text-destructive">−{stats.deletions}</span>
            </span>
          </div>
          <div className="diff-scroll">
            {mode === "changes" ? (
              <table className="diff-table" aria-label="Highlighted code changes">
                <tbody>
                  {fileDiff(selected.kind).map((line, index) => (
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
                {revisedCode[selected.kind].split("\n").map((line, index) => (
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

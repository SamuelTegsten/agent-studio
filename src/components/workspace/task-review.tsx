import { useState } from "react";
import {
  ArrowRight,
  Check,
  FileDiff,
  GitMerge,
  GitBranch,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useDemoConversation } from "@/hooks/use-demo-conversation";
import {
  applyReviewRequest,
  canMerge,
  initialReview,
  mergeReview,
  reviewChanges,
  reviewMessages,
  reviewResponse,
} from "@/lib/task-review";
import systemImage from "@/assets/dispatch-review.asset.json";

const explanations = [
  {
    path: "services/jobs.openapi.json",
    title: "Predictable API responses",
    before: "Success response was unspecified.",
    after: "Success and not-found responses are documented.",
    outcome: "Clients can understand the expected outcomes.",
  },
  {
    path: "database/schema.sql",
    title: "A more traceable job record",
    before: "Status was unrestricted, with no attempt count or timestamps.",
    after: "Allowed states, an attempt counter, and creation time are proposed.",
    outcome: "Operators can inspect job history more clearly.",
  },
  {
    path: "workers/queue.ts",
    title: "Failures become visible",
    before: "Execution errors could leave the processing loop.",
    after: "The worker catches errors and records a failure.",
    outcome: "An operator can investigate before retrying.",
  },
  {
    path: "docs/architecture.md",
    title: "A human review checkpoint",
    before: "Delivery gates ended at health checks.",
    after: "Unknown outcomes go to operator review before replay.",
    outcome: "Recovery is intentional rather than automatic.",
  },
];

export function TaskReview({
  open,
  onOpenChange,
  taskBusy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskBusy: boolean;
}) {
  const [state, setState] = useState(initialReview);
  const [tab, setTab] = useState<"overview" | "changes">("overview");
  const [mobilePanel, setMobilePanel] = useState<"report" | "chat">("report");
  const [input, setInput] = useState("");
  const [confirm, setConfirm] = useState(false);
  const chat = useDemoConversation({
    initialMessages: reviewMessages,
    suggestions: ["What are the risks?", "Add updated_at to the schema"],
    responseFor: reviewResponse,
    onTurnComplete: (text) => setState((current) => applyReviewRequest(current, text)),
  });
  const changes = reviewChanges(state.files);
  const additions = changes.reduce((sum, change) => sum + change.additions, 0);
  const deletions = changes.reduce((sum, change) => sum + change.deletions, 0);
  const busy = taskBusy || chat.busy;
  const merged = state.mergedRevision !== null;
  function send(text: string) {
    if (merged) return;
    if (chat.send(text, [], "build")) {
      setInput("");
      setState((current) => ({ ...current, approvedRevision: null }));
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="task-review-window">
        <header className="review-header">
          <div className="review-title">
            <span className="review-icon">
              <FileDiff />
            </span>
            <div>
              <p className="eyebrow">DISPATCH / REVIEW GATE</p>
              <DialogTitle>Review assembly / 0042</DialogTitle>
              <DialogDescription>
                Sample revision {state.revision} · {changes.length} changed files · Frontend demo
              </DialogDescription>
            </div>
          </div>
          <span className={`review-status ${merged ? "merged" : ""}`}>
            {merged ? <Check /> : <GitBranch />}
            {merged ? "Merged · demo" : busy ? "Revision in progress" : "Awaiting review"}
          </span>
        </header>
        <nav className="review-mobile-nav" aria-label="Review panels">
          <Button
            variant="ghost"
            aria-pressed={mobilePanel === "report"}
            onClick={() => setMobilePanel("report")}
          >
            <FileDiff />
            Report
          </Button>
          <Button
            variant="ghost"
            aria-pressed={mobilePanel === "chat"}
            onClick={() => setMobilePanel("chat")}
          >
            <MessageSquare />
            Review chat
          </Button>
        </nav>
        <div className={`review-body review-show-${mobilePanel}`}>
          <section className="review-chat" aria-label="Review conversation">
            <header>
              <MessageSquare />
              <h3>Review with Forma</h3>
              <span className="session-pill">SIMULATED</span>
            </header>
            <Conversation className="min-h-0 flex-1">
              <ConversationContent className="review-chat-content">
                {chat.messages.map((message) => (
                  <Message
                    key={message.id}
                    from={message.role}
                    className={`chat-message ${message.role === "user" ? "is-user" : "is-assistant"}`}
                  >
                    <MessageContent>
                      {message.parts.map((part, index) =>
                        part.type === "text" ? (
                          <MessageResponse
                            key={index}
                            className={message.id === chat.activeId ? "streaming-response" : ""}
                          >
                            {part.text}
                          </MessageResponse>
                        ) : null,
                      )}
                    </MessageContent>
                  </Message>
                ))}
                {chat.phase === "thinking" && <Shimmer>Reviewing your request…</Shimmer>}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
            <div className="review-composer">
              <div className="chat-suggestions">
                {!merged &&
                  chat.suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      className="suggestion-button"
                      disabled={busy}
                      onClick={() => send(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
              </div>
              <PromptInput onSubmit={({ text }) => send(text)} className="composer">
                <PromptInputTextarea
                  aria-label="Review message"
                  placeholder={
                    merged
                      ? "This sample revision is merged"
                      : "Ask a question or request a change…"
                  }
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={merged || busy}
                />
                <PromptInputFooter>
                  <span className="review-composer-label">REVISION {state.revision} / LOCAL</span>
                  <PromptInputSubmit
                    aria-label={chat.busy ? "Stop review response" : "Send review message"}
                    status={chat.busy ? "streaming" : "ready"}
                    disabled={merged || (!chat.busy && !input.trim())}
                    onClick={
                      chat.busy
                        ? (event) => {
                            event.preventDefault();
                            chat.stop();
                          }
                        : undefined
                    }
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </section>
          <section className="review-report" aria-label="Change report">
            <div className="review-tabs" role="tablist" aria-label="Review views">
              <Button
                variant="ghost"
                role="tab"
                aria-selected={tab === "overview"}
                onClick={() => setTab("overview")}
              >
                Overview
              </Button>
              <Button
                variant="ghost"
                role="tab"
                aria-selected={tab === "changes"}
                onClick={() => setTab("changes")}
              >
                All changes <span>{changes.length}</span>
              </Button>
              <span className="review-diff-total">
                <span className="text-success">+{additions}</span>
                <span className="text-destructive">−{deletions}</span>
              </span>
            </div>
            <div className="review-report-scroll">
              {tab === "overview" ? (
                <>
                  <section className="review-intro">
                    <p className="eyebrow">WHAT CHANGED</p>
                    <h2>Safer jobs. Clearer outcomes.</h2>
                    <p>
                      The proposal makes failures easier to inspect and adds a human checkpoint
                      before replaying work.
                    </p>
                  </section>
                  <figure className="review-system-image">
                    <img
                      src={systemImage.url}
                      alt="Illustrated operator console, API gateway, job database, and queue worker connected in order"
                    />
                    <figcaption>
                      Console <ArrowRight /> Jobs API <ArrowRight /> Job store <ArrowRight /> Worker
                    </figcaption>
                  </figure>
                  <section className="review-impact">
                    <div className="review-section-heading">
                      <h3>Change footprint</h3>
                      <span>Lines added / removed</span>
                    </div>
                    <svg
                      className="review-change-graph"
                      viewBox="0 0 560 148"
                      role="img"
                      aria-label={`Change graph: ${additions} lines added, ${deletions} removed across ${changes.length} files`}
                    >
                      {changes.map((change, index) => (
                        <g key={change.file.path}>
                          <text x="0" y={index * 35 + 21}>
                            {change.file.path.split("/").at(-1)}
                          </text>
                          <rect
                            className="review-graph-track"
                            x="180"
                            y={index * 35 + 8}
                            width="300"
                            height="16"
                            rx="2"
                          />
                          <rect
                            className="review-graph-added"
                            x="180"
                            y={index * 35 + 8}
                            width={
                              (change.additions /
                                Math.max(
                                  ...changes.map((item) => item.additions + item.deletions),
                                )) *
                              300
                            }
                            height="16"
                            rx="2"
                          />
                          <rect
                            className="review-graph-removed"
                            x={
                              180 +
                              (change.additions /
                                Math.max(
                                  ...changes.map((item) => item.additions + item.deletions),
                                )) *
                                300
                            }
                            y={index * 35 + 8}
                            width={
                              (change.deletions /
                                Math.max(
                                  ...changes.map((item) => item.additions + item.deletions),
                                )) *
                              300
                            }
                            height="16"
                          />
                          <text x="495" y={index * 35 + 21}>
                            +{change.additions} −{change.deletions}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </section>
                  <section className="review-breakdown">
                    <h3>The breakdown</h3>
                    {explanations.map((item, index) => (
                      <article key={item.path}>
                        <span className="review-step">0{index + 1}</span>
                        <div>
                          <h4>{item.title}</h4>
                          <p className="review-file-path">{item.path}</p>
                          <dl>
                            <dt>Before</dt>
                            <dd>{item.before}</dd>
                            <dt>After</dt>
                            <dd>
                              {item.after}
                              {item.path === "database/schema.sql" && state.revision > 1
                                ? " The latest revision also adds an updated_at default."
                                : ""}
                            </dd>
                          </dl>
                          <p className="review-outcome">{item.outcome}</p>
                        </div>
                      </article>
                    ))}
                  </section>
                  <div className="review-warning">
                    <ShieldAlert />
                    <div>
                      <strong>Review is not a release check.</strong>
                      <p>
                        Tests, migrations, and services have not run. Validate existing job states
                        and failure handling before using this proposal in a real project.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="review-all-diffs">
                  {changes.map((change) => (
                    <section key={change.file.path} className="review-file-diff">
                      <header>
                        <FileDiff />
                        <h3>{change.file.path}</h3>
                        <span className="text-success">+{change.additions}</span>
                        <span className="text-destructive">−{change.deletions}</span>
                      </header>
                      <div className="review-code-scroll">
                        <table className="diff-table" aria-label={`Changes in ${change.file.path}`}>
                          <tbody>
                            {change.lines.map((line, index) => (
                              <tr key={index} className={`diff-${line.type}`}>
                                <td className="diff-number">{line.oldLine}</td>
                                <td className="diff-number">{line.newLine}</td>
                                <td className="diff-sign">
                                  {line.type === "added"
                                    ? "+"
                                    : line.type === "removed"
                                      ? "−"
                                      : " "}
                                </td>
                                <td className="diff-code">
                                  <code>{line.content || " "}</code>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
        <footer className="review-merge-footer">
          {merged ? (
            <p role="status" className="review-merged-message">
              <Check />
              Sample revision {state.mergedRevision} merged into master. No repository was changed.
            </p>
          ) : (
            <label className="review-approval">
              <Checkbox
                checked={state.approvedRevision === state.revision}
                disabled={busy}
                onCheckedChange={(checked) =>
                  setState((current) => ({
                    ...current,
                    approvedRevision: checked === true ? current.revision : null,
                  }))
                }
              />
              <span>
                I reviewed revision {state.revision}
                <small>Sample merge only · no repository connected</small>
              </span>
            </label>
          )}
          <Button disabled={!canMerge(state, busy)} onClick={() => setConfirm(true)}>
            <GitMerge />
            {merged ? "Merged to master · demo" : "Merge into master"}
          </Button>
        </footer>
        <Dialog open={confirm} onOpenChange={setConfirm}>
          <DialogContent>
            <DialogTitle>Merge revision {state.revision} into master?</DialogTitle>
            <DialogDescription>
              This marks the reviewed sample as merged for this session only. It does not change a
              Git branch, publish, or run checks.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirm(false)}>
                Cancel
              </Button>
              <Button
                disabled={!canMerge(state, busy)}
                onClick={() => {
                  setState((current) => mergeReview(current, busy));
                  setConfirm(false);
                }}
              >
                <GitMerge />
                Confirm demo merge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

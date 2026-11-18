import { useEffect, useRef, useState } from "react";
import type { UIMessage } from "ai";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  Files,
  GitBranch,
  History,
  LayoutPanelLeft,
  LockKeyhole,
  Maximize2,
  MessageSquare,
  Monitor,
  MoreHorizontal,
  MousePointer2,
  Paperclip,
  Play,
  Terminal,
  Plus,
  RotateCcw,
  Settings2,
  Smartphone,
  Square,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationDownload,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { BrandMark } from "./brand";
import { ArtifactPreview } from "./artifact-preview";
import { InfrastructurePreview } from "./infrastructure-preview";
import { availableSections, projectCapabilities, type PreviewSection } from "@/lib/infrastructure";
import { type ArtifactKind } from "@/lib/artifacts";
import { toolTitles } from "@/lib/chat-demo";
import { useDemoConversation } from "@/hooks/use-demo-conversation";

function IconButton({
  label,
  children,
  onClick,
  active = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          className="rail-action"
          data-active={active}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
function AttachmentList() {
  const attachments = usePromptInputAttachments();
  if (!attachments.files.length) return null;
  return (
    <div className="flex w-full flex-wrap gap-2 px-3 pt-3">
      {attachments.files.map((file) => (
        <div
          key={file.id}
          className="flex max-w-full items-center gap-2 rounded-md border bg-muted px-2 py-1 text-xs"
        >
          <Paperclip className="size-3 shrink-0" />
          <span className="max-w-44 truncate">{file.filename}</span>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label={`Remove ${file.filename}`}
            onClick={() => attachments.remove(file.id)}
          >
            <X className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function DevelopmentWorkspace() {
  const chat = useDemoConversation();
  const { messages, busy } = chat;
  const [input, setInput] = useState("");

  const [mode, setMode] = useState<"build" | "plan">("build");
  const [view, setView] = useState<PreviewSection>("infrastructure");
  const [artifact, setArtifact] = useState<ArtifactKind>("api");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [dialog, setDialog] = useState<"files" | "history" | "settings" | "share" | "reset" | null>(
    null,
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [previewKey, setPreviewKey] = useState(0);
  const [notice, setNotice] = useState("");

  const textarea = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showPreview && !dialog && !busy) textarea.current?.focus();
  }, [showPreview, dialog, busy]);
  function send(
    text: string,
    files: { type: "file"; mediaType: string; url: string; filename?: string }[],
  ) {
    if (chat.send(text, files, mode)) setInput("");
  }
  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      setNotice("Clipboard unavailable in this browser.");
    }
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await previewRef.current?.requestFullscreen();
    } catch {
      setNotice("Fullscreen is unavailable in this browser.");
    }
  }
  return (
    <TooltipProvider delayDuration={250}>
      <main className={`workspace ${showPreview ? "show-preview" : ""}`}>
        <aside className="rail" aria-label="Workspace navigation">
          <BrandMark />
          <div className="rail-divider" />
          <IconButton
            label="Conversation"
            active={!showPreview}
            onClick={() => setShowPreview(false)}
          >
            <MessageSquare />
          </IconButton>
          <IconButton
            label="Project preview"
            active={showPreview}
            onClick={() => {
              setShowPreview(true);
              setView("infrastructure");
            }}
          >
            <LayoutPanelLeft />
          </IconButton>
          <IconButton label="Project files" onClick={() => setDialog("files")}>
            <Files />
          </IconButton>
          <IconButton label="Version history" onClick={() => setDialog("history")}>
            <History />
          </IconButton>
          <div className="mt-auto" />
          <IconButton label="Workspace settings" onClick={() => setDialog("settings")}>
            <Settings2 />
          </IconButton>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full bg-accent text-xs text-primary"
                onClick={() => setDialog("settings")}
                aria-label="Samuel’s workspace"
              >
                ST
              </Button>
            </TooltipTrigger>
            <TooltipContent>Samuel’s workspace</TooltipContent>
          </Tooltip>
        </aside>
        <header className="workspace-header">
          <div className="flex min-w-0 items-center gap-3">
            <span className="project-icon">
              <LayoutPanelLeft className="size-4" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[13px] font-semibold">Dispatch / Factory</h1>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs" aria-label="Project menu">
                      <ChevronDown className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setDialog("files")}>
                      Project files
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDialog("reset")}>
                      Reset conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-[10px] text-muted-foreground">
                FACTORY / 01 <span className="mx-1">/</span> Software assembly line
              </p>
            </div>
            <span className="header-secondary ml-3 flex items-center gap-1.5 border-l pl-4 text-[10px] text-muted-foreground">
              <LockKeyhole className="size-3" /> Private
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="header-secondary flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="status-dot" /> SESSION / LOCAL
            </span>
            <Button size="sm" onClick={() => setDialog("share")} className="gap-2 text-xs">
              <ArrowUpRight className="size-3.5" />
              Share
            </Button>
          </div>
        </header>
        <section className="chat-panel" aria-label="Development chat">
          <div className="panel-heading">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold">Agent</span>
              <span className="session-pill">Frontend demo</span>
            </div>
            <div className="flex gap-1">
              <IconButton label="Replay example conversation" onClick={chat.replay}>
                <Play />
              </IconButton>
              <IconButton label="Reset conversation" onClick={() => setDialog("reset")}>
                <Plus />
              </IconButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" variant="ghost" aria-label="Conversation actions">
                    <MoreHorizontal className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <ConversationDownload
                    messages={messages}
                    filename="factory-conversation.md"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <ArrowDownToLine />
                    Export conversation
                  </ConversationDownload>
                  <DropdownMenuItem onClick={() => setDialog("reset")}>
                    Reset conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="chat-runbar">
            <span className={busy ? "run-indicator running" : "run-indicator"} />
            <span>
              {chat.replaying
                ? `EXAMPLE RUN / ${chat.replayStep} OF 3`
                : busy
                  ? "AGENT WORKING"
                  : chat.completed
                    ? "EXAMPLE COMPLETE"
                    : "DISPATCH / DEVELOPMENT"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto h-6 px-2 text-[10px]"
              onClick={busy ? chat.stop : chat.replay}
            >
              {busy ? <Square className="size-3" /> : <Play className="size-3" />}
              {busy ? "Stop" : chat.completed ? "Replay" : "Run example"}
            </Button>
          </div>
          <Conversation>
            <ConversationContent className="chat-content">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                Today
                <div className="h-px flex-1 bg-border" />
              </div>
              {messages.map((message) => (
                <Message key={message.id} from={message.role} className="chat-message appear">
                  {message.role === "assistant" && (
                    <div className="agent-label">
                      <BrandMark />
                      Forma
                      <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                        {message.id === chat.activeId ? "LIVE" : "SIMULATED"}
                      </span>
                    </div>
                  )}
                  <MessageContent>
                    {message.parts.map((part, index) => {
                      if (part.type === "text")
                        return (
                          <MessageResponse
                            key={index}
                            isAnimating={
                              message.id === chat.activeId &&
                              chat.phase === "streaming" &&
                              index === message.parts.length - 1
                            }
                            className={
                              message.id === chat.activeId &&
                              chat.phase === "streaming" &&
                              index === message.parts.length - 1
                                ? "streaming-response"
                                : ""
                            }
                          >
                            {part.text}
                          </MessageResponse>
                        );
                      if (part.type === "file")
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <Paperclip className="size-3" />
                            {part.filename ?? "Attachment"}
                          </div>
                        );
                      if (part.type === "dynamic-tool")
                        return (
                          <Tool key={part.toolCallId} defaultOpen={false} className="activity-tool">
                            <ToolHeader
                              className="tool-header"
                              type="dynamic-tool"
                              toolName={part.toolName}
                              state={part.state}
                              title={toolTitles[part.toolName] ?? part.toolName}
                            />
                            <ToolContent>
                              <ToolInput input={part.input} />
                              <ToolOutput output={part.output} errorText={part.errorText} />
                            </ToolContent>
                          </Tool>
                        );
                      return null;
                    })}
                    {message.id === "response" && (
                      <div className="mt-2 overflow-hidden rounded-lg border">
                        <div className="flex items-center gap-3 bg-muted/50 p-3">
                          <span className="grid size-8 place-items-center rounded-md border bg-card text-primary">
                            <LayoutPanelLeft className="size-4" />
                          </span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold">Full-stack assembly / 0042</p>
                            <p className="text-[10px] text-muted-foreground">
                              Version 1 <span className="mx-1">·</span> 5 sample artifacts
                            </p>
                          </div>
                          <span className="size-5 rounded-full bg-accent p-1 text-success">
                            <Check className="size-3" />
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t px-3 py-2">
                          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="status-dot" />
                            Preview ready
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 px-1 text-[10px] text-primary"
                            onClick={() => {
                              setShowPreview(true);
                              setView("infrastructure");
                            }}
                          >
                            View preview
                            <ArrowUpRight className="size-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </MessageContent>
                  {message.role === "assistant" && message.id !== chat.activeId && (
                    <MessageActions className="mt-1 gap-0 text-muted-foreground">
                      <MessageAction
                        tooltip={copied === message.id ? "Copied" : "Copy response"}
                        onClick={() =>
                          copy(
                            message.parts
                              .filter((p) => p.type === "text")
                              .map((p) => p.text)
                              .join("\n\n"),
                            message.id,
                          )
                        }
                      >
                        {copied === message.id ? <Check /> : <Copy />}
                      </MessageAction>
                      <MessageAction
                        tooltip="Helpful"
                        onClick={() =>
                          setFeedback((current) => ({ ...current, [message.id]: "up" }))
                        }
                        className={feedback[message.id] === "up" ? "text-primary bg-accent" : ""}
                      >
                        <ThumbsUp />
                      </MessageAction>
                      <MessageAction
                        tooltip="Not helpful"
                        onClick={() =>
                          setFeedback((current) => ({ ...current, [message.id]: "down" }))
                        }
                        className={feedback[message.id] === "down" ? "text-primary bg-accent" : ""}
                      >
                        <ThumbsDown />
                      </MessageAction>
                      <span className="ml-auto text-[9px] text-muted-foreground">
                        {chat.stoppedIds.includes(message.id) ? "STOPPED" : "✓ COMPLETE"}
                      </span>
                    </MessageActions>
                  )}
                </Message>
              ))}
              {busy && (
                <div className="generation-status" role="status">
                  <span className="run-indicator running" />
                  <Shimmer>
                    {chat.phase === "working"
                      ? "Inspecting local fixtures…"
                      : chat.phase === "streaming"
                        ? "Composing response…"
                        : chat.replaying && chat.phase === "idle"
                          ? "Next checkpoint…"
                          : "Tracing the next step…"}
                  </Shimmer>
                </div>
              )}
              {!busy && chat.recommendedArtifact && (
                <Button
                  variant="outline"
                  size="sm"
                  className="artifact-followup"
                  onClick={() => {
                    if (chat.recommendedArtifact) setArtifact(chat.recommendedArtifact);
                    setView("infrastructure");
                    setShowPreview(true);
                  }}
                >
                  <Terminal className="size-3.5" />
                  Inspect {chat.recommendedArtifact} output
                  <ArrowUpRight className="ml-auto size-3.5" />
                </Button>
              )}
            </ConversationContent>
            <ConversationScrollButton aria-label="Scroll to latest message" />
          </Conversation>
          <div className="composer-wrap">
            <div className="chat-suggestions">
              {chat.suggestions.slice(0, 2).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => send(suggestion, [])}
                  className="suggestion-button"
                >
                  <ArrowUpRight className="size-3" />
                  {suggestion}
                </Button>
              ))}
            </div>
            <PromptInput
              className="composer"
              multiple
              onSubmit={({ text, files }) => send(text, files)}
              onError={(error) => setNotice(error.message)}
            >
              <AttachmentList />
              <PromptInputTextarea
                ref={textarea}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  busy ? "Draft your next instruction…" : "Give the factory its next instruction…"
                }
                aria-label="Message Forma"
              />
              <PromptInputFooter>
                <div className="flex items-center gap-1">
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger
                      aria-label="Add attachment"
                      title="Add attachment"
                    >
                      <Plus className="size-4" />
                    </PromptInputActionMenuTrigger>
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments label="Attach files" />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-[11px] text-muted-foreground"
                      >
                        <span className="size-1.5 rounded-full bg-primary" />
                        {mode === "build" ? "Build" : "Plan"}
                        <ChevronDown className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setMode("build")}>
                        <Code2 />
                        Build{mode === "build" && <Check className="ml-auto" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setMode("plan")}>
                        <MessageSquare />
                        Plan{mode === "plan" && <Check className="ml-auto" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <PromptInputSubmit
                  status={busy ? "streaming" : "ready"}
                  disabled={!busy && !input.trim()}
                  onStop={chat.stop}
                  className="rounded-md"
                  title={busy ? "Stop" : "Send message"}
                >
                  {busy ? <Square className="size-3.5" /> : <ArrowUp className="size-4" />}
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
            <div className="mt-2.5 flex items-center justify-between text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="status-dot" />
                LOCAL / NOMINAL
              </span>
              <span>
                UI simulation <span className="mx-1">·</span> Session resets on refresh
              </span>
            </div>
            {notice && (
              <p role="status" className="mt-2 text-xs text-destructive">
                {notice}
              </p>
            )}
          </div>
        </section>
        <section className="preview-panel" aria-label="Project preview">
          <div className="preview-toolbar">
            <div className="primary-preview-tabs" role="tablist" aria-label="Preview sections">
              {availableSections(projectCapabilities.hasFrontend).map((section) => (
                <Button
                  key={section}
                  role="tab"
                  aria-selected={view === section}
                  variant="ghost"
                  size="sm"
                  onClick={() => setView(section)}
                  className={view === section ? "selected" : ""}
                >
                  {section === "infrastructure" ? (
                    <Code2 className="size-3.5" />
                  ) : (
                    <Monitor className="size-3.5" />
                  )}
                  {section === "infrastructure" ? "Infrastructure" : "Frontend"}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {view === "frontend" && (
                <>
                  <IconButton
                    label="Desktop preview"
                    active={device === "desktop"}
                    onClick={() => setDevice("desktop")}
                  >
                    <Monitor />
                  </IconButton>
                  <IconButton
                    label="Mobile preview"
                    active={device === "mobile"}
                    onClick={() => setDevice("mobile")}
                  >
                    <Smartphone />
                  </IconButton>
                </>
              )}
              <IconButton label="Fullscreen preview" onClick={fullscreen}>
                <Maximize2 />
              </IconButton>
            </div>
          </div>
          <div
            ref={previewRef}
            className={`browser-frame ${device === "mobile" && view === "frontend" ? "mobile-frame" : ""}`}
          >
            {view === "infrastructure" ? (
              <InfrastructurePreview artifact={artifact} onSelect={setArtifact} />
            ) : (
              <>
                <div className="browser-bar">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Refresh preview"
                    onClick={() => setPreviewKey((key) => key + 1)}
                  >
                    <RotateCcw className="size-3" />
                  </Button>
                  <div className="address-bar">
                    <LockKeyhole className="size-2.5" />
                    dispatch.local / overview
                  </div>
                  <IconButton label="Expand preview" onClick={fullscreen}>
                    <ExternalLink />
                  </IconButton>
                </div>
                <ArtifactPreview key={previewKey} kind="web" />
              </>
            )}
          </div>
          <div className="preview-footnote">
            <span className="flex items-center gap-1.5">
              <span className="status-dot" />
              {view === "infrastructure"
                ? "INFRASTRUCTURE / SAMPLE CHANGES"
                : "FRONTEND / LOCAL PREVIEW"}
            </span>
            <span className="flex items-center gap-1.5">
              <GitBranch className="size-3" />
              main · v1
            </span>
          </div>
        </section>
        <Dialog
          open={dialog !== null}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {dialog === "files"
                  ? "Project files"
                  : dialog === "history"
                    ? "Version history"
                    : dialog === "share"
                      ? "Share Dispatch / Factory"
                      : dialog === "reset"
                        ? "Reset this conversation?"
                        : "Workspace settings"}
              </DialogTitle>
              <DialogDescription>
                {dialog === "reset"
                  ? "Your session messages will be removed. The original sample conversation will be restored."
                  : dialog === "share"
                    ? "Export this session or copy the current workspace link."
                    : "Dispatch / Factory · Frontend demo"}
              </DialogDescription>
            </DialogHeader>
            {dialog === "files" && (
              <div className="space-y-1">
                {[
                  "src/components/workspace/artifact-preview.tsx",
                  "src/styles.css",
                  "AGENT.md",
                  "CLAUDE.md",
                ].map((file) => (
                  <div
                    className="flex items-center gap-2 rounded-md bg-muted px-3 py-3 text-xs"
                    key={file}
                  >
                    <Files className="size-4 shrink-0 text-muted-foreground" />
                    <span className="break-all">{file}</span>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDialog(null);
                    setView("infrastructure");
                    setShowPreview(true);
                  }}
                >
                  <Code2 />
                  View sample code
                </Button>
              </div>
            )}
            {dialog === "history" && (
              <div className="flex gap-3 rounded-md border p-4">
                <Check className="size-4 text-success" />
                <div>
                  <p className="text-sm font-medium">Version 1 — Full-stack assembly / 0042</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Initial sample · 5 sample artifacts
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0"
                    onClick={() => {
                      setDialog(null);
                      setView("infrastructure");
                      setShowPreview(true);
                    }}
                  >
                    Open preview
                    <ArrowRight />
                  </Button>
                </div>
              </div>
            )}
            {dialog === "settings" && (
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Workspace</dt>
                  <dd>Personal</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Conversation</dt>
                  <dd>Single session</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">History</dt>
                  <dd>Resets on refresh</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Agent connection</dt>
                  <dd>Demo only</dd>
                </div>
              </dl>
            )}
            {dialog === "share" && (
              <div className="flex flex-col gap-3">
                <Button variant="outline" onClick={() => copy(window.location.href, "link")}>
                  {copied === "link" ? <Check /> : <Copy />}
                  {copied === "link" ? "Link copied" : "Copy workspace link"}
                </Button>
                <ConversationDownload
                  messages={messages}
                  filename="factory-conversation.md"
                  variant="outline"
                >
                  <ArrowDownToLine />
                  Export conversation
                </ConversationDownload>
                <p className="text-xs text-muted-foreground">
                  The link opens the demo. Session messages are not shared or saved.
                </p>
              </div>
            )}
            {dialog === "reset" && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialog(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    chat.reset();
                    setInput("");
                    setFeedback({});
                    setDialog(null);
                  }}
                >
                  Reset conversation
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  );
}

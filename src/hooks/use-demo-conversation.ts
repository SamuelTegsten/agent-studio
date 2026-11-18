import { useEffect, useRef, useState } from "react";
import type { FileUIPart, UIMessage } from "ai";
import {
  demoScenarios,
  initialMessages,
  responseFor,
  revealWords,
  type DemoScenario,
} from "@/lib/chat-demo";
import type { ArtifactKind } from "@/lib/artifacts";

type Phase = "idle" | "thinking" | "working" | "streaming";
type ConversationOptions = {
  initialMessages?: UIMessage[];
  suggestions?: string[];
  responseFor?: typeof responseFor;
  onTurnComplete?: (input: string) => void;
};
export function useDemoConversation(options: ConversationOptions = {}) {
  const [messages, setMessages] = useState<UIMessage[]>(options.initialMessages ?? initialMessages);
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState(
    options.suggestions ?? ["Inspect the API", "Review the job schema", "Trace a worker failure"],
  );
  const [replaying, setReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [recommendedArtifact, setRecommendedArtifact] = useState<ArtifactKind | null>(null);
  const [stoppedIds, setStoppedIds] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef<string | null>(null);
  const playing = useRef(false);
  const running = useRef(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function clear() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  function startTurn(
    input: string,
    scenario: DemoScenario,
    files: FileUIPart[],
    next?: () => void,
  ) {
    clear();
    running.current = true;
    const id = crypto.randomUUID();
    active.current = id;
    setActiveId(id);
    setPhase("thinking");
    setCompleted(false);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text: input }, ...files] },
      { id, role: "assistant", parts: [] },
    ]);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let partIndex = 0;
    function patch(parts: UIMessage["parts"]) {
      setMessages((current) =>
        current.map((message) => (message.id === id ? { ...message, parts } : message)),
      );
    }
    const finishedParts: UIMessage["parts"] = [];
    function advance() {
      if (active.current !== id) return;
      const part = scenario.parts[partIndex];
      if (!part) {
        running.current = false;
        active.current = null;
        setPhase("idle");
        setActiveId(null);
        setSuggestions(scenario.suggestions);
        setRecommendedArtifact(scenario.artifact);
        options.onTurnComplete?.(input);
        next?.();
        return;
      }
      if (part.type === "text") {
        const textPart = part;
        setPhase("streaming");
        const words = part.text.match(/\S+\s*/g)?.length ?? 0;
        let count = 0;
        function tick() {
          if (active.current !== id) return;
          count = reduced ? words : count + 3;
          patch([...finishedParts, { type: "text", text: revealWords(textPart.text, count) }]);
          if (count >= words) {
            finishedParts.push(textPart);
            partIndex++;
            timer.current = setTimeout(advance, reduced ? 0 : 180);
          } else timer.current = setTimeout(tick, 65);
        }
        tick();
      } else if (part.type === "dynamic-tool") {
        setPhase("working");
        patch([
          ...finishedParts,
          {
            type: "dynamic-tool",
            toolName: part.toolName,
            toolCallId: `${id}-${part.toolCallId}`,
            state: "input-available",
            input: part.input,
          },
        ]);
        timer.current = setTimeout(
          () => {
            if (active.current !== id) return;
            finishedParts.push({ ...part, toolCallId: `${id}-${part.toolCallId}` });
            patch([...finishedParts]);
            partIndex++;
            timer.current = setTimeout(advance, 220);
          },
          reduced ? 0 : 1000,
        );
      } else {
        finishedParts.push(part);
        partIndex++;
        advance();
      }
    }
    timer.current = setTimeout(advance, reduced ? 0 : 700);
  }
  function send(input: string, files: FileUIPart[], mode: "build" | "plan") {
    if (running.current || playing.current || (!input.trim() && !files.length)) return false;
    startTurn(
      input.trim() || "Review the attached files",
      (options.responseFor ?? responseFor)(input, mode),
      files,
    );
    return true;
  }
  function stop() {
    clear();
    playing.current = false;
    running.current = false;
    setReplaying(false);
    setPhase("idle");
    const id = active.current;
    if (id) {
      setStoppedIds((current) => [...current, id]);
      setMessages((current) =>
        current.map((message) =>
          message.id === id
            ? {
                ...message,
                parts: message.parts
                  .filter(
                    (part) => part.type !== "dynamic-tool" || part.state !== "input-available",
                  )
                  .concat({
                    type: "text",
                    text: "\n\n_Stopped here. The partial response is preserved._",
                  }),
              }
            : message,
        ),
      );
    }
    active.current = null;
    setActiveId(null);
  }
  function reset() {
    stop();
    setMessages(options.initialMessages ?? initialMessages);
    setReplayStep(0);
    setCompleted(false);
    setStoppedIds([]);
    setRecommendedArtifact(null);
    setSuggestions(
      options.suggestions ?? ["Inspect the API", "Review the job schema", "Trace a worker failure"],
    );
  }
  function replay() {
    if (running.current || playing.current) return;
    reset();
    playing.current = true;
    setReplaying(true);
    function play(index: number) {
      if (!playing.current) return;
      const scenario = demoScenarios[index];
      if (!scenario) {
        playing.current = false;
        setReplaying(false);
        setCompleted(true);
        return;
      }
      setReplayStep(index + 1);
      startTurn(scenario.prompt, scenario, [], () => {
        if (playing.current) timer.current = setTimeout(() => play(index + 1), 1200);
      });
    }
    play(0);
  }
  return {
    messages,
    phase,
    activeId,
    suggestions,
    replaying,
    replayStep,
    completed,
    recommendedArtifact,
    stoppedIds,
    busy: phase !== "idle" || replaying,
    send,
    stop,
    reset,
    replay,
  };
}

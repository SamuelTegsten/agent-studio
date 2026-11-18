import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDemoConversation } from "@/hooks/use-demo-conversation";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("conversation lifecycle", () => {
  it("appends input immediately and progressively reveals the response", () => {
    const { result } = renderHook(() => useDemoConversation());
    act(() => {
      result.current.send("Inspect the API", [], "build");
    });
    expect(result.current.messages).toHaveLength(4);
    expect(result.current.phase).toBe("thinking");
    act(() => {
      vi.advanceTimersByTime(700);
    });
    const partial = result.current.messages.at(-1)?.parts[0];
    expect(partial?.type).toBe("text");
    if (partial?.type === "text") expect(partial.text.split(" ").length).toBeLessThan(8);
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.phase).toBe("idle");
    expect(result.current.recommendedArtifact).toBe("api");
  });
  it("stops without losing partial text or allowing delayed output", () => {
    const { result } = renderHook(() => useDemoConversation());
    act(() => {
      result.current.send("Inspect the API", [], "build");
      vi.advanceTimersByTime(830);
    });
    act(() => {
      result.current.stop();
    });
    const stopped = result.current.messages;
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.messages).toEqual(stopped);
    expect(result.current.stoppedIds).toHaveLength(1);
    expect(result.current.busy).toBe(false);
  });
  it("replays exactly three turns and does not accept concurrent sending", () => {
    const { result } = renderHook(() => useDemoConversation());
    act(() => {
      result.current.replay();
    });
    let accepted = true;
    act(() => {
      accepted = result.current.send("extra", [], "build");
    });
    expect(accepted).toBe(false);
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current.messages.filter((message) => message.role === "user")).toHaveLength(4);
    expect(result.current.completed).toBe(true);
    expect(result.current.replaying).toBe(false);
  });
  it("reset cancels replay and restores the initial conversation", () => {
    const { result } = renderHook(() => useDemoConversation());
    act(() => {
      result.current.replay();
    });
    act(() => {
      result.current.reset();
      vi.runAllTimers();
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.busy).toBe(false);
  });
});

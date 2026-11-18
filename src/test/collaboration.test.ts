import { describe, expect, it } from "vitest";
import { canInstruct, handOff, participant } from "@/lib/collaboration";

describe("shared session control", () => {
  it("only the idle driver can instruct the agent", () => {
    expect(canInstruct("you", "you", false)).toBe(true);
    expect(canInstruct("mira", "you", false)).toBe(false);
    expect(canInstruct("you", "you", true)).toBe(false);
  });
  it("control cannot change hands during a run", () => {
    expect(handOff("you", "mira", false)).toBe("mira");
    expect(handOff("you", "mira", true)).toBe("you");
  });
  it("unknown ids fall back to the local user", () => {
    expect(participant("ghost").id).toBe("you");
  });
});

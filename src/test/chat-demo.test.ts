import { describe, expect, it } from "vitest";
import { demoReply, initialMessages } from "@/lib/chat-demo";

describe("frontend demo behavior", () => {
  it("starts with one conversation containing the initial brief and response", () => {
    expect(initialMessages.map((message) => message.role)).toEqual(["user", "assistant"]);
  });
  it("selects different behavior for planning and building", () => {
    expect(demoReply("Add a gallery", "plan")).not.toEqual(demoReply("Add a gallery", "build"));
  });
});

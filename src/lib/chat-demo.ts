import type { UIMessage } from "ai";

export const initialMessages: UIMessage[] = [
  {
    id: "brief",
    role: "user",
    parts: [
      {
        type: "text",
        text: "Build a job orchestration system. I need an operator console, a jobs API, a data store, and a queue worker. Keep the boundaries clear and the delivery pipeline observable.",
      },
    ],
  },
  {
    id: "response",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "I’ve mapped **Dispatch** into five inspectable artifacts. The console is only one part of the system.",
      },
      {
        type: "text",
        text: "Assembly plan:\n\n- Operator console for job visibility\n- REST contracts for the jobs service\n- Job records and schema\n- Queue worker and runtime logs\n- System architecture blueprint",
      },
      {
        type: "dynamic-tool",
        toolName: "read-files",
        toolCallId: "read",
        state: "output-available",
        input: { files: ["src/routes/index.tsx", "src/styles.css"] },
        output: "Reviewed the sample system boundaries.",
      },
      {
        type: "dynamic-tool",
        toolName: "edit-files",
        toolCallId: "edit",
        state: "output-available",
        input: { files: ["StudioPreview.tsx", "styles.css"] },
        output: "Prepared five local artifact fixtures.",
      },
      {
        type: "text",
        text: "The sample assembly is ready to inspect. Switch between the application, API, data, terminal, and blueprint outputs. These are local fixtures, not deployed services.",
      },
    ],
  },
];

export function demoReply(text: string, mode: "build" | "plan"): string {
  if (mode === "plan")
    return `Here’s a suggested plan for your request:\n\n1. Review the current layout.\n2. Explore “${text}”.\n3. Refine the design and check it at different screen sizes.\n\nThis is a frontend demo; no project files have been changed.`;
  return `I’ve noted your request: “${text}”.\n\nThis workspace is a frontend demo, so I haven’t changed project files or called an AI model. You can explore the preview, inspect the sample code, or keep refining the brief here.`;
}

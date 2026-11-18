import { createFileRoute } from "@tanstack/react-router";
import { DevelopmentWorkspace } from "@/components/workspace/development-workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forma — Software factory" },
      {
        name: "description",
        content:
          "An industrial agent workspace with source diffs, QA verification, system topology, and adaptive software previews.",
      },
      { property: "og:title", content: "Forma — Software factory" },
      {
        property: "og:description",
        content:
          "Inspect code changes, verification results, service connections, and UI in one agent workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevelopmentWorkspace,
});

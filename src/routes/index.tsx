import { createFileRoute } from "@tanstack/react-router";
import { DevelopmentWorkspace } from "@/components/workspace/development-workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forma — Software factory" },
      {
        name: "description",
        content:
          "An industrial agent workspace with adaptive application, API, data, terminal, and document previews.",
      },
      { property: "og:title", content: "Forma — Software factory" },
      {
        property: "og:description",
        content: "Inspect every layer of a software assembly in one agent workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevelopmentWorkspace,
});

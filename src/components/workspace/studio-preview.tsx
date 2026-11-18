import architecture from "@/assets/architecture.asset.json";
import { ArrowUpRight } from "lucide-react";

export function StudioPreview() {
  return (
    <div className="site-preview">
      <header className="site-nav">
        <a className="site-wordmark" href="#home">
          STUDIO NORTH<span className="text-primary">®</span>
        </a>
        <nav className="flex gap-7">
          <a href="#work">Work</a>
          <a href="#studio">Studio</a>
          <a href="mailto:hello@studionorth.example">
            Contact <ArrowUpRight className="inline size-3" />
          </a>
        </nav>
      </header>
      <section className="site-heading" id="home">
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest">
          <span className="status-dot" /> Independent architecture studio
        </div>
        <h1>
          Spaces for living.
          <br />
          Built for life.
        </h1>
        <div className="flex items-end justify-between gap-5">
          <p className="max-w-64 text-[11px] leading-relaxed text-muted-foreground">
            We create thoughtful architecture that connects people, place, and possibility.
          </p>
          <a
            href="#work"
            className="flex shrink-0 items-center gap-3 border-b border-preview-foreground pb-1 text-[10px]"
          >
            Explore our work <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </section>
      <section id="work">
        <img
          className="site-photo"
          src={architecture.url}
          alt="Minimal concrete art museum with a leafy tree beneath a clear blue sky"
        />
        <div className="site-caption">
          <span>01 / The North Gallery</span>
          <span>
            Cultural · Copenhagen, Denmark <ArrowUpRight className="ml-2 inline size-3" />
          </span>
        </div>
      </section>
      <section className="site-about" id="studio">
        <p className="text-[9px] uppercase tracking-widest">A sense of place</p>
        <div>
          <h2>
            Good architecture starts
            <br />
            with understanding.
          </h2>
          <p className="mt-4 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
            Every site has a story. We listen closely, design intentionally, and build spaces that
            belong.
          </p>
        </div>
      </section>
    </div>
  );
}
export const sampleCode = `// Studio North · homepage preview\nimport { StudioPreview } from './studio-preview';\n\nexport function Homepage() {\n  return (\n    <main>\n      <StudioPreview />\n    </main>\n  );\n}\n\n/* Design system */\n:root {\n  --background: oklch(0.975 0.006 85);\n  --foreground: oklch(0.23 0.016 80);\n  --font-display: "Manrope", sans-serif;\n}\n\n// Frontend preview only.\n// Changes in chat do not modify this code.`;

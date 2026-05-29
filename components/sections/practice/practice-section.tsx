import Container from "@/components/ui/container";
import SectionHeader from "@/components/ui/section-header";

type ToolCard = {
  eyebrow: string;
  title: string;
  body: string;
};

const tools: ToolCard[] = [
  {
    eyebrow: "Tile Guide",
    title: "Every tile, explained",
    body: "Visual encyclopedia with suits, honors, and jokers — tap any tile to learn its role at the table.",
  },
  {
    eyebrow: "Smart Quizzes",
    title: "Learn by doing",
    body: "Adaptive drills for Charleston passing, hand reading, and scoring — tuned to where you actually get stuck.",
  },
  {
    eyebrow: "Weekly Challenges",
    title: "Stay sharp between games",
    body: "Fresh hand-building puzzles every week — build pattern recognition without pressure at the table.",
  },
];

export default function PracticeSection() {
  return (
    <section id="tools" className="py-[clamp(72px,10vw,120px)]">
      <Container>
        <SectionHeader
          eyebrow="Practice tools"
          title="Everything you need between club nights"
          lead="Tile guides, adaptive quizzes, and weekly challenges — so every club night feels like your best game yet."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <article
              key={tool.eyebrow}
              className="overflow-hidden rounded-card border border-border bg-surface p-[clamp(28px,4vw,40px)] shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-card"
            >
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                {tool.eyebrow}
              </p>
              <h3 className="mb-3 font-display text-[clamp(1.35rem,2.2vw,1.75rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
                {tool.title}
              </h3>
              <p className="max-w-[42ch] text-[15px] leading-[1.55] text-muted">
                {tool.body}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

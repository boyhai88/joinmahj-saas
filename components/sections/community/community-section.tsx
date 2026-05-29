import type { ReactNode } from "react";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/ui/section-header";

type Metric = {
  value: ReactNode;
  label: string;
};

type ActivityPill = {
  dot: "green" | "gold" | "live";
  content: ReactNode;
};

const metrics: Metric[] = [
  { value: "2,000+", label: "Beginners Joined" },
  { value: "120+", label: "Local Mahjong Clubs" },
  { value: "15,000+", label: "Practice Sessions" },
  {
    value: (
      <>
        4.9
        <span className="font-sans text-[0.72em] tracking-normal text-accent">
          ★
        </span>
      </>
    ),
    label: "Member Satisfaction",
  },
];

const dotColor: Record<ActivityPill["dot"], string> = {
  green: "bg-success shadow-[0_0_0_3px_oklch(58%_0.14_145/0.18)]",
  gold: "bg-accent shadow-[0_0_0_3px_oklch(72%_0.085_75/0.22)]",
  live: "bg-[oklch(58%_0.16_25)] shadow-[0_0_0_3px_oklch(58%_0.16_25/0.2)]",
};

const pills: ActivityPill[] = [
  {
    dot: "green",
    content: (
      <span>
        <strong className="font-semibold text-fg">24 beginners</strong> joined
        this week
      </span>
    ),
  },
  {
    dot: "gold",
    content: (
      <span>
        <time className="font-medium text-muted">Tonight</time> · Beginner Table
        · <span className="font-medium text-muted">7PM</span> ·{" "}
        <span className="font-semibold text-primary">4 spots left</span>
      </span>
    ),
  },
  {
    dot: "live",
    content: (
      <span>
        <strong className="font-semibold text-fg">Live Club Event</strong> ·
        Austin
      </span>
    ),
  },
];

export default function CommunitySection() {
  return (
    <section
      id="social"
      aria-labelledby="community-heading"
      className="py-[clamp(72px,10vw,120px)]"
      style={{
        background:
          "linear-gradient(180deg, var(--bg) 0%, oklch(96% 0.016 82) 50%, var(--bg) 100%)",
      }}
    >
      <Container>
        <SectionHeader
          headingId="community-heading"
          eyebrow="Community"
          title="A table already waiting for you"
          lead="Thousands of beginners are learning, hosting, and finding their people — one warm evening at a time."
        />

        {/* Metrics */}
        <div
          className="mb-[clamp(40px,6vw,64px)] grid grid-cols-1 gap-[clamp(16px,2.5vw,24px)] sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Platform highlights"
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              role="listitem"
              className="rounded-card border border-border bg-surface px-[clamp(20px,2.5vw,28px)] py-[clamp(24px,3vw,32px)] text-center shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-card"
            >
              <p className="mb-2 font-display text-[clamp(2rem,3.5vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-fg">
                {metric.value}
              </p>
              <p className="text-[13px] font-medium leading-[1.45] text-muted">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        {/* Activity pills */}
        <div
          className="flex flex-col flex-wrap items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          aria-label="Live community activity"
        >
          {pills.map((pill, index) => (
            <div
              key={index}
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-[oklch(99%_0.01_90/0.85)] px-5 py-3 text-center text-[13px] font-medium text-fg shadow-soft backdrop-blur-[10px] transition hover:border-[oklch(72%_0.085_75/0.45)] hover:shadow-card sm:text-left"
            >
              <span
                aria-hidden
                className={`h-2 w-2 shrink-0 animate-pulse rounded-full ${dotColor[pill.dot]}`}
              />
              {pill.content}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

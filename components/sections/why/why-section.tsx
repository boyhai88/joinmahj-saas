import type { ReactNode } from "react";
import Container from "@/components/ui/container";

type WhyCard = {
  title: string;
  body: string;
  icon: ReactNode;
};

const cards: WhyCard[] = [
  {
    title: "Social",
    body: "Build lasting friendships around the table — perfect for girls' night and brunch clubs.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Relaxing",
    body: "Unplug from screens and settle into a calm, focused rhythm with friends.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  },
  {
    title: "Beginner-friendly",
    body: "Our 7-day roadmap breaks down every rule so you never feel lost.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    title: "Club culture",
    body: "Join local clubs, host your own table, and grow a community you love.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export default function WhySection() {
  return (
    <section id="why" className="py-[clamp(72px,10vw,120px)]">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-[clamp(40px,6vw,80px)]">
          {/* Visual */}
          <div
            aria-hidden
            className="relative aspect-16/10 max-h-[360px] overflow-hidden rounded-card shadow-card lg:aspect-4/5 lg:max-h-none"
            style={{
              background:
                "linear-gradient(200deg, oklch(91% 0.03 80), oklch(84% 0.04 75))",
            }}
          >
            <p className="absolute inset-x-5 bottom-5 rounded-2xl bg-[oklch(99%_0.01_90/0.94)] p-[18px] font-display text-[1.125rem] italic leading-[1.35] text-fg shadow-soft lg:inset-x-8 lg:bottom-8 lg:p-6 lg:text-[clamp(1.25rem,2.5vw,1.75rem)]">
              &ldquo;The new book club — but you actually put your phone
              down.&rdquo;
            </p>
          </div>

          {/* Content */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Why Mahjong
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
              Mahjong is becoming the new social table
            </h2>
            <p className="mt-5 max-w-[54ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.65] text-muted">
              Across American suburbs and cities, women are rediscovering
              Mahjong as the perfect ritual — social without being loud,
              engaging without being competitive, and beautifully offline.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-card border border-border bg-surface px-6 py-7 transition duration-200 hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[12px] bg-gold-light text-primary [&_svg]:h-[22px] [&_svg]:w-[22px]">
                    {card.icon}
                  </div>
                  <h3 className="mb-2 text-[1.125rem] font-semibold text-fg">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-[1.55] text-muted">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

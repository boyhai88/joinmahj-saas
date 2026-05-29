"use client";

import { useState } from "react";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/ui/section-header";
import Button from "@/components/ui/button";

type Club = {
  name: string;
  desc: string;
  meta: string;
  pin: { left: string; top: string };
};

const clubs: Club[] = [
  {
    name: "Warm Table Club",
    desc: "Westlake · Beginner-friendly · Thu & Sat",
    meta: "Next game: Thu 7pm · 3 spots open",
    pin: { left: "28%", top: "42%" },
  },
  {
    name: "Brunch & Tiles Society",
    desc: "Downtown · All levels · Sun mornings",
    meta: "Next game: Sun 10am · 6 spots open",
    pin: { left: "52%", top: "35%" },
  },
  {
    name: "The Mahj Room",
    desc: "South Congress · Women-only · Wed evenings",
    meta: "Next game: Wed 6:30pm · Waitlist",
    pin: { left: "68%", top: "55%" },
  },
  {
    name: "Neighborhood Mahj Circle",
    desc: "Hyde Park · Host rotation · Flexible",
    meta: "Next game: Fri 7pm · 2 spots open",
    pin: { left: "42%", top: "62%" },
  },
];

export default function ClubsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  return (
    <section id="clubs" className="py-[clamp(72px,10vw,120px)]">
      <Container>
        <SectionHeader
          eyebrow="Find your table"
          title="Clubs near you"
          lead="Discover welcoming Mahjong clubs in your city — beginner-friendly tables, warm hosts, zero intimidation."
        />

        <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
          <div className="grid min-h-[300px] grid-cols-1 lg:min-h-[460px] lg:grid-cols-[1fr_380px]">
            {/* Map canvas */}
            <div
              className="relative min-h-[300px]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(94% 0.015 85), oklch(90% 0.02 80))",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-35"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                  backgroundSize: "56px 56px",
                }}
              />
              {clubs.map((club, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={club.name}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Select ${club.name}`}
                    className={`absolute h-12 w-10 -translate-x-1/2 -translate-y-full cursor-pointer transition-transform duration-200 hover:scale-110 ${
                      isActive ? "z-2 scale-110" : ""
                    }`}
                    style={{ left: club.pin.left, top: club.pin.top }}
                  >
                    <svg
                      width="40"
                      height="48"
                      viewBox="0 0 36 44"
                      className="drop-shadow-[0_4px_8px_oklch(18%_0.012_280/0.25)]"
                    >
                      <path
                        d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.06 27.94 0 18 0z"
                        fill="var(--primary)"
                      />
                      <circle
                        cx="18"
                        cy="17"
                        r="7"
                        fill={isActive ? "var(--accent)" : "var(--surface)"}
                      />
                    </svg>
                  </button>
                );
              })}
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col border-t border-border p-8 lg:border-t-0 lg:border-l">
              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Enter city or zip code"
                  aria-label="Search clubs"
                  className="min-w-0 flex-1 rounded-[10px] border border-border bg-bg px-[18px] py-3.5 text-sm text-fg outline-none transition focus:border-accent"
                />
                <Button type="button" size="sm" className="shrink-0">
                  Search
                </Button>
              </div>

              <ul className="flex-1 overflow-y-auto">
                {clubs.map((club, index) => {
                  const isActive = index === activeIndex;
                  const isMatch =
                    normalizedQuery === "" ||
                    `${club.name} ${club.desc} ${club.meta}`
                      .toLowerCase()
                      .includes(normalizedQuery);
                  if (!isMatch) return null;
                  return (
                    <li key={club.name}>
                      <button
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`mb-2 w-full cursor-pointer rounded-[10px] border p-[18px] text-left transition-colors duration-200 ${
                          isActive
                            ? "border-border bg-bg"
                            : "border-transparent hover:border-border hover:bg-bg"
                        }`}
                      >
                        <h4 className="mb-1 text-[15px] font-semibold text-fg">
                          {club.name}
                        </h4>
                        <p className="text-[13px] text-muted">{club.desc}</p>
                        <p className="mt-2 text-xs font-semibold text-accent">
                          {club.meta}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        </div>
      </Container>
    </section>
  );
}

"use client";

import { useState } from "react";
import Container from "@/components/ui/container";
import SectionHeader from "@/components/ui/section-header";
import { roadmapDays } from "./roadmap-data";
import RoadmapTabs from "./roadmap-tabs";
import RoadmapPanel from "./roadmap-panel";

export default function RoadmapSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="roadmap" className="py-[clamp(72px,10vw,120px)]">
      <Container>
        <SectionHeader
          eyebrow="Your first week"
          title="7-Day Beginner Roadmap"
          lead={
            <>
              From &ldquo;what are these tiles?&rdquo; to confidently calling
              your first Mahjong — one gentle step at a time.
            </>
          }
        />

        <div className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
          <RoadmapTabs
            days={roadmapDays}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
          <RoadmapPanel day={roadmapDays[activeIndex]} />
        </div>
      </Container>
    </section>
  );
}

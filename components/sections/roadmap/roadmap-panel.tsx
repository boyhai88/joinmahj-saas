import Button from "@/components/ui/button";
import type { RoadmapDay } from "./roadmap-data";

type RoadmapPanelProps = {
  day: RoadmapDay;
};

export default function RoadmapPanel({ day }: RoadmapPanelProps) {
  return (
    <div className="grid grid-cols-1 items-center gap-10 p-[clamp(32px,5vw,48px)] lg:grid-cols-2">
      <div>
        <h3 className="mb-4 font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
          {day.title}
        </h3>
        <p className="mb-6 leading-[1.65] text-muted">{day.desc}</p>
        <ul className="mb-0">
          {day.items.map((item) => (
            <li
              key={item}
              className="relative border-b border-border py-2.5 pl-7 text-sm text-fg last:border-b-0 before:absolute before:left-0 before:top-4 before:h-2 before:w-2 before:rounded-full before:bg-accent before:content-['']"
            >
              {item}
            </li>
          ))}
        </ul>
        <Button href="#cta" className="mt-6">
          Start Day {day.day} free
        </Button>
      </div>

      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-card border border-border bg-bg p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-light font-display text-2xl font-semibold text-primary">
          {day.icon}
        </div>
        <p className="max-w-[28ch] text-sm text-muted">{day.preview}</p>
      </div>
    </div>
  );
}

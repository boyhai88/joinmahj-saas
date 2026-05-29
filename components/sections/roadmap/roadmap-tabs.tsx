import type { RoadmapDay } from "./roadmap-data";

type RoadmapTabsProps = {
  days: RoadmapDay[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export default function RoadmapTabs({
  days,
  activeIndex,
  onSelect,
}: RoadmapTabsProps) {
  return (
    <div className="grid grid-cols-2 border-b border-border sm:grid-cols-4 lg:grid-cols-7">
      {days.map((day, index) => {
        const isActive = index === activeIndex;
        return (
          <button
            key={day.day}
            type="button"
            onClick={() => onSelect(index)}
            aria-pressed={isActive}
            className={`cursor-pointer border-t border-r border-border px-3 py-5 text-center transition-colors duration-200 last:border-r-0 sm:border-t-0 sm:nth-[n+5]:border-t lg:border-t-0 lg:nth-[n+5]:border-t-0 ${
              isActive
                ? "-mb-px border-b-2 border-b-primary bg-bg"
                : "hover:bg-bg"
            }`}
          >
            <div
              className={`mb-1.5 font-display text-2xl font-semibold leading-none ${
                isActive ? "text-primary" : "text-accent"
              }`}
            >
              {day.day}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
              Day {day.day}
            </div>
          </button>
        );
      })}
    </div>
  );
}

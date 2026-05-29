"use client";

import { useMemo, useState } from "react";
import { markLessonComplete } from "@/lib/learn/actions";
import type { Lesson } from "@/lib/learn/lessons";

type LearnAppProps = {
  lessons: Lesson[];
  initialCompletedDays: number[];
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function LearnApp({
  lessons,
  initialCompletedDays,
}: LearnAppProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set(initialCompletedDays)
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const lesson = useMemo(
    () => lessons.find((item) => item.day === activeDay) ?? lessons[0],
    [lessons, activeDay]
  );

  const isCompleted = completed.has(lesson.day);

  async function handleComplete() {
    if (pending || isCompleted) return;
    setError(null);
    setPending(true);
    try {
      const { day } = await markLessonComplete(lesson.day);
      setCompleted((prev) => new Set(prev).add(day));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save progress."
      );
    } finally {
      setPending(false);
    }
  }

  function selectDay(day: number) {
    setActiveDay(day);
    setMobileSidebar(false);
    setError(null);
  }

  function renderSidebar() {
    return (
      <nav className="flex h-full flex-col gap-1 p-4" aria-label="Roadmap days">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          7-Day Roadmap
        </p>
        {lessons.map((item) => {
          const isActive = item.day === activeDay;
          const done = completed.has(item.day);
          return (
            <button
              key={item.day}
              type="button"
              onClick={() => selectDay(item.day)}
              className={`flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-bg font-medium text-fg"
                  : "text-muted hover:bg-bg hover:text-fg"
              }`}
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  {item.dayLabel}
                </span>
                <span className="block truncate">{item.title}</span>
              </span>
              {done ? (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-surface">
                  <CheckIcon className="h-3 w-3" />
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-8rem)] gap-4">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 self-start overflow-hidden rounded-card border border-border bg-surface shadow-soft lg:block">
        {renderSidebar()}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebar ? (
        <div className="absolute inset-0 z-20 lg:hidden">
          <button
            type="button"
            aria-label="Close roadmap"
            onClick={() => setMobileSidebar(false)}
            className="absolute inset-0 bg-[oklch(18%_0.012_280/0.25)]"
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-hidden rounded-card border border-border bg-surface shadow-card">
            {renderSidebar()}
          </div>
        </div>
      ) : null}

      {/* Main content */}
      <section className="min-w-0 flex-1">
        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebar(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-sm font-medium text-fg shadow-soft transition-colors hover:bg-bg"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
              className="h-4 w-4"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            All days
          </button>
        </div>

        <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,48px)] shadow-soft">
          <div className="mb-2 flex items-center gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              {lesson.dayLabel}
            </p>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(58%_0.14_145/0.12)] px-3 py-1 text-[12px] font-semibold text-[oklch(40%_0.12_145)]">
                <CheckIcon className="h-3 w-3" />
                Completed
              </span>
            ) : null}
          </div>

          <h1 className="mb-6 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
            {lesson.title}
          </h1>

          <div className="flex flex-col gap-4 text-[15px] leading-[1.7] text-muted">
            {lesson.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 rounded-card border border-border bg-bg p-6">
            <h2 className="mb-4 font-display text-[1.35rem] font-medium tracking-[-0.01em] text-fg">
              Key takeaways
            </h2>
            <ul className="flex flex-col gap-2.5">
              {lesson.takeaways.map((takeaway) => (
                <li
                  key={takeaway}
                  className="flex items-start gap-3 text-sm text-fg"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold-light text-primary">
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-6 rounded-[10px] border border-[oklch(58%_0.16_25/0.3)] bg-[oklch(58%_0.16_25/0.08)] px-3.5 py-2.5 text-[13px] text-[oklch(45%_0.16_25)]"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-8">
            {isCompleted ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[oklch(58%_0.14_145/0.35)] bg-[oklch(58%_0.14_145/0.08)] px-6 py-3 text-[15px] font-medium text-[oklch(40%_0.12_145)]">
                <CheckIcon className="h-4 w-4" />
                Completed
              </span>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={pending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-[30px] py-[15px] text-[15px] font-medium text-surface shadow-[0_4px_16px_oklch(38%_0.045_130/0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Saving…" : "Mark complete"}
              </button>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

import Link from "next/link";
import Button from "@/components/ui/button";
import Container from "@/components/ui/container";
import {
  academyCategories,
  type AcademyCourse,
  type CourseTier,
} from "@/lib/learn/academy-courses";

function TierBadge({ tier }: { tier: CourseTier }) {
  if (tier === "free") {
    return (
      <span className="inline-flex items-center rounded-full bg-[oklch(58%_0.14_145/0.14)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-success">
        Free
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-fg">
      Pro
    </span>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function CoverTierBadge({ tier }: { tier: CourseTier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-soft ${
        tier === "free" ? "bg-success text-surface" : "bg-fg text-surface"
      }`}
    >
      {tier === "free" ? "Free" : "Pro"}
    </span>
  );
}

function CourseCover({
  course,
  index,
}: {
  course: AcademyCourse;
  index: number;
}) {
  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[16px] bg-linear-to-br from-gold-light to-[oklch(85%_0.04_80)]">
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(oklch(99%_0.01_90/0.6)_1px,transparent_1px)] bg-size-[14px_14px]" />

      <div className="absolute inset-x-3 top-3 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-[oklch(99%_0.01_90/0.85)] px-2.5 py-1 font-display text-xs font-semibold text-primary shadow-soft">
          {String(index + 1).padStart(2, "0")}
        </span>
        <CoverTierBadge tier={course.tier} />
      </div>

      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(99%_0.01_90/0.9)] text-primary shadow-card transition-transform duration-200 group-hover:scale-110">
        <PlayIcon className="ml-0.5 h-5 w-5" />
      </span>

      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[oklch(99%_0.01_90/0.85)] px-2.5 py-1 text-[11px] font-medium text-fg shadow-soft">
        <ClockIcon className="h-3.5 w-3.5 text-muted" />
        {course.duration}
      </span>
    </div>
  );
}

function CourseCard({
  course,
  index,
}: {
  course: AcademyCourse;
  index: number;
}) {
  return (
    <Link
      href={`/learn/${course.slug}`}
      className="group flex flex-col rounded-card border border-border bg-surface p-4 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-card"
    >
      <CourseCover course={course} index={index} />
      <div className="flex flex-1 flex-col px-1 pt-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
          Course {String(index + 1).padStart(2, "0")}
        </p>
        <h3 className="mb-2 font-display text-[1.35rem] font-medium leading-snug text-fg transition-colors group-hover:text-primary">
          {course.title}
        </h3>
        <p className="flex-1 text-sm leading-[1.6] text-muted">
          {course.summary}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Start lesson
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function AcademyPage() {
  const firstCourseSlug = academyCategories[0].courses[0].slug;

  return (
    <>
      <section className="pt-[clamp(48px,7vw,88px)]">
        <Container>
          <div className="mx-auto max-w-[760px] text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Mahjong Academy
            </p>
            <h1 className="mb-5 font-display text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.05] tracking-[-0.02em] text-fg">
              Learn Mahjong, from beginner to advanced
            </h1>
            <p className="mx-auto mb-7 max-w-[56ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.6] text-muted">
              Learn Mahjong from beginner to advanced with structured lessons,
              AI-assisted training, and real-world hand analysis.
            </p>

            <div className="mb-9 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-muted">
              <span className="rounded-full border border-border bg-surface px-4 py-2 shadow-soft">
                Beginner
              </span>
              <span aria-hidden className="text-accent">
                →
              </span>
              <span className="rounded-full border border-border bg-surface px-4 py-2 shadow-soft">
                Intermediate
              </span>
              <span aria-hidden className="text-accent">
                →
              </span>
              <span className="rounded-full border border-border bg-surface px-4 py-2 shadow-soft">
                Advanced
              </span>
            </div>

            <p className="mb-8 text-base text-muted">
              Start learning and improve your Mahjong skills.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={`/learn/${firstCourseSlug}`} size="lg">
                Start Free Learning
              </Button>
              <Button href="#intermediate" variant="secondary" size="lg">
                Explore Pro Courses
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {academyCategories.map((category) => (
        <section
          key={category.id}
          id={category.id}
          className="py-[clamp(40px,6vw,72px)]"
        >
          <Container>
            <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[640px]">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight text-fg">
                    {category.level}
                  </h2>
                  <TierBadge tier={category.tier} />
                </div>
                <p className="text-[15px] leading-[1.6] text-muted">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.courses.map((course, index) => (
                <CourseCard key={course.slug} course={course} index={index} />
              ))}
            </div>
          </Container>
        </section>
      ))}
    </>
  );
}

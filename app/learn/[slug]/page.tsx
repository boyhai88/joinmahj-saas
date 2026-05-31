import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import {
  getAcademyCourse,
  getAllAcademyCourseSlugs,
  getCourseLessons,
} from "@/lib/learn/academy-courses";
import { getBeginnerContent } from "@/lib/learn/beginner-content";

export function generateStaticParams() {
  return getAllAcademyCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getAcademyCourse(slug);
  if (!result) {
    return { title: "Course | Mahjong Academy" };
  }

  const { course } = result;
  const title = `${course.title} | Mahjong Academy`;
  const description = course.summary;
  const canonical = `/learn/${course.slug}`;

  return {
    title,
    description,
    keywords: [
      "mahjong",
      "learn mahjong",
      "mahjong course",
      "mahjong tutorial",
      course.title,
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
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
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

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
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
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
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getAcademyCourse(slug);
  if (!result) {
    notFound();
  }
  const { course, category } = result;
  const courseContent = getBeginnerContent(slug);
  const lessons = getCourseLessons(course).map((lesson, index) => ({
    ...lesson,
    title: courseContent?.sections[index]?.heading ?? lesson.title,
  }));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPro = course.tier === "pro";

  const infoItems = [
    { label: "Level", value: category.level },
    { label: "Access", value: isPro ? "PRO" : "FREE" },
    { label: "Duration", value: course.duration },
    { label: "Lessons", value: String(lessons.length) },
  ];

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary,
    educationalLevel: category.level,
    provider: {
      "@type": "Organization",
      name: "JoinMahj",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24 pb-[clamp(48px,8vw,96px)]">
        <section className="py-[clamp(32px,5vw,56px)]">
          <Container>
            <div className="mx-auto max-w-[820px]">
              <Link
                href="/learn"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                ← Back to Mahjong Academy
              </Link>

              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                  {category.level}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                    isPro ? "bg-fg text-surface" : "bg-success text-surface"
                  }`}
                >
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>

              <h1 className="mb-4 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.1] tracking-[-0.02em] text-fg">
                {course.title}
              </h1>
              <p className="mb-7 text-[clamp(1.05rem,1.6vw,1.2rem)] leading-[1.6] text-muted">
                {course.summary}
              </p>

              {/* A. Video player placeholder */}
              <div className="relative mb-7 flex aspect-video flex-col items-center justify-center overflow-hidden rounded-card bg-linear-to-br from-gold-light to-[oklch(85%_0.04_80)] shadow-soft">
                <div className="absolute inset-0 opacity-50 bg-[radial-gradient(oklch(99%_0.01_90/0.6)_1px,transparent_1px)] bg-size-[18px_18px]" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(99%_0.01_90/0.9)] text-primary shadow-card sm:h-20 sm:w-20">
                  <PlayIcon className="ml-1 h-7 w-7 sm:h-9 sm:w-9" />
                </span>
                <p className="relative mt-4 font-display text-xl font-medium text-fg">
                  Course Preview
                </p>
                <p className="relative mt-1 text-[13px] font-medium uppercase tracking-widest text-muted">
                  Lessons coming soon
                </p>
              </div>

              {/* B. Course info bar */}
              <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border shadow-soft sm:grid-cols-4">
                {infoItems.map((item) => (
                  <div key={item.label} className="bg-surface px-4 py-4 text-center">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
                      {item.label}
                    </p>
                    <p className="font-display text-lg font-medium text-fg">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {courseContent ? (
                <>
                  {/* Course outline */}
                  <article className="mb-8 rounded-card border border-border bg-surface p-[clamp(20px,3.5vw,40px)] shadow-soft">
                    <h2 className="mb-5 font-display text-[1.5rem] font-medium text-fg">
                      What you&rsquo;ll learn
                    </h2>
                    <ol className="flex flex-col gap-2.5">
                      {courseContent.sections.map((section, index) => (
                        <li
                          key={section.heading}
                          className="flex items-center gap-3 text-[15px] text-fg"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg font-display text-sm font-semibold text-primary">
                            {index + 1}
                          </span>
                          {section.heading}
                        </li>
                      ))}
                    </ol>
                  </article>

                  {/* Teaching content */}
                  <article className="mb-8 rounded-card border border-border bg-surface p-[clamp(20px,3.5vw,40px)] shadow-soft">
                    <p className="mb-7 text-[clamp(1rem,1.5vw,1.15rem)] leading-[1.7] text-muted">
                      {courseContent.intro}
                    </p>
                    {courseContent.sections.map((section) => (
                      <div key={section.heading} className="mb-7 last:mb-0">
                        <h3 className="mb-3 font-display text-[1.35rem] font-medium leading-snug text-fg">
                          {section.heading}
                        </h3>
                        {section.paragraphs.map((paragraph, index) => (
                          <p
                            key={index}
                            className="mb-3 text-[15px] leading-[1.7] text-muted last:mb-0"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ))}
                  </article>

                  {/* Key takeaways */}
                  <div className="mb-8 rounded-card border border-border bg-bg p-[clamp(20px,3.5vw,36px)]">
                    <h2 className="mb-5 flex items-center gap-2.5 font-display text-[1.35rem] font-medium text-fg">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-surface">
                        <CheckIcon className="h-4 w-4" />
                      </span>
                      Key takeaways
                    </h2>
                    <ul className="flex flex-col gap-3">
                      {courseContent.keyTips.map((tip) => (
                        <li
                          key={tip}
                          className="flex items-start gap-3 text-[15px] leading-[1.6] text-fg"
                        >
                          <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-success" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Common beginner mistakes */}
                  <div className="mb-8 rounded-card border border-border bg-bg p-[clamp(20px,3.5vw,36px)]">
                    <h2 className="mb-5 flex items-center gap-2.5 font-display text-[1.35rem] font-medium text-fg">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-fg">
                        <AlertIcon className="h-4 w-4" />
                      </span>
                      Common beginner mistakes
                    </h2>
                    <ul className="flex flex-col gap-3">
                      {courseContent.commonMistakes.map((mistake) => (
                        <li
                          key={mistake}
                          className="flex items-start gap-3 text-[15px] leading-[1.6] text-fg"
                        >
                          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {mistake}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : null}

              {/* C. Course content / lessons */}
              <article className="mb-8 rounded-card border border-border bg-surface p-[clamp(20px,3.5vw,40px)] shadow-soft">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h2 className="font-display text-[1.5rem] font-medium text-fg">
                    Course content
                  </h2>
                  <span className="text-[13px] text-muted">
                    {lessons.length} lessons
                  </span>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {lessons.map((lesson) => (
                    <li
                      key={lesson.index}
                      className="flex items-center gap-3 rounded-[14px] border border-border bg-bg px-4 py-3.5"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          lesson.locked
                            ? "bg-surface text-muted"
                            : "bg-primary text-surface"
                        }`}
                      >
                        {lesson.locked ? (
                          <LockIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="ml-0.5 h-4 w-4" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold uppercase tracking-widest text-muted">
                          Lesson {lesson.index}
                        </p>
                        <p className="truncate text-[15px] font-medium text-fg">
                          {lesson.title}
                        </p>
                      </div>

                      <span className="hidden shrink-0 text-[13px] text-muted sm:inline">
                        {lesson.duration}
                      </span>

                      {lesson.locked ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[oklch(90%_0.018_85/0.6)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">
                          <LockIcon className="h-3 w-3" />
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-success px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-surface">
                          Free
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </article>

              {/* D. CTA */}
              <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-[clamp(20px,3.5vw,40px)] shadow-soft sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-display text-xl font-medium text-fg">
                    {isPro ? "Unlock the full course" : "Ready to begin?"}
                  </p>
                  <p className="mt-1 text-[13px] text-muted">
                    {isPro
                      ? "This is a Pro course. Lessons are coming soon."
                      : "All lessons in this course are free. Content is coming soon."}
                  </p>
                </div>
                {isPro ? (
                  <Button href="/pricing" size="md" className="shrink-0">
                    Unlock with Pro
                  </Button>
                ) : (
                  <Button
                    href="/pricing"
                    variant="secondary"
                    size="md"
                    className="shrink-0"
                  >
                    Start this free course
                  </Button>
                )}
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

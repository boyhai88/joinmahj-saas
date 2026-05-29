import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { lessons } from "@/lib/learn/lessons";

export const metadata = {
  title: "Dashboard — JoinMahj",
  description: "Your learning progress, AI Coach, and quick actions.",
};

const TOTAL_DAYS = 7;

const quickActions = [
  { label: "Learn", href: "/learn", description: "7-day roadmap" },
  { label: "Coach", href: "/coach", description: "Ask the AI coach" },
  { label: "Community", href: "/#social", description: "Meet the table" },
  { label: "Clubs", href: "/#clubs", description: "Find a club" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth required.
  if (!user) {
    redirect("/login");
  }

  // B. Learning progress.
  const { data: progressRows } = await supabase
    .from("progress")
    .select("day, status")
    .eq("user_id", user.id);

  const completedDays = new Set(
    (progressRows ?? [])
      .filter((row) => row.status === "completed")
      .map((row) => row.day as number)
  );
  const completedCount = completedDays.size;
  const percentage = Math.round((completedCount / TOTAL_DAYS) * 100);

  // C. Next unfinished day.
  const nextDay =
    lessons.find((lesson) => !completedDays.has(lesson.day)) ?? null;
  const allDone = nextDay === null;

  // D. Latest AI chat.
  const { data: latestChatRows } = await supabase
    .from("ai_chats")
    .select("title")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);
  const latestChatTitle = latestChatRows?.[0]?.title ?? null;

  return (
    <>
      <SiteHeader userEmail={user.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <Container>
            {/* A. Welcome */}
            <div className="mb-8 rounded-card border border-border bg-surface p-[clamp(24px,4vw,40px)] shadow-soft">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Dashboard
              </p>
              <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-muted">{user.email}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* B. Learning progress */}
              <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-soft">
                <h2 className="mb-1 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
                  Learning progress
                </h2>
                <p className="mb-5 text-sm text-muted">
                  {completedCount} of {TOTAL_DAYS} days completed
                </p>

                <div className="mb-2 flex items-end justify-between">
                  <span className="font-display text-[2.5rem] font-semibold leading-none text-fg">
                    {percentage}
                    <span className="text-xl text-muted">%</span>
                  </span>
                </div>
                <div
                  className="h-2.5 w-full overflow-hidden rounded-full bg-bg"
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {lessons.map((lesson) => {
                    const done = completedDays.has(lesson.day);
                    return (
                      <span
                        key={lesson.day}
                        title={`${lesson.dayLabel}: ${lesson.title}`}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold ${
                          done
                            ? "bg-success text-surface"
                            : "border border-border bg-bg text-muted"
                        }`}
                      >
                        {lesson.day}
                      </span>
                    );
                  })}
                </div>
              </article>

              {/* C. Continue learning */}
              <article className="flex flex-col rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-soft">
                <h2 className="mb-1 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
                  Continue learning
                </h2>
                {allDone ? (
                  <>
                    <p className="mb-6 text-sm text-muted">
                      You&rsquo;ve completed the full 7-day roadmap. Wonderful
                      work — revisit any day anytime.
                    </p>
                    <div className="mt-auto">
                      <Button href="/learn">Review the roadmap</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-5 text-sm text-muted">
                      Pick up where you left off.
                    </p>
                    <div className="mb-6 rounded-card border border-border bg-bg p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                        {nextDay.dayLabel}
                      </p>
                      <p className="mt-1 font-display text-[1.35rem] font-medium tracking-[-0.01em] text-fg">
                        {nextDay.title}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Button href="/learn">Continue to {nextDay.dayLabel}</Button>
                    </div>
                  </>
                )}
              </article>

              {/* D. AI Coach */}
              <article className="flex flex-col rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-soft">
                <h2 className="mb-1 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
                  AI Coach
                </h2>
                <p className="mb-5 text-sm text-muted">
                  {latestChatTitle
                    ? "Your most recent conversation"
                    : "Start your first conversation with your Mahjong coach."}
                </p>
                {latestChatTitle ? (
                  <div className="mb-6 rounded-card border border-border bg-bg p-5">
                    <p className="truncate font-display text-[1.25rem] font-medium tracking-[-0.01em] text-fg">
                      {latestChatTitle}
                    </p>
                  </div>
                ) : null}
                <div className="mt-auto">
                  <Button href="/coach" variant={latestChatTitle ? "primary" : "secondary"}>
                    {latestChatTitle ? "Continue chatting" : "Ask the coach"}
                  </Button>
                </div>
              </article>

              {/* E. Quick actions */}
              <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-soft">
                <h2 className="mb-5 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
                  Quick actions
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col gap-1 rounded-card border border-border bg-bg p-4 transition duration-200 hover:-translate-y-1 hover:border-[oklch(72%_0.085_75/0.5)] hover:shadow-soft"
                    >
                      <span className="font-display text-[1.15rem] font-medium text-fg">
                        {action.label}
                      </span>
                      <span className="text-[13px] text-muted">
                        {action.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </article>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

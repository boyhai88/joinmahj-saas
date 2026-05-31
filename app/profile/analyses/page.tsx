import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { getAnalyses } from "@/lib/analyze/history-actions";

export const metadata = {
  title: "Your analyses — JoinMahj",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AnalysesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const analyses = await getAnalyses();

  return (
    <>
      <SiteHeader userEmail={user.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <Container>
            <div className="mx-auto max-w-[820px]">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    History
                  </p>
                  <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
                    Your analyses
                  </h1>
                </div>
                <Button href="/analyze" size="sm">
                  New analysis
                </Button>
              </div>

              {analyses.length === 0 ? (
                <div className="rounded-card border border-border bg-surface p-[clamp(32px,6vw,56px)] text-center shadow-soft">
                  <h2 className="mb-2 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
                    No saved analyses yet.
                  </h2>
                  <p className="mb-6 text-sm text-muted">
                    Analyze a hand and tap Save Analysis to keep it here.
                  </p>
                  <Button href="/analyze">Analyze a hand</Button>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {analyses.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/profile/analyses/${item.id}`}
                        className="flex gap-4 rounded-card border border-border bg-surface p-5 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-card"
                      >
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-20 w-20 shrink-0 rounded-[12px] object-cover"
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-[13px] text-muted">
                            {formatDate(item.created_at)}
                          </p>
                          <p className="font-display text-[1.2rem] font-medium tracking-[-0.01em] text-fg">
                            Discard: {item.discard ?? "—"}
                          </p>
                          <p className="mt-1 text-[13px] text-muted">
                            {item.shanten ?? 0} away ·{" "}
                            {item.tiles.length} tiles
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

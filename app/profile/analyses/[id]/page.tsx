import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import Container from "@/components/ui/container";
import { getAnalysis } from "@/lib/analyze/history-actions";
import ShareAnalysisButton from "@/components/analyze/share-analysis-button";

export const metadata = {
  title: "Analysis — JoinMahj",
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

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const analysis = await getAnalysis(id);
  if (!analysis) {
    notFound();
  }

  return (
    <>
      <SiteHeader userEmail={user.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <Container>
            <div className="mx-auto max-w-[720px]">
              <Link
                href="/profile/analyses"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                ← Back to your analyses
              </Link>

              <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,48px)] shadow-soft">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Saved analysis
                </p>
                <p className="mb-6 text-[13px] text-muted">
                  {formatDate(analysis.created_at)}
                </p>

                {analysis.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={analysis.image_url}
                    alt="Analyzed Mahjong hand"
                    className="mb-6 max-h-[420px] w-full rounded-[16px] object-contain"
                  />
                ) : null}

                <div className="flex flex-col gap-5">
                  <div className="rounded-card border border-border bg-bg p-5">
                    <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                      Hand Efficiency
                    </h2>
                    <p className="text-[13px] text-muted">Current Shanten</p>
                    <p className="mb-3 font-display text-[1.5rem] font-medium text-fg">
                      {analysis.shanten ?? 0} away
                    </p>
                    {analysis.effective_tiles.length > 0 ? (
                      <>
                        <p className="mb-1 text-[13px] text-muted">
                          Effective Tiles
                        </p>
                        <ul className="mb-3 flex flex-wrap gap-2">
                          {analysis.effective_tiles.map((tile, index) => (
                            <li
                              key={`${tile}-${index}`}
                              className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-[13px] text-fg"
                            >
                              {tile}
                            </li>
                          ))}
                        </ul>
                        <p className="text-[13px] text-muted">
                          Effective Tile Count: {analysis.effective_tiles.length}
                        </p>
                      </>
                    ) : (
                      <p className="text-[13px] text-muted">
                        No effective tiles saved.
                      </p>
                    )}
                  </div>

                  {analysis.potential_hands.length > 0 ? (
                    <div>
                      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                        Potential Hands
                      </h2>
                      <ul className="flex flex-col gap-1.5">
                        {analysis.potential_hands.map((hand, index) => (
                          <li
                            key={`${hand}-${index}`}
                            className="flex items-center gap-2.5 text-sm text-fg"
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            {hand}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                      Recommended Discard
                    </h2>
                    <p className="font-display text-[1.75rem] font-medium tracking-[-0.01em] text-fg">
                      {analysis.discard ?? "—"}
                    </p>
                  </div>

                  {analysis.reason ? (
                    <div>
                      <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                        Why
                      </h2>
                      <p className="text-sm leading-[1.65] text-muted">
                        {analysis.reason}
                      </p>
                    </div>
                  ) : null}

                  {analysis.winning_potential ? (
                    <div>
                      <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                        Winning Potential
                      </h2>
                      <p className="font-display text-[2rem] font-semibold leading-none text-fg">
                        {analysis.winning_potential}
                      </p>
                    </div>
                  ) : null}

                  {analysis.tiles.length > 0 ? (
                    <p className="border-t border-border pt-4 text-[13px] text-muted">
                      Hand: {analysis.tiles.join(", ")}
                    </p>
                  ) : null}
                </div>
              </article>

              <div className="mt-6">
                <ShareAnalysisButton
                  imageUrl={analysis.image_url}
                  tiles={analysis.tiles}
                  discard={analysis.discard}
                  reason={analysis.reason}
                  winningPotential={analysis.winning_potential}
                  potentialHands={analysis.potential_hands}
                />
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

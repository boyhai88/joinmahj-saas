import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import Container from "@/components/ui/container";
import { getPost } from "@/lib/community/actions";

export const metadata = {
  title: "Post — Community — JoinMahj",
};

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const detail = await getPost(id);
  if (!detail) {
    notFound();
  }

  const { post } = detail;
  const created = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <Container>
            <div className="mx-auto max-w-[720px]">
              <Link
                href="/community"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                ← Back to Community
              </Link>

              <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,48px)] shadow-soft">
                <h1 className="mb-2 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
                  {post.title}
                </h1>
                <p className="mb-6 text-[13px] text-muted">
                  Player {post.user_id.slice(0, 6)} · {created}
                </p>
                <div className="whitespace-pre-wrap text-[15px] leading-[1.7] text-fg">
                  {post.content}
                </div>
              </article>

              <p className="mt-6 text-center text-sm text-muted">
                Comments and likes are coming soon.
              </p>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

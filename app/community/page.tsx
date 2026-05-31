import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import CommunityPage from "@/components/community/community-page";
import { getPosts, getCommunityStats } from "@/lib/community/actions";

export const metadata = {
  title: "Community — JoinMahj",
  description: "Learn together. Ask questions. Share wins.",
};

export default async function Community() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [posts, stats] = await Promise.all([getPosts(), getCommunityStats()]);

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <CommunityPage
            initialPosts={posts}
            authed={Boolean(user)}
            stats={stats}
          />
        </section>
      </main>
    </>
  );
}

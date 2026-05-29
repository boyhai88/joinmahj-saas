import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import Container from "@/components/ui/container";
import PostDetail from "@/components/community/post-detail";
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

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <Container>
            <PostDetail initial={detail} authed={Boolean(user)} />
          </Container>
        </section>
      </main>
    </>
  );
}

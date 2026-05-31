import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import AcademyPage from "@/components/learn/academy-page";

export const metadata = {
  title: "Mahjong Academy — JoinMahj",
  description:
    "Learn Mahjong from beginner to advanced with structured lessons, AI-assisted training, and real-world hand analysis.",
};

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24 pb-[clamp(48px,8vw,96px)]">
        <AcademyPage />
      </main>
    </>
  );
}

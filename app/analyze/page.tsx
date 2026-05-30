import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import AnalyzePage from "@/components/analyze/analyze-page";

export const metadata = {
  title: "Analyze Your Hand — JoinMahj",
  description:
    "Upload a photo of your tiles and get AI-powered advice on your next move.",
};

export default async function Analyze() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <AnalyzePage authed={Boolean(user)} />
        </section>
      </main>
    </>
  );
}

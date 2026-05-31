import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import AcademyPage from "@/components/learn/academy-page";

export const metadata: Metadata = {
  title: "Mahjong Academy | Learn Mahjong Online",
  description:
    "Learn Mahjong from beginner to advanced with structured lessons, strategy guides, and community learning.",
  keywords: [
    "mahjong",
    "learn mahjong",
    "mahjong academy",
    "mahjong lessons",
    "mahjong strategy",
  ],
  alternates: {
    canonical: "/learn",
  },
  openGraph: {
    title: "Mahjong Academy | Learn Mahjong Online",
    description:
      "Learn Mahjong from beginner to advanced with structured lessons, strategy guides, and community learning.",
    type: "website",
    url: "/learn",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mahjong Academy | Learn Mahjong Online",
    description:
      "Learn Mahjong from beginner to advanced with structured lessons, strategy guides, and community learning.",
  },
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

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import LearnApp from "@/components/learn/learn-app";
import { lessons } from "@/lib/learn/lessons";

export const metadata = {
  title: "Learn — 7-Day Beginner Roadmap — JoinMahj",
  description: "Work through the 7-day beginner roadmap, one step at a time.",
};

export default async function LearnPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth required.
  if (!user) {
    redirect("/login");
  }

  const { data: progressRows } = await supabase
    .from("progress")
    .select("day, status")
    .eq("user_id", user.id);

  const initialCompletedDays = (progressRows ?? [])
    .filter((row) => row.status === "completed")
    .map((row) => row.day as number);

  return (
    <>
      <SiteHeader userEmail={user.email ?? null} />
      <main className="pt-24">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-10 sm:px-6 lg:px-8">
          <LearnApp
            lessons={lessons}
            initialCompletedDays={initialCompletedDays}
          />
        </div>
      </main>
    </>
  );
}

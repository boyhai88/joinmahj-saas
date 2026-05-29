import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import ClubsPage from "@/components/clubs/clubs-page";
import { getClubs } from "@/lib/clubs/actions";

export const metadata = {
  title: "Clubs — JoinMahj",
  description: "Find welcoming Mahjong tables near you.",
};

export default async function Clubs() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const clubs = await getClubs();

  let memberClubIds: string[] = [];
  if (user) {
    const { data: memberships } = await supabase
      .from("club_members")
      .select("club_id")
      .eq("user_id", user.id);
    memberClubIds = (memberships ?? []).map((row) => row.club_id as string);
  }

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <ClubsPage
            initialClubs={clubs}
            memberClubIds={memberClubIds}
            authed={Boolean(user)}
          />
        </section>
      </main>
    </>
  );
}

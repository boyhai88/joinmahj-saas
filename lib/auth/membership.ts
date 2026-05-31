import { createClient } from "@/lib/supabase/server";

// Single source of truth for Pro membership.
// A user is Pro when they have an active/trialing subscription on a paid plan
// (member or club_pro). profiles.plan is intentionally NOT used here.
export async function isProMember(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  return (
    !!subscription &&
    (subscription.status === "active" || subscription.status === "trialing") &&
    (subscription.plan === "member" || subscription.plan === "club_pro")
  );
}

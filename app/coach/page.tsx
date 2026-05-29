import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import CoachApp from "@/components/coach/coach-app";
import type { Chat, Message, MessageRole } from "@/lib/coach/actions";

export const metadata = {
  title: "AI Coach — JoinMahj",
  description: "Chat with your beginner-friendly Mahjong coach.",
};

export default async function CoachPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth required.
  if (!user) {
    redirect("/login");
  }

  const { data: chatRows } = await supabase
    .from("ai_chats")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const chats: Chat[] = (chatRows ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    updated_at: row.updated_at,
  }));

  // Membership / free-tier quota for the coach UI.
  const FREE_DAILY_LIMIT = 3;
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const unlimited =
    !!subscription &&
    (subscription.status === "active" || subscription.status === "trialing") &&
    (subscription.plan === "member" || subscription.plan === "club_pro");

  let remaining = FREE_DAILY_LIMIT;
  if (!unlimited) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: usage } = await supabase
      .from("ai_usage")
      .select("message_count")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle();
    remaining = Math.max(0, FREE_DAILY_LIMIT - (usage?.message_count ?? 0));
  }

  const activeChatId = chats[0]?.id ?? null;

  let initialMessages: Message[] = [];
  if (activeChatId) {
    const { data: messageRows } = await supabase
      .from("ai_messages")
      .select("id, role, content, created_at")
      .eq("chat_id", activeChatId)
      .order("created_at", { ascending: true });

    initialMessages = (messageRows ?? []).map((row) => ({
      id: row.id,
      role: row.role as MessageRole,
      content: row.content,
      created_at: row.created_at,
    }));
  }

  return (
    <>
      <SiteHeader userEmail={user.email ?? null} />
      <main className="pt-24">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-6 sm:px-6 lg:px-8">
          <CoachApp
            initialChats={chats}
            initialActiveChatId={activeChatId}
            initialMessages={initialMessages}
            membership={{ unlimited, remaining }}
          />
        </div>
      </main>
    </>
  );
}

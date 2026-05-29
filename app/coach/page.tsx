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
          />
        </div>
      </main>
    </>
  );
}

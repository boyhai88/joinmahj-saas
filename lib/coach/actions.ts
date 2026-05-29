"use server";

import { createClient } from "@/lib/supabase/server";

export type Chat = {
  id: string;
  title: string;
  updated_at: string;
};

export type MessageRole = "system" | "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
};

const DEFAULT_TITLE = "New conversation";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return { supabase, user };
}

export async function createChat(): Promise<Chat> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("ai_chats")
    .insert({ user_id: user.id, title: DEFAULT_TITLE })
    .select("id, title, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create chat.");
  }

  return { id: data.id, title: data.title, updated_at: data.updated_at };
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role as MessageRole,
    content: row.content,
    created_at: row.created_at,
  }));
}

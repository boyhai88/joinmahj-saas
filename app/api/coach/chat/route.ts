import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Message, MessageRole } from "@/lib/coach/actions";

const FALLBACK_REPLY = "Sorry, AI Coach is temporarily unavailable.";
const DEFAULT_TITLE = "New conversation";

const SYSTEM_PROMPT = [
  "You are JoinMahj Coach, a warm, patient American Mahjong coach for beginners.",
  "Explain rules, the Charleston, reading the card, hand-building, calls, and etiquette in plain language.",
  "Be encouraging and concise. Never condescending. Avoid gambling framing — this is a social, learning game.",
  "If a question is ambiguous, ask a short clarifying question.",
].join(" ");

const DASHSCOPE_URL =
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const DASHSCOPE_MODEL = process.env.DASHSCOPE_MODEL ?? "qwen-plus";

type ChatCompletionMessage = {
  role: MessageRole;
  content: string;
};

type ParsedBody = {
  chatId: string;
  content: string;
};

function parseBody(body: unknown): ParsedBody | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  const { chatId, content } = record;
  if (typeof chatId !== "string" || typeof content !== "string") return null;
  const trimmedId = chatId.trim();
  const trimmedContent = content.trim();
  if (!trimmedId || !trimmedContent) return null;
  return { chatId: trimmedId, content: trimmedContent };
}

async function callQwen(messages: ChatCompletionMessage[]): Promise<string> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing DASHSCOPE_API_KEY");
  }

  const response = await fetch(DASHSCOPE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DASHSCOPE_MODEL,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`DashScope request failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from DashScope");
  }

  return content;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = parseBody(rawBody);
  if (!parsed) {
    return NextResponse.json(
      { error: "chatId and content are required" },
      { status: 400 }
    );
  }

  const { chatId, content } = parsed;

  // 1. Persist the user's message (RLS verifies chat ownership).
  const { data: userRow, error: userError } = await supabase
    .from("ai_messages")
    .insert({ chat_id: chatId, role: "user", content })
    .select("id, role, content, created_at")
    .single();

  if (userError || !userRow) {
    return NextResponse.json(
      { error: "Could not save message" },
      { status: 400 }
    );
  }

  // 2. Load full chat history (includes the message just saved) for context.
  const { data: historyRows } = await supabase
    .from("ai_messages")
    .select("role, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  const history: ChatCompletionMessage[] = (historyRows ?? []).map((row) => ({
    role: row.role as MessageRole,
    content: row.content,
  }));

  // 3. Call Qwen. On any failure, fall back to a friendly apology.
  let assistantContent: string;
  try {
    assistantContent = await callQwen([
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
    ]);
  } catch {
    assistantContent = FALLBACK_REPLY;
  }

  // 4. Persist the assistant response.
  const { data: aiRow, error: aiError } = await supabase
    .from("ai_messages")
    .insert({ chat_id: chatId, role: "assistant", content: assistantContent })
    .select("id, role, content, created_at")
    .single();

  if (aiError || !aiRow) {
    return NextResponse.json(
      { error: "Could not save reply" },
      { status: 400 }
    );
  }

  // 5. Title the chat from the first user message + bump updated_at.
  const { data: chatRow } = await supabase
    .from("ai_chats")
    .select("title")
    .eq("id", chatId)
    .single();

  let title = chatRow?.title ?? DEFAULT_TITLE;
  if (title === DEFAULT_TITLE) {
    title = content.length > 40 ? `${content.slice(0, 40)}…` : content;
  }
  await supabase.from("ai_chats").update({ title }).eq("id", chatId);

  const userMessage: Message = {
    id: userRow.id,
    role: userRow.role as MessageRole,
    content: userRow.content,
    created_at: userRow.created_at,
  };
  const assistantMessage: Message = {
    id: aiRow.id,
    role: aiRow.role as MessageRole,
    content: aiRow.content,
    created_at: aiRow.created_at,
  };

  return NextResponse.json({ userMessage, assistantMessage, title });
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChat,
  getMessages,
  type Chat,
  type Message,
} from "@/lib/coach/actions";

type SendResponse = {
  userMessage: Message;
  assistantMessage: Message;
  title: string;
};

type CoachAppProps = {
  initialChats: Chat[];
  initialActiveChatId: string | null;
  initialMessages: Message[];
};

export default function CoachApp({
  initialChats,
  initialActiveChatId,
  initialMessages,
}: CoachAppProps) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    initialActiveChatId
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function reportError(err: unknown) {
    setError(err instanceof Error ? err.message : "Something went wrong.");
  }

  async function handleNewChat() {
    setError(null);
    setMobileSidebar(false);
    try {
      const chat = await createChat();
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat.id);
      setMessages([]);
    } catch (err) {
      reportError(err);
    }
  }

  async function handleSelectChat(id: string) {
    if (id === activeChatId) {
      setMobileSidebar(false);
      return;
    }
    setError(null);
    setActiveChatId(id);
    setMessages([]);
    setMobileSidebar(false);
    try {
      const loaded = await getMessages(id);
      setMessages(loaded);
    } catch (err) {
      reportError(err);
    }
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const content = input.trim();
    if (!content || pending) return;

    setError(null);
    setPending(true);
    setInput("");

    try {
      let chatId = activeChatId;

      // Lazily create a chat on the first message.
      if (!chatId) {
        const chat = await createChat();
        chatId = chat.id;
        setChats((prev) => [chat, ...prev]);
        setActiveChatId(chat.id);
      }

      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, content }),
      });

      if (!response.ok) {
        throw new Error("Sorry, AI Coach is temporarily unavailable.");
      }

      const { userMessage, assistantMessage, title } =
        (await response.json()) as SendResponse;

      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Reflect the new title and move the chat to the top of the list.
      setChats((prev) => {
        const target = prev.find((c) => c.id === chatId);
        if (!target) return prev;
        const updated: Chat = {
          ...target,
          title,
          updated_at: assistantMessage.created_at,
        };
        return [updated, ...prev.filter((c) => c.id !== chatId)];
      });
    } catch (err) {
      reportError(err);
      setInput(content);
    } finally {
      setPending(false);
    }
  }

  function renderSidebar() {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <button
          type="button"
          onClick={handleNewChat}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-surface shadow-[0_4px_16px_oklch(38%_0.045_130/0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
            className="h-4 w-4"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <p className="px-2 py-3 text-[13px] text-muted">
              No conversations yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {chats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <li key={chat.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectChat(chat.id)}
                      className={`w-full truncate rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-bg font-medium text-fg"
                          : "text-muted hover:bg-bg hover:text-fg"
                      }`}
                    >
                      {chat.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100dvh-8rem)] gap-4">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 overflow-hidden rounded-card border border-border bg-surface shadow-soft lg:block">
        {renderSidebar()}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebar ? (
        <div className="absolute inset-0 z-20 lg:hidden">
          <button
            type="button"
            aria-label="Close conversations"
            onClick={() => setMobileSidebar(false)}
            className="absolute inset-0 bg-[oklch(18%_0.012_280/0.25)]"
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-hidden rounded-card border border-border bg-surface shadow-card">
            {renderSidebar()}
          </div>
        </div>
      ) : null}

      {/* Main chat area */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-card border border-border bg-surface shadow-soft">
        {/* Mobile toolbar */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileSidebar(true)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:bg-bg"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
              className="h-4 w-4"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Chats
          </button>
          <button
            type="button"
            onClick={handleNewChat}
            className="text-sm font-medium text-primary"
          >
            New
          </button>
        </div>

        {/* Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-bg px-4 py-6 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-primary p-2.5 shadow-[0_3px_10px_oklch(38%_0.045_130/0.22)]">
                <div className="grid h-full w-full grid-cols-2 gap-[3px]">
                  <span className="rounded-[3px] bg-[oklch(99%_0.01_90/0.35)]" />
                  <span className="rounded-[3px] bg-[oklch(99%_0.01_90/0.35)]" />
                  <span className="rounded-[3px] bg-[oklch(99%_0.01_90/0.35)]" />
                  <span className="rounded-[3px] bg-accent" />
                </div>
              </div>
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-[-0.02em] text-fg">
                Ask your Mahjong Coach
              </h2>
              <p className="mt-3 max-w-[42ch] text-sm leading-[1.6] text-muted">
                Describe your hand or ask about a discard, the Charleston, or
                reading the card. Your coach is here to help — calm, clear, and
                beginner-friendly.
              </p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-[760px] flex-col gap-5">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col gap-1.5 ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${
                        isUser ? "text-accent" : "text-primary"
                      }`}
                    >
                      {isUser ? "You" : "Coach"}
                    </span>
                    <div
                      className={`max-w-[88%] text-sm leading-[1.58] ${
                        isUser
                          ? "rounded-[20px] rounded-br-[5px] bg-primary px-[18px] py-[15px] text-surface shadow-[0_6px_20px_oklch(38%_0.045_130/0.22)]"
                          : "rounded-[20px] rounded-bl-[5px] border border-border bg-surface px-[18px] py-[15px] text-fg shadow-soft"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}
              <div ref={threadEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-surface px-4 py-4 sm:px-6">
          {error ? (
            <p
              role="alert"
              className="mx-auto mb-3 max-w-[760px] rounded-[10px] border border-[oklch(58%_0.16_25/0.3)] bg-[oklch(58%_0.16_25/0.08)] px-3.5 py-2 text-[13px] text-[oklch(45%_0.16_25)]"
            >
              {error}
            </p>
          ) : null}
          <form
            onSubmit={handleSend}
            className="mx-auto flex max-w-[760px] items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your next move…"
              aria-label="Message to your Mahjong Coach"
              className="min-w-0 flex-1 rounded-full border border-border bg-bg px-5 py-3.5 text-sm text-fg outline-none transition focus:border-[oklch(72%_0.085_75/0.55)] focus:shadow-[0_0_0_3px_oklch(88%_0.04_75/0.45)] placeholder:text-[oklch(52%_0.025_85/0.55)]"
            />
            <button
              type="submit"
              disabled={pending || input.trim().length === 0}
              aria-label="Send message"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-primary text-surface shadow-[0_4px_14px_oklch(38%_0.045_130/0.25)] transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="h-[17px] w-[17px]"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

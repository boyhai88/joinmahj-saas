type ChatMessage = {
  role: "user" | "ai";
  label: string;
  text: string;
};

const messages: ChatMessage[] = [
  {
    role: "user",
    label: "You",
    text: "Should I discard Bamboo 3?",
  },
  {
    role: "ai",
    label: "Coach",
    text: "You're one tile away from a flexible hand. Discard Bamboo 3 and keep your defensive options open.",
  },
  {
    role: "user",
    label: "You",
    text: "Can I call this tile?",
  },
  {
    role: "ai",
    label: "Coach",
    text: "Yes — calling this tile completes your sequence and improves your position for the next draw.",
  },
];

const trustPills = ["Beginner-friendly", "No judgment", "Available 24/7"];

export default function CoachSection() {
  return (
    <section
      id="ai-coach"
      className="relative overflow-hidden py-[clamp(72px,10vw,120px)]"
    >
      {/* Warm radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-6%] top-[8%] h-[min(480px,50vw)] w-[min(480px,50vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(88% 0.06 75 / 0.35), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-[clamp(48px,7vw,88px)] lg:grid-cols-[0.95fr_1.05fr]">
          {/* Copy */}
          <div>
            <p className="mb-[22px] text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              AI Coach
            </p>
            <h2 className="mb-7 max-w-[12ch] font-display text-[clamp(2.5rem,5vw,3.85rem)] font-medium leading-[1.06] tracking-[-0.02em] text-fg">
              Your Mahjong Coach,
              <br />
              Always at the Table.
            </h2>
            <p className="mb-5 max-w-[44ch] text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.65] text-muted">
              Get instant beginner-friendly guidance, strategy help, and
              confidence-building feedback anytime you play.
            </p>
            <p className="mb-9 max-w-[42ch] text-[15px] leading-[1.65] text-muted">
              Whether you&rsquo;re learning your first Charleston or
              second-guessing a discard at home, your coach meets you where you
              are — calm, clear, and never condescending.
            </p>
            <ul className="flex flex-wrap gap-2.5" aria-label="Coach benefits">
              {trustPills.map((pill) => (
                <li
                  key={pill}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-[11px] text-[13px] font-medium text-fg shadow-[0_4px_24px_oklch(18%_0.012_280/0.05)] before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-accent before:content-['']"
                >
                  {pill}
                </li>
              ))}
            </ul>
          </div>

          {/* Demo window */}
          <div className="relative p-3.5">
            {/* Blurred glow behind window */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-1 z-0 rounded-[34px] opacity-75 blur-[32px]"
              style={{
                background:
                  "linear-gradient(145deg, oklch(88% 0.06 75 / 0.4), oklch(38% 0.045 130 / 0.08))",
              }}
            />

            <div
              className="relative z-1 overflow-hidden rounded-[24px] border border-border bg-surface shadow-[0_24px_64px_oklch(18%_0.012_280/0.10),0_0_0_1px_oklch(100%_0_0/0.5)_inset]"
              role="region"
              aria-label="JoinMahj Coach conversation"
            >
              {/* Header */}
              <header className="flex items-center gap-3.5 border-b border-border bg-surface px-[22px] py-[18px]">
                <div
                  aria-hidden
                  className="grid h-[42px] w-[42px] shrink-0 grid-cols-2 gap-[3px] rounded-[12px] bg-primary p-2 shadow-[0_3px_10px_oklch(38%_0.045_130/0.22)]"
                >
                  <span className="rounded-[3px] bg-[oklch(99%_0.01_90/0.35)]" />
                  <span className="rounded-[3px] bg-[oklch(99%_0.01_90/0.35)]" />
                  <span className="rounded-[3px] bg-[oklch(99%_0.01_90/0.35)]" />
                  <span className="rounded-[3px] bg-accent" />
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold tracking-[-0.02em] text-fg">
                    JoinMahj Coach
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted before:h-1.5 before:w-1.5 before:rounded-full before:bg-success before:shadow-[0_0_0_2px_oklch(58%_0.14_145/0.18)] before:content-['']">
                    Online · ready to help
                  </div>
                </div>
                <span className="ml-auto shrink-0 rounded-full bg-gold-light px-[11px] py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[oklch(42%_0.05_130)]">
                  Member
                </span>
              </header>

              {/* Thread */}
              <div className="flex flex-col gap-[22px] overflow-hidden bg-bg px-6 pb-6 pt-7">
                {messages.map((message, index) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex max-w-[88%] flex-col gap-2 ${
                        isUser ? "items-end self-end" : "items-start self-start"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          isUser ? "text-accent" : "text-primary"
                        }`}
                      >
                        {message.label}
                      </span>
                      {isUser ? (
                        <div className="rounded-[20px] rounded-br-[5px] bg-primary px-[18px] py-[15px] text-sm leading-[1.58] text-surface shadow-[0_6px_20px_oklch(38%_0.045_130/0.22)]">
                          {message.text}
                        </div>
                      ) : (
                        <div className="relative rounded-[20px] rounded-bl-[5px] border border-border bg-surface py-[15px] pl-5 pr-[18px] text-sm leading-[1.58] text-fg shadow-[0_4px_24px_oklch(18%_0.012_280/0.05)] before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-r-sm before:bg-linear-to-b before:from-accent before:to-[oklch(72%_0.085_75/0.5)] before:content-['']">
                          {message.text}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Composer */}
              <form className="flex items-center gap-2.5 border-t border-border bg-surface px-5 pb-5 pt-4">
                <input
                  type="text"
                  placeholder="Ask about your next move…"
                  aria-label="Message to JoinMahj Coach"
                  className="min-w-0 flex-1 rounded-full border border-border bg-bg px-5 py-3.5 text-sm text-fg outline-none transition focus:border-[oklch(72%_0.085_75/0.55)] focus:shadow-[0_0_0_3px_oklch(88%_0.04_75/0.45)] placeholder:text-[oklch(52%_0.025_85/0.55)]"
                />
                <button
                  type="button"
                  aria-label="Send message"
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-primary text-surface shadow-[0_4px_14px_oklch(38%_0.045_130/0.25)] transition hover:scale-[1.04] hover:bg-primary-hover"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-[17px] w-[17px]"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

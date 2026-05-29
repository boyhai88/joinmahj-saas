"use client";

import { useRouter } from "next/navigation";

type CoachCtaProps = {
  href: string;
};

export default function CoachCta({ href }: CoachCtaProps) {
  const router = useRouter();

  function go() {
    router.push(href);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        go();
      }}
      className="flex items-center gap-2.5 border-t border-border bg-surface px-5 pb-5 pt-4"
    >
      <input
        type="text"
        readOnly
        onClick={go}
        onFocus={go}
        placeholder="Ask about your next move…"
        aria-label="Open the AI Coach"
        className="min-w-0 flex-1 cursor-pointer rounded-full border border-border bg-bg px-5 py-3.5 text-sm text-fg outline-none transition focus:border-[oklch(72%_0.085_75/0.55)] focus:shadow-[0_0_0_3px_oklch(88%_0.04_75/0.45)] placeholder:text-[oklch(52%_0.025_85/0.55)]"
      />
      <button
        type="submit"
        aria-label="Open the AI Coach"
        className="flex h-[46px] w-[46px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-surface shadow-[0_4px_14px_oklch(38%_0.045_130/0.25)] transition hover:scale-[1.04] hover:bg-primary-hover"
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
  );
}

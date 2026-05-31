"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/auth/actions";

type UserMenuProps = {
  email: string;
};

function shortenEmail(email: string) {
  if (email.length <= 16) return email;
  return `${email.slice(0, 15)}…`;
}

export default function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const initial = email.charAt(0).toUpperCase();
  const itemClasses =
    "flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-sm text-fg transition-colors hover:bg-[oklch(90%_0.018_85/0.4)]";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-3 text-sm font-medium text-fg shadow-soft transition hover:border-[oklch(72%_0.085_75/0.5)]"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-gold-light to-[oklch(85%_0.04_80)] font-display text-sm font-semibold text-primary">
          {initial}
        </span>
        <span className="hidden max-w-[140px] truncate sm:inline">
          {shortenEmail(email)}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`h-4 w-4 text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-2xl border border-border bg-[oklch(99%_0.01_90/0.95)] p-1.5 shadow-card backdrop-blur-xl"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
              Signed in as
            </p>
            <p className="mt-0.5 truncate text-[13px] font-medium text-fg">
              {email}
            </p>
          </div>

          <div className="pt-1.5">
            <Link
              role="menuitem"
              href="/profile/analyses"
              onClick={() => setOpen(false)}
              className={itemClasses}
            >
              My Analyses
            </Link>
            <Link
              role="menuitem"
              href="/community"
              onClick={() => setOpen(false)}
              className={itemClasses}
            >
              Community
            </Link>
            <Link
              role="menuitem"
              href="/analyze"
              onClick={() => setOpen(false)}
              className={itemClasses}
            >
              Analyze New Hand
            </Link>
            <Link
              role="menuitem"
              href="/pricing"
              onClick={() => setOpen(false)}
              className={itemClasses}
            >
              Billing
            </Link>

            <form action={signOut}>
              <button role="menuitem" type="submit" className={itemClasses}>
                Logout
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

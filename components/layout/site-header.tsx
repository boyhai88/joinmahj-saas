"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import UserMenu from "@/components/layout/user-menu";

type SiteHeaderProps = {
  userEmail?: string | null;
};

const navLinks = [
  { label: "Analyze", href: "/analyze" },
  { label: "Learn", href: "/learn" },
  { label: "Coach", href: "/coach" },
  { label: "Community", href: "/community" },
  { label: "Clubs", href: "/clubs" },
  { label: "Pricing", href: "/#pricing" },
];

export default function SiteHeader({ userEmail }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[oklch(97%_0.018_85/0.55)] backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between gap-5 rounded-2xl border border-border bg-[oklch(99%_0.01_90/0.72)] px-[18px] py-3 shadow-soft backdrop-blur-xl sm:px-7">
          {/* Logo */}
          <a
            href={userEmail ? "/dashboard" : "/"}
            className="shrink-0 font-display text-2xl font-semibold tracking-[-0.03em] text-fg transition-opacity hover:opacity-85"
          >
            Join<span className="text-accent">Mahj</span>
          </a>

          {/* Desktop nav */}
          <nav
            aria-label="Main navigation"
            className="mx-auto hidden items-center gap-[clamp(20px,2.5vw,36px)] lg:flex"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            {userEmail ? (
              <UserMenu email={userEmail} />
            ) : (
              <>
                <a
                  href="/login"
                  className="hidden rounded-full px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-[oklch(90%_0.018_85/0.5)] sm:inline-flex"
                >
                  Login
                </a>
                <Button href="/signup" size="sm">
                  Sign Up
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-11 w-11 items-center justify-center rounded-[10px] text-fg transition-colors hover:bg-[oklch(90%_0.018_85/0.45)] lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
                className="h-[22px] w-[22px]"
              >
                {open ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {open ? (
            <nav
              id="mobile-nav"
              aria-label="Mobile navigation"
              className="absolute inset-x-0 top-[calc(100%+10px)] flex flex-col gap-1 rounded-2xl border border-border bg-[oklch(99%_0.01_90/0.92)] p-5 shadow-card backdrop-blur-xl lg:hidden"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-[10px] px-3.5 py-3 text-[15px] font-medium text-muted transition-colors hover:bg-[oklch(90%_0.018_85/0.35)] hover:text-fg"
                >
                  {link.label}
                </a>
              ))}
              {!userEmail ? (
                <div className="mt-3 flex flex-col gap-1 border-t border-border pt-4 sm:hidden">
                  <a
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-[10px] px-3.5 py-3 text-[15px] font-medium text-muted transition-colors hover:bg-[oklch(90%_0.018_85/0.35)] hover:text-fg"
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="text-[15px] font-medium text-fg"
                  >
                    <span className="block rounded-full bg-primary px-6 py-3.5 text-center text-surface">
                      Sign Up
                    </span>
                  </a>
                </div>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}

"use client";

import type { PostAuthor } from "@/lib/community/actions";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.max(1, Math.floor(diff / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min > 1 ? "s" : ""} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} day${day > 1 ? "s" : ""} ago`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon} month${mon > 1 ? "s" : ""} ago`;
  const yr = Math.floor(mon / 12);
  return `${yr} year${yr > 1 ? "s" : ""} ago`;
}

function displayName(author: PostAuthor | null, userId: string): string {
  const name = author?.full_name?.trim();
  return name && name.length > 0 ? name : `Player ${userId.slice(0, 6)}`;
}

type AuthorBadgeProps = {
  author: PostAuthor | null;
  userId: string;
  createdAt: string;
};

export default function AuthorBadge({
  author,
  userId,
  createdAt,
}: AuthorBadgeProps) {
  const name = displayName(author, userId);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2.5">
      {author?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={author.avatar_url}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gold-light to-[oklch(85%_0.04_80)] font-display text-sm font-semibold text-primary">
          {initial}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-fg">{name}</p>
        <p className="text-[12px] text-muted">{timeAgo(createdAt)}</p>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import CreatePostDialog from "@/components/community/create-post-dialog";
import AuthorBadge from "@/components/community/author-badge";
import {
  getPosts,
  toggleLike,
  type CommunityPostListItem,
  type CommunityStats,
} from "@/lib/community/actions";

type FeedKey = "latest" | "popular" | "photos" | "videos";

type CommunityPageProps = {
  initialPosts: CommunityPostListItem[];
  authed: boolean;
  stats: CommunityStats;
};

const FEEDS: { id: FeedKey; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "popular", label: "Popular" },
  { id: "photos", label: "Photos" },
  { id: "videos", label: "Videos" },
];

const TRENDING_TAGS = [
  "Beginner",
  "Strategy",
  "Hand Review",
  "Winning Story",
  "Club",
  "Question",
];

function preview(content: string) {
  return content.length > 120 ? `${content.slice(0, 120)}…` : content;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" />
    </svg>
  );
}

function TagChips({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full border border-border bg-bg px-2.5 py-1 text-[11px] font-medium text-muted"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export default function CommunityPage({
  initialPosts,
  authed,
  stats,
}: CommunityPageProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPostListItem[]>(initialPosts);
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<FeedKey>("latest");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return TRENDING_TAGS.map((tag) => ({ tag, count: counts.get(tag) ?? 0 }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const visiblePosts = useMemo(() => {
    let list = posts;

    if (activeTag) {
      list = list.filter((post) => (post.tags ?? []).includes(activeTag));
    }

    if (feed === "photos") {
      list = list.filter((post) => post.media_type === "image");
    } else if (feed === "videos") {
      list = list.filter((post) => post.media_type === "video");
    }

    const sorted = [...list];
    if (feed === "popular") {
      sorted.sort(
        (a, b) =>
          b.likes_count - a.likes_count ||
          b.comments_count - a.comments_count
      );
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return sorted;
  }, [posts, feed, activeTag]);

  function startCreate() {
    if (!authed) {
      router.push("/login");
      return;
    }
    setOpen(true);
  }

  async function handleCreated() {
    setOpen(false);
    try {
      setPosts(await getPosts());
    } catch {
      // Keep existing list if refresh fails.
    }
  }

  async function handleLike(target: CommunityPostListItem) {
    if (!authed) {
      router.push("/login");
      return;
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === target.id
          ? {
              ...p,
              liked_by_me: !p.liked_by_me,
              likes_count: p.likes_count + (p.liked_by_me ? -1 : 1),
            }
          : p
      )
    );

    try {
      const result = await toggleLike(target.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === target.id
            ? { ...p, liked_by_me: result.liked, likes_count: result.likes_count }
            : p
        )
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === target.id
            ? {
                ...p,
                liked_by_me: target.liked_by_me,
                likes_count: target.likes_count,
              }
            : p
        )
      );
    }
  }

  const statItems = [
    { label: "Posts", value: stats.posts },
    { label: "Photos", value: stats.photos },
    { label: "Videos", value: stats.videos },
    { label: "Members", value: stats.members },
  ];

  return (
    <Container>
      {/* Hero */}
      <div className="mx-auto mb-[clamp(28px,4vw,48px)] max-w-[760px] text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Community
        </p>
        <h1 className="mb-4 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
          Mahjong Fan Community
        </h1>
        <p className="mx-auto mb-7 max-w-[48ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.65] text-muted">
          Learn together. Ask questions. Share wins, hands, and clips.
        </p>
        <Button type="button" onClick={startCreate}>
          Create Post
        </Button>
      </div>

      {/* Community stats */}
      <div className="mx-auto mb-[clamp(28px,4vw,44px)] grid max-w-[760px] grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border shadow-soft sm:grid-cols-4">
        {statItems.map((item) => (
          <div key={item.label} className="bg-surface px-4 py-5 text-center">
            <p className="font-display text-[1.75rem] font-semibold leading-none text-fg [font-variant-numeric:tabular-nums]">
              {item.value}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-[760px]">
        {/* Feed navigation */}
        <div className="mb-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FEEDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFeed(item.id)}
              aria-pressed={feed === item.id}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                feed === item.id
                  ? "border-accent bg-gold-light text-primary"
                  : "border-border bg-surface text-muted hover:text-fg"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Trending tags */}
        {tagCounts.length > 0 ? (
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
              Trending Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {activeTag ? (
                <button
                  type="button"
                  onClick={() => setActiveTag(null)}
                  className="rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-muted transition hover:text-fg"
                >
                  Clear filter
                </button>
              ) : null}
              {tagCounts.map(({ tag, count }) => {
                const active = activeTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveTag(active ? null : tag)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                      active
                        ? "border-accent bg-gold-light text-primary"
                        : "border-border bg-surface text-muted hover:text-fg"
                    }`}
                  >
                    #{tag.replace(/\s+/g, "")} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Post list */}
        {visiblePosts.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-[clamp(32px,6vw,56px)] text-center shadow-soft">
            <h2 className="mb-2 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
              No posts found
            </h2>
            <p className="mb-6 text-sm text-muted">
              Try another category or tag.
            </p>
            <Button type="button" onClick={startCreate}>
              Create Post
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className="rounded-card border border-border bg-surface p-6 shadow-soft transition duration-200 hover:shadow-card"
              >
                <div className="mb-4">
                  <AuthorBadge
                    author={post.author}
                    userId={post.user_id}
                    createdAt={post.created_at}
                  />
                </div>

                {post.media_type === "video" && post.media_url ? (
                  <video
                    src={post.media_url}
                    controls
                    preload="metadata"
                    className="mb-4 max-h-[300px] w-full rounded-[16px] bg-bg"
                  />
                ) : post.media_url || post.image_url ? (
                  <Link href={`/community/${post.id}`} className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.media_url ?? post.image_url ?? ""}
                      alt=""
                      className="mb-4 max-h-[260px] w-full rounded-[16px] object-cover"
                    />
                  </Link>
                ) : null}

                <Link href={`/community/${post.id}`} className="block">
                  <TagChips tags={post.tags} />
                  <h3 className="mb-2 font-display text-[1.35rem] font-medium leading-[1.2] tracking-[-0.01em] text-fg">
                    {post.title}
                  </h3>
                  <p className="mb-4 text-sm leading-[1.6] text-muted">
                    {preview(post.content)}
                  </p>
                </Link>

                <div className="flex items-center gap-5 text-[13px] text-muted">
                  <button
                    type="button"
                    onClick={() => handleLike(post)}
                    aria-pressed={post.liked_by_me}
                    aria-label={post.liked_by_me ? "Unlike post" : "Like post"}
                    className={`inline-flex items-center gap-1.5 transition-colors ${
                      post.liked_by_me ? "text-accent" : "hover:text-fg"
                    }`}
                  >
                    <HeartIcon filled={post.liked_by_me} />
                    {post.likes_count}
                  </button>
                  <Link
                    href={`/community/${post.id}`}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
                  >
                    <CommentIcon />
                    {post.comments_count}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <CreatePostDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
}

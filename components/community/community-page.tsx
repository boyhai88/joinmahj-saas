"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import CreatePostDialog from "@/components/community/create-post-dialog";
import {
  getPosts,
  toggleLike,
  type CommunityPostListItem,
} from "@/lib/community/actions";

type CommunityPageProps = {
  initialPosts: CommunityPostListItem[];
  authed: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function preview(content: string) {
  return content.length > 120 ? `${content.slice(0, 120)}…` : content;
}

function authorLabel(userId: string) {
  return `Player ${userId.slice(0, 6)}`;
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

export default function CommunityPage({
  initialPosts,
  authed,
}: CommunityPageProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPostListItem[]>(initialPosts);
  const [open, setOpen] = useState(false);

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

  async function handleLike(post: CommunityPostListItem) {
    if (!authed) {
      router.push("/login");
      return;
    }

    // Optimistic update.
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              liked_by_me: !p.liked_by_me,
              likes_count: p.likes_count + (p.liked_by_me ? -1 : 1),
            }
          : p
      )
    );

    try {
      const result = await toggleLike(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, liked_by_me: result.liked, likes_count: result.likes_count }
            : p
        )
      );
    } catch {
      // Revert on failure.
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                liked_by_me: post.liked_by_me,
                likes_count: post.likes_count,
              }
            : p
        )
      );
    }
  }

  return (
    <Container>
      {/* Hero */}
      <div className="mx-auto mb-[clamp(32px,5vw,56px)] max-w-[720px] text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Community
        </p>
        <h1 className="mb-4 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
          Community
        </h1>
        <p className="mx-auto mb-7 max-w-[48ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.65] text-muted">
          Learn together. Ask questions. Share wins.
        </p>
        <Button type="button" onClick={startCreate}>
          Create Post
        </Button>
      </div>

      {/* Post list */}
      <div className="mx-auto max-w-[720px]">
        {posts.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-[clamp(32px,6vw,56px)] text-center shadow-soft">
            <h2 className="mb-2 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
              No posts yet.
            </h2>
            <p className="mb-6 text-sm text-muted">
              Be the first player to start the conversation.
            </p>
            <Button type="button" onClick={startCreate}>
              Create First Post
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-card border border-border bg-surface p-6 shadow-soft transition duration-200 hover:shadow-card"
              >
                <Link href={`/community/${post.id}`} className="block">
                  {post.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image_url}
                      alt=""
                      className="mb-4 max-h-[260px] w-full rounded-[16px] object-cover"
                    />
                  ) : null}
                  <h3 className="mb-2 font-display text-[1.35rem] font-medium leading-[1.2] tracking-[-0.01em] text-fg">
                    {post.title}
                  </h3>
                  <p className="mb-3 text-[13px] text-muted">
                    {authorLabel(post.user_id)} · {formatDate(post.created_at)}
                  </p>
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

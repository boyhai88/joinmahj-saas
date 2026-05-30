"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import {
  createComment,
  toggleLike,
  type CommunityComment,
  type PostDetail as PostDetailData,
} from "@/lib/community/actions";

type PostDetailProps = {
  initial: PostDetailData;
  authed: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function authorLabel(userId: string) {
  return `Player ${userId.slice(0, 6)}`;
}

export default function PostDetail({ initial, authed }: PostDetailProps) {
  const router = useRouter();
  const { post } = initial;

  const [liked, setLiked] = useState(initial.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [comments, setComments] = useState<CommunityComment[]>(initial.comments);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLike() {
    if (!authed) {
      router.push("/login");
      return;
    }

    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount(prevCount + (prevLiked ? -1 : 1));

    try {
      const result = await toggleLike(post.id);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  }

  async function handleComment(event: React.FormEvent) {
    event.preventDefault();
    if (!authed) {
      router.push("/login");
      return;
    }
    const content = input.trim();
    if (!content || pending) return;

    setError(null);
    setPending(true);
    try {
      const comment = await createComment({ postId: post.id, content });
      setComments((prev) => [...prev, comment]);
      setCommentsCount((prev) => prev + 1);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <Link
        href="/community"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
      >
        ← Back to Community
      </Link>

      <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,48px)] shadow-soft">
        <h1 className="mb-2 font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
          {post.title}
        </h1>
        <p className="mb-6 text-[13px] text-muted">
          {authorLabel(post.user_id)} · {formatDate(post.created_at)}
        </p>

        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt="Shared Mahjong hand"
            className="mb-6 max-h-[480px] w-full rounded-[16px] object-contain"
          />
        ) : null}

        <div className="whitespace-pre-wrap text-[15px] leading-[1.7] text-fg">
          {post.content}
        </div>

        <div className="mt-8 flex items-center gap-5 border-t border-border pt-5 text-[13px] text-muted">
          <button
            type="button"
            onClick={handleLike}
            aria-pressed={liked}
            aria-label={liked ? "Unlike post" : "Like post"}
            className={`inline-flex items-center gap-1.5 transition-colors ${
              liked ? "text-accent" : "hover:text-fg"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-4 w-4"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
            {likesCount}
          </button>
          <span className="inline-flex items-center gap-1.5">
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
            {commentsCount}
          </span>
        </div>
      </article>

      {/* Comments */}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
          Comments
        </h2>

        {authed ? (
          <form onSubmit={handleComment} className="mb-6 flex flex-col gap-3">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              placeholder="Share a thought or answer…"
              aria-label="Write a comment"
              className="w-full resize-y rounded-[12px] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none transition focus:border-[oklch(72%_0.085_75/0.55)] focus:shadow-[0_0_0_3px_oklch(88%_0.04_75/0.45)] placeholder:text-[oklch(52%_0.025_85/0.55)]"
            />
            {error ? (
              <p
                role="alert"
                className="rounded-[10px] border border-[oklch(58%_0.16_25/0.3)] bg-[oklch(58%_0.16_25/0.08)] px-3.5 py-2.5 text-[13px] text-[oklch(45%_0.16_25)]"
              >
                {error}
              </p>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={pending || input.trim().length === 0}
              >
                {pending ? "Posting…" : "Post comment"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="mb-6 rounded-card border border-border bg-surface p-5 text-sm text-muted shadow-soft">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>{" "}
            to join the conversation.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-muted">
            No comments yet. Be the first to reply.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-card border border-border bg-surface p-5 shadow-soft"
              >
                <p className="mb-1.5 text-[13px] text-muted">
                  {authorLabel(comment.user_id)} · {formatDate(comment.created_at)}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-[1.6] text-fg">
                  {comment.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

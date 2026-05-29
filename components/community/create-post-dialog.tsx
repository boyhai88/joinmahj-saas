"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { createPost, type CommunityPost } from "@/lib/community/actions";

type CreatePostDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (post: CommunityPost) => void;
};

export default function CreatePostDialog({
  open,
  onClose,
  onCreated,
}: CreatePostDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const post = await createPost({ title, content });
      setTitle("");
      setContent("");
      onCreated(post);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish post.");
    } finally {
      setPending(false);
    }
  }

  const fieldClasses =
    "w-full rounded-[12px] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none transition focus:border-[oklch(72%_0.085_75/0.55)] focus:shadow-[0_0_0_3px_oklch(88%_0.04_75/0.45)] placeholder:text-[oklch(52%_0.025_85/0.55)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-[oklch(18%_0.012_280/0.35)] backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create a post"
        className="relative w-full max-w-lg rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-card"
      >
        <h2 className="mb-1 font-display text-[1.75rem] font-medium tracking-[-0.02em] text-fg">
          Create a post
        </h2>
        <p className="mb-6 text-sm text-muted">
          Ask a question or share a win with the community.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="post-title" className="text-sm font-medium text-fg">
              Title
            </label>
            <input
              id="post-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={140}
              placeholder="What's on your mind?"
              className={fieldClasses}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="post-content" className="text-sm font-medium text-fg">
              Content
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              rows={5}
              placeholder="Share the details…"
              className={`${fieldClasses} resize-y`}
            />
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-[10px] border border-[oklch(58%_0.16_25/0.3)] bg-[oklch(58%_0.16_25/0.08)] px-3.5 py-2.5 text-[13px] text-[oklch(45%_0.16_25)]"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

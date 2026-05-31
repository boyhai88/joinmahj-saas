"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/button";
import { createPost, type CommunityPost } from "@/lib/community/actions";
import { uploadCommunityMedia } from "@/lib/community/media-actions";

type CreatePostDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (post: CommunityPost) => void;
};

type PostType = "text" | "photo" | "video";

const POST_TYPES: { id: PostType; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "photo", label: "Photo" },
  { id: "video", label: "Video" },
];

const AVAILABLE_TAGS = [
  "Beginner",
  "Strategy",
  "Hand Review",
  "Winning Story",
  "Club",
  "Question",
];

const MAX_TAGS = 3;

const IMAGE_ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
const VIDEO_ACCEPT = "video/mp4,video/webm";
const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export default function CreatePostDialog({
  open,
  onClose,
  onCreated,
}: CreatePostDialogProps) {
  const [postType, setPostType] = useState<PostType>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!open) return null;

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function switchType(next: PostType) {
    setPostType(next);
    setError(null);
    clearFile();
  }

  function handleFileChange(selected: File | null) {
    setError(null);
    if (!selected) {
      clearFile();
      return;
    }

    const isImage = IMAGE_TYPES.includes(selected.type);
    const isVideo = VIDEO_TYPES.includes(selected.type);

    if (postType === "photo" && !isImage) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (postType === "video" && !isVideo) {
      setError("Please choose an MP4 or WebM video.");
      return;
    }
    if (isImage && selected.size > MAX_IMAGE_BYTES) {
      setError("Images must be 10MB or smaller.");
      return;
    }
    if (isVideo && selected.size > MAX_VIDEO_BYTES) {
      setError("Videos must be 100MB or smaller.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selected));
    setFile(selected);
  }

  function toggleTag(tag: string) {
    setTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }
      if (prev.length >= MAX_TAGS) {
        return prev;
      }
      return [...prev, tag];
    });
  }

  function resetForm() {
    setPostType("text");
    setTitle("");
    setContent("");
    setTags([]);
    clearFile();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    if (postType !== "text" && !file) {
      setError(
        postType === "photo"
          ? "Please add a photo, or switch to a Text post."
          : "Please add a video, or switch to a Text post."
      );
      return;
    }

    setPending(true);
    try {
      let mediaUrl: string | undefined;
      let mediaType: "text" | "image" | "video" = "text";

      if (postType !== "text" && file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploaded = await uploadCommunityMedia(formData);
        mediaUrl = uploaded.publicUrl;
        mediaType = uploaded.mediaType;
      }

      const post = await createPost({
        title,
        content,
        mediaUrl,
        mediaType,
        tags,
      });

      resetForm();
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-card"
      >
        <h2 className="mb-1 font-display text-[1.75rem] font-medium tracking-[-0.02em] text-fg">
          Create a post
        </h2>
        <p className="mb-6 text-sm text-muted">
          Share a thought, a hand photo, or a short video with the community.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Post type */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg">Post type</span>
            <div className="flex gap-2">
              {POST_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => switchType(type.id)}
                  aria-pressed={postType === type.id}
                  className={`flex-1 rounded-[10px] border px-3 py-2.5 text-sm font-medium transition ${
                    postType === type.id
                      ? "border-accent bg-gold-light text-primary"
                      : "border-border bg-bg text-muted hover:text-fg"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Media upload */}
          {postType !== "text" ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="post-media" className="text-sm font-medium text-fg">
                {postType === "photo" ? "Photo" : "Video"}
              </label>
              {previewUrl ? (
                <div className="rounded-[12px] border border-border bg-bg p-3">
                  {postType === "photo" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="mx-auto max-h-[260px] w-full rounded-[10px] object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      preload="metadata"
                      className="mx-auto max-h-[260px] w-full rounded-[10px]"
                    />
                  )}
                  <button
                    type="button"
                    onClick={clearFile}
                    className="mt-2 text-[13px] font-medium text-muted underline-offset-2 transition-colors hover:text-fg hover:underline"
                  >
                    Remove {postType === "photo" ? "photo" : "video"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[120px] flex-col items-center justify-center gap-1.5 rounded-[12px] border-2 border-dashed border-border bg-bg px-4 py-6 text-center transition hover:border-[oklch(72%_0.085_75/0.5)]"
                >
                  <span className="font-display text-[1.1rem] font-medium text-fg">
                    {postType === "photo" ? "Add a photo" : "Add a video"}
                  </span>
                  <span className="text-[13px] text-muted">
                    {postType === "photo"
                      ? "JPG, PNG or WebP · up to 10MB"
                      : "MP4 or WebM · up to 100MB"}
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                id="post-media"
                type="file"
                accept={postType === "photo" ? IMAGE_ACCEPT : VIDEO_ACCEPT}
                className="hidden"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
              />
            </div>
          ) : null}

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

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg">
              Tags{" "}
              <span className="font-normal text-muted">
                (up to {MAX_TAGS})
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const active = tags.includes(tag);
                const disabled = !active && tags.length >= MAX_TAGS;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    aria-pressed={active}
                    disabled={disabled}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                      active
                        ? "border-accent bg-gold-light text-primary"
                        : disabled
                          ? "cursor-not-allowed border-border bg-bg text-[oklch(52%_0.025_85/0.45)]"
                          : "border-border bg-bg text-muted hover:text-fg"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
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

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { createPost } from "@/lib/community/actions";
import { uploadHandImage } from "@/lib/analyze/upload-hand";
import { analyzeHand } from "@/lib/analyze/analyze-hand";
import {
  analyzeStrategy,
  type StrategyResult,
} from "@/lib/analyze/strategy-advisor";
import TileEditor from "@/components/analyze/tile-editor";
import {
  calculateShanten,
  type ShantenResult,
} from "@/lib/mahjong/shanten";
import { rankDraws } from "@/lib/mahjong/draw-value";
import { saveAnalysis } from "@/lib/analyze/history-actions";
import Link from "next/link";

const ANALYZE_ERROR =
  "Unable to analyze this hand.\n请重新上传更清晰的图片。";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export default function AnalyzePage({ authed }: { authed: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [tiles, setTiles] = useState<string[] | null>(null);
  const [editedTiles, setEditedTiles] = useState<string[]>([]);
  const [strategizing, setStrategizing] = useState(false);
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [shanten, setShanten] = useState<ShantenResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const drawSummary = shanten ? rankDraws(shanten.effectiveTiles) : null;

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      setError("Only JPG and PNG images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 10MB or smaller.");
      return;
    }

    setError(null);
    setUploadedUrl(null);
    setTiles(null);
    setEditedTiles([]);
    setStrategy(null);
    setShanten(null);
    setAnalyzeError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadHandImage(formData);
      setUploadedUrl(result.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName(null);
    setUploadedUrl(null);
    setError(null);
    setUploading(false);
    setTiles(null);
    setEditedTiles([]);
    setStrategy(null);
    setShanten(null);
    setAnalyzeError(null);
    setRecognizing(false);
    setStrategizing(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Step 1: recognize tiles from the image (does NOT run strategy).
  async function handleRecognize() {
    if (uploading || !uploadedUrl || recognizing) return;
    setAnalyzeError(null);
    setStrategy(null);
    setShanten(null);
    setTiles(null);
    setEditedTiles([]);
    setRecognizing(true);
    try {
      const { tiles: recognized } = await analyzeHand(uploadedUrl);
      setTiles(recognized);
      setEditedTiles(recognized);
    } catch {
      setAnalyzeError(ANALYZE_ERROR);
    } finally {
      setRecognizing(false);
    }
  }

  // Editing tiles invalidates any previous strategy result.
  function handleTilesChange(next: string[]) {
    setEditedTiles(next);
    setStrategy(null);
    setShanten(null);
    setAnalyzeError(null);
    setSaveStatus("idle");
    setSaveError(null);
  }

  async function handleSave() {
    if (!strategy || !shanten || saveStatus === "saving") return;
    setSaveError(null);
    setSaveStatus("saving");
    try {
      await saveAnalysis({
        imageUrl: uploadedUrl,
        tiles: editedTiles,
        shanten: shanten.shanten,
        discard: strategy.discard,
        reason: strategy.reason,
        winningPotential: strategy.winningPotential,
        effectiveTiles: shanten.effectiveTiles,
        potentialHands: strategy.suggestions,
      });
      setSaveStatus("saved");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save analysis."
      );
      setSaveStatus("idle");
    }
  }

  // Step 2: analyze strategy for the (possibly edited) tiles.
  async function handleStrategy() {
    if (editedTiles.length === 0 || strategizing) return;
    setAnalyzeError(null);
    setStrategy(null);
    setStrategizing(true);
    setSaveStatus("idle");
    setSaveError(null);
    // Local hand-efficiency metrics (no network).
    setShanten(calculateShanten(editedTiles));
    try {
      const advice = await analyzeStrategy(editedTiles);
      setStrategy(advice);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // Surface the free-tier limit message; otherwise show the generic error.
      setAnalyzeError(
        message.startsWith("You have reached") ? message : ANALYZE_ERROR
      );
    } finally {
      setStrategizing(false);
    }
  }

  async function handlePublish() {
    if (!strategy || publishing) return;
    if (!authed) {
      router.push("/login");
      return;
    }

    setPublishError(null);
    setPublishing(true);
    try {
      const winning = strategy.winningPotential.endsWith("%")
        ? strategy.winningPotential
        : `${strategy.winningPotential}%`;

      const content = [
        "AI Mahjong Analysis",
        "",
        "Recognized Tiles:",
        editedTiles.join(", "),
        "",
        "Recommended Discard:",
        strategy.discard,
        "",
        "Reason:",
        strategy.reason,
        "",
        "Potential Hands:",
        strategy.suggestions.join(", "),
        "",
        "Winning Potential:",
        winning,
        "",
        "Question:",
        "Would you agree with the AI recommendation?",
      ].join("\n");

      const post = await createPost({
        title: "What would you discard here?",
        content,
        imageUrl: uploadedUrl ?? undefined,
      });

      router.push(`/community/${post.id}`);
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : "Could not publish discussion."
      );
      setPublishing(false);
    }
  }

  return (
    <Container>
      {/* Hero */}
      <div className="mx-auto mb-[clamp(32px,5vw,56px)] max-w-[720px] text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          AI Hand Analyzer
        </p>
        <h1 className="mb-4 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
          Analyze Your Mahjong Hand
        </h1>
        <p className="mx-auto max-w-[52ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.65] text-muted">
          Upload a photo of your tiles and get AI-powered advice on your next
          move.
        </p>
      </div>

      <div className="mx-auto flex max-w-[820px] flex-col gap-6">
        {/* Upload / Preview */}
        {previewUrl ? (
          <div className="rounded-card border border-border bg-surface p-[clamp(20px,3vw,28px)] shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview of your uploaded Mahjong hand"
              className="mx-auto max-h-[420px] w-full rounded-[16px] object-contain"
            />
            {fileName ? (
              <p className="mt-3 truncate text-center text-[13px] text-muted">
                {fileName}
              </p>
            ) : null}

            <div className="mt-2 text-center text-[13px]">
              {uploading ? (
                <span className="text-muted">Uploading…</span>
              ) : uploadedUrl ? (
                <span className="font-medium text-[oklch(40%_0.12_145)]">
                  Uploaded ✓
                </span>
              ) : error ? (
                <span className="text-[oklch(45%_0.16_25)]">{error}</span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                onClick={handleRecognize}
                disabled={uploading || !uploadedUrl || recognizing}
              >
                {uploading
                  ? "Uploading…"
                  : recognizing
                    ? "Recognizing…"
                    : "Recognize Tiles"}
              </Button>
              <Button type="button" variant="secondary" onClick={clearImage}>
                Remove photo
              </Button>
            </div>

            <p
              className={`mt-3 text-center text-[13px] ${
                error ? "text-[oklch(45%_0.16_25)]" : "text-muted"
              }`}
            >
              {uploading
                ? "Please wait until the image upload finishes."
                : error
                  ? error
                  : uploadedUrl
                    ? "Ready to recognize tiles."
                    : ""}
            </p>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a Mahjong hand photo"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              handleFiles(event.dataTransfer.files);
            }}
            className={`flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed p-6 text-center transition ${
              dragActive
                ? "border-accent bg-[oklch(88%_0.04_75/0.25)]"
                : "border-border bg-surface hover:border-[oklch(72%_0.085_75/0.5)]"
            }`}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold-light text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="font-display text-[1.35rem] font-medium text-fg">
              Drag &amp; drop a Mahjong hand photo
            </p>
            <p className="mt-1.5 text-sm text-muted">or</p>
            <span className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-[30px] py-[13px] text-[15px] font-medium text-surface shadow-[0_4px_16px_oklch(38%_0.045_130/0.28)]">
              Upload Image
            </span>
            <p className="mt-4 text-xs text-muted">JPG, JPEG or PNG</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />

        {!previewUrl && error ? (
          <p
            role="alert"
            className="rounded-[10px] border border-[oklch(58%_0.16_25/0.3)] bg-[oklch(58%_0.16_25/0.08)] px-3.5 py-2.5 text-center text-[13px] text-[oklch(45%_0.16_25)]"
          >
            {error}
          </p>
        ) : null}

        {/* Tile Editor (after recognition, before strategy) */}
        {tiles !== null ? (
          <div className="flex flex-col gap-4">
            <TileEditor
              tiles={editedTiles}
              original={tiles}
              onChange={handleTilesChange}
            />
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleStrategy}
                disabled={editedTiles.length === 0 || strategizing}
              >
                {strategizing ? "Analyzing…" : "Analyze Strategy"}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Result Area */}
        <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-soft">
          <h2 className="mb-2 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
            AI Analysis
          </h2>

          {strategizing ? (
            <p className="text-sm leading-[1.6] text-muted">Analyzing…</p>
          ) : analyzeError ? (
            <p className="whitespace-pre-line text-sm leading-[1.6] text-[oklch(45%_0.16_25)]">
              {analyzeError}
            </p>
          ) : strategy ? (
            <div className="flex flex-col gap-5">
              {shanten ? (
                <div className="rounded-card border border-border bg-bg p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    Hand Efficiency
                  </h3>
                  <div className="mb-3">
                    <p className="text-[13px] text-muted">Current Shanten</p>
                    <p className="font-display text-[1.5rem] font-medium text-fg">
                      {shanten.shanten} away
                    </p>
                  </div>
                  {!drawSummary || shanten.effectiveTiles.length === 0 ? (
                    <div className="mb-3">
                      <p className="mb-1 text-[13px] text-muted">Best Draws</p>
                      <p className="text-sm text-muted">
                        No effective tiles calculated yet.
                      </p>
                    </div>
                  ) : (
                    <div className="mb-3 flex flex-col gap-4">
                      {/* Top 3 */}
                      <div>
                        <p className="mb-2 text-[13px] text-muted">
                          Top 3 Draws
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {drawSummary.top.map((tile, index) => (
                            <span
                              key={`top-${tile}-${index}`}
                              className="inline-flex items-center rounded-full bg-gold-light px-3 py-1 text-[13px] font-medium text-primary"
                            >
                              {tile}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tiered list */}
                      <div>
                        <p className="mb-2 text-[13px] text-muted">
                          Most Valuable Draws
                        </p>
                        <div className="flex flex-col gap-3">
                          {drawSummary.tiers.map((tier) => (
                            <div key={tier.stars}>
                              <p
                                className="mb-1 text-sm text-accent"
                                aria-label={`${tier.stars} stars`}
                              >
                                {"★".repeat(tier.stars)}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {tier.tiles.map((tile, index) => (
                                  <span
                                    key={`${tier.stars}-${tile}-${index}`}
                                    className="inline-flex items-center rounded-full border border-border bg-bg px-3 py-1 text-[13px] text-fg"
                                  >
                                    {tile}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Advanced: raw effective tiles list */}
                      <div>
                        <button
                          type="button"
                          onClick={() => setShowAdvanced((value) => !value)}
                          className="text-[13px] font-medium text-muted underline-offset-2 transition-colors hover:text-fg hover:underline"
                        >
                          {showAdvanced
                            ? "Hide effective tiles"
                            : "Show all effective tiles"}
                        </button>
                        {showAdvanced ? (
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {shanten.effectiveTiles.map((tile, index) => (
                              <li
                                key={`${tile}-${index}`}
                                className="flex items-center gap-2.5 text-sm text-fg"
                              >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                {tile}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[13px] text-muted">
                      Effective Tile Count
                    </p>
                    <p className="font-display text-[1.25rem] font-medium text-fg">
                      {shanten.count} tiles
                    </p>
                  </div>
                </div>
              ) : null}

              <div>
                <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Recommended Discard
                </h3>
                <p className="font-display text-[1.75rem] font-medium tracking-[-0.01em] text-fg">
                  {strategy.discard || "—"}
                </p>
              </div>

              {strategy.reason ? (
                <div>
                  <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    Why
                  </h3>
                  <p className="text-sm leading-[1.65] text-muted">
                    {strategy.reason}
                  </p>
                </div>
              ) : null}

              {strategy.suggestions.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    Potential Hands
                  </h3>
                  <ul className="flex flex-col gap-1.5">
                    {strategy.suggestions.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex items-center gap-2.5 text-sm text-fg"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {strategy.winningPotential ? (
                <div>
                  <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    Winning Potential
                  </h3>
                  <p className="font-display text-[2rem] font-semibold leading-none text-fg">
                    {strategy.winningPotential}
                  </p>
                </div>
              ) : null}

              {editedTiles.length > 0 ? (
                <p className="text-[13px] text-muted">
                  Hand: {editedTiles.join(", ")}
                </p>
              ) : null}

              <div className="border-t border-border pt-5">
                {saveStatus === "saved" ? (
                  <p className="text-sm text-muted">
                    Saved.{" "}
                    <Link
                      href="/profile/analyses"
                      className="font-medium text-primary hover:underline"
                    >
                      View your analyses
                    </Link>
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSave}
                    disabled={saveStatus === "saving"}
                  >
                    {saveStatus === "saving" ? "Saving…" : "Save Analysis"}
                  </Button>
                )}
                {saveError ? (
                  <p className="mt-2 text-[13px] text-[oklch(45%_0.16_25)]">
                    {saveError}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm leading-[1.6] text-muted">
              Upload a Mahjong hand to receive strategic advice.
            </p>
          )}
        </article>

        {/* Community CTA */}
        <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-soft">
          <h2 className="mb-1 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
            Want more opinions?
          </h2>
          <p className="mb-5 text-sm leading-[1.6] text-muted">
            Share your hand with the community.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={handlePublish}
            disabled={!strategy || publishing}
          >
            {publishing ? "Publishing…" : "Publish Discussion"}
          </Button>
          {publishError ? (
            <p className="mt-3 text-[13px] text-[oklch(45%_0.16_25)]">
              {publishError}
            </p>
          ) : null}
        </article>
      </div>
    </Container>
  );
}

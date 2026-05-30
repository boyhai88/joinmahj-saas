"use client";

import { useRef, useState } from "react";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { uploadHandImage } from "@/lib/analyze/upload-hand";
import { analyzeHand } from "@/lib/analyze/analyze-hand";
import {
  analyzeStrategy,
  type StrategyResult,
} from "@/lib/analyze/strategy-advisor";

const ANALYZE_ERROR =
  "Unable to analyze this hand.\n请重新上传更清晰的图片。";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export default function AnalyzePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [tiles, setTiles] = useState<string[] | null>(null);
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

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
    setStrategy(null);
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
    setStrategy(null);
    setAnalyzeError(null);
    setAnalyzing(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleAnalyze() {
    if (!uploadedUrl || analyzing) return;
    setAnalyzeError(null);
    setTiles(null);
    setStrategy(null);
    setAnalyzing(true);
    try {
      // 1. Recognize tiles from the image.
      const { tiles: recognized } = await analyzeHand(uploadedUrl);
      setTiles(recognized);
      if (recognized.length === 0) {
        throw new Error("No tiles recognized.");
      }
      // 2. Get strategy advice for the recognized hand.
      const advice = await analyzeStrategy(recognized);
      setStrategy(advice);
    } catch {
      setAnalyzeError(ANALYZE_ERROR);
    } finally {
      setAnalyzing(false);
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
                onClick={handleAnalyze}
                disabled={uploading || !uploadedUrl || analyzing}
              >
                {analyzing ? "Analyzing…" : "Analyze Hand"}
              </Button>
              <Button type="button" variant="secondary" onClick={clearImage}>
                Remove photo
              </Button>
            </div>
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

        {/* Result Area */}
        <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,36px)] shadow-soft">
          <h2 className="mb-2 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
            AI Analysis
          </h2>

          {analyzing ? (
            <p className="text-sm leading-[1.6] text-muted">Analyzing…</p>
          ) : analyzeError ? (
            <p className="whitespace-pre-line text-sm leading-[1.6] text-[oklch(45%_0.16_25)]">
              {analyzeError}
            </p>
          ) : strategy ? (
            <div className="flex flex-col gap-5">
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

              {tiles && tiles.length > 0 ? (
                <p className="border-t border-border pt-4 text-[13px] text-muted">
                  Recognized: {tiles.join(", ")}
                </p>
              ) : null}
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
          <Button type="button" variant="secondary" disabled>
            Publish Discussion
          </Button>
        </article>
      </div>
    </Container>
  );
}

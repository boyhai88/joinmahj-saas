"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { createPost } from "@/lib/community/actions";

type ShareAnalysisButtonProps = {
  imageUrl: string | null;
  tiles: string[];
  discard: string | null;
  reason: string | null;
  winningPotential: string | null;
  potentialHands: string[];
};

export default function ShareAnalysisButton({
  imageUrl,
  tiles,
  discard,
  reason,
  winningPotential,
  potentialHands,
}: ShareAnalysisButtonProps) {
  const router = useRouter();
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    if (sharing) return;
    setError(null);
    setSharing(true);
    try {
      const winning = winningPotential
        ? winningPotential.endsWith("%")
          ? winningPotential
          : `${winningPotential}%`
        : "—";

      const content = [
        "AI Mahjong Analysis",
        "",
        "Recognized Tiles:",
        tiles.join(", "),
        "",
        "Recommended Discard:",
        discard ?? "—",
        "",
        "Reason:",
        reason ?? "—",
        "",
        "Potential Hands:",
        potentialHands.join(", "),
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
        imageUrl: imageUrl ?? undefined,
      });

      router.push(`/community/${post.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not share to community."
      );
      setSharing(false);
    }
  }

  return (
    <div>
      <Button type="button" onClick={handleShare} disabled={sharing}>
        {sharing ? "Sharing…" : "Share to Community"}
      </Button>
      {error ? (
        <p className="mt-2 text-[13px] text-[oklch(45%_0.16_25)]">{error}</p>
      ) : null}
    </div>
  );
}

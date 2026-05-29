"use client";

import { useState } from "react";
import Button from "@/components/ui/button";

type PricingCheckoutButtonProps = {
  plan: string;
  priceId?: string;
  label: string;
  variant?: "primary" | "secondary";
};

export default function PricingCheckoutButton({
  plan,
  priceId,
  label,
  variant = "primary",
}: PricingCheckoutButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (!priceId) {
      setError("This plan is not available yet.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, plan }),
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <Button
        type="button"
        variant={variant}
        className="w-full"
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Redirecting…" : label}
      </Button>
      {error ? (
        <p className="mt-2 text-center text-[13px] text-[oklch(45%_0.16_25)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

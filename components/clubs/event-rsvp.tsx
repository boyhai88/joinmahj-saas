"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import {
  registerForEvent,
  cancelEventRegistration,
} from "@/lib/clubs/event-actions";

type EventRsvpProps = {
  eventId: string;
  capacity: number | null;
  initialCount: number;
  initialRegistered: boolean;
  authed: boolean;
};

export default function EventRsvp({
  eventId,
  capacity,
  initialCount,
  initialRegistered,
  authed,
}: EventRsvpProps) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [registered, setRegistered] = useState(initialRegistered);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull = capacity !== null && count >= capacity;

  async function handleClick() {
    if (!authed) {
      router.push("/login");
      return;
    }
    if (pending) return;

    setError(null);
    setPending(true);
    try {
      const result = registered
        ? await cancelEventRegistration(eventId)
        : await registerForEvent(eventId);
      setRegistered(result.registered);
      setCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  const disabled = pending || (!registered && isFull);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
      <Button
        type="button"
        size="sm"
        variant={registered ? "secondary" : "primary"}
        onClick={handleClick}
        disabled={disabled}
      >
        {pending
          ? "Saving…"
          : registered
            ? "Cancel RSVP"
            : isFull
              ? "Event is full"
              : "RSVP"}
      </Button>

      <span className="text-[13px] text-muted">
        {capacity !== null
          ? `${count} / ${capacity} seats filled`
          : `${count} registered`}
      </span>

      {error ? (
        <span className="text-[13px] text-[oklch(45%_0.16_25)]">{error}</span>
      ) : null}
    </div>
  );
}

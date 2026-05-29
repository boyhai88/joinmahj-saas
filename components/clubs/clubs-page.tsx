"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { joinClub, leaveClub, type ClubListItem } from "@/lib/clubs/actions";

type ClubsPageProps = {
  initialClubs: ClubListItem[];
  memberClubIds: string[];
  authed: boolean;
};

export default function ClubsPage({
  initialClubs,
  memberClubIds,
  authed,
}: ClubsPageProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Set<string>>(
    () => new Set(memberClubIds)
  );
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(initialClubs.map((club) => [club.id, club.members_count]))
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleToggle(club: ClubListItem) {
    if (!authed) {
      router.push("/login");
      return;
    }
    if (pendingId) return;

    const isMember = members.has(club.id);
    setPendingId(club.id);

    // Optimistic update.
    setMembers((prev) => {
      const next = new Set(prev);
      if (isMember) next.delete(club.id);
      else next.add(club.id);
      return next;
    });
    setCounts((prev) => ({
      ...prev,
      [club.id]: (prev[club.id] ?? club.members_count) + (isMember ? -1 : 1),
    }));

    try {
      if (isMember) {
        await leaveClub(club.id);
      } else {
        await joinClub(club.id);
      }
    } catch {
      // Revert on failure.
      setMembers((prev) => {
        const next = new Set(prev);
        if (isMember) next.add(club.id);
        else next.delete(club.id);
        return next;
      });
      setCounts((prev) => ({ ...prev, [club.id]: club.members_count }));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Container>
      {/* Hero */}
      <div className="mx-auto mb-[clamp(32px,5vw,56px)] max-w-[720px] text-center">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          Clubs
        </p>
        <h1 className="mb-4 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
          Clubs
        </h1>
        <p className="mx-auto mb-7 max-w-[48ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.65] text-muted">
          Find welcoming Mahjong tables near you.
        </p>
        <Button href="#club-list">Browse Clubs</Button>
      </div>

      {/* Club list */}
      <div id="club-list" className="mx-auto max-w-[960px] scroll-mt-28">
        {initialClubs.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-[clamp(32px,6vw,56px)] text-center shadow-soft">
            <h2 className="mb-2 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
              No clubs yet.
            </h2>
            <p className="text-sm text-muted">
              Clubs will appear here when organizers create them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {initialClubs.map((club) => {
              const isMember = members.has(club.id);
              const count = counts[club.id] ?? club.members_count;
              return (
                <article
                  key={club.id}
                  className="flex flex-col rounded-card border border-border bg-surface p-6 shadow-soft transition duration-200 hover:shadow-card"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="font-display text-[1.5rem] font-medium leading-[1.15] tracking-[-0.01em] text-fg">
                      {club.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                        club.is_public
                          ? "bg-gold-light text-primary"
                          : "border border-border bg-bg text-muted"
                      }`}
                    >
                      {club.is_public ? "Public" : "Private"}
                    </span>
                  </div>

                  {club.city || club.location ? (
                    <p className="mb-3 text-[13px] font-medium text-muted">
                      {[club.city, club.location].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}

                  {club.description ? (
                    <p className="mb-4 text-sm leading-[1.6] text-muted">
                      {club.description}
                    </p>
                  ) : null}

                  <p className="mb-5 text-[13px] text-muted">
                    {count} {count === 1 ? "member" : "members"}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-3">
                    <Button href={`/clubs/${club.id}`} variant="secondary" size="sm">
                      View Club
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={isMember ? "secondary" : "primary"}
                      onClick={() => handleToggle(club)}
                      disabled={pendingId === club.id}
                    >
                      {isMember ? "Leave" : "Join"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}

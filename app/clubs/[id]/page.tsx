import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/layout/site-header";
import Container from "@/components/ui/container";
import { getClub, getClubEvents } from "@/lib/clubs/actions";
import {
  getEventRegistrationCount,
  isRegistered,
} from "@/lib/clubs/event-actions";
import EventRsvp from "@/components/clubs/event-rsvp";

export const metadata = {
  title: "Club — JoinMahj",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const detail = await getClub(id);
  if (!detail) {
    notFound();
  }

  const { club, memberCount } = detail;
  const events = await getClubEvents(club.id);

  const eventsWithRsvp = await Promise.all(
    events.map(async (event) => ({
      event,
      count: await getEventRegistrationCount(event.id),
      registered: await isRegistered(event.id),
    }))
  );

  return (
    <>
      <SiteHeader userEmail={user?.email ?? null} />
      <main className="pt-24">
        <section className="py-[clamp(40px,6vw,72px)]">
          <Container>
            <div className="mx-auto max-w-[720px]">
              <Link
                href="/clubs"
                className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-fg"
              >
                ← Back to Clubs
              </Link>

              <article className="rounded-card border border-border bg-surface p-[clamp(24px,4vw,48px)] shadow-soft">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em] text-fg">
                    {club.name}
                  </h1>
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
                  <p className="mb-4 text-[13px] font-medium text-muted">
                    {[club.city, club.location].filter(Boolean).join(" · ")}
                  </p>
                ) : null}

                {club.description ? (
                  <p className="mb-4 text-[15px] leading-[1.7] text-fg">
                    {club.description}
                  </p>
                ) : null}

                <p className="text-[13px] text-muted">
                  {memberCount} {memberCount === 1 ? "member" : "members"}
                </p>
              </article>

              {/* Upcoming Events */}
              <section className="mt-10">
                <h2 className="mb-4 font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
                  Upcoming Events
                </h2>

                {eventsWithRsvp.length === 0 ? (
                  <p className="rounded-card border border-border bg-surface p-5 text-sm text-muted shadow-soft">
                    No upcoming events.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {eventsWithRsvp.map(({ event, count, registered }) => (
                      <li
                        key={event.id}
                        className="rounded-card border border-border bg-surface p-6 shadow-soft"
                      >
                        <h3 className="mb-1.5 font-display text-[1.35rem] font-medium leading-[1.2] tracking-[-0.01em] text-fg">
                          {event.title}
                        </h3>

                        {event.description ? (
                          <p className="mb-3 text-sm leading-[1.6] text-muted">
                            {event.description}
                          </p>
                        ) : null}

                        <dl className="flex flex-col gap-1.5 text-[13px] text-muted">
                          <div className="flex gap-2">
                            <dt className="font-semibold text-fg">When</dt>
                            <dd>
                              {formatDateTime(event.starts_at)}
                              {event.ends_at
                                ? ` – ${formatTime(event.ends_at)}`
                                : ""}
                            </dd>
                          </div>
                          {event.location ? (
                            <div className="flex gap-2">
                              <dt className="font-semibold text-fg">Location</dt>
                              <dd>{event.location}</dd>
                            </div>
                          ) : null}
                          {typeof event.capacity === "number" ? (
                            <div className="flex gap-2">
                              <dt className="font-semibold text-fg">Capacity</dt>
                              <dd>{event.capacity} seats</dd>
                            </div>
                          ) : null}
                        </dl>

                        <EventRsvp
                          eventId={event.id}
                          capacity={event.capacity}
                          initialCount={count}
                          initialRegistered={registered}
                          authed={Boolean(user)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

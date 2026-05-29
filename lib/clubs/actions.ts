"use server";

import { createClient } from "@/lib/supabase/server";

export type ClubMemberRole = "owner" | "admin" | "member";

export type Club = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  location: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ClubListItem = {
  id: string;
  name: string;
  city: string | null;
  location: string | null;
  description: string | null;
  is_public: boolean;
  members_count: number;
  created_at: string;
};

export type ClubDetail = {
  club: Club;
  isMember: boolean;
  memberCount: number;
};

export type ClubEvent = {
  id: string;
  club_id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
};

export type CreateEventInput = {
  clubId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  capacity?: number;
};

const CLUB_COLUMNS =
  "id, owner_id, name, slug, description, city, location, is_public, created_at, updated_at";
const EVENT_COLUMNS =
  "id, club_id, created_by, title, description, location, starts_at, ends_at, capacity, created_at, updated_at";

type MemberCountRow = { count: number };

function readCount(value: MemberCountRow[] | MemberCountRow | null | undefined) {
  if (Array.isArray(value)) return value[0]?.count ?? 0;
  return value?.count ?? 0;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return { supabase, user };
}

export async function getClubs(): Promise<ClubListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clubs")
    .select(
      "id, name, city, location, description, is_public, created_at, club_members(count)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  type Row = {
    id: string;
    name: string;
    city: string | null;
    location: string | null;
    description: string | null;
    is_public: boolean;
    created_at: string;
    club_members: MemberCountRow[] | null;
  };

  return ((data ?? []) as Row[]).map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    location: row.location,
    description: row.description,
    is_public: row.is_public,
    created_at: row.created_at,
    members_count: readCount(row.club_members),
  }));
}

export async function getClub(id: string): Promise<ClubDetail | null> {
  const supabase = await createClient();

  const { data: club, error } = await supabase
    .from("clubs")
    .select(CLUB_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!club) {
    return null;
  }

  const { count: memberCount } = await supabase
    .from("club_members")
    .select("id", { count: "exact", head: true })
    .eq("club_id", id);

  let isMember = false;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: membership } = await supabase
      .from("club_members")
      .select("id")
      .eq("club_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    isMember = Boolean(membership);
  }

  return {
    club: club as Club,
    isMember,
    memberCount: memberCount ?? 0,
  };
}

export async function joinClub(clubId: string): Promise<{ joined: boolean }> {
  const { supabase, user } = await requireUser();

  // Avoid duplicate join.
  const { data: existing } = await supabase
    .from("club_members")
    .select("id")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { joined: true };
  }

  const { error } = await supabase
    .from("club_members")
    .insert({ club_id: clubId, user_id: user.id, role: "member" });

  if (error) {
    throw new Error(error.message);
  }

  return { joined: true };
}

export async function leaveClub(clubId: string): Promise<{ left: boolean }> {
  const { supabase, user } = await requireUser();

  // Owners cannot leave their own club in this step.
  const { data: club } = await supabase
    .from("clubs")
    .select("owner_id")
    .eq("id", clubId)
    .maybeSingle();

  if (club && club.owner_id === user.id) {
    throw new Error("Club owners cannot leave their own club.");
  }

  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("club_id", clubId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return { left: true };
}

export async function getClubEvents(clubId: string): Promise<ClubEvent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("club_id", clubId)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ClubEvent[];
}

export async function createEvent(
  input: CreateEventInput
): Promise<ClubEvent> {
  const { supabase, user } = await requireUser();

  const title = input.title.trim();
  if (!title) {
    throw new Error("Event title is required.");
  }
  if (!input.startsAt) {
    throw new Error("Event start time is required.");
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      club_id: input.clubId,
      created_by: user.id,
      title,
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      starts_at: input.startsAt,
      ends_at: input.endsAt || null,
      capacity:
        typeof input.capacity === "number" ? input.capacity : null,
    })
    .select(EVENT_COLUMNS)
    .single();

  if (error || !data) {
    // RLS rejects non-owners (policy: "Club owners create events").
    throw new Error(error?.message ?? "Could not create event.");
  }

  return data as ClubEvent;
}

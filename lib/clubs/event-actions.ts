"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type RsvpResult = {
  registered: boolean;
  count: number;
};

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

// Total registrations are counted with the service-role client because RLS
// restricts each user to seeing only their own registration rows.
export async function getEventRegistrationCount(
  eventId: string
): Promise<number> {
  const admin = createAdminClient();

  const { count } = await admin
    .from("event_registrations")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("status", "registered");

  return count ?? 0;
}

export async function isRegistered(eventId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(data);
}

export async function registerForEvent(eventId: string): Promise<RsvpResult> {
  const { supabase, user } = await requireUser();

  // Prevent duplicate registration.
  const { data: existing } = await supabase
    .from("event_registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { registered: true, count: await getEventRegistrationCount(eventId) };
  }

  // Capacity check against the true total.
  const admin = createAdminClient();
  const { data: event } = await admin
    .from("events")
    .select("capacity")
    .eq("id", eventId)
    .maybeSingle();

  const capacity: number | null = event?.capacity ?? null;
  const count = await getEventRegistrationCount(eventId);

  if (capacity !== null && count >= capacity) {
    throw new Error("Event is full.");
  }

  const { error } = await supabase
    .from("event_registrations")
    .insert({ event_id: eventId, user_id: user.id, status: "registered" });

  if (error) {
    throw new Error(error.message);
  }

  return { registered: true, count: count + 1 };
}

export async function cancelEventRegistration(
  eventId: string
): Promise<RsvpResult> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return { registered: false, count: await getEventRegistrationCount(eventId) };
}

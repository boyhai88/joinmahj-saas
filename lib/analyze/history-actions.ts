"use server";

import { createClient } from "@/lib/supabase/server";

export type AnalysisRecord = {
  id: string;
  image_url: string | null;
  tiles: string[];
  shanten: number | null;
  discard: string | null;
  reason: string | null;
  winning_potential: string | null;
  effective_tiles: string[];
  potential_hands: string[];
  created_at: string;
};

export type SaveAnalysisInput = {
  imageUrl?: string | null;
  tiles: string[];
  shanten: number;
  discard: string;
  reason: string;
  winningPotential: string;
  effectiveTiles: string[];
  potentialHands: string[];
};

const COLUMNS =
  "id, image_url, tiles, shanten, discard, reason, winning_potential, effective_tiles, potential_hands, created_at";

function toTiles(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((t): t is string => typeof t === "string")
    : [];
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

export async function saveAnalysis(
  input: SaveAnalysisInput
): Promise<{ id: string }> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("analysis_history")
    .insert({
      user_id: user.id,
      image_url: input.imageUrl ?? null,
      tiles: input.tiles,
      shanten: input.shanten,
      discard: input.discard,
      reason: input.reason,
      winning_potential: input.winningPotential,
      effective_tiles: input.effectiveTiles,
      potential_hands: input.potentialHands,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not save analysis.");
  }

  return { id: data.id };
}

export async function getAnalyses(): Promise<AnalysisRecord[]> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("analysis_history")
    .select(COLUMNS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    image_url: row.image_url,
    tiles: toTiles(row.tiles),
    shanten: row.shanten,
    discard: row.discard,
    reason: row.reason,
    winning_potential: row.winning_potential,
    effective_tiles: toTiles(row.effective_tiles),
    potential_hands: toTiles(row.potential_hands),
    created_at: row.created_at,
  }));
}

export async function getAnalysis(id: string): Promise<AnalysisRecord | null> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("analysis_history")
    .select(COLUMNS)
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    return null;
  }

  return {
    id: data.id,
    image_url: data.image_url,
    tiles: toTiles(data.tiles),
    shanten: data.shanten,
    discard: data.discard,
    reason: data.reason,
    winning_potential: data.winning_potential,
    effective_tiles: toTiles(data.effective_tiles),
    potential_hands: toTiles(data.potential_hands),
    created_at: data.created_at,
  };
}

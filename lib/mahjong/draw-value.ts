// Display-layer ranking of effective tiles into star tiers.
// This does NOT touch calculateShanten or the shanten algorithm — it only
// presents the already-computed effective tiles in a beginner-friendly way.

export type DrawTier = {
  stars: number;
  tiles: string[];
};

export type DrawSummary = {
  top: string[];
  tiers: DrawTier[];
};

// Value heuristic by tile centrality: middle suited tiles are the most
// flexible draws, edges/terminals less so, honors least.
function starsFor(tile: string): number {
  const suited = tile.match(/^([1-9])\s+(Bamboo|Circle|Character)$/);
  if (suited) {
    const n = Number(suited[1]);
    if (n >= 4 && n <= 6) return 5;
    if (n === 1 || n === 9) return 3;
    return 4; // 2, 3, 7, 8
  }
  return 3; // honors
}

export function rankDraws(effectiveTiles: string[]): DrawSummary {
  const ranked = effectiveTiles.map((tile) => ({ tile, stars: starsFor(tile) }));

  // Group into tiers (descending stars), preserving input order within a tier.
  const byTier = new Map<number, string[]>();
  for (const { tile, stars } of ranked) {
    const list = byTier.get(stars);
    if (list) list.push(tile);
    else byTier.set(stars, [tile]);
  }

  const tiers: DrawTier[] = [...byTier.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([stars, tiles]) => ({ stars, tiles }));

  // Top draws: highest-star tiles first (stable), capped at 3.
  const top = ranked
    .map((entry, index) => ({ ...entry, index }))
    .sort((a, b) => b.stars - a.stars || a.index - b.index)
    .slice(0, 3)
    .map((entry) => entry.tile);

  return { top, tiers };
}

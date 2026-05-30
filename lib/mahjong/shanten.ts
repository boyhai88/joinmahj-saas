export type ShantenResult = {
  shanten: number;
  effectiveTiles: string[];
  count: number;
};

// ----------------------------------------------------------------------------
// Tile model
// 34 tile types, indexed:
//   0..8   man   (Characters) 1m..9m
//   9..17  pin   (Circles)    1p..9p
//   18..26 sou   (Bamboo)     1s..9s
//   27..33 honors             East, South, West, North, White, Green, Red
// ----------------------------------------------------------------------------
const SUIT_BASE = { m: 0, p: 9, s: 18 } as const;
const HONOR_BASE = 27;

// z1..z7 → indices 27..33
const HONOR_NAMES = [
  "East Wind",
  "South Wind",
  "West Wind",
  "North Wind",
  "White Dragon",
  "Green Dragon",
  "Red Dragon",
];

const ENGLISH_SUIT: Record<string, keyof typeof SUIT_BASE> = {
  character: "m",
  characters: "m",
  man: "m",
  circle: "p",
  circles: "p",
  dot: "p",
  dots: "p",
  pin: "p",
  bamboo: "s",
  bamboos: "s",
  bam: "s",
  sou: "s",
};

const ENGLISH_HONOR: Record<string, number> = {
  "east wind": 0,
  east: 0,
  "south wind": 1,
  south: 1,
  "west wind": 2,
  west: 2,
  "north wind": 3,
  north: 3,
  "white dragon": 4,
  white: 4,
  "green dragon": 5,
  green: 5,
  "red dragon": 6,
  red: 6,
};

const CHINESE_SUIT: Record<string, keyof typeof SUIT_BASE> = {
  万: "m",
  筒: "p",
  条: "s",
};

const CHINESE_HONOR: Record<string, number> = {
  东: 0,
  南: 1,
  西: 2,
  北: 3,
  白: 4,
  发: 5,
  中: 6,
};

function suitIndex(suit: keyof typeof SUIT_BASE, num: number): number | null {
  if (num < 1 || num > 9) return null;
  return SUIT_BASE[suit] + (num - 1);
}

// Parse a single tile token into a 34-index, or null if unrecognized.
function parseSingle(raw: string): number | null {
  const token = raw.trim();
  if (!token) return null;

  // MPSZ single: "1m", "5z"
  const mpsz = token.match(/^([1-9])([mpsz])$/i);
  if (mpsz) {
    const num = Number(mpsz[1]);
    const suit = mpsz[2].toLowerCase();
    if (suit === "z") {
      return num >= 1 && num <= 7 ? HONOR_BASE + (num - 1) : null;
    }
    return suitIndex(suit as keyof typeof SUIT_BASE, num);
  }

  // English suited: "1 Bamboo", "3 Circle"
  const eng = token.match(/^([1-9])\s*([A-Za-z]+)$/);
  if (eng) {
    const num = Number(eng[1]);
    const suit = ENGLISH_SUIT[eng[2].toLowerCase()];
    if (suit) return suitIndex(suit, num);
  }

  // Chinese suited: "1万", "3条"
  const chs = token.match(/^([1-9])\s*([万筒条])$/);
  if (chs) {
    const num = Number(chs[1]);
    const suit = CHINESE_SUIT[chs[2]];
    if (suit) return suitIndex(suit, num);
  }

  // Honors (English / Chinese)
  const lower = token.toLowerCase();
  if (lower in ENGLISH_HONOR) return HONOR_BASE + ENGLISH_HONOR[lower];
  if (token in CHINESE_HONOR) return HONOR_BASE + CHINESE_HONOR[token];

  return null;
}

// Expand an MPSZ run token like "123m" or "77z" into indices.
function parseRun(raw: string): number[] | null {
  const token = raw.trim();
  if (!/^([0-9]+[mpsz])+$/i.test(token)) return null;

  const indices: number[] = [];
  const groups = token.match(/[0-9]+[mpsz]/gi) ?? [];
  for (const group of groups) {
    const suit = group[group.length - 1].toLowerCase();
    const digits = group.slice(0, -1);
    for (const d of digits) {
      const num = Number(d);
      if (suit === "z") {
        if (num < 1 || num > 7) return null;
        indices.push(HONOR_BASE + (num - 1));
      } else {
        const idx = suitIndex(suit as keyof typeof SUIT_BASE, num);
        if (idx === null) return null;
        indices.push(idx);
      }
    }
  }
  return indices;
}

function toCounts(tiles: string[]): number[] {
  const counts = new Array<number>(34).fill(0);
  for (const tile of tiles) {
    const run = parseRun(tile);
    if (run && run.length > 1) {
      for (const idx of run) counts[idx] = Math.min(4, counts[idx] + 1);
      continue;
    }
    const single = parseSingle(tile);
    if (single !== null) {
      counts[single] = Math.min(4, counts[single] + 1);
    }
  }
  return counts;
}

function indexToName(index: number): string {
  if (index >= HONOR_BASE) return HONOR_NAMES[index - HONOR_BASE];
  const num = (index % 9) + 1;
  if (index < 9) return `${num} Character`;
  if (index < 18) return `${num} Circle`;
  return `${num} Bamboo`;
}

// ----------------------------------------------------------------------------
// Standard-hand shanten (4 melds + 1 pair) via backtracking decomposition.
// ----------------------------------------------------------------------------
function standardShanten(source: number[], meldsNeeded: number): number {
  const counts = source.slice();
  let best = 2 * meldsNeeded;

  function record(melds: number, partials: number, hasPair: boolean) {
    let t = partials;
    if (melds + t > meldsNeeded) t = meldsNeeded - melds;
    if (t < 0) t = 0;
    const sh = 2 * meldsNeeded - 2 * melds - t - (hasPair ? 1 : 0);
    if (sh < best) best = sh;
  }

  function dfs(i: number, melds: number, partials: number, hasPair: boolean) {
    while (i < 34 && counts[i] === 0) i += 1;
    if (i >= 34) {
      record(melds, partials, hasPair);
      return;
    }

    const suited = i < HONOR_BASE;
    const rank = i % 9; // 0-based within suit

    // Leave remaining tiles at i as floating; move on.
    dfs(i + 1, melds, partials, hasPair);

    // Triplet (pung)
    if (counts[i] >= 3) {
      counts[i] -= 3;
      dfs(i, melds + 1, partials, hasPair);
      counts[i] += 3;
    }

    // Pair as the head
    if (!hasPair && counts[i] >= 2) {
      counts[i] -= 2;
      dfs(i, melds, partials, true);
      counts[i] += 2;
    }

    // Pair as a triplet candidate (partial)
    if (counts[i] >= 2) {
      counts[i] -= 2;
      dfs(i, melds, partials + 1, hasPair);
      counts[i] += 2;
    }

    if (suited) {
      // Sequence (chow)
      if (rank <= 6 && counts[i + 1] > 0 && counts[i + 2] > 0) {
        counts[i] -= 1;
        counts[i + 1] -= 1;
        counts[i + 2] -= 1;
        dfs(i, melds + 1, partials, hasPair);
        counts[i] += 1;
        counts[i + 1] += 1;
        counts[i + 2] += 1;
      }
      // Adjacent partial (ryanmen / penchan)
      if (rank <= 7 && counts[i + 1] > 0) {
        counts[i] -= 1;
        counts[i + 1] -= 1;
        dfs(i, melds, partials + 1, hasPair);
        counts[i] += 1;
        counts[i + 1] += 1;
      }
      // Gap partial (kanchan)
      if (rank <= 6 && counts[i + 2] > 0) {
        counts[i] -= 1;
        counts[i + 2] -= 1;
        dfs(i, melds, partials + 1, hasPair);
        counts[i] += 1;
        counts[i + 2] += 1;
      }
    }
  }

  dfs(0, 0, 0, false);
  return best;
}

export function calculateShanten(tiles: string[]): ShantenResult {
  const counts = toCounts(tiles);
  const total = counts.reduce((sum, c) => sum + c, 0);

  // Size-aware meld target: a hand can hold floor(n/3) melds (capped at 4 for a
  // full 13/14-tile hand). This keeps shanten meaningful for partial hands.
  const meldsNeeded = Math.min(4, Math.floor(total / 3));
  const base = standardShanten(counts, meldsNeeded);

  // Effective tiles: those that, if drawn, reduce the shanten by one. The meld
  // target is held fixed so the +1-tile comparison stays valid.
  const effective: string[] = [];
  let count = 0;
  for (let i = 0; i < 34; i += 1) {
    if (counts[i] >= 4) continue;
    counts[i] += 1;
    const next = standardShanten(counts, meldsNeeded);
    counts[i] -= 1;
    if (next < base) {
      effective.push(indexToName(i));
      count += 4 - counts[i];
    }
  }

  return {
    shanten: Math.max(0, base),
    effectiveTiles: effective,
    count,
  };
}

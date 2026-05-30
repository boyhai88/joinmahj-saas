"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/button";

type TileEditorProps = {
  tiles: string[];
  original: string[];
  onChange: (tiles: string[]) => void;
};

type TileGroup = {
  label: string;
  options: string[];
};

function range(from: number, to: number) {
  const out: number[] = [];
  for (let i = from; i <= to; i += 1) out.push(i);
  return out;
}

const ENGLISH_GROUPS: TileGroup[] = [
  { label: "Bamboo", options: range(1, 9).map((n) => `${n} Bamboo`) },
  { label: "Circle", options: range(1, 9).map((n) => `${n} Circle`) },
  { label: "Character", options: range(1, 9).map((n) => `${n} Character`) },
  {
    label: "Honors",
    options: [
      "East Wind",
      "South Wind",
      "West Wind",
      "North Wind",
      "Red Dragon",
      "Green Dragon",
      "White Dragon",
    ],
  },
];

const CHINESE_GROUPS: TileGroup[] = [
  { label: "条 (Bamboo)", options: range(1, 9).map((n) => `${n}条`) },
  { label: "筒 (Circle)", options: range(1, 9).map((n) => `${n}筒`) },
  { label: "万 (Character)", options: range(1, 9).map((n) => `${n}万`) },
  { label: "字牌 (Honors)", options: ["东", "南", "西", "北", "中", "发", "白"] },
];

function looksChinese(list: string[]) {
  return list.some((tile) => /[\u4e00-\u9fff]/.test(tile));
}

export default function TileEditor({
  tiles,
  original,
  onChange,
}: TileEditorProps) {
  const groups = useMemo<TileGroup[]>(
    () =>
      looksChinese(tiles.length > 0 ? tiles : original)
        ? CHINESE_GROUPS
        : ENGLISH_GROUPS,
    [tiles, original]
  );

  const allOptions = useMemo(
    () => groups.flatMap((group) => group.options),
    [groups]
  );

  const [selected, setSelected] = useState("");
  const current = selected || allOptions[0];

  function remove(index: number) {
    onChange(tiles.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= tiles.length) return;
    const next = [...tiles];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function add() {
    if (!current) return;
    onChange([...tiles, current]);
  }

  function reset() {
    onChange([...original]);
  }

  return (
    <div className="rounded-card border border-border bg-surface p-[clamp(20px,3vw,32px)] shadow-soft">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-[1.5rem] font-medium tracking-[-0.01em] text-fg">
          Recognized Tiles
        </h2>
        <button
          type="button"
          onClick={reset}
          className="text-[13px] font-medium text-muted underline-offset-2 transition-colors hover:text-fg hover:underline"
        >
          Reset
        </button>
      </div>
      <p className="mb-4 text-[13px] text-muted">
        Tiles recognized: {tiles.length}
      </p>

      {tiles.length === 0 ? (
        <p className="mb-5 text-sm text-muted">
          No tiles yet — add the tiles in your hand below.
        </p>
      ) : (
        <ul className="mb-5 flex flex-wrap gap-2">
          {tiles.map((tile, index) => (
            <li
              key={`${tile}-${index}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-bg py-1 pl-1 pr-1.5 text-[13px] text-fg"
            >
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move left"
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:text-fg disabled:opacity-30"
              >
                ‹
              </button>
              <span className="px-0.5">{tile}</span>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === tiles.length - 1}
                aria-label="Move right"
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:text-fg disabled:opacity-30"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={`Remove ${tile}`}
                className="flex h-5 w-5 items-center justify-center rounded-full text-muted transition-colors hover:bg-[oklch(90%_0.018_85/0.5)] hover:text-fg"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={current}
          onChange={(event) => setSelected(event.target.value)}
          aria-label="Tile to add"
          className="min-w-0 flex-1 rounded-[12px] border border-border bg-bg px-4 py-3 text-sm text-fg outline-none transition focus:border-[oklch(72%_0.085_75/0.55)] focus:shadow-[0_0_0_3px_oklch(88%_0.04_75/0.45)]"
        >
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <Button type="button" variant="secondary" size="sm" onClick={add}>
          Add Tile
        </Button>
      </div>
    </div>
  );
}

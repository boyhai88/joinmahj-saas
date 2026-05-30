"use server";

import { createClient } from "@/lib/supabase/server";

const DASHSCOPE_URL =
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const CHAT_MODEL = process.env.DASHSCOPE_CHAT_MODEL ?? "qwen-plus";

const SYSTEM_PROMPT = [
  "You are a professional Mahjong strategy coach.",
  "Analyze the hand.",
  "Recommend:",
  "1. Best discard",
  "2. Reason",
  "3. Suggested hand patterns",
  "4. Winning potential score",
  "Respond in English only.",
  "Do not use Chinese characters or Chinese Mahjong terms anywhere.",
  "Translate all tile names and hand pattern names into English.",
  "Examples: 九莲宝灯 -> Nine Gates; 清龙 -> Pure Straight; 平胡 -> All Sequences;",
  "发财 -> Green Dragon; 红中 -> Red Dragon; 白板 -> White Dragon.",
  "Return JSON only.",
  'Format: {"discard":"Green Dragon","reason":"...","winningPotential":"72%","suggestions":["All Sequences","Half Flush"]}',
  "No markdown. No explanations. JSON only.",
].join("\n");

// Safeguard: normalize any Chinese terms the model might still emit.
const TERM_MAP: Record<string, string> = {
  九莲宝灯: "Nine Gates",
  清龙: "Pure Straight",
  平胡: "All Sequences",
  混一色: "Half Flush",
  清一色: "Full Flush",
  十三幺: "Thirteen Orphans",
  七对子: "Seven Pairs",
  碰碰胡: "All Triplets",
  发财: "Green Dragon",
  发: "Green Dragon",
  红中: "Red Dragon",
  中: "Red Dragon",
  白板: "White Dragon",
  白: "White Dragon",
  东: "East Wind",
  南: "South Wind",
  西: "West Wind",
  北: "North Wind",
};

// Longer keys first so multi-character terms win over single-character ones.
const TERM_KEYS = Object.keys(TERM_MAP).sort((a, b) => b.length - a.length);

function normalizeText(value: string): string {
  let result = value;
  for (const key of TERM_KEYS) {
    if (result.includes(key)) {
      result = result.split(key).join(TERM_MAP[key]);
    }
  }
  return result;
}

export type StrategyResult = {
  discard: string;
  reason: string;
  winningPotential: string;
  suggestions: string[];
};

function parseStrategy(content: string): StrategyResult | null {
  let text = content.trim();

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    text = fenced[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  try {
    const parsed = JSON.parse(text) as {
      discard?: unknown;
      reason?: unknown;
      winningPotential?: unknown;
      suggestions?: unknown;
    };

    const winning =
      typeof parsed.winningPotential === "string"
        ? parsed.winningPotential
        : typeof parsed.winningPotential === "number"
          ? `${parsed.winningPotential}%`
          : "";

    return {
      discard:
        typeof parsed.discard === "string"
          ? normalizeText(parsed.discard)
          : "",
      reason:
        typeof parsed.reason === "string" ? normalizeText(parsed.reason) : "",
      winningPotential: winning,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions
            .filter((item): item is string => typeof item === "string")
            .map(normalizeText)
        : [],
    };
  } catch {
    return null;
  }
}

export async function analyzeStrategy(
  tiles: string[]
): Promise<StrategyResult> {
  if (!tiles || tiles.length === 0) {
    throw new Error("No tiles to analyze.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error("AI is not configured.");
  }

  const response = await fetch(DASHSCOPE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Hand tiles: ${JSON.stringify(tiles)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Strategy analysis failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from the strategy model.");
  }

  const result = parseStrategy(content);
  if (!result) {
    throw new Error("Could not parse strategy response.");
  }

  return result;
}

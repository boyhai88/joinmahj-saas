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
  "Return JSON only.",
  'Format: {"discard":"发财","reason":"...","winningPotential":"72%","suggestions":["平胡","混一色"]}',
  "No markdown. No explanations. JSON only.",
].join("\n");

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
      discard: typeof parsed.discard === "string" ? parsed.discard : "",
      reason: typeof parsed.reason === "string" ? parsed.reason : "",
      winningPotential: winning,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter(
            (item): item is string => typeof item === "string"
          )
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

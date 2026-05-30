"use server";

import { createClient } from "@/lib/supabase/server";

const DASHSCOPE_URL =
  process.env.DASHSCOPE_BASE_URL ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const VISION_MODEL = process.env.DASHSCOPE_VISION_MODEL ?? "qwen-vl-plus";

const SYSTEM_PROMPT = "You are a Mahjong tile recognition expert.";
const USER_PROMPT = [
  "Identify every visible Mahjong tile.",
  "Return JSON only.",
  'Format: { "tiles": ["1 Bamboo", "2 Bamboo", "Red Dragon"] }',
  "No markdown. No explanations. JSON only.",
].join("\n");

export type AnalyzeResult = {
  tiles: string[];
};

function extractTiles(content: string): string[] {
  let text = content.trim();

  // Strip a ```json ... ``` fence if the model added one.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    text = fenced[1].trim();
  }

  // Narrow to the first JSON object.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1);
  }

  try {
    const parsed = JSON.parse(text) as { tiles?: unknown };
    if (parsed && Array.isArray(parsed.tiles)) {
      return parsed.tiles.filter(
        (tile): tile is string => typeof tile === "string"
      );
    }
  } catch {
    // fall through
  }
  return [];
}

export async function analyzeHand(imageUrl: string): Promise<AnalyzeResult> {
  if (!imageUrl) {
    throw new Error("No image provided.");
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
      model: VISION_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: USER_PROMPT },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Recognition failed (${response.status}).`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from the recognition model.");
  }

  return { tiles: extractTiles(content) };
}

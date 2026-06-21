"use server";

import type { RecogItem } from "./types";

// Free via Google AI Studio (no credit card). Swap the model string if you like;
// check current free models at https://aistudio.google.com  ->  "Get API key".
const MODEL = "gemini-2.5-flash-lite";

const PROMPT = `You are a nutrition estimator who specialises in Malaysian food and Malaysian fast-food chains (McDonald's Malaysia, KFC, Texas Chicken, Marrybrown, A&W, Pizza Hut, mamak stalls, kopitiam, etc.).

Identify every distinct food or drink in the image. Use Malaysian portion sizes and local recipes (santan, sambal, kuah, etc.) when relevant. Estimate based ONLY on the portion visible.

Also estimate the total weight of each item in grams ("est_grams") so the portion can be rescaled.

Reply with STRICT JSON and nothing else — no markdown, no commentary:
{"items":[{"name":"short dish name","portion":"e.g. 1 plate","est_grams":int,"calories":int,"protein":int,"carbs":int,"fat":int,"confidence":"high|medium|low"}]}

If you cannot identify any food, reply {"items":[]}.`;

/**
 * Sends a base64 food photo to Google Gemini and returns estimated items.
 * Runs only on the server, so GEMINI_API_KEY is never exposed to the browser.
 */
export async function recogniseFood(
  base64: string,
  mediaType: string
): Promise<RecogItem[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY environment variable");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mediaType, data: base64 } },
              { text: PROMPT },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text)
    .filter((t): t is string => typeof t === "string")
    .join("\n");

  const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(clean) as { items?: RecogItem[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    console.error("Gemini parse failed. Raw output:", clean.slice(0, 500));
    return [];
  }
}

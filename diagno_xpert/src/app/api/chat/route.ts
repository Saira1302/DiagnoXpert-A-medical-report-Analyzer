import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

const DEFAULT_MODEL_ID = "aaditya/Llama3-OpenBioLLM-8B";

function buildPrompt(userMessage: string): string {
  return [
    "System:",
    "You are a friendly medical assistant (DiagnoXpert). Answer the user's medical questions clearly and concisely in simple, non-technical language. Do not diagnose. Recommend seeing a doctor when appropriate. Keep replies under 200 words.",
    "",
    "User:",
    userMessage,
    "",
    "Assistant:",
  ].join("\n");
}

function cleanOutput(text: string): string {
  const idx = text.search(/\bUser\s*:|Human\s*:|Patient\s*:/);
  if (idx !== -1) return text.substring(0, idx).replace(/[\s.,]+$/, "").trim();
  return text.trim();
}

function extractText(output: unknown): string {
  if (typeof output === "string") return output.trim();

  if (Array.isArray(output) && output.length > 0) {
    const first = output[0] as { generated_text?: unknown } | undefined;
    const t = first?.generated_text;
    if (typeof t === "string") return t.trim();
  }

  if (output && typeof output === "object") {
    const v = output as { generated_text?: unknown };
    if (typeof v.generated_text === "string") return v.generated_text.trim();
  }

  return String(output ?? "").trim();
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const client = new InferenceClient(token);
    const modelId = process.env.HF_MODEL_ID || DEFAULT_MODEL_ID;

    const output = await client.textGeneration({
      model: modelId,
      inputs: buildPrompt(message.trim()),
      parameters: {
        max_new_tokens: 350,
        temperature: 0.3,
        top_p: 0.9,
        return_full_text: false,
      },
    });

    const reply = cleanOutput(extractText(output));
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Chat error:", err);
    return NextResponse.json({ error: err?.message || "Failed to process message." }, { status: 500 });
  }
}

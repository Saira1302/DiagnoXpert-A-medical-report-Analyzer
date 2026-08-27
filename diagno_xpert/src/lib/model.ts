import { InferenceClient } from "@huggingface/inference";

export type ParsedReport = {
  patient_info?: {
    patient_name?: string;
    age?: string;
    sex?: string;
    patient_id?: string;
  };
  tests?: unknown[];
  [key: string]: unknown;
};

const DEFAULT_MODEL_ID = "aaditya/Llama3-OpenBioLLM-8B";
const DEFAULT_USER_QUESTION =
  "Explain this medical report in easy language for a non-medical person.";

type TestRow = {
  test_name?: string;
  result?: string;
  unit?: string;
  reference_value?: string;
  status?: string;
};

function detectStatus(result?: string, reference?: string): "high" | "low" | "normal" | "unknown" {
  if (!result || !reference) return "unknown";
  const valueMatch = result.replace(/,/g, "").match(/[\d.]+/);
  if (!valueMatch) return "unknown";
  const value = parseFloat(valueMatch[0]);
  const clean = reference.replace(/,/g, "");

  const range = clean.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (range) {
    const min = parseFloat(range[1]);
    const max = parseFloat(range[2]);
    if (value < min) return "low";
    if (value > max) return "high";
    return "normal";
  }
  const lt = clean.match(/[<≤]\s*([\d.]+)/);
  if (lt) return value <= parseFloat(lt[1]) ? "normal" : "high";
  const gt = clean.match(/[>≥]\s*([\d.]+)/);
  if (gt) return value >= parseFloat(gt[1]) ? "normal" : "low";
  return "unknown";
}

function formatTestsAsLines(tests: unknown): string {
  if (!Array.isArray(tests) || tests.length === 0) return "(no tests parsed)";
  const rows = tests as TestRow[];
  return rows
    .map((t) => {
      const name = t.test_name?.trim() || "Unknown";
      const value = `${t.result ?? "—"}${t.unit ? " " + t.unit : ""}`;
      const ref = t.reference_value?.trim() || "—";
      const status = (t.status || detectStatus(t.result, t.reference_value)).toUpperCase();
      return `- ${name}: ${value} (reference ${ref}) — ${status}`;
    })
    .join("\n");
}

function buildSystemPrompt(): string {
  return [
    "You are OpenBioLLM, a friendly medical assistant that explains lab reports to patients in simple, everyday language.",
    "You NEVER greet, never use dialogue labels (User:, Patient:, Human:), never repeat the user's instructions back, and never claim a final diagnosis.",
    "You ALWAYS produce the answer using EXACTLY these five bold markdown headings, in this order:",
    "**Summary**, **Abnormal Findings**, **Diet Plan**, **Daily Routine**, **Follow-up**.",
    "Each section has 2–4 short sentences or bullet points with concrete, practical advice (specific foods, habits, follow-up timeframes).",
    "If a value is HIGH or LOW, explain in plain language what it could mean and suggest practical actions. If everything is NORMAL, still give general healthy-lifestyle advice.",
  ].join(" ");
}

function buildUserPrompt(args: {
  patient: {
    name: string;
    age: string;
    gender: string;
    patient_id: string;
  };
  testsBlock: string;
  userQuestion: string;
}): string {
  return [
    `Patient: ${args.patient.name}, ${args.patient.gender}, age ${args.patient.age} (ID ${args.patient.patient_id}).`,
    "",
    "Lab results:",
    args.testsBlock,
    "",
    `Patient request: ${args.userQuestion}`,
    "",
    "Now write the structured report using EXACTLY the five bold sections: **Summary**, **Abnormal Findings**, **Diet Plan**, **Daily Routine**, **Follow-up**.",
  ].join("\n");
}

function buildJsonUserPrompt(args: {
  patient: object;
  tests: unknown;
}): string {
  return [
    "Analyze each lab value and respond with a JSON array only — no explanations, no markdown.",
    "",
    `Patient Info: ${JSON.stringify(args.patient)}`,
    `Test Values: ${JSON.stringify(args.tests)}`,
    "",
    "Each element must include: test_name, value, status (low|high|normal|borderline), normal_range, headline, explanation, causes, diet_tips, lifestyle_tips, when_to_see_doctor, emoji.",
  ].join("\n");
}

export function resolveModelId(modelId: string): string {
  const normalized = modelId.trim() || DEFAULT_MODEL_ID;
  if (normalized === "aaditya/OpenBioLLM-Llama3-8B") {
    return DEFAULT_MODEL_ID;
  }
  return normalized;
}

function cleanOutput(text: string): string {
  let out = text.trim();
  out = out.replace(/<\|[^|]+\|>/g, "").trim();
  const idx = out.search(/\bUser\s*:|Human\s*:|Patient\s*:/);
  if (idx !== -1) out = out.substring(0, idx).replace(/[\s.,]+$/, "").trim();
  return out;
}

function extractGeneratedText(output: unknown): string {
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

function buildTextGenerationPrompt(systemPrompt: string, userPrompt: string): string {
  return [
    "<|begin_of_text|><|start_header_id|>system<|end_header_id|>",
    "",
    systemPrompt,
    "<|eot_id|><|start_header_id|>user<|end_header_id|>",
    "",
    userPrompt,
    "<|eot_id|><|start_header_id|>assistant<|end_header_id|>",
    "",
  ].join("\n");
}

export async function callOpenBioLlm(args: {
  reportData: ParsedReport;
  userQuestion?: string;
  responseStyle: "chat" | "json";
  modelId: string;
}): Promise<string> {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("Missing HF_TOKEN in environment.");

  const client = new InferenceClient(token);
  const resolvedModelId = resolveModelId(args.modelId);
  const userQuestion = (args.userQuestion || DEFAULT_USER_QUESTION).trim();

  const patient = args.reportData.patient_info ?? {};
  const patientPayload = {
    name: patient.patient_name ?? "N/A",
    age: patient.age ?? "N/A",
    gender: patient.sex ?? "N/A",
    patient_id: patient.patient_id ?? "N/A",
  };

  const tests = Array.isArray(args.reportData.tests) ? args.reportData.tests : [];

  const systemPrompt =
    args.responseStyle === "json"
      ? "You are OpenBioLLM, a biomedical assistant. Reply with valid JSON only — no prose, no markdown, no dialogue."
      : buildSystemPrompt();

  const userPrompt =
    args.responseStyle === "json"
      ? buildJsonUserPrompt({ patient: patientPayload, tests })
      : buildUserPrompt({
          patient: patientPayload,
          testsBlock: formatTestsAsLines(tests),
          userQuestion,
        });

  // Prefer chatCompletion — it applies the model's chat template server-side
  // and avoids prompt-echoing seen with raw textGeneration.
  try {
    const completion = await client.chatCompletion({
      model: resolvedModelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 900,
      temperature: 0.3,
      top_p: 0.9,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return cleanOutput(content);
    }
  } catch (chatErr) {
    console.warn(
      "chatCompletion failed, falling back to textGeneration:",
      (chatErr as Error)?.message,
    );
  }

  const fallbackPrompt = buildTextGenerationPrompt(systemPrompt, userPrompt);
  const output = await client.textGeneration({
    model: resolvedModelId,
    inputs: fallbackPrompt,
    parameters: {
      max_new_tokens: 900,
      temperature: 0.3,
      top_p: 0.9,
      return_full_text: false,
    },
  });

  return cleanOutput(extractGeneratedText(output));
}

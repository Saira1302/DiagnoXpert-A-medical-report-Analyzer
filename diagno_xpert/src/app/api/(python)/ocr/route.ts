import { NextResponse } from "next/server";
import { MedicalParser } from "@/lib/ocr";
import { callOpenBioLlm,resolveModelId } from "@/lib/model";
import type { ParsedReport } from "@/lib/model";
const parser = new MedicalParser();

const DEFAULT_MODEL_ID = "aaditya/Llama3-OpenBioLLM-8B";
const DEFAULT_USER_QUESTION = "Explain this medical report in easy language for a non-medical person.";

async function parseReportFromFormData(formData: FormData) {
  const ocrText = formData.get("ocrText") as string | null;
  const ocrConfidence = formData.get("ocrConfidence") as string | null;
  const sourceType = (formData.get("sourceType") as string | null) === "pdf" ? "pdf" : "image";

  if (ocrText) {
    let confidencePayload: unknown = undefined;
    if (ocrConfidence) {
      try {
        confidencePayload = JSON.parse(ocrConfidence);
      } catch {
        confidencePayload = undefined;
      }
    }

    return parser.parseFromText(ocrText, sourceType, confidencePayload as any);
  }

  let file: File | null = null;
  for (const entry of formData.entries()) {
    if (entry[1] instanceof File) {
      file = entry[1];
      break;
    }
  }

  if (!file) {
    throw new Error("No file uploaded");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return parser.parsePDF(buffer);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const responseStyleRaw = (formData.get("responseStyle") as string | null)?.toLowerCase();
    const responseStyle = responseStyleRaw === "json" ? "json" : "chat";
    const userQuestion = (formData.get("userQuestion") as string | null) ?? DEFAULT_USER_QUESTION;
    const configuredModelId = process.env.HF_MODEL_ID || process.env.OPENBIO_MODEL_ID || DEFAULT_MODEL_ID;
    const resolvedModelId = resolveModelId(configuredModelId);

    const result = await parseReportFromFormData(formData);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    try {
      const aiInterpretation = await callOpenBioLlm({
        reportData: result as unknown as ParsedReport,
        responseStyle,
        userQuestion,
        modelId: configuredModelId,
      });

      return NextResponse.json({
        ...result,
        ai_interpretation: aiInterpretation,
        ai_model: resolvedModelId,
      });
    } catch (modelErr: any) {
      // Keep parser response available even if the model call fails.
      return NextResponse.json({
        ...result,
        ai_interpretation: "",
        ai_error: modelErr?.message || "Failed to interpret report with model.",
      });
    }

  } catch (err: any) {
    console.error("OCR Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import OpenAI from "openai";
import { prisma } from "@/lib/db";
import { loadConfig } from "@/lib/rules/config";
import { runRules } from "@/lib/rules/runRules";
import { buildAnnotatedHtml } from "@/lib/validation/annotate";
import { scoreFindings } from "@/lib/validation/score";
import { ValidationFinding, ValidationResult } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 20000;
const DEFAULT_MODEL = "gpt-4o-mini";

type ValidateRequest = {
  text: string;
  configOverrides?: Record<string, unknown>;
  useLLM?: boolean;
};

type RefinementResponse = Array<{
  id: string;
  suggestion?: string;
  rationale?: string;
  severity?: ValidationFinding["severity"];
  confidence?: number;
}>;

const buildContext = (text: string, start: number, end: number) => {
  const before = text.slice(Math.max(0, start - 60), start);
  const after = text.slice(end, Math.min(text.length, end + 60));
  return `${before}[${text.slice(start, end)}]${after}`;
};

const refineWithLLM = async (
  text: string,
  findings: ValidationFinding[]
) => {
  if (!process.env.OPENAI_API_KEY || findings.length === 0) {
    return { findings, model: undefined };
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const payload = findings.map((finding) => ({
    id: finding.id,
    category: finding.category,
    severity: finding.severity,
    snippet: finding.snippet,
    suggestion: finding.suggestion,
    rationale: finding.rationale,
    confidence: finding.confidence,
    context: buildContext(text, finding.start, finding.end)
  }));

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You refine existing style findings. Do not cite or reference the AP Stylebook. " +
          "Do not add new findings or new rule IDs. " +
          "Return JSON only with the same IDs, optionally adjusting suggestion, rationale, severity, and confidence. " +
          "If uncertain, set severity to 'review' and explain what to verify."
      },
      {
        role: "user",
        content: JSON.stringify(payload)
      }
    ]
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  let refinements: RefinementResponse = [];
  try {
    refinements = JSON.parse(content) as RefinementResponse;
  } catch {
    refinements = [];
  }

  const updates = new Map(refinements.map((item) => [item.id, item]));
  const refined = findings.map((finding) => {
    const update = updates.get(finding.id);
    if (!update) return finding;
    return {
      ...finding,
      suggestion: update.suggestion ?? finding.suggestion,
      rationale: update.rationale ?? finding.rationale,
      severity: update.severity ?? finding.severity,
      confidence:
        update.confidence !== undefined ? update.confidence : finding.confidence
    };
  });

  return { findings: refined, model: DEFAULT_MODEL };
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ValidateRequest;
  const text = typeof body?.text === "string" ? body.text : "";

  if (!text.trim()) {
    return NextResponse.json(
      { error: "Text is required." },
      { status: 400 }
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text exceeds ${MAX_TEXT_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const config = await loadConfig(body.configOverrides);
  const deterministicFindings = runRules(text, config) as ValidationFinding[];

  let findings = deterministicFindings;
  let model: string | undefined;

  if (body.useLLM) {
    try {
      const refined = await refineWithLLM(text, deterministicFindings);
      findings = refined.findings;
      model = refined.model;
    } catch {
      findings = deterministicFindings;
    }
  }

  const { score, categories } = scoreFindings(findings);
  const annotatedText = buildAnnotatedHtml(text, findings);
  const createdAt = new Date().toISOString();
  const sourceTextHash = createHash("sha256").update(text).digest("hex");

  await prisma.validationRun.create({
    data: {
      score,
      categoriesJson: JSON.stringify(categories),
      findingsJson: JSON.stringify(findings),
      annotatedText,
      sourceTextHash
    }
  });

  const response: ValidationResult = {
    score,
    categories,
    findings,
    annotatedText,
    meta: { model, createdAt }
  };

  return NextResponse.json(response);
}

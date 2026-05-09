export type ValidationCategoryScore = {
  score: number;
  count: number;
};

export type ValidationFinding = {
  id: string;
  severity: "definite" | "potential" | "review";
  category: string;
  start: number;
  end: number;
  snippet: string;
  suggestion: string;
  rationale: string;
  confidence: number;
  rule_id: string;
};

export type ValidationResult = {
  score: number;
  categories: Record<string, ValidationCategoryScore>;
  findings: ValidationFinding[];
  annotatedText: string;
  meta: { model?: string; createdAt: string };
};

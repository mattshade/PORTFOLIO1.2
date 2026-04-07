import { ValidationFinding } from "@/lib/types";

const severityPenalty: Record<ValidationFinding["severity"], number> = {
  definite: 8,
  potential: 4,
  review: 2
};

const defaultCategories = [
  "Punctuation",
  "Numbers",
  "Dates/Times",
  "Titles",
  "Capitalization",
  "Abbreviations",
  "Inclusivity",
  "Headlines"
];

export const scoreFindings = (findings: ValidationFinding[]) => {
  const categorySet = new Set<string>(defaultCategories);
  for (const finding of findings) {
    categorySet.add(finding.category);
  }

  const categories: Record<string, { score: number; count: number }> = {};
  for (const category of categorySet) {
    const categoryFindings = findings.filter(
      (finding) => finding.category === category
    );
    const penalty = categoryFindings.reduce(
      (sum, finding) => sum + severityPenalty[finding.severity],
      0
    );
    const score = Math.max(0, 100 - penalty);
    categories[category] = { score, count: categoryFindings.length };
  }

  const scores = Object.values(categories).map((entry) => entry.score);
  const overall =
    scores.length === 0
      ? 100
      : Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);

  return { score: overall, categories };
};

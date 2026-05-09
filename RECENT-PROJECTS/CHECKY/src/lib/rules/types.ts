export type Severity = "definite" | "potential" | "review";

export type Finding = {
  id: string;
  severity: Severity;
  category: string;
  start: number;
  end: number;
  snippet: string;
  suggestion: string;
  rationale: string;
  confidence: number;
  rule_id: string;
};

export type FindingBase = Omit<Finding, "id" | "rule_id">;

export type Rule = {
  id: string;
  category: string;
  description: string;
  examples?: { bad: string; good: string }[];
  check: (text: string, config: Config) => FindingBase[];
};

export type HeadlineCase = "sentence" | "title";

export type Config = {
  useOxfordComma: boolean;
  numeralThreshold: number;
  preferPercentSymbol: boolean;
  headlineCase: HeadlineCase;
  preferSmartQuotes: boolean;
  useMonthAbbrevWithDay: boolean;
  useStateAbbrevDateline: boolean;
  usePeriodsInUsAbbrev: boolean;
  allowedAcronyms: string[];
  inclusiveTerms: Record<string, string>;
};

export type ConfigOverrides = Partial<Config>;

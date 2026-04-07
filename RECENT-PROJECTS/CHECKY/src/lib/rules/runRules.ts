import { rules } from "./registry";
import { Config, Finding } from "./types";

export const runRules = (text: string, config: Config): Finding[] => {
  const findings: Finding[] = [];

  for (const rule of rules) {
    const results = rule.check(text, config);
    for (const result of results) {
      const id = `${rule.id}-${result.start}-${result.end}`;
      findings.push({
        ...result,
        id,
        rule_id: rule.id
      });
    }
  }

  return findings;
};

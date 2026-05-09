import { describe, expect, it } from "vitest";
import { runRules } from "@/lib/rules/runRules";
import { defaultConfig } from "@/lib/rules/config";

describe("rules engine", () => {
  it("flags double spaces after periods", () => {
    const findings = runRules("Hello.  World.", defaultConfig);
    const match = findings.find((finding) =>
      finding.rule_id.includes("double-space-after-period")
    );
    expect(match).toBeTruthy();
  });

  it("flags uppercase AM/PM", () => {
    const findings = runRules("The meeting is at 9 AM.", defaultConfig);
    const match = findings.find((finding) =>
      finding.rule_id.includes("time-format-am-pm")
    );
    expect(match).toBeTruthy();
  });

  it("flags all caps words not in allowlist", () => {
    const findings = runRules("We saw BIGNEWS today.", defaultConfig);
    const match = findings.find((finding) =>
      finding.rule_id.includes("all-caps-words")
    );
    expect(match).toBeTruthy();
  });
});

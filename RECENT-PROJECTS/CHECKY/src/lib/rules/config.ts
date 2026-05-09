import fs from "node:fs/promises";
import path from "node:path";
import { Config, ConfigOverrides } from "./types";

export const defaultConfig: Config = {
  useOxfordComma: true,
  numeralThreshold: 9,
  preferPercentSymbol: true,
  headlineCase: "sentence",
  preferSmartQuotes: true,
  useMonthAbbrevWithDay: true,
  useStateAbbrevDateline: true,
  usePeriodsInUsAbbrev: true,
  allowedAcronyms: ["API", "NASA", "FBI", "EU", "UN", "NATO", "UAE"],
  inclusiveTerms: {
    crazy: "unreasonable",
    insane: "extreme",
    "master/slave": "primary/replica",
    blacklist: "blocklist",
    whitelist: "allowlist",
    guys: "everyone",
    manpower: "staffing"
  }
};

export async function loadConfig(
  overrides?: ConfigOverrides
): Promise<Config> {
  const configPath = path.join(process.cwd(), "rules", "config.json");
  let fileConfig: Partial<Config> = {};

  try {
    const raw = await fs.readFile(configPath, "utf8");
    fileConfig = JSON.parse(raw) as Partial<Config>;
  } catch {
    fileConfig = {};
  }

  const merged: Config = {
    ...defaultConfig,
    ...fileConfig,
    ...overrides,
    allowedAcronyms:
      overrides?.allowedAcronyms ??
      fileConfig.allowedAcronyms ??
      defaultConfig.allowedAcronyms,
    inclusiveTerms: {
      ...defaultConfig.inclusiveTerms,
      ...(fileConfig.inclusiveTerms ?? {}),
      ...(overrides?.inclusiveTerms ?? {})
    }
  };

  return merged;
}

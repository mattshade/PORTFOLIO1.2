import { Config, FindingBase, Rule } from "./types";

type MatchResult = { start: number; end: number; match: string };

const findAllMatches = (regex: RegExp, text: string): MatchResult[] => {
  const results: MatchResult[] = [];
  const flags = regex.flags.includes("g") ? regex.flags : `${regex.flags}g`;
  const re = new RegExp(regex.source, flags);
  let match: RegExpExecArray | null = null;

  while ((match = re.exec(text)) !== null) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    results.push({ start, end, match: match[0] });
    if (match[0].length === 0) {
      re.lastIndex += 1;
    }
  }

  return results;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const makeFinding = (
  text: string,
  start: number,
  end: number,
  base: Omit<FindingBase, "start" | "end" | "snippet">
): FindingBase => ({
  ...base,
  start,
  end,
  snippet: text.slice(start, end)
});

const monthAbbrevMap: Record<string, string> = {
  January: "Jan.",
  February: "Feb.",
  August: "Aug.",
  September: "Sept.",
  October: "Oct.",
  November: "Nov.",
  December: "Dec."
};

const stateAbbrevMap: Record<string, string> = {
  Alabama: "Ala.",
  Alaska: "Alaska",
  Arizona: "Ariz.",
  Arkansas: "Ark.",
  California: "Calif.",
  Colorado: "Colo.",
  Connecticut: "Conn.",
  Delaware: "Del.",
  Florida: "Fla.",
  Georgia: "Ga.",
  Hawaii: "Hawaii",
  Idaho: "Idaho",
  Illinois: "Ill.",
  Indiana: "Ind.",
  Iowa: "Iowa",
  Kansas: "Kan.",
  Kentucky: "Ky.",
  Louisiana: "La.",
  Maine: "Maine",
  Maryland: "Md.",
  Massachusetts: "Mass.",
  Michigan: "Mich.",
  Minnesota: "Minn.",
  Mississippi: "Miss.",
  Missouri: "Mo.",
  Montana: "Mont.",
  Nebraska: "Neb.",
  Nevada: "Nev.",
  NewHampshire: "N.H.",
  NewJersey: "N.J.",
  NewMexico: "N.M.",
  NewYork: "N.Y.",
  NorthCarolina: "N.C.",
  NorthDakota: "N.D.",
  Ohio: "Ohio",
  Oklahoma: "Okla.",
  Oregon: "Ore.",
  Pennsylvania: "Pa.",
  RhodeIsland: "R.I.",
  SouthCarolina: "S.C.",
  SouthDakota: "S.D.",
  Tennessee: "Tenn.",
  Texas: "Texas",
  Utah: "Utah",
  Vermont: "Vt.",
  Virginia: "Va.",
  Washington: "Wash.",
  WestVirginia: "W.Va.",
  Wisconsin: "Wis.",
  Wyoming: "Wyo."
};

const titleWords = [
  "president",
  "governor",
  "mayor",
  "senator",
  "representative",
  "director",
  "chief",
  "officer",
  "professor",
  "doctor",
  "chair",
  "commissioner"
];

export const rules: Rule[] = [
  {
    id: "time-format-am-pm",
    category: "Dates/Times",
    description:
      "Time markers should be lowercase with periods (a.m./p.m.).",
    check: (text) => {
      const findings: FindingBase[] = [];
      const matches = findAllMatches(
        /\b([0-9]{1,2})(?::[0-9]{2})?\s?(AM|PM|A\.M\.|P\.M\.|A\.M|P\.M|am|pm|a\.m|p\.m)\b/g,
        text
      );

      for (const match of matches) {
        const normalized = match.match.toLowerCase();
        if (normalized.includes("a.m.") || normalized.includes("p.m.")) {
          continue;
        }
        const suggestion = normalized.replace(/\b(am|pm)\b/i, (value) =>
          value.toLowerCase() === "am" ? "a.m." : "p.m."
        );
        findings.push(
          makeFinding(text, match.start, match.end, {
            severity: "definite",
            category: "Dates/Times",
            suggestion,
            rationale: "Use lowercase time markers with periods.",
            confidence: 0.7
          })
        );
      }

      return findings;
    }
  },
  {
    id: "double-space-after-period",
    category: "Punctuation",
    description: "Avoid double spaces after a period.",
    check: (text) =>
      findAllMatches(/\. {2,}/g, text).map((match) =>
        makeFinding(text, match.start, match.end, {
          severity: "definite",
          category: "Punctuation",
          suggestion: ". ",
          rationale: "Use a single space after a period.",
          confidence: 0.85
        })
      )
  },
  {
    id: "smart-quotes-preference",
    category: "Punctuation",
    description: "Prefer smart quotes over straight quotes.",
    check: (text, config) => {
      if (!config.preferSmartQuotes) return [];
      return findAllMatches(/"/g, text).map((match) =>
        makeFinding(text, match.start, match.end, {
          severity: "potential",
          category: "Punctuation",
          suggestion: "Replace with smart quotes.",
          rationale:
            "Smart quotes improve typographic readability, but may depend on platform.",
          confidence: 0.4
        })
      );
    }
  },
  {
    id: "percent-symbol-preference",
    category: "Numbers",
    description: "Use % or the word percent based on configuration.",
    check: (text, config) => {
      if (config.preferPercentSymbol) {
        return findAllMatches(/\b([0-9]+)\s+percent\b/gi, text).map((match) =>
          makeFinding(text, match.start, match.end, {
            severity: "potential",
            category: "Numbers",
            suggestion: match.match.replace(/\s+percent/i, "%"),
            rationale: "Configured preference is the percent symbol.",
            confidence: 0.6
          })
        );
      }
      return findAllMatches(/\b([0-9]+)%\b/g, text).map((match) =>
        makeFinding(text, match.start, match.end, {
          severity: "potential",
          category: "Numbers",
          suggestion: match.match.replace("%", " percent"),
          rationale: "Configured preference is the word percent.",
          confidence: 0.6
        })
      );
    }
  },
  {
    id: "numerals-below-threshold",
    category: "Numbers",
    description: "Use words for numbers below a configurable threshold.",
    check: (text, config) => {
      const findings: FindingBase[] = [];
      const matches = findAllMatches(/\b([0-9]{1,2})\b/g, text);
      for (const match of matches) {
        const value = Number(match.match);
        if (Number.isNaN(value)) continue;
        if (value >= 0 && value <= config.numeralThreshold) {
          findings.push(
            makeFinding(text, match.start, match.end, {
              severity: "potential",
              category: "Numbers",
              suggestion: "Spell out the number in words.",
              rationale:
                "Configured preference is to spell out small numbers in running text.",
              confidence: 0.45
            })
          );
        }
      }
      return findings;
    }
  },
  {
    id: "month-abbrev-with-day",
    category: "Dates/Times",
    description: "Abbreviate certain months when used with a day.",
    check: (text, config) => {
      if (!config.useMonthAbbrevWithDay) return [];
      const findings: FindingBase[] = [];
      const matches = findAllMatches(
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+([0-9]{1,2})(,)?\b/g,
        text
      );
      for (const match of matches) {
        const monthMatch = /^(January|February|March|April|May|June|July|August|September|October|November|December)/.exec(
          match.match
        );
        if (!monthMatch) continue;
        const month = monthMatch[1];
        const abbr = monthAbbrevMap[month];
        if (!abbr) continue;
        const suggestion = match.match.replace(month, abbr);
        findings.push(
          makeFinding(text, match.start, match.end, {
            severity: "review",
            category: "Dates/Times",
            suggestion,
            rationale:
              "Some styles abbreviate certain months when paired with a day.",
            confidence: 0.35
          })
        );
      }
      return findings;
    }
  },
  {
    id: "title-capitalization-before-name",
    category: "Titles",
    description: "Capitalize formal titles when used before a name.",
    check: (text) => {
      const findings: FindingBase[] = [];
      const titleRegex = new RegExp(
        `\\b(${titleWords.join("|")})\\s+([A-Z][a-z]+)\\b`,
        "g"
      );
      const matches = findAllMatches(titleRegex, text);
      for (const match of matches) {
        const words = match.match.split(" ");
        const title = words[0];
        const suggestion = `${title[0].toUpperCase()}${title.slice(1)} ${words[1]}`;
        findings.push(
          makeFinding(text, match.start, match.end, {
            severity: "potential",
            category: "Titles",
            suggestion,
            rationale:
              "Formal titles are often capitalized when they immediately precede a name.",
            confidence: 0.5
          })
        );
      }
      return findings;
    }
  },
  {
    id: "excessive-exclamation",
    category: "Punctuation",
    description: "Avoid multiple exclamation points.",
    check: (text) =>
      findAllMatches(/!{2,}/g, text).map((match) =>
        makeFinding(text, match.start, match.end, {
          severity: "potential",
          category: "Punctuation",
          suggestion: "!",
          rationale: "Multiple exclamation points can read as informal.",
          confidence: 0.55
        })
      )
  },
  {
    id: "all-caps-words",
    category: "Capitalization",
    description: "Flag all-caps words unless whitelisted.",
    check: (text, config) => {
      const findings: FindingBase[] = [];
      const matches = findAllMatches(/\b[A-Z]{4,}\b/g, text);
      for (const match of matches) {
        if (config.allowedAcronyms.includes(match.match)) continue;
        findings.push(
          makeFinding(text, match.start, match.end, {
            severity: "review",
            category: "Capitalization",
            suggestion: "Consider using standard capitalization.",
            rationale:
              "All-caps words can reduce readability unless they are established acronyms.",
            confidence: 0.4
          })
        );
      }
      return findings;
    }
  },
  {
    id: "state-abbrev-dateline",
    category: "Abbreviations",
    description: "Use state abbreviations in datelines.",
    check: (text, config) => {
      if (!config.useStateAbbrevDateline) return [];
      const findings: FindingBase[] = [];
      const matches = findAllMatches(
        /^([A-Z][A-Z .'-]+),\s([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s[-—]/gm,
        text
      );
      for (const match of matches) {
        const parts = match.match.split(",");
        if (parts.length < 2) continue;
        const statePart = parts[1].trim().split(/\s[-—]/)[0];
        const key = statePart.replace(/\s/g, "");
        const abbr = stateAbbrevMap[key as keyof typeof stateAbbrevMap];
        if (!abbr || abbr === statePart) continue;
        const suggestion = match.match.replace(statePart, abbr);
        findings.push(
          makeFinding(text, match.start, match.end, {
            severity: "review",
            category: "Abbreviations",
            suggestion,
            rationale:
              "Some styles abbreviate states in datelines; verify with house style.",
            confidence: 0.35
          })
        );
      }
      return findings;
    }
  },
  {
    id: "company-suffix-punctuation",
    category: "Abbreviations",
    description: "Ensure common company suffixes include periods.",
    check: (text) =>
      findAllMatches(/\b([A-Z][\w&.-]+)\s+(Inc|Ltd|Co|Corp)\b(?!\.)/g, text).map(
        (match) =>
          makeFinding(text, match.start, match.end, {
            severity: "potential",
            category: "Abbreviations",
            suggestion: `${match.match}.`,
            rationale:
              "Company suffixes are often abbreviated with periods in formal style.",
            confidence: 0.5
          })
      )
  },
  {
    id: "inclusive-language",
    category: "Inclusivity",
    description: "Flag potentially exclusionary or outdated terms.",
    check: (text, config) => {
      const findings: FindingBase[] = [];
      for (const [term, suggestion] of Object.entries(
        config.inclusiveTerms
      )) {
        const termRegex = new RegExp(escapeRegExp(term), "gi");
        const matches = findAllMatches(termRegex, text);
        for (const match of matches) {
          findings.push(
            makeFinding(text, match.start, match.end, {
              severity: "review",
              category: "Inclusivity",
              suggestion: `Consider "${suggestion}".`,
              rationale:
                "Inclusive language improves clarity and welcomes broader audiences.",
              confidence: 0.35
            })
          );
        }
      }
      return findings;
    }
  },
  {
    id: "oxford-comma",
    category: "Punctuation",
    description: "Use the Oxford comma in simple lists.",
    check: (text, config) => {
      if (!config.useOxfordComma) return [];
      return findAllMatches(
        /\b([A-Za-z]+),\s+([A-Za-z]+)\s+and\s+([A-Za-z]+)\b/g,
        text
      ).map((match) =>
        makeFinding(text, match.start, match.end, {
          severity: "potential",
          category: "Punctuation",
          suggestion: match.match.replace(/\s+and\s+/, ", and "),
          rationale:
            "Configured preference is to include the Oxford comma in lists.",
          confidence: 0.45
        })
      );
    }
  },
  {
    id: "us-abbreviation-periods",
    category: "Abbreviations",
    description: "Use periods in U.S. abbreviation when configured.",
    check: (text, config) => {
      if (!config.usePeriodsInUsAbbrev) return [];
      return findAllMatches(/\bUS\b/g, text).map((match) =>
        makeFinding(text, match.start, match.end, {
          severity: "potential",
          category: "Abbreviations",
          suggestion: "U.S.",
          rationale: "Configured preference is to use periods.",
          confidence: 0.5
        })
      );
    }
  },
  {
    id: "headline-all-caps",
    category: "Headlines",
    description: "Avoid ALL CAPS headlines.",
    check: (text) => {
      const firstLine = text.split(/\r?\n/)[0] ?? "";
      const letters = firstLine.replace(/[^A-Z]/g, "");
      if (
        firstLine.length > 0 &&
        firstLine.length <= 120 &&
        letters.length >= 6 &&
        firstLine === firstLine.toUpperCase()
      ) {
        return [
          makeFinding(text, 0, firstLine.length, {
            severity: "review",
            category: "Headlines",
            suggestion: "Use standard capitalization for the headline.",
            rationale:
              "All-caps headlines can read as shouting and reduce readability.",
            confidence: 0.35
          })
        ];
      }
      return [];
    }
  }
];

import { ValidationFinding } from "@/lib/types";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const preserveNewlines = (value: string) => value.replace(/\n/g, "<br />");

export const buildAnnotatedHtml = (
  text: string,
  findings: ValidationFinding[]
) => {
  const sorted = [...findings].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
  });

  let cursor = 0;
  let output = "";

  for (const finding of sorted) {
    if (finding.start < cursor) {
      continue;
    }
    if (finding.start > cursor) {
      output += preserveNewlines(escapeHtml(text.slice(cursor, finding.start)));
    }
    const snippet = text.slice(finding.start, finding.end);
    output += `<mark data-finding-id="${finding.id}" data-severity="${
      finding.severity
    }" class="finding-mark">${
      preserveNewlines(escapeHtml(snippet)) || "&nbsp;"
    }</mark>`;
    cursor = finding.end;
  }

  if (cursor < text.length) {
    output += preserveNewlines(escapeHtml(text.slice(cursor)));
  }

  return output;
};

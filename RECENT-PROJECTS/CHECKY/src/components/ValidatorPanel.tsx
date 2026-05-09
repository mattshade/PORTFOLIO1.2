"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ValidationFinding, ValidationResult } from "@/lib/types";

const sampleArticle = `CITY OF RIVERGLEN, California — The mayor said 10 percent of residents voted at 8 PM on January 12, 2026. 
"We are excited!!" she said. The company Riverglen Inc reported DOUBLE DIGIT growth.
The board includes Maria, Jose and Lee. A spokesperson noted that manpower shortages remain.`;

const severityLabels: Record<ValidationFinding["severity"], string> = {
  definite: "Definite issue",
  potential: "Potential issue",
  review: "Needs human review"
};

export default function ValidatorPanel({
  className
}: {
  className?: string;
}) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useLLM, setUseLLM] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    definite: true,
    potential: true,
    review: true
  });
  
  const filteredFindings = useMemo(() => {
    if (!result) return [];
    return result.findings.filter((finding) => filters[finding.severity]);
  }, [result, filters]);

  useEffect(() => {
    if (!selectedFindingId) return;
    const target = document.querySelector<HTMLElement>(
      `[data-finding-id="${selectedFindingId}"]`
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ring-2", "ring-blue-500");
      setTimeout(() => {
        target.classList.remove("ring-2", "ring-blue-500");
      }, 1200);
    }
  }, [selectedFindingId]);

  const handleValidate = async () => {
    if (!text.trim()) {
      setStatus("Paste article text before validating.");
      return;
    }
    setIsLoading(true);
    setStatus(null);
    setSelectedFindingId(null);
    setResult(null);
    
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, useLLM })
      });
      if (!response.ok) {
        throw new Error("Validation failed");
      }
      const data = (await response.json()) as ValidationResult;
      setResult(data);
    } catch {
      setStatus("Validation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (finding: ValidationFinding) => {
    if (!finding.suggestion) return;
    setText((prev) => prev.slice(0, finding.start) + finding.suggestion + prev.slice(finding.end));
    setStatus("Suggestion applied. Re-run validation for updated results.");
    setResult(null);
  };

  const handleCopyJson = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setStatus("Report copied to clipboard.");
  };

  const handleDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "validation-report.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex h-full gap-6 p-8 ${className ?? ""}`}>
      {/* Left Side - Input */}
      <div className="pane flex w-1/2 flex-col overflow-hidden rounded-3xl">
        <div className="pane-header px-8 py-5">
          <h2 className="text-lg font-semibold text-slate-100">
            AP Style Validator
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Paste your article below
          </p>
        </div>
        
        <div className="flex flex-1 flex-col p-8">
          <textarea
            className="input flex-1 resize-none rounded-2xl px-5 py-4 text-[15px] leading-relaxed text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            placeholder="Paste your article text here..."
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="button rounded-xl px-5 py-2.5 text-sm font-medium hover:brightness-105"
                onClick={() => setText(sampleArticle)}
              >
                Load Sample
              </button>
              
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={useLLM}
                  onChange={(event) => setUseLLM(event.target.checked)}
                />
                AI refinement
              </label>
            </div>
            
            <button
              className="button button-primary rounded-xl px-6 py-2.5 text-sm font-semibold hover:brightness-105 disabled:opacity-50"
              onClick={handleValidate}
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? "Analyzing..." : "Validate"}
            </button>
          </div>
          
          {status && (
            <p className="mt-3 text-sm text-amber-400">{status}</p>
          )}
        </div>
      </div>

      {/* Right Side - Results */}
      <div className="pane flex w-1/2 flex-col overflow-hidden rounded-3xl">
        <div className="pane-header px-8 py-5">
          <h2 className="text-lg font-semibold text-slate-100">Results</h2>
          <p className="mt-1 text-sm text-slate-400">
            Validation findings and score
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          {/* Welcome State */}
          {!result && !isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="card max-w-sm rounded-2xl p-7 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-4 text-sm text-slate-200">Results will appear here</p>
                <p className="mt-1 text-xs text-slate-400">Paste text and click Validate</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <div className="card rounded-2xl p-7">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-slate-200">Analyzing your article...</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-2 w-3/4 animate-pulse rounded bg-slate-200/70"></div>
                  <div className="h-2 w-1/2 animate-pulse rounded bg-slate-200/70"></div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Score Card */}
              <div className="card rounded-2xl p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400">
                      Overall Score
                    </h3>
                    <p className="mt-1 text-5xl font-semibold text-slate-100">
                      {result.score}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-300">
                    {result.meta.model || "Rules only"}
                  </span>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {Object.entries(result.categories).map(([category, entry]) => (
                    <div key={category} className="surface rounded-xl p-3">
                      <p className="text-xs font-medium text-slate-400">
                        {category}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-slate-100">
                        {entry.score}
                      </p>
                      <p className="text-xs text-slate-400">
                        {entry.count} {entry.count === 1 ? "issue" : "issues"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Findings */}
              <div className="card rounded-2xl p-7">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-100">
                    Findings ({result.findings.length})
                  </h3>
                  <div className="flex gap-2 text-xs">
                    {(["definite", "potential", "review"] as const).map(
                      (severity) => (
                      <label key={severity} className="flex items-center gap-1 text-slate-400">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={filters[severity]}
                          onChange={(e) =>
                            setFilters((prev) => ({ ...prev, [severity]: e.target.checked }))
                          }
                        />
                        <span className="hidden sm:inline">{severityLabels[severity]}</span>
                        <span className="sm:hidden">{severity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredFindings.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">
                      No findings match the selected filters
                    </p>
                  ) : (
                    filteredFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className="surface rounded-xl p-5 transition hover:brightness-105"
                      >
                        <div className="mb-2 flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-100">
                              {finding.category}
                            </p>
                            <p className="text-xs text-slate-400">
                              {severityLabels[finding.severity]} · {Math.round(finding.confidence * 100)}% confidence
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="button rounded-lg px-3 py-1.5 text-xs font-medium hover:brightness-105"
                              onClick={() => setSelectedFindingId(finding.id)}
                            >
                              Locate
                            </button>
                            <button
                              className="button button-primary rounded-lg px-3 py-1.5 text-xs font-medium hover:brightness-105"
                              onClick={() => handleApplySuggestion(finding)}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-slate-200">
                          <p>
                            <span className="font-medium">Found:</span> "{finding.snippet}"
                          </p>
                          <p>
                            <span className="font-medium">Suggestion:</span> {finding.suggestion}
                          </p>
                          <p className="text-xs text-slate-400">{finding.rationale}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-5 flex gap-3 border-t border-white/40 pt-5">
                  <button
                    className="button rounded-xl px-4 py-2.5 text-sm font-medium hover:brightness-105"
                    onClick={handleCopyJson}
                  >
                    Copy JSON
                  </button>
                  <button
                    className="button rounded-xl px-4 py-2.5 text-sm font-medium hover:brightness-105"
                    onClick={handleDownloadJson}
                  >
                    Download JSON
                  </button>
                </div>
              </div>

              {/* Annotated Article */}
              <div className="card rounded-2xl p-7">
                <h3 className="mb-3 text-base font-semibold text-slate-100">
                  Annotated Article
                </h3>
                <div
                  className="surface rounded-xl p-5 text-sm leading-relaxed text-slate-200"
                  dangerouslySetInnerHTML={{ __html: result.annotatedText }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

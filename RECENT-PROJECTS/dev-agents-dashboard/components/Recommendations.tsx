export default function Recommendations() {
  const toolRecs = [
    {
      tool: "Google Antigravity",
      recommendation: "MONITOR",
      color: "yellow",
      rationale: "Impressive vision but public preview + no enterprise controls = too early for production. Watch for GA + governance announcements. If Google commits, could be disruptive. Risk: Product longevity uncertain."
    },
    {
      tool: "Claude Code",
      recommendation: "PILOT",
      color: "blue",
      rationale: "GA + multi-surface flexibility + strong reasoning. Best for terminal-centric teams and internal tooling. Constraint: Limit to non-regulated codebases until audit/compliance story matures."
    },
    {
      tool: "GitHub Copilot",
      recommendation: "ADOPT",
      color: "green",
      rationale: "Most production-ready, lowest risk, best governance. Ideal for enterprises already on GitHub. Custom agents unlock domain-specific workflows. Constraint: Agent mode is less autonomous than competitors—plan for human-in-loop."
    },
    {
      tool: "OpenAI Codex",
      recommendation: "PILOT",
      color: "blue",
      rationale: "Best for teams that need parallel agent workflows + strongest safety model. Constraint: macOS-only app limits rollout; CLI more broadly usable. Watch for cross-platform app + IDE integration depth."
    },
    {
      tool: "Cursor",
      recommendation: "ADOPT",
      color: "green",
      rationale: "Best-in-class IDE agent UX. Ideal for startups, product eng teams, and non-regulated code. Enforceable privacy mode makes it viable for many enterprises. Constraint: Requires editor switch—assess team buy-in first."
    }
  ];

  const questions = [
    {
      category: "Governance & Risk",
      questions: [
        "What code can agents access? (all repos, or scoped?)",
        "What audit trail exists when agents make changes?",
        "What happens if an agent introduces a vulnerability or breaks production?",
        "Do we have approval workflows for high-risk actions (deployments, infra, secrets)?"
      ]
    },
    {
      category: "Adoption Strategy",
      questions: [
        "Are we piloting with volunteers or mandating top-down?",
        "How do we measure productivity gains? (velocity, defect rates, developer sentiment?)",
        "What's our rollback plan if adoption stalls or creates more harm than good?"
      ]
    },
    {
      category: "Vendor Strategy",
      questions: [
        "Are we multi-homing (use multiple tools) or standardizing on one?",
        "What's our lock-in risk? (Cursor/Antigravity = high; Claude Code/Copilot = medium)",
        "Can we leverage existing contracts (GitHub Enterprise, ChatGPT Enterprise)?"
      ]
    },
    {
      category: "Team Readiness",
      questions: [
        "Do our senior engineers trust these tools enough to delegate?",
        "Do our junior engineers have enough fundamentals to review agent output?",
        "What training/onboarding is required?"
      ]
    },
    {
      category: "Competitive Timing",
      questions: [
        "Who are our competitors adopting? Are we falling behind?",
        "What's the cost of waiting 6-12 months? (Likely: 2-3x velocity gap)",
        "What's the cost of adopting too early? (Likely: IP exposure, security incidents)"
      ]
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Recommendations</h2>

      {/* Tool Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Tool-by-Tool Assessment</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolRecs.map((rec, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-3 mb-3">
                <h4 className="text-lg font-bold text-gray-900">{rec.tool}</h4>
                <span className={`px-4 py-1 rounded-full text-sm font-bold text-center ${
                  rec.color === 'green' ? 'bg-green-100 text-green-800' :
                  rec.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.recommendation}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{rec.rationale}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

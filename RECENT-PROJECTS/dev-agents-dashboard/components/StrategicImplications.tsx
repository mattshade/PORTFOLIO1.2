export default function StrategicImplications() {
  const implications = [
    {
      title: "The \"IDE Wars 2.0\" are here—but it's not about syntax highlighting anymore",
      content: "The competitive axis is shifting from \"best text editor\" to \"best agent runtime.\" Cursor and Antigravity are betting developers will switch editors for better agents. Copilot is betting GitHub integration makes IDE choice irrelevant. Claude Code and Codex are betting on agent orchestration layers that sit above the IDE.",
      implication: "Traditional IDE vendors (JetBrains, VS Code) face disruption unless they become first-class agent platforms. Expect rapid M&A or deep partnerships."
    },
    {
      title: "Convergence on \"Plan → Execute → Review\" pattern",
      content: "Every tool is converging on some version of: 1) Agent explores context and plans, 2) Agent executes multi-step changes, 3) Developer reviews and approves. Divergence is in how: Codex is most cautious (sandbox + approvals before execution), Cursor is most ergonomic (Plan mode + diff review UI), Antigravity is most ambitious (verification loop across surfaces), Copilot is most incremental (iteration with developer in loop).",
      implication: "The winner will balance autonomy with control. Too cautious (Codex?) creates friction. Too autonomous (Antigravity?) creates enterprise risk."
    },
    {
      title: "Enterprise governance is the dark horse differentiator",
      content: "Capabilities are converging rapidly (all have multi-file, multi-step, planning). But audit logs, data residency, role-based access, and compliance certifications are months-to-years behind. GitHub Copilot has a 12-18 month lead on enterprise governance maturity. Cursor is catching up with enforceable privacy mode. Antigravity, Claude Code, Codex lack public detail on audit/compliance.",
      implication: "For Fortune 500 adoption, enterprise readiness matters more than raw capability. Startups and SMBs can move faster with Cursor/Claude Code; enterprises will gravitate to Copilot by default unless others close the governance gap fast."
    },
    {
      title: "The \"agent ecosystem\" land grab is underway",
      content: "GitHub's custom agents + skills strategy is an attempt to become the \"app store for coding agents.\" OpenAI's Codex is trying similar with parallel agents + automations. Antigravity's \"agent-first platform\" language suggests ecosystem ambitions.",
      implication: "The company that standardizes agent interfaces (think: Apple App Store, AWS marketplace) captures long-term value. GitHub has the distribution advantage. OpenAI has the model advantage. Antigravity/Cursor have the IDE advantage."
    },
    {
      title: "The \"junior dev replacement\" narrative is wrong—this is about leveraging senior devs",
      content: "These tools don't replace junior engineers (who need mentorship, domain learning, judgment). They amplify senior engineers by automating the \"mechanical\" parts of implementation—multi-file refactors, test generation, boilerplate.",
      implication: "ROI is highest for senior/staff engineers on legacy codebases or large-scale migrations. Onboarding junior devs with agents may backfire (they learn agent limitations, not engineering fundamentals)."
    }
  ];

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Strategic Implications</h2>
      <div className="space-y-6">
        {implications.map((item, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-3 text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">{item.content}</p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm font-semibold text-blue-900">
                <span className="text-blue-600">→</span> {item.implication}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

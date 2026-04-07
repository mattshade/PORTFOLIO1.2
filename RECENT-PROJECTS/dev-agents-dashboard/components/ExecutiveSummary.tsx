export default function ExecutiveSummary() {
  const insights = [
    {
      title: "The autocomplete era is over",
      text: "All five players are racing toward \"agent as platform\"—not just code completion, but multi-step planning, execution, and verification. The competitive battlefield is shifting from \"suggest next line\" to \"finish the feature.\"",
      color: "blue"
    },
    {
      title: "Three distinct go-to-market strategies",
      text: "Embed in distribution (GitHub Copilot leveraging GitHub/IDE lock-in), Replace the IDE (Cursor, Google Antigravity as editor platforms), Agent control plane (OpenAI Codex, Claude Code as orchestration layers)",
      color: "purple"
    },
    {
      title: "Enterprise readiness is the new moat",
      text: "GitHub Copilot and Cursor have clear enterprise stories (audit logs, enforceable privacy, trust centers). Antigravity, Claude Code, and Codex lag on publicly documented governance controls—making them riskier for regulated industries despite strong capabilities.",
      color: "emerald"
    },
    {
      title: "The trust tax is real but unsolved",
      text: "Every tool requires human review for non-trivial changes. The winners will be whoever makes review/approval ergonomics feel natural rather than burdensome. Cursor's Plan+Review UI and Codex's approval policies are early attempts; no one has cracked it yet.",
      color: "amber"
    },
    {
      title: "Autonomy without guardrails is a non-starter",
      text: "Antigravity's agent capabilities are impressive but lack detail on safety controls. Codex's sandbox-by-default is the most conservative. Claude Code's \"checkpoints\" split the difference. Enterprises will demand Codex-level sandboxing with Cursor-level ergonomics.",
      color: "red"
    },
    {
      title: "GitHub is playing defense and offense",
      text: "Copilot is the only tool that owns both the code host and the agent layer. Custom agent ecosystem positioning threatens standalone tools. If GitHub succeeds, they become the \"system of record + AI workflow layer\"—the most defensible position long-term.",
      color: "indigo"
    },
    {
      title: "Ignoring this shift = 12-18 month productivity gap",
      text: "Early adopters report 2-3x velocity on refactors, migrations, and multi-file changes. The gap between agent-native teams and traditional workflows will compound quickly. But premature adoption without governance creates IP/security exposure.",
      color: "orange"
    }
  ];

  const getAccentColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      emerald: 'from-emerald-500 to-teal-500',
      amber: 'from-amber-500 to-yellow-500',
      red: 'from-red-500 to-orange-500',
      indigo: 'from-indigo-500 to-blue-500',
      orange: 'from-orange-500 to-red-500'
    };
    return colors[color] || 'from-gray-500 to-gray-600';
  };

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">Summary</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="group relative bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${getAccentColor(insight.color)} rounded-l-xl`}></div>
            <div className="pl-3">
              <h3 className="font-bold text-base mb-3 text-gray-900 leading-tight">{insight.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{insight.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

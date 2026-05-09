const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function CapabilityScorecard() {
  const tools = [
    {
      name: "Google Antigravity",
      shortName: "Antigravity",
      scores: { autonomy: 4, understanding: 3, safety: 2, trust: 2, production: 2, imageGen: 4 },
      total: 17,
      color: "amber",
      logo: `${BASE}/logos/antigravity.svg`
    },
    {
      name: "Claude Code",
      shortName: "Claude Code",
      scores: { autonomy: 4, understanding: 4, safety: 3, trust: 3, production: 3, imageGen: 3 },
      total: 20,
      color: "purple",
      logo: `${BASE}/logos/claude.svg`
    },
    {
      name: "GitHub Copilot",
      shortName: "Copilot",
      scores: { autonomy: 3, understanding: 4, safety: 3, trust: 4, production: 5, imageGen: 2 },
      total: 21,
      color: "blue",
      logo: `${BASE}/logos/copilot.svg`
    },
    {
      name: "OpenAI Codex",
      shortName: "Codex",
      scores: { autonomy: 5, understanding: 3, safety: 5, trust: 3, production: 3, imageGen: 4 },
      total: 23,
      color: "emerald",
      logo: `${BASE}/logos/codex.svg`
    },
    {
      name: "Cursor",
      shortName: "Cursor",
      scores: { autonomy: 4, understanding: 4, safety: 4, trust: 4, production: 4, imageGen: 3 },
      total: 23,
      color: "indigo",
      logo: `${BASE}/logos/cursor.svg`
    }
  ];

  const categories = [
    {
      key: 'autonomy',
      label: 'Autonomy',
      description: 'Can handle multi-step tasks independently'
    },
    {
      key: 'understanding',
      label: 'Codebase Understanding',
      description: 'Comprehends project structure and conventions'
    },
    {
      key: 'safety',
      label: 'Safety & Control',
      description: 'Guardrails and approval mechanisms'
    },
    {
      key: 'trust',
      label: 'Developer Trust',
      description: 'Transparency and reliability track record'
    },
    {
      key: 'production',
      label: 'Production Ready',
      description: 'Enterprise governance and maturity'
    },
    {
      key: 'imageGen',
      label: 'Image Generation',
      description: 'Generate/analyze images for UI, diagrams, and assets'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score === 5) return 'from-emerald-400 to-emerald-600';
    if (score === 4) return 'from-blue-400 to-blue-600';
    if (score === 3) return 'from-amber-400 to-amber-600';
    if (score === 2) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getToolColor = (color: string) => {
    switch (color) {
      case 'amber': return 'from-amber-500 to-amber-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'emerald': return 'from-emerald-500 to-emerald-600';
      case 'indigo': return 'from-indigo-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">Agent Capability Scorecard</h2>
        <p className="text-lg text-gray-600">Quantitative assessment across 6 critical dimensions</p>
      </div>

      {/* Desktop View - Card Grid */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-4 mb-8">
        {tools.map((tool, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 card-hover">
            <div className="mb-4">
              <div className={`flex items-center justify-center mb-3 ${tool.shortName === 'Codex' ? 'w-14 h-14' : 'w-12 h-12'}`}>
                <img
                  src={tool.logo}
                  alt={`${tool.shortName} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">{tool.shortName}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">{tool.total}</span>
                <span className="text-sm text-gray-500">/30</span>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => {
                const score = tool.scores[cat.key as keyof typeof tool.scores];
                return (
                  <div key={cat.key} className="group relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{cat.label.split(' ')[0]}</span>
                      <span className="text-sm font-bold text-gray-900">{score}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-300`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile/Tablet View - Category by Category */}
      <div className="lg:hidden space-y-6">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-lg text-gray-900 mb-1">{cat.label}</h3>
              <p className="text-sm text-gray-600">{cat.description}</p>
            </div>

            <div className="space-y-3">
              {tools.map((tool, toolIdx) => {
                const score = tool.scores[cat.key as keyof typeof tool.scores];
                return (
                  <div key={toolIdx} className="flex items-center gap-3">
                    <div className={`flex items-center justify-center flex-shrink-0 ${tool.shortName === 'Codex' ? 'w-10 h-10' : 'w-8 h-8'}`}>
                      <img
                        src={tool.logo}
                        alt={`${tool.shortName} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{tool.shortName}</span>
                        <span className="text-sm font-bold text-gray-900 ml-2">{score}/5</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreColor(score)}`}
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Scale explanation */}
      <div className="mt-8 flex items-center justify-center">
        <div className="inline-flex items-center gap-6 px-6 py-3 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600"></div>
            <span>1-2: Weak/Nascent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
            <span>3: Adequate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <span>4: Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <span>5: Industry-leading</span>
          </div>
        </div>
      </div>

      {/* Dimension Definitions */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-gray-900">Dimension Definitions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <h4 className="font-semibold text-sm text-gray-900">{cat.label}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-3 text-gray-900">Top Performers</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">1.</span>
              <span><strong>Cursor & Codex (23/30)</strong> — Tie: Cursor excels in balance, Codex leads in autonomy/safety/image capabilities</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span><strong>Copilot (21/30)</strong> — Dominates production readiness and developer trust</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-3 text-gray-900">Key Gaps</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-orange-600">⚠</span>
              <span><strong>Safety gap:</strong> Codex (5) sets the bar with OS sandboxing; Antigravity (2) lacks public detail</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600">⚠</span>
              <span><strong>Trust deficit:</strong> Antigravity (2) held back by preview status and unclear governance</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

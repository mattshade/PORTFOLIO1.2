import ToolLogo from './ToolLogo';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function ComparisonTable() {
  const tools = [
    {
      name: "Antigravity",
      fullName: "Google Antigravity",
      tagline: "Agent-first development platform",
      maturity: "Preview",
      maturityScore: 2,
      enterprise: false,
      risk: "High",
      riskScore: 3,
      autonomyScore: 4,
      color: "amber",
      logo: `${BASE}/logos/antigravity.svg`,
      fallbackLetter: "A",
      pros: ["Platform ambition", "Cross-surface agents", "End-to-end execution"],
      cons: ["Preview risk", "No enterprise controls", "IDE switch required"],
      imageGen: {
        support: "Yes",
        useCases: "UI mockups, diagrams, icons via Gemini integration"
      }
    },
    {
      name: "Claude Code",
      fullName: "Claude Code",
      tagline: "Agentic terminal-first coding",
      maturity: "GA",
      maturityScore: 4,
      enterprise: true,
      risk: "Medium",
      riskScore: 2,
      autonomyScore: 4,
      color: "purple",
      logo: `${BASE}/logos/claude.svg`,
      fallbackLetter: "C",
      pros: ["Terminal-native", "Multi-surface", "Strong reasoning"],
      cons: ["Limited audit story", "Less mature review UX"],
      imageGen: {
        support: "Limited",
        useCases: "Image analysis for debugging, documentation screenshots"
      }
    },
    {
      name: "Copilot",
      fullName: "GitHub Copilot",
      tagline: "AI assistant evolving to agent + skills",
      maturity: "Widely Adopted",
      maturityScore: 5,
      enterprise: true,
      risk: "Low",
      riskScore: 1,
      autonomyScore: 3,
      color: "blue",
      logo: `${BASE}/logos/copilot.svg`,
      fallbackLetter: "C",
      pros: ["GitHub integration", "Enterprise governance", "Agent ecosystem"],
      cons: ["Slower iteration", "Less autonomous"],
      imageGen: {
        support: "No",
        useCases: "Not a current focus; primarily code-centric"
      }
    },
    {
      name: "Codex",
      fullName: "OpenAI Codex",
      tagline: "Parallel coding agent command center",
      maturity: "Mixed",
      maturityScore: 3,
      enterprise: false,
      risk: "Medium",
      riskScore: 2,
      autonomyScore: 5,
      color: "emerald",
      logo: `${BASE}/logos/codex.svg`,
      fallbackLetter: "C",
      pros: ["Parallel agents", "Strongest sandbox", "Git workflows"],
      cons: ["macOS-only app", "Network-off default", "Less IDE integration"],
      imageGen: {
        support: "Yes",
        useCases: "DALL-E integration for UI components, wireframes, assets"
      }
    },
    {
      name: "Cursor",
      fullName: "Cursor",
      tagline: "AI code editor with independent agent",
      maturity: "GA",
      maturityScore: 4,
      enterprise: true,
      risk: "Medium",
      riskScore: 2,
      autonomyScore: 4,
      color: "indigo",
      logo: `${BASE}/logos/cursor.svg`,
      fallbackLetter: "C",
      pros: ["IDE-first UX", "Plan+Review", "Privacy controls"],
      cons: ["Vendor lock-in", "Model routing complexity"],
      imageGen: {
        support: "Limited",
        useCases: "Via model providers (GPT-4V, Claude) for design feedback"
      }
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      amber: 'bg-amber-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      indigo: 'bg-indigo-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'Low') return 'text-emerald-600 bg-emerald-50';
    if (risk === 'Medium') return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3 text-gray-900">Comparison</h2>
        <p className="text-lg text-gray-600">At-a-glance assessment across key dimensions</p>
      </div>

      {/* Visual Scorecard - Desktop Only */}
      <div className="hidden lg:block mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="grid grid-cols-3 gap-8 mb-8">
            {/* Maturity Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Maturity Level
              </h3>
              <div className="space-y-3">
                {tools.map((tool, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{tool.name}</span>
                      <span className="text-gray-500">{tool.maturity}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getColorClasses(tool.color)}`}
                        style={{ width: `${(tool.maturityScore / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Autonomy Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Agent Autonomy
              </h3>
              <div className="space-y-3">
                {tools.map((tool, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{tool.name}</span>
                      <span className="text-gray-500">{tool.autonomyScore}/5</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getColorClasses(tool.color)}`}
                        style={{ width: `${(tool.autonomyScore / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Chart */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Adoption Risk
              </h3>
              <div className="space-y-3">
                {tools.map((tool, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{tool.name}</span>
                      <span className="text-gray-500">{tool.risk}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          tool.riskScore === 1 ? 'bg-emerald-500' :
                          tool.riskScore === 2 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(tool.riskScore / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {tools.map((tool, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <ToolLogo
                  name={tool.name}
                  logo={tool.logo}
                  fallbackLetter={tool.fallbackLetter}
                  color={tool.color}
                />
                {tool.enterprise && (
                  <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-base text-gray-900 mb-1">{tool.name}</h3>
              <p className="text-xs text-gray-600 leading-snug">{tool.tagline}</p>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-medium text-gray-700">
                {tool.maturity}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(tool.risk)}`}>
                {tool.risk}
              </span>
            </div>

            {/* Pros & Cons */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">Strengths</span>
                </div>
                <ul className="space-y-1">
                  {tool.pros.map((pro, i) => (
                    <li key={i} className="text-xs text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-emerald-500">
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">Constraints</span>
                </div>
                <ul className="space-y-1">
                  {tool.cons.map((con, i) => (
                    <li key={i} className="text-xs text-gray-600 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-amber-500">
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 mb-2">
                  <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">Image Generation</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      tool.imageGen.support === 'Yes' ? 'bg-emerald-50 text-emerald-700' :
                      tool.imageGen.support === 'Limited' ? 'bg-amber-50 text-amber-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {tool.imageGen.support}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{tool.imageGen.useCases}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
          <span>Enterprise Ready</span>
        </div>
      </div>
    </section>
  );
}

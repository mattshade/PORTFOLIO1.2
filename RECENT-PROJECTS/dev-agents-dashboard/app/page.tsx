import ExecutiveSummary from '@/components/ExecutiveSummary'
import ComparisonTable from '@/components/ComparisonTable'
import CapabilityScorecard from '@/components/CapabilityScorecard'
import StrategicImplications from '@/components/StrategicImplications'
import Recommendations from '@/components/Recommendations'
import { Bot } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="relative border-b border-gray-200 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bot className="w-7 h-7 text-gray-700" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Developer Agent Competitive Analysis
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              February 2026
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div id="comparison">
          <ComparisonTable />
        </div>

        <div id="scorecard">
          <CapabilityScorecard />
        </div>

        <div id="summary">
          <ExecutiveSummary />
        </div>

        <div id="implications">
          <StrategicImplications />
        </div>

        <div id="recommendations">
          <Recommendations />
        </div>

        {/* Disclaimer */}
        <section className="mt-16 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <h3 className="font-bold text-xl mb-4 text-gray-900">Assumptions & Caveats</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Explicit assumptions made in this analysis:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Where tools lack public documentation on audit/governance (Antigravity, Claude Code, Codex), lower enterprise readiness is inferred. This may underestimate private enterprise offerings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>All tools will improve rapidly. The scorecard reflects today's documented state, not future potential.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>All tools use frontier models (GPT-4, Claude Sonnet 4.5, Gemini 2.0) with similar raw code generation quality. Differentiation is in workflow, controls, and integration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Developers will adopt tools that reduce friction (IDE-native) over tools requiring workflow changes, unless the productivity gain is 3x+.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Regulated industries (finance, healthcare, defense) will require explicit audit/compliance before adoption.</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">Where information is uncertain:</p>
              <p>Antigravity (almost everything about enterprise readiness), Claude Code (audit/compliance details), Codex (enterprise rollout maturity), and all tools (hallucination rates, code quality benchmarks, long-term reliability are not publicly quantified).</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                This analysis is based on publicly available documentation as of February 2026 and inferences from stated positioning. Actual enterprise offerings may include features not documented publicly. Validate with vendor enterprise sales teams before making procurement decisions.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Developer Agent Competitive Analysis</p>
              <p className="text-xs text-gray-500 mt-1">Last updated February 2026</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

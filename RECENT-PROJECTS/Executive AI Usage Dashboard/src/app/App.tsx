import { Users, UserCheck, TrendingUp, Sparkles, Github, Bot, MessageSquare } from 'lucide-react';
import { LicenseAllocationChart } from '@/app/components/LicenseAllocationChart';
import { ActiveUsersChart } from '@/app/components/ActiveUsersChart';
import { LicensedVsActivePanel } from '@/app/components/LicensedVsActivePanel';
import { ChatGPTUsagePanel } from '@/app/components/ChatGPTUsagePanel';

import fireflyLogo from '@/assets/14578e01e21026bfd388e99e48a28bb9f2a84299.png';
import copilotMsLogo from '@/assets/e793658a892984fffb242f1799ce98004fef049b.png';
import copilotGhLogo from '@/assets/3fe29f24369b13a226c9a98e9ecd27e28ecce4de.png';
import chatgptLogo from '@/assets/f1a5c32d7db6bec4f009610ecfa33878d0073736.png';
import slackLogo from '@/assets/slack-logo.png';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl text-gray-900 mb-1">AI Tools Usage Dashboard</h1>
              <p className="text-sm text-gray-600">Last Updated: January 29, 2026</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg">
              <img src={copilotGhLogo} alt="GitHub Copilot" className="h-5 sm:h-6 w-5 sm:w-6 object-contain" />
              <img src={copilotMsLogo} alt="Microsoft Copilot" className="h-6 sm:h-7 w-6 sm:w-7 object-contain" />
              <img src={chatgptLogo} alt="ChatGPT" className="h-5 sm:h-6 w-5 sm:w-6 object-contain" />
              <img src={fireflyLogo} alt="Adobe Firefly" className="h-5 sm:h-6 w-5 sm:w-6 object-contain" />
              <img src={slackLogo} alt="Slack AI" className="h-5 sm:h-6 w-5 sm:w-6 object-contain" />
              <span className="text-xs text-gray-600 ml-2">AI Tools</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6">
          {/* Slack AI Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-50 rounded-lg">
                <img src={slackLogo} alt="Slack AI" className="h-6 w-6 object-contain" />
              </div>
              <p className="text-sm text-gray-900 font-medium">Slack AI</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Users</p>
                <p className="text-2xl text-gray-900">650</p>
                <p className="text-xs text-gray-500 mt-1">Total observed users</p>
              </div>
            </div>
          </div>
          {/* Firefly Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 rounded-lg">
                <img src={fireflyLogo} alt="Adobe Firefly" className="h-5 w-5 object-contain" />
              </div>
              <p className="text-sm text-gray-900 font-medium">Adobe Firefly</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Licenses Purchased</p>
                <p className="text-2xl text-gray-900">500</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-1">Active Users</p>
                <p className="text-2xl text-gray-900">300</p>
                <p className="text-xs text-green-600 mt-1">60% utilization</p>
              </div>
            </div>
          </div>

          {/* GitHub Copilot Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <img src={copilotGhLogo} alt="GitHub Copilot" className="h-5 w-5 object-contain" />
              </div>
              <p className="text-sm text-gray-900 font-medium">GitHub Copilot</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Seats Allocated</p>
                <p className="text-2xl text-gray-900">175</p>
                <p className="text-xs text-gray-500 mt-1">160 Enabled, 15 Pending</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-1">Active Users</p>
                <p className="text-2xl text-gray-900">125</p>
                <p className="text-xs text-green-600 mt-1">71% utilization</p>
              </div>
            </div>
          </div>

          {/* Microsoft Copilot Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <img src={copilotMsLogo} alt="Microsoft Copilot" className="h-7 w-7 object-contain" />
              </div>
              <p className="text-sm text-gray-900 font-medium">Microsoft Copilot</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Seats Allocated</p>
                <p className="text-2xl text-gray-900">300</p>
                <p className="text-xs text-gray-500 mt-1">280 Enabled, 20 Pending</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-1">Active Users</p>
                <p className="text-2xl text-gray-900">150</p>
                <p className="text-xs text-amber-600 mt-1">50% utilization</p>
              </div>
            </div>
          </div>

          {/* ChatGPT Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-50 rounded-lg">
                <img src={chatgptLogo} alt="ChatGPT" className="h-6 w-6 object-contain" />
              </div>
              <p className="text-sm text-gray-900 font-medium">ChatGPT</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Licenses Allocated</p>
                <p className="text-2xl text-gray-900">700</p>
                <p className="text-xs text-gray-500 mt-1">700 Enabled, 100 Pending</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-1">Users with Activity (January)</p>
                <p className="text-2xl text-gray-900">575</p>
                <p className="text-xs text-green-600 mt-1">82% adoption of enabled licenses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Row: Active Users & License Allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ActiveUsersChart />
          <div className="lg:col-span-2">
            <LicenseAllocationChart />
          </div>
        </div>

        {/* Bottom Section: Licensed vs Active & ChatGPT Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <LicensedVsActivePanel />
          <ChatGPTUsagePanel />
        </div>

        {/* Footer Insights */}
        <div className="mt-6 sm:mt-8 bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm text-gray-900 mb-3">Key Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs">
            <div>
              <div className="text-gray-700 mb-1">Capacity Risk</div>
              <p className="text-gray-600">
                International Division at 90% Firefly capacity. Consider reallocating unused licenses from Corporate HQ (45% unused) or Regional Operations (40% unused).
              </p>
            </div>
            <div>
              <div className="text-gray-700 mb-1">Adoption Gap</div>
              <p className="text-gray-600">
                40% of allocated Copilot seats inactive. Target HQ Operations and Marketing teams for onboarding and training initiatives.
              </p>
            </div>
            <div>
              <div className="text-gray-700 mb-1">Power User Pattern</div>
              <p className="text-gray-600">
                Analytics and Editorial teams show highest ChatGPT engagement with project creation, indicating mature workflow integration.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300 text-xs text-gray-600 space-y-1">
            <p>Firefly licenses reflect purchased allocations. Copilot allocation data includes Enabled and Pending licenses.</p>
            <p>ChatGPT: 700 enabled licenses, 100 pending users (invited but not signed in). January activity: 575 users (82% adoption).</p>
            <p>Active users represent recorded activity and are not time-bounded unless specified.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
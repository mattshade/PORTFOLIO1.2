import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, Github, Bot, MessageSquare } from 'lucide-react';

import fireflyLogo from '@/assets/14578e01e21026bfd388e99e48a28bb9f2a84299.png';
import copilotMsLogo from '@/assets/e793658a892984fffb242f1799ce98004fef049b.png';
import copilotGhLogo from '@/assets/3fe29f24369b13a226c9a98e9ecd27e28ecce4de.png';
import chatgptLogo from '@/assets/f1a5c32d7db6bec4f009610ecfa33878d0073736.png';
import slackLogo from '@/assets/slack-logo.png';

interface ToolData {
  name: string;
  activeUsers: number;
  allocatedLicenses: number;
  contextLabel: string;
  color: string;
  icon: string;
  tooltip?: string;
}

const toolData: ToolData[] = [
  {
    name: 'Slack AI',
    activeUsers: 650,
    allocatedLicenses: 650,
    contextLabel: 'Total active users',
    color: '#e01e5a',
    icon: 'Slack',
    tooltip: 'High engagement across workspaces.'
  },
  {
    name: 'ChatGPT',
    activeUsers: 575,
    allocatedLicenses: 700,
    contextLabel: 'Users with Activity (January)',
    color: '#10b981',
    icon: 'MessageSquare',
    tooltip: 'Usage-based licensing model. 700 enabled licenses, 100 pending users (invited but not signed in).'
  },
  {
    name: 'Adobe Firefly',
    activeUsers: 300,
    allocatedLicenses: 500,
    contextLabel: 'of 500 purchased licenses',
    color: '#ef4444',
    icon: 'Sparkles',
    tooltip: 'Firefly licenses are purchased, not provisioned.'
  },
  {
    name: 'Microsoft Copilot',
    activeUsers: 150,
    allocatedLicenses: 300,
    contextLabel: 'of 300 allocated seats',
    color: '#8b5cf6',
    icon: 'Bot',
    tooltip: 'Seats include enabled and pending users.'
  },
  {
    name: 'GitHub Copilot',
    activeUsers: 125,
    allocatedLicenses: 175,
    contextLabel: 'of 175 allocated seats',
    color: '#3b82f6',
    icon: 'Github',
    tooltip: 'Seats include enabled and pending users.'
  },
];

export function ActiveUsersChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm text-gray-900 mb-1">Observed Users by Tool</h3>
        <p className="text-xs text-gray-500">Ranked by observed user counts. Context shown against allocated licenses.</p>
      </div>

      <div className="space-y-3">
        {toolData.map((tool, index) => {
          const coveragePercent = (tool.activeUsers / tool.allocatedLicenses) * 100;

          return (
            <div
              key={tool.name}
              className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors"
              title={tool.tooltip}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-50 rounded text-xs font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <div className={`flex items-center justify-center ${tool.name === 'ChatGPT' || tool.name === 'Microsoft Copilot' ? 'w-7 h-7' : 'w-5 h-5'} ${tool.color.includes('10b981') ? 'text-green-600' : tool.color.includes('ef4444') ? 'text-red-500' : tool.color.includes('8b5cf6') ? 'text-purple-600' : 'text-gray-700'}`}>
                    {tool.icon === 'Sparkles' && <img src={fireflyLogo} alt="Adobe Firefly" className="w-full h-full object-contain" />}
                    {tool.icon === 'Github' && <img src={copilotGhLogo} alt="GitHub Copilot" className="w-full h-full object-contain" />}
                    {tool.icon === 'Bot' && <img src={copilotMsLogo} alt="Microsoft Copilot" className="w-full h-full object-contain" />}
                    {tool.icon === 'MessageSquare' && <img src={chatgptLogo} alt="ChatGPT" className="w-full h-full object-contain" />}
                    {tool.icon === 'Slack' && <img src={slackLogo} alt="Slack AI" className="w-full h-full object-contain" />}
                  </div>
                  <span className="text-xs text-gray-700">{tool.name}</span>
                </div>
                <div className="text-lg text-gray-900 font-medium">{tool.activeUsers}</div>
              </div>

              <div className="pl-8">
                <p className="text-xs text-gray-500 mb-2">{tool.contextLabel}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${coveragePercent}%`,
                      backgroundColor: '#6b7280'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
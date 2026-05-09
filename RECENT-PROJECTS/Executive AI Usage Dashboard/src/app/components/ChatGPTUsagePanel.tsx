import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MessageSquare, FolderKanban } from 'lucide-react';

import chatgptLogo from '@/assets/f1a5c32d7db6bec4f009610ecfa33878d0073736.png';

const data = [
  { department: 'Analytics', messages: 3500, projects: 30 },
  { department: 'Editorial', messages: 3000, projects: 30 },
  { department: 'Marketing', messages: 2500, projects: 20 },
  { department: 'Operations', messages: 2000, projects: 20 },
  { department: 'Product', messages: 2000, projects: 25 },
  { department: 'Engineering', messages: 1500, projects: 15 },
  { department: 'Sales', messages: 1000, projects: 10 },
];

export function ChatGPTUsagePanel() {
  const totalMessages = data.reduce((sum, item) => sum + item.messages, 0);
  const totalProjects = data.reduce((sum, item) => sum + item.projects, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm h-full">
      <div className="mb-4 flex items-center gap-3">
        <img src={chatgptLogo} alt="ChatGPT" className="h-7 sm:h-9 w-7 sm:w-9 object-contain flex-shrink-0" />
        <div>
          <h3 className="text-sm text-gray-900 mb-1">ChatGPT Usage Depth</h3>
          <p className="text-xs text-gray-500">All-time cumulative data</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700">Total Messages</span>
          </div>
          <p className="text-2xl text-green-700">{totalMessages.toLocaleString()}</p>
          <p className="text-xs text-gray-600 mt-1">Across 500 users with activity</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderKanban className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-700">Projects Created</span>
          </div>
          <p className="text-2xl text-purple-700">{totalProjects}</p>
          <p className="text-xs text-gray-600 mt-1">Advanced feature adoption</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis
            type="category"
            dataKey="department"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="square"
          />
          <Bar dataKey="messages" fill="#10b981" name="Messages" radius={[0, 4, 4, 0]} />
          <Bar dataKey="projects" fill="#8b5cf6" name="Projects" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">Top Power Users</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-900">Analytics Team</span>
            <span className="text-gray-600">~120 msgs/user</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-900">Editorial Team</span>
            <span className="text-gray-600">~100 msgs/user</span>
          </div>
        </div>
      </div>
    </div>
  );
}
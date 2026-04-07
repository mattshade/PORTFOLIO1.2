import { Users, UserCheck, Github } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import copilotGhLogo from '@/assets/3fe29f24369b13a226c9a98e9ecd27e28ecce4de.png';

const data = [
  { segment: 'Corporate HQ', enabled: 40, pending: 5, allocated: 45, active: 30, inactive: 15 },
  { segment: 'Regional Operations', enabled: 80, pending: 5, allocated: 85, active: 65, inactive: 20 },
  { segment: 'International Division', enabled: 40, pending: 5, allocated: 45, active: 30, inactive: 15 },
];

export function LicensedVsActivePanel() {
  const totalAllocated = data.reduce((sum, item) => sum + item.allocated, 0);
  const totalActive = data.reduce((sum, item) => sum + item.active, 0);
  const utilizationRate = ((totalActive / totalAllocated) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm h-full">
      <div className="mb-4 flex items-center gap-3">
        <img src={copilotGhLogo} alt="GitHub Copilot" className="h-6 sm:h-7 w-6 sm:w-7 object-contain flex-shrink-0" />
        <div>
          <h3 className="text-sm text-gray-900 mb-1">GitHub Copilot Seats by Segment</h3>
          <p className="text-xs text-gray-500">Allocated seats vs Active (≥1 interaction)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">Seats Allocated</span>
          </div>
          <p className="text-2xl text-gray-900">{totalAllocated}</p>
          <p className="text-xs text-gray-500 mt-1">{data.reduce((sum, item) => sum + item.enabled, 0)} Enabled, {data.reduce((sum, item) => sum + item.pending, 0)} Pending</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700">Active Users</span>
          </div>
          <p className="text-2xl text-blue-700">{totalActive}</p>
          <p className="text-xs text-blue-600 mt-1">{utilizationRate}% utilization</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="segment"
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
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
          <Bar dataKey="active" fill="#3b82f6" name="Active" radius={[4, 4, 0, 0]} />
          <Bar dataKey="inactive" fill="#e5e7eb" name="Inactive Seats" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
        {data.map((item) => {
          const utilization = ((item.active / item.allocated) * 100).toFixed(0);
          return (
            <div key={item.segment} className="flex items-center justify-between text-xs">
              <span className="text-gray-600">{item.segment}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">{item.active} of {item.allocated}</span>
                <span className="text-gray-900">{utilization}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
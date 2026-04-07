import { TrendingUp, TrendingDown, Minus, Github } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EngagementData {
  business: string;
  activeUsers: number;
  avgActiveDays: number;
  totalPrompts: number;
  engagementLevel: 'high' | 'medium' | 'low';
}

const data: EngagementData[] = [
  { business: 'Corporate Digital', activeUsers: 15, avgActiveDays: 8.0, totalPrompts: 900, engagementLevel: 'high' },
  { business: 'Regional Operations', activeUsers: 55, avgActiveDays: 8.0, totalPrompts: 4000, engagementLevel: 'high' },
  { business: 'International Division', activeUsers: 20, avgActiveDays: 9.0, totalPrompts: 2500, engagementLevel: 'high' },
  { business: 'Content & Editorial', activeUsers: 15, avgActiveDays: 4.0, totalPrompts: 500, engagementLevel: 'medium' },
  { business: 'HQ Operations', activeUsers: 5, avgActiveDays: 3.0, totalPrompts: 200, engagementLevel: 'low' },
  { business: 'Marketing', activeUsers: 5, avgActiveDays: 3.0, totalPrompts: 150, engagementLevel: 'low' },
];

const getEngagementColor = (level: string) => {
  switch (level) {
    case 'high': return '#3b82f6';
    case 'medium': return '#f59e0b';
    case 'low': return '#ef4444';
    default: return '#9ca3af';
  }
};

export function CopilotEngagementTable() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="mb-4 sm:mb-6 flex items-center gap-3">
        <Github className="h-6 sm:h-8 w-6 sm:w-8 text-gray-700 flex-shrink-0" />
        <div>
          <h3 className="text-sm text-gray-900 mb-1">GitHub Copilot Engagement by Sub-Business</h3>
          <p className="text-xs text-gray-500">Active = ≥1 chat or code completion (cumulative)</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs text-gray-600">Business Unit</th>
              <th className="text-right py-3 px-4 text-xs text-gray-600">Active Users</th>
              <th className="text-right py-3 px-4 text-xs text-gray-600">Avg Active Days</th>
              <th className="text-right py-3 px-4 text-xs text-gray-600">Total Prompts</th>
              <th className="text-right py-3 px-4 text-xs text-gray-600">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={row.business} 
                className={`border-b border-gray-100 ${
                  row.engagementLevel === 'high' ? 'bg-blue-50/30' : 
                  row.engagementLevel === 'low' ? 'bg-red-50/30' : ''
                }`}
              >
                <td className="py-3 px-4 text-gray-900">{row.business}</td>
                <td className="py-3 px-4 text-right text-gray-900">{row.activeUsers}</td>
                <td className="py-3 px-4 text-right text-gray-900">{row.avgActiveDays}</td>
                <td className="py-3 px-4 text-right text-gray-900">{row.totalPrompts.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {row.engagementLevel === 'high' && (
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    )}
                    {row.engagementLevel === 'low' && (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    {row.engagementLevel === 'medium' && (
                      <Minus className="w-4 h-4 text-orange-600" />
                    )}
                    <span 
                      className="inline-block px-2 py-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${getEngagementColor(row.engagementLevel)}15`,
                        color: getEngagementColor(row.engagementLevel)
                      }}
                    >
                      {row.engagementLevel}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis 
              type="category" 
              dataKey="business" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              width={100}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="activeUsers" name="Active Users" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getEngagementColor(entry.engagementLevel)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        <p className="text-xs text-gray-600 mt-4">
          Engagement metrics reflect usage intensity among active users only and are not normalized by total seats.
        </p>
      </div>
    </div>
  );
}
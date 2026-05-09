import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

import fireflyLogo from '@/assets/14578e01e21026bfd388e99e48a28bb9f2a84299.png';

interface LicenseData {
  segment: string;
  purchased: number;
  remaining: number;
  total: number;
  utilizationRate: number;
}

const data: LicenseData[] = [
  { segment: 'Corporate HQ', purchased: 70, remaining: 55, total: 125, utilizationRate: 55 },
  { segment: 'Regional Operations', purchased: 170, remaining: 110, total: 280, utilizationRate: 60 },
  { segment: 'International Division', purchased: 80, remaining: 10, total: 90, utilizationRate: 90 },
];

export function LicenseAllocationChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm h-full">
      <div className="mb-4 flex items-center gap-3">
        <img src={fireflyLogo} alt="Adobe Firefly" className="h-6 sm:h-8 w-6 sm:w-8 object-contain flex-shrink-0" />
        <div>
          <h3 className="text-sm text-gray-900 mb-1">Firefly License Allocation by Segment</h3>
          <p className="text-xs text-gray-500">Purchased licenses vs Remaining</p>
        </div>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              stroke="#e5e7eb"
            />
            <YAxis
              type="category"
              dataKey="segment"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              width={80}
              stroke="#e5e7eb"
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
            <Bar dataKey="purchased" stackId="a" fill="#3b82f6" name="Purchased" radius={[0, 4, 4, 0]} />
            <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" name="Remaining" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((item) => (
          <div key={item.segment} className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{item.segment}</span>
            <div className="flex items-center gap-2">
              <span className={`${item.utilizationRate >= 90 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                {item.utilizationRate}% utilized
              </span>
              {item.utilizationRate >= 90 && (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
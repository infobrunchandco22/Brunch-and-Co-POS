import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../lib/utils';

interface OrdersChartProps {
  data: {
    time: string;
    count: number;
    revenue: number;
  }[];
}

export const OrdersChart: React.FC<OrdersChartProps> = ({ data }) => {
  const [metric, setMetric] = useState<'revenue' | 'count'>('revenue');

  return (
    <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-headline-lg font-bold text-base text-[#000000]">
            Today's Peak Hours & Sales
          </h3>
          <p className="text-xs text-[#7a4900]">Order volume and revenue breakdown by hour</p>
        </div>

        <div className="flex items-center bg-[#F6F1EB] p-1 rounded-xl border border-[#000000]/10 text-xs">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              metric === 'revenue'
                ? 'bg-[#3d2500] text-[#FFFDF7] font-semibold shadow-xs'
                : 'text-[#7a4900] hover:text-[#000000]'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('count')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              metric === 'count'
                ? 'bg-[#3d2500] text-[#FFFDF7] font-semibold shadow-xs'
                : 'text-[#7a4900] hover:text-[#000000]'
            }`}
          >
            Order Volume
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 w-full flex items-center justify-center text-[#7a4900] text-xs">
          No order history data yet. Connect a database to see live stats.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7a4900" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7a4900" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#000000/10" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#7a4900"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
              />
              <YAxis
                stroke="#7a4900"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (metric === 'revenue' ? `Rs ${val / 1000}k` : val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  color: '#000000',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(val: any) => [
                  metric === 'revenue' ? formatCurrency(Number(val)) : `${val} Orders`,
                  metric === 'revenue' ? 'Revenue' : 'Orders',
                ]}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#3d2500"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

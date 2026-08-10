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
    <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-headline-lg font-bold text-base text-[#e5e2e1]">
            Today's Peak Hours & Sales
          </h3>
          <p className="text-xs text-[#9f8d85]">Order volume and revenue breakdown by hour</p>
        </div>

        <div className="flex items-center bg-[#131313] p-1 rounded-xl border border-[#353534] text-xs">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              metric === 'revenue'
                ? 'bg-[#6e4025] text-[#eeae8b] font-semibold'
                : 'text-[#9f8d85] hover:text-[#e5e2e1]'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('count')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              metric === 'count'
                ? 'bg-[#6e4025] text-[#eeae8b] font-semibold'
                : 'text-[#9f8d85] hover:text-[#e5e2e1]'
            }`}
          >
            Order Volume
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 w-full flex items-center justify-center text-[#9f8d85] text-xs">
          No order history data yet. Connect a database to see live stats.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fab895" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fab895" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#9f8d85"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#353534' }}
              />
              <YAxis
                stroke="#9f8d85"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (metric === 'revenue' ? `Rs ${val / 1000}k` : val)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#201f1f',
                  borderColor: '#52443d',
                  borderRadius: '12px',
                  color: '#e5e2e1',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(val: any) => [
                  metric === 'revenue' ? formatCurrency(Number(val)) : `${val} Orders`,
                  metric === 'revenue' ? 'Revenue' : 'Orders',
                ]}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#fab895"
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

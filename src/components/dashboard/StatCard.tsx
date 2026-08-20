import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  changePct: number;
  icon: LucideIcon;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  changePct,
  icon: Icon,
  subtitle,
}) => {
  const isPositive = changePct >= 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#000000]/10 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-[#3d2500]/40 transition-all duration-200">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#000000] via-[#3d2500] to-[#7a4900] opacity-30 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex items-start justify-between">
        <span className="text-xs font-label-caps uppercase tracking-wider text-[#7a4900]">
          {title}
        </span>
        <div className="w-9 h-9 rounded-xl bg-[#F6F1EB] border border-[#000000]/10 flex items-center justify-center text-[#3d2500] shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-bold font-headline-lg text-[#000000] tracking-tight">
          {value}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div
          className={`flex items-center space-x-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? `+${changePct}%` : `${changePct}%`}</span>
        </div>
        <span className="text-[#7a4900] text-[11px]">{subtitle || 'vs last week'}</span>
      </div>
    </div>
  );
};

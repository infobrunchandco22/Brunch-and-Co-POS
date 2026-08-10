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
    <div className="bg-[#1c1b1b] border border-[#353534] rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-[#52443d] transition-all duration-200">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6e4025] via-[#fab895] to-[#574939] opacity-40 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex items-start justify-between">
        <span className="text-xs font-label-caps uppercase tracking-wider text-[#9f8d85]">
          {title}
        </span>
        <div className="w-9 h-9 rounded-xl bg-[#2a2a2a] border border-[#353534] flex items-center justify-center text-[#fab895] shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-2xl font-bold font-headline-lg text-[#e5e2e1] tracking-tight">
          {value}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div
          className={`flex items-center space-x-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
            isPositive
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
              : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? `+${changePct}%` : `${changePct}%`}</span>
        </div>
        <span className="text-[#9f8d85] text-[11px]">{subtitle || 'vs last week'}</span>
      </div>
    </div>
  );
};

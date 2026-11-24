import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  change?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  subtext?: string;
  status?: {
    label: string;
    variant: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue';
  };
  onClick?: () => void;
  className?: string;
}

const statusColorMap = {
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  blue: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  iconBgColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  change,
  subtext,
  status,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel p-4 sm:p-5 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 relative group overflow-hidden ${
        onClick ? 'cursor-pointer hover:bg-slate-850/80 hover:translate-y-[-1px]' : ''
      } ${className}`}
    >
      {/* Background soft ambient gradient */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-300" />

      <div className="flex items-start justify-between gap-3 mb-2.5">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 truncate">
          {title}
        </span>
        <div
          className={`p-2 rounded-lg border shrink-0 transition-transform duration-200 group-hover:scale-110 ${iconBgColor}`}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-800/50">
        {change ? (
          <div className="flex items-center gap-1 font-medium">
            <span className={change.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
              {change.isPositive ? '↑' : '↓'} {change.value}
            </span>
            {change.label && <span className="text-slate-400">{change.label}</span>}
          </div>
        ) : subtext ? (
          <span className="text-slate-400 truncate">{subtext}</span>
        ) : (
          <span className="text-slate-500">Real-time sync</span>
        )}

        {status && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              statusColorMap[status.variant]
            }`}
          >
            {status.label}
          </span>
        )}
      </div>
    </div>
  );
};

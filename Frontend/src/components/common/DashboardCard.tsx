import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "indigo" | "emerald" | "amber" | "rose" | "cyan" | "purple";
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "indigo",
}) => {
  const colorMap = {
    indigo: "bg-blue-950/80 text-blue-400 border-blue-500/30",
    emerald: "bg-emerald-950/80 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-950/80 text-amber-400 border-amber-500/30",
    rose: "bg-rose-950/80 text-rose-400 border-rose-500/30",
    cyan: "bg-cyan-950/80 text-cyan-400 border-cyan-500/30",
    purple: "bg-purple-950/80 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md transition-all hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[color]}`}>{icon}</div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;

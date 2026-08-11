import React from "react";

interface BadgeProps {
  status: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = "" }) => {
  const norm = (status || "").toUpperCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";

  switch (norm) {
    case "ACTIVE":
    case "CONFIRMED":
    case "PAID":
    case "AVAILABLE":
    case "LIVE":
    case "SUCCESS":
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200 font-bold";
      break;
    case "PENDING":
    case "RESERVED":
    case "EXPIRING":
      styles = "bg-amber-50 text-amber-700 border-amber-200 font-bold";
      break;
    case "OCCUPIED":
    case "SUSPENDED":
    case "FAILED":
    case "EXPIRED":
      styles = "bg-rose-50 text-rose-700 border-rose-200 font-bold";
      break;
    case "COMPLETED":
      styles = "bg-blue-50 text-blue-700 border-blue-200 font-bold";
      break;
    case "CANCELLED":
    case "MAINTENANCE":
    case "INACTIVE":
      styles = "bg-slate-100 text-slate-600 border-slate-200 font-semibold";
      break;
    case "ADMIN":
      styles = "bg-purple-50 text-purple-700 border-purple-200 font-bold";
      break;
    case "OWNER":
      styles = "bg-blue-50 text-blue-700 border-blue-200 font-bold";
      break;
    case "EMPLOYEE":
      styles = "bg-cyan-50 text-cyan-700 border-cyan-200 font-bold";
      break;
    case "CUSTOMER":
      styles = "bg-teal-50 text-teal-700 border-teal-200 font-bold";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 opacity-80"></span>
      {status}
    </span>
  );
};

export default Badge;

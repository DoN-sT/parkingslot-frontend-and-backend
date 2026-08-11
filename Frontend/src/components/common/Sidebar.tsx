import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  User,
  Building2,
  Grid,
  Users,
  BarChart3,
  QrCode,
  CheckCircle2,
  Activity,
  ShieldAlert,
  CreditCard,
  Building
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors duration-150 ${
      isActive
        ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 font-semibold"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 shrink-0 hidden md:flex flex-col min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-6">
        {/* CUSTOMER LINKS */}
        {role === "CUSTOMER" && (
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Customer Portal
            </p>
            <div className="space-y-1">
              <NavLink to="/customer" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </NavLink>
              <NavLink to="/customer/search" className={linkClass}>
                <Search className="w-4 h-4" /> Find Parking
              </NavLink>
              <NavLink to="/customer/bookings" className={linkClass}>
                <CalendarCheck className="w-4 h-4" /> My Bookings
              </NavLink>
              <NavLink to="/customer/profile" className={linkClass}>
                <User className="w-4 h-4" /> Profile
              </NavLink>
            </div>
          </div>
        )}

        {/* OWNER LINKS */}
        {role === "OWNER" && (
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Facility Owner
            </p>
            <div className="space-y-1">
              <NavLink to="/owner" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" /> Overview
              </NavLink>
              <NavLink to="/owner/parking" className={linkClass}>
                <Building2 className="w-4 h-4" /> Parking Lots
              </NavLink>
              <NavLink to="/owner/slots" className={linkClass}>
                <Grid className="w-4 h-4" /> Slot Manager
              </NavLink>
              <NavLink to="/owner/bookings" className={linkClass}>
                <CalendarCheck className="w-4 h-4" /> All Bookings
              </NavLink>
              <NavLink to="/owner/employees" className={linkClass}>
                <Users className="w-4 h-4" /> Employees
              </NavLink>
              <NavLink to="/owner/analytics" className={linkClass}>
                <BarChart3 className="w-4 h-4" /> Analytics
              </NavLink>
            </div>
          </div>
        )}

        {/* EMPLOYEE LINKS */}
        {role === "EMPLOYEE" && (
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Gate Operations
            </p>
            <div className="space-y-1">
              <NavLink to="/employee" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" /> Gate Station
              </NavLink>
              <NavLink to="/employee/scanner" className={linkClass}>
                <QrCode className="w-4 h-4" /> QR Scanner
              </NavLink>
              <NavLink to="/employee/bookings" className={linkClass}>
                <CheckCircle2 className="w-4 h-4" /> Facility Bookings
              </NavLink>
              <NavLink to="/employee/activity" className={linkClass}>
                <Activity className="w-4 h-4" /> Activity Log
              </NavLink>
            </div>
          </div>
        )}

        {/* ADMIN LINKS */}
        {role === "ADMIN" && (
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Platform Admin
            </p>
            <div className="space-y-1">
              <NavLink to="/admin" end className={linkClass}>
                <LayoutDashboard className="w-4 h-4" /> Control Center
              </NavLink>
              <NavLink to="/admin/owners" className={linkClass}>
                <Building className="w-4 h-4" /> Owner Approvals
              </NavLink>
              <NavLink to="/admin/users" className={linkClass}>
                <Users className="w-4 h-4" /> Users Management
              </NavLink>
              <NavLink to="/admin/parking" className={linkClass}>
                <Building2 className="w-4 h-4" /> All Facilities
              </NavLink>
              <NavLink to="/admin/bookings" className={linkClass}>
                <CalendarCheck className="w-4 h-4" /> Platform Bookings
              </NavLink>
              <NavLink to="/admin/payments" className={linkClass}>
                <CreditCard className="w-4 h-4" /> Payment Audits
              </NavLink>
              <NavLink to="/admin/analytics" className={linkClass}>
                <BarChart3 className="w-4 h-4" /> Global Analytics
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

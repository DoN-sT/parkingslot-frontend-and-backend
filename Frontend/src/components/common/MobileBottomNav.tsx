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
  BarChart3,
  QrCode,
  CheckCircle2,
  Users,
  ShieldAlert
} from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const { user, role } = useAuth();

  if (!user) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center flex-1 py-1.5 px-1 text-[11px] font-semibold transition-colors ${
      isActive ? "text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
    }`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A] border-t border-slate-800 shadow-xl flex items-center justify-around h-16 px-2">
      {role === "CUSTOMER" && (
        <>
          <NavLink to="/customer" end className={linkClass}>
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/customer/search" className={linkClass}>
            <Search className="w-5 h-5 mb-0.5" />
            <span>Search</span>
          </NavLink>
          <NavLink to="/customer/bookings" className={linkClass}>
            <CalendarCheck className="w-5 h-5 mb-0.5" />
            <span>Passes</span>
          </NavLink>
          <NavLink to="/customer/profile" className={linkClass}>
            <User className="w-5 h-5 mb-0.5" />
            <span>Profile</span>
          </NavLink>
        </>
      )}

      {role === "OWNER" && (
        <>
          <NavLink to="/owner" end className={linkClass}>
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/owner/parking" className={linkClass}>
            <Building2 className="w-5 h-5 mb-0.5" />
            <span>Lots</span>
          </NavLink>
          <NavLink to="/owner/slots" className={linkClass}>
            <Grid className="w-5 h-5 mb-0.5" />
            <span>Slots</span>
          </NavLink>
          <NavLink to="/owner/analytics" className={linkClass}>
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>Metrics</span>
          </NavLink>
        </>
      )}

      {role === "EMPLOYEE" && (
        <>
          <NavLink to="/employee" end className={linkClass}>
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Gate</span>
          </NavLink>
          <NavLink to="/employee/scanner" className={linkClass}>
            <QrCode className="w-5 h-5 mb-0.5" />
            <span>Scanner</span>
          </NavLink>
          <NavLink to="/employee/bookings" className={linkClass}>
            <CheckCircle2 className="w-5 h-5 mb-0.5" />
            <span>Bookings</span>
          </NavLink>
        </>
      )}

      {role === "ADMIN" && (
        <>
          <NavLink to="/admin" end className={linkClass}>
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </NavLink>
          <NavLink to="/admin/owners" className={linkClass}>
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span>Approvals</span>
          </NavLink>
          <NavLink to="/admin/users" className={linkClass}>
            <Users className="w-5 h-5 mb-0.5" />
            <span>Users</span>
          </NavLink>
          <NavLink to="/admin/parking" className={linkClass}>
            <Building2 className="w-5 h-5 mb-0.5" />
            <span>Facilities</span>
          </NavLink>
        </>
      )}
    </div>
  );
};

export default MobileBottomNav;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "./Badge";
import {
  Car,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  Building2,
  QrCode,
  Users
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleColor = () => {
    switch (role) {
      case "ADMIN":
        return "text-purple-400";
      case "OWNER":
        return "text-indigo-400";
      case "EMPLOYEE":
        return "text-cyan-400";
      case "CUSTOMER":
      default:
        return "text-emerald-400";
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
              <Car className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                ParkingSpot
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                  LIVE
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-100 leading-tight">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                        {user.role}
                      </span>
                      {user.status && <Badge status={user.status} />}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-slate-800 px-4 pt-3 pb-5 space-y-4 shadow-xl animate-fadeIn">
          {user ? (
            <div className="space-y-4">
              {/* User profile banner */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <Badge status={user.role} />
              </div>

              {/* Quick Profile Link */}
              {role === "CUSTOMER" && (
                <Link
                  to="/customer/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-blue-400 transition border border-slate-800 bg-slate-900/50"
                >
                  <User className="w-4 h-4 text-blue-400" /> Account Settings & Profile
                </Link>
              )}

              {/* Sign out button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 p-2.5 rounded-lg text-xs font-bold transition"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-lg text-xs transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-xs shadow-sm transition"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

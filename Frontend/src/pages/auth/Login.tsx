import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import { Car, Lock, Mail, ShieldCheck, UserCheck, Key, AlertCircle } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      redirectUser(user.role);
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPass);
      redirectUser(user.role);
    } catch (err: any) {
      setError(err.message || "Failed demo login");
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role: string) => {
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    switch (role) {
      case "ADMIN":
        navigate("/admin", { replace: true });
        break;
      case "OWNER":
        navigate("/owner", { replace: true });
        break;
      case "EMPLOYEE":
        navigate("/employee", { replace: true });
        break;
      case "CUSTOMER":
      default:
        navigate("/customer", { replace: true });
        break;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#0B0F19]">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-500/30 mb-2">
            <Car className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to ParkingSpot</h2>
          <p className="text-xs text-slate-400 font-medium">Sign in to manage reservations, facilities & gate passes</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-blue-400 font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={loading} className="w-full py-2.5 text-xs">
            Sign In
          </Button>
        </form>

        {/* QUICK DEMO LOGIN BUTTONS FOR SHOWCASE */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            ⚡ Quick Demo Sign-In (Select Role)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("customer@parkingspot.com", "customer123")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <UserCheck className="w-3.5 h-3.5" /> Customer Demo
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("owner@parkingspot.com", "owner123")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 rounded-xl text-xs text-blue-400 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Car className="w-3.5 h-3.5" /> Owner Demo
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("employee@parkingspot.com", "emp123")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-xs text-cyan-400 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Key className="w-3.5 h-3.5" /> Employee Demo
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("admin@parkingspot.com", "admin123")}
              className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-xl text-xs text-purple-400 font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Demo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

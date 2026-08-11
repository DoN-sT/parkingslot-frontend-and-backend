import React, { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardCard from "../../components/common/DashboardCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Activity, Users, Building2, DollarSign, TrendingUp } from "lucide-react";

export const SystemAnalytics: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics");
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load admin analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const roleDistribution = [
    { name: "Customers", value: stats?.totalCustomers || 0, color: "#10b981" },
    { name: "Owners", value: stats?.totalOwners || 0, color: "#6366f1" },
    { name: "Employees", value: stats?.totalEmployees || 0, color: "#06b6d4" },
    { name: "Admins", value: 1, color: "#a855f7" },
  ];

  const platformGrowthData = [
    { month: "Jan", bookings: 450, revenue: 3200 },
    { month: "Feb", bookings: 680, revenue: 5400 },
    { month: "Mar", bookings: 920, revenue: 7800 },
    { month: "Apr", bookings: 1200, revenue: 11200 },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform Performance & Governance Metrics</h1>
        <p className="text-xs text-slate-400">Macro analytics on user acquisition, transaction volume and system health</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle="Registered accounts"
          icon={<Users className="w-5 h-5" />}
          color="indigo"
        />
        <DashboardCard
          title="Facilities"
          value={stats?.totalFacilities || 0}
          subtitle="Active lots"
          icon={<Building2 className="w-5 h-5" />}
          color="emerald"
        />
        <DashboardCard
          title="Total Platform GMV"
          value={`$${stats?.totalRevenue || 0}`}
          subtitle="Processed payments"
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
        <DashboardCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          subtitle="Awaiting review"
          icon={<Activity className="w-5 h-5" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Monthly Transaction GMV ($)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" /> User Role Demographics
          </h3>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {roleDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;

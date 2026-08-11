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
  Cell,
  LineChart,
  Line
} from "recharts";
import { TrendingUp, DollarSign, Percent, Grid, Building2 } from "lucide-react";

export const OwnerAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/owner/analytics");
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Error loading analytics:", err);
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

  // Mock chart data derived from owner stats
  const revenueData = [
    { name: "Mon", revenue: 120 },
    { name: "Tue", revenue: 210 },
    { name: "Wed", revenue: 180 },
    { name: "Thu", revenue: 290 },
    { name: "Fri", revenue: 340 },
    { name: "Sat", revenue: 450 },
    { name: "Sun", revenue: data?.todayRevenue || 380 },
  ];

  const occupancyPieData = [
    { name: "Available", value: data?.availableSlots || 20, color: "#10b981" },
    { name: "Reserved", value: data?.reservedSlots || 8, color: "#f59e0b" },
    { name: "Occupied", value: data?.occupiedSlots || 12, color: "#f43f5e" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Facility Revenue & Occupancy Analytics</h1>
        <p className="text-xs text-slate-400">In-depth statistical breakdown of parking facility performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Daily Revenue"
          value={`$${data?.todayRevenue || 0}`}
          subtitle="Real-time collection"
          icon={<DollarSign className="w-5 h-5" />}
          color="indigo"
        />
        <DashboardCard
          title="Occupancy Rate"
          value={`${data?.occupancyRate || 0}%`}
          subtitle="Capacity utilization"
          icon={<Percent className="w-5 h-5" />}
          color="emerald"
        />
        <DashboardCard
          title="Active Facility Lots"
          value={data?.totalParking || 0}
          subtitle={`${data?.totalSlots || 0} total bays`}
          icon={<Building2 className="w-5 h-5" />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Revenue Trend Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Weekly Revenue Trend ($)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-emerald-400" /> Live Slot Allocation
          </h3>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {occupancyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-xs">
            {occupancyPieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 font-semibold">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerAnalytics;

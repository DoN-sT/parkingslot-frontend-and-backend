import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardCard from "../../components/common/DashboardCard";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import {
  Building2,
  Grid,
  CalendarCheck,
  DollarSign,
  Users,
  Plus,
  BarChart3,
  TrendingUp,
  Percent,
  Activity
} from "lucide-react";

export const OwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/owner/analytics");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Error loading owner stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Facility Owner Portal</h1>
          <p className="text-xs text-slate-400">Monitor live parking bays, revenue, employee gate access & reservations</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/owner/parking">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Add Parking Facility
            </Button>
          </Link>
          <Link to="/owner/employees">
            <Button variant="outline" icon={<Users className="w-4 h-4" />}>
              Manage Employees
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Facilities"
          value={stats?.totalParking || 0}
          subtitle="Managed lots"
          icon={<Building2 className="w-5 h-5" />}
          color="indigo"
        />
        <DashboardCard
          title="Total Parking Bays"
          value={stats?.totalSlots || 0}
          subtitle={`${stats?.availableSlots || 0} available`}
          icon={<Grid className="w-5 h-5" />}
          color="emerald"
        />
        <DashboardCard
          title="Occupancy Rate"
          value={`${stats?.occupancyRate || 0}%`}
          subtitle="Real-time capacity utilization"
          icon={<Percent className="w-5 h-5" />}
          color="amber"
        />
        <DashboardCard
          title="Revenue Generated"
          value={`$${stats?.todayRevenue || 0}`}
          subtitle="Paid reservations"
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Bay Status Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" /> Real-time Slot Capacity Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
            <span className="text-xs text-emerald-400 font-semibold uppercase">Available Bays</span>
            <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.availableSlots || 0}</h4>
          </div>

          <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl">
            <span className="text-xs text-amber-400 font-semibold uppercase">Reserved Bays</span>
            <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.reservedSlots || 0}</h4>
          </div>

          <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl">
            <span className="text-xs text-rose-400 font-semibold uppercase">Occupied Bays</span>
            <h4 className="text-3xl font-extrabold text-white mt-1">{stats?.occupiedSlots || 0}</h4>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recent Customer Reservations</h3>
          <Link to="/owner/bookings" className="text-xs text-indigo-400 font-semibold hover:underline">
            View All Bookings →
          </Link>
        </div>

        {stats?.recentBookings?.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No recent customer bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Booking ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Bay No.</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats?.recentBookings?.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-indigo-400">{b.id}</td>
                    <td className="p-3 font-semibold text-white">{b.customerName}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{b.slotNumber}</td>
                    <td className="p-3 font-mono">{b.vehicleNumber}</td>
                    <td className="p-3 font-bold text-white">${b.totalAmount}</td>
                    <td className="p-3"><Badge status={b.bookingStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;

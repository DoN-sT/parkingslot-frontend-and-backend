import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import DashboardCard from "../../components/common/DashboardCard";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import {
  ShieldCheck,
  Users,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowRight
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/analytics");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load admin stats:", err);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">System Admin Console</h1>
          <p className="text-xs text-slate-400">Platform governance, facility approvals, user management & security logs</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/approvals">
            <Button variant="primary" icon={<ShieldCheck className="w-4 h-4" />}>
              Facility Approvals ({stats?.pendingApprovals || 0})
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="outline" icon={<Users className="w-4 h-4" />}>
              User Accounts
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Total Platform Users"
          value={stats?.totalUsers || 0}
          subtitle="Drivers, Owners & Employees"
          icon={<Users className="w-5 h-5" />}
          color="indigo"
        />
        <DashboardCard
          title="Facility Owners"
          value={stats?.totalOwners || 0}
          subtitle="Verified parking operators"
          icon={<Building2 className="w-5 h-5" />}
          color="emerald"
        />
        <DashboardCard
          title="Total Parking Facilities"
          value={stats?.totalFacilities || 0}
          subtitle={`${stats?.pendingApprovals || 0} pending review`}
          icon={<Activity className="w-5 h-5" />}
          color="amber"
        />
        <DashboardCard
          title="Total Volume Revenue"
          value={`$${stats?.totalRevenue || 0}`}
          subtitle="Across all parking lots"
          icon={<DollarSign className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Facility Approvals Notice Banner */}
      {stats?.pendingApprovals > 0 && (
        <div className="p-5 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Pending Facility Verification Requests</h4>
              <p className="text-xs text-amber-300/80">
                There are {stats.pendingApprovals} facility listings waiting for platform compliance approval.
              </p>
            </div>
          </div>
          <Link to="/admin/approvals">
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              Review Requests
            </Button>
          </Link>
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" /> Platform System Activity Audit Trail
        </h3>

        {stats?.recentActivity?.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No recent system activity recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats?.recentActivity?.map((act: any) => (
                  <tr key={act.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-white">{act.userName}</td>
                    <td className="p-3 font-mono font-bold text-indigo-400">{act.action}</td>
                    <td className="p-3 text-slate-300">{act.details}</td>
                    <td className="p-3 text-slate-400 font-mono">{new Date(act.timestamp).toLocaleTimeString()}</td>
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

export default AdminDashboard;

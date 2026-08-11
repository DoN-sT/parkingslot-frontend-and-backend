import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { User } from "../../types";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Users, Search, ShieldAlert, CheckCircle, Mail, Phone } from "lucide-react";

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      if (res.data.success) {
        setUsers(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.users || []));
      }
    } catch (err) {
      console.error("Failed to load platform users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Platform User Management</h1>
        <p className="text-xs text-slate-400">View registered driver accounts, facility owners & gate employees</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by user name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {["ALL", "CUSTOMER", "OWNER", "EMPLOYEE", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                roleFilter === r ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No users found matching filter criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Registered Date</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3 font-mono text-slate-300">{u.email}</td>
                    <td className="p-3"><Badge status={u.role} /></td>
                    <td className="p-3"><Badge status={u.status} /></td>
                    <td className="p-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      {u.role !== "ADMIN" && (
                        <Button
                          size="sm"
                          variant={u.status === "ACTIVE" ? "danger" : "outline"}
                          onClick={() => handleToggleUserStatus(u)}
                        >
                          {u.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                        </Button>
                      )}
                    </td>
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

export default UserManagement;

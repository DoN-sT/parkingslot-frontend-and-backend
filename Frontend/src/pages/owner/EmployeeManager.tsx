import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { User, ParkingFacility } from "../../types";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import { Users, Plus, ShieldCheck, Mail, Phone, Lock, AlertCircle, Building2 } from "lucide-react";

export const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [permissions, setPermissions] = useState<string[]>([
    "CAN_SCAN_QR",
    "CAN_MANUAL_ENTRY",
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [empRes, facRes] = await Promise.all([
        api.get("/owner/employees"),
        api.get("/parking"),
      ]);
      if (empRes.data.success) setEmployees(empRes.data.data);
      if (facRes.data.success) {
        setFacilities(facRes.data.data);
        if (facRes.data.data.length > 0) setFacilityId(facRes.data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load employee roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter((p) => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await api.post("/owner/employees", {
        name,
        email,
        password,
        phone,
        facilityId,
        permissions,
      });

      if (res.data.success) {
        setModalOpen(false);
        setName("");
        setEmail("");
        setPassword("");
        fetchData();
      }
    } catch (err: any) {
      setError(err.message || "Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  const getPermissionBadges = (perms: any): string[] => {
    if (!perms) return ["Standard Gate Access"];
    if (Array.isArray(perms)) return perms;
    if (typeof perms === "object") {
      const active = Object.entries(perms)
        .filter(([_, val]) => Boolean(val))
        .map(([key]) => key);
      return active.length > 0 ? active : ["Standard Gate Access"];
    }
    return [String(perms)];
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gate Employee Roster</h1>
          <p className="text-xs text-slate-400">Authorize gate staff, assigned facilities & scanner permissions</p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Register Employee
        </Button>
      </div>

      {/* Roster Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-slate-900 rounded-2xl animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Employees Registered</h3>
          <p className="text-xs text-slate-400">Create staff accounts to allow gate workers to validate customer QR passes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((emp) => {
            const facName = facilities.find((f) => f.id === emp.assignedFacilityId)?.name || "All Facilities";

            return (
              <div
                key={emp.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-sm uppercase">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{emp.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {emp.email}
                      </p>
                    </div>
                  </div>
                  <Badge status={emp.status} />
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Facility
                    </span>
                    <strong className="text-white">{facName}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-1">
                      Granted Gate Permissions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {getPermissionBadges(emp.permissions).map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-mono"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Gate Employee Account">
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Gatekeeper"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@parkingspot.com"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Facility</label>
            <select
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Permissions</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "CAN_SCAN_QR", label: "QR Pass Scanner" },
                { id: "CAN_MANUAL_ENTRY", label: "Manual Gate Pass" },
                { id: "CAN_OVERRIDE_SLOT", label: "Bay Override" },
                { id: "CAN_VIEW_REPORTS", label: "View Shift Logs" },
              ].map((p) => (
                <label
                  key={p.id}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                    permissions.includes(p.id)
                      ? "bg-indigo-600/30 border-indigo-500 text-white"
                      : "bg-slate-800/80 border-slate-700/80 text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions.includes(p.id)}
                    onChange={() => handleTogglePermission(p.id)}
                    className="accent-indigo-500 rounded"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" isLoading={saving} className="w-full py-2.5">
            Register Employee
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeManager;

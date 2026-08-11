import React from "react";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/common/Badge";
import { User, Mail, Phone, ShieldCheck, Calendar } from "lucide-react";

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Driver Profile</h1>
        <p className="text-xs text-slate-400">Account overview and contact details</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center uppercase">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="mt-2">
              <Badge status={user.role} />
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
            <span className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-indigo-400" /> Email Address
            </span>
            <strong className="text-white">{user.email}</strong>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
            <span className="flex items-center gap-2 text-slate-400">
              <Phone className="w-4 h-4 text-indigo-400" /> Phone Number
            </span>
            <strong className="text-white">{user.phone || "Not provided"}</strong>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
            <span className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Account Status
            </span>
            <Badge status={user.status} />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl">
            <span className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4 text-indigo-400" /> Member Since
            </span>
            <strong className="text-white">{new Date(user.createdAt).toLocaleDateString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { ParkingFacility } from "../../types";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { ShieldCheck, Check, X, MapPin, Building2, AlertCircle } from "lucide-react";

export const FacilityApprovals: React.FC = () => {
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      const res = await api.get("/admin/parking/pending");
      if (res.data.success) {
        setFacilities(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load pending facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/parking/${id}/approve`);
      fetchFacilities();
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/parking/${id}/reject`);
      fetchFacilities();
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Facility Verification & Approvals</h1>
        <p className="text-xs text-slate-400">Audit new facility submissions for safety, address legitimacy, and operational compliance</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">All Clear! No Pending Approvals</h3>
            <p className="text-xs text-slate-400">All submitted parking facilities have been reviewed and verified.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {facilities.map((fac) => (
              <div
                key={fac.id}
                className="p-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{fac.name}</h3>
                    <Badge status={fac.status} />
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {fac.address}, {fac.city}
                  </p>
                  <p className="text-xs text-slate-300">{fac.description}</p>
                  <div className="flex gap-2 text-xs text-emerald-400 font-semibold">
                    <span>${fac.hourlyRate}/hour</span> • <span>{fac.totalSlotsCount || fac.totalSlots} Slots</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={actionLoading === fac.id}
                    icon={<Check className="w-4 h-4" />}
                    onClick={() => handleApprove(fac.id)}
                  >
                    Approve Listing
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    isLoading={actionLoading === fac.id}
                    icon={<X className="w-4 h-4" />}
                    onClick={() => handleReject(fac.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityApprovals;

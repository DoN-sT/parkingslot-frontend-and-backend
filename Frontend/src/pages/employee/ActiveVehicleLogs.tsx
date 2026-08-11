import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Booking } from "../../types";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Car, Clock, MapPin, LogOut } from "lucide-react";

export const ActiveVehicleLogs: React.FC = () => {
  const [activeVehicles, setActiveVehicles] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveVehicles = async () => {
    try {
      const res = await api.get("/employee/active-vehicles");
      if (res.data.success) {
        setActiveVehicles(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load active vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVehicles();
  }, []);

  const handleCheckout = async (bId: string) => {
    try {
      await api.post("/employee/confirm-exit", { bookingId: bId });
      fetchActiveVehicles();
    } catch (err) {
      console.error("Failed exit checkout:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Currently Parked Vehicles</h1>
        <p className="text-xs text-slate-400">Live roster of vehicles currently inside facility gates</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : activeVehicles.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Car className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Active Parked Vehicles</h3>
            <p className="text-xs text-slate-400">There are no checked-in vehicles inside the lot currently.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Vehicle Registration</th>
                  <th className="p-3">Slot Bay</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Entry Time</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-indigo-400">{v.id}</td>
                    <td className="p-3 font-mono font-bold text-white">{v.vehicleNumber}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{v.slotNumber}</td>
                    <td className="p-3 text-white">{v.customerName || "Driver"}</td>
                    <td className="p-3 text-slate-300 font-mono">
                      {v.entryTime ? new Date(v.entryTime).toLocaleTimeString() : "N/A"}
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="accent"
                        icon={<LogOut className="w-3.5 h-3.5" />}
                        onClick={() => handleCheckout(v.id)}
                      >
                        Check Out Exit
                      </Button>
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

export default ActiveVehicleLogs;

import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { ParkingFacility, Slot, SlotStatus, VehicleType } from "../../types";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import { Grid, Plus, Trash2, Edit2, Car, Zap, Bike, AlertCircle, RefreshCw } from "lucide-react";

export const SlotManager: React.FC = () => {
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  // Slot modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [slotNumber, setSlotNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("4-Wheeler");
  const [floor, setFloor] = useState("Floor 1");
  const [pricePerHour, setPricePerHour] = useState<number>(15);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      const res = await api.get("/owner/parking");
      if (res.data.success) {
        const data = res.data.data;
        const list = Array.isArray(data) ? data : (data?.parking || []);
        if (list.length > 0) {
          setFacilities(list);
          setSelectedFacilityId(list[0].id || list[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to load facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (fId: string) => {
    if (!fId) return;
    try {
      const res = await api.get(`/owner/parking/${fId}/slots`);
      if (res.data.success) {
        const data = res.data.data;
        setSlots(Array.isArray(data) ? data : (data?.slots || []));
      }
    } catch (err) {
      console.error("Failed to fetch facility slots:", err);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacilityId) {
      fetchSlots(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacilityId) return;
    setSaving(true);
    setError(null);

    try {
      const res = await api.post(`/owner/parking/${selectedFacilityId}/slots`, {
        slotNumber,
        vehicleType,
        floor,
        pricePerHour: Number(pricePerHour),
      });

      if (res.data.success) {
        setModalOpen(false);
        setSlotNumber("");
        fetchSlots(selectedFacilityId);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create slot");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (slot: Slot, newStatus: SlotStatus) => {
    try {
      await api.put(`/owner/slots/${slot.id}`, { status: newStatus });
      fetchSlots(selectedFacilityId);
    } catch (err) {
      console.error("Failed to update slot status:", err);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this parking slot?")) return;
    try {
      await api.delete(`/owner/slots/${id}`);
      fetchSlots(selectedFacilityId);
    } catch (err) {
      console.error("Failed to delete slot:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Slot Management</h1>
          <p className="text-xs text-slate-400">Configure vehicle bays, pricing, and maintenance status</p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Add Slot Bay
        </Button>
      </div>

      {/* Facility Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-slate-900 p-2 rounded-2xl border border-slate-800">
        {facilities.map((fac) => (
          <button
            key={fac.id}
            onClick={() => setSelectedFacilityId(fac.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedFacilityId === fac.id
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            🏢 {fac.name}
          </button>
        ))}
      </div>

      {/* Slot Grid Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-indigo-400" /> Active Bays Roster ({slots.length})
          </h3>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Available: <strong className="text-emerald-400">{slots.filter((s) => s.status === "AVAILABLE").length}</strong></span>
            <span>Occupied: <strong className="text-rose-400">{slots.filter((s) => s.status === "OCCUPIED").length}</strong></span>
          </div>
        </div>

        {slots.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No parking slots created for this facility yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((s) => (
              <div
                key={s.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3 shadow-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-base text-white">{s.slotNumber}</span>
                  <Badge status={s.status} />
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p>Type: <strong className="text-white">{s.vehicleType}</strong></p>
                  <p>Level: <strong className="text-slate-400">{s.floor || "Ground"}</strong></p>
                  <p>Rate: <strong className="text-emerald-400">${s.pricePerHour}/hr</strong></p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <select
                    value={s.status}
                    onChange={(e) => handleToggleStatus(s, e.target.value as SlotStatus)}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>

                  <button
                    onClick={() => handleDeleteSlot(s.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE SLOT MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Parking Slot Bay">
        <form onSubmit={handleCreateSlot} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Slot Bay Designation</label>
            <input
              type="text"
              required
              value={slotNumber}
              onChange={(e) => setSlotNumber(e.target.value.toUpperCase())}
              placeholder="e.g. A-105"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Category</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="4-Wheeler">4-Wheeler Car</option>
                <option value="2-Wheeler">2-Wheeler Bike</option>
                <option value="EV">EV Charger Bay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Floor / Level</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="Floor 1"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hourly Rate ($)</label>
            <input
              type="number"
              required
              min="1"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(Number(e.target.value))}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <Button type="submit" variant="primary" isLoading={saving} className="w-full py-2.5">
            Create Parking Bay
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default SlotManager;

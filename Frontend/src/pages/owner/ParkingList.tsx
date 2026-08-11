import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { ParkingFacility } from "../../types";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import { Building2, Plus, Edit2, Trash2, MapPin, Clock, DollarSign, AlertCircle } from "lucide-react";

export const ParkingList: React.FC = () => {
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<ParkingFacility | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Metropolis");
  const [hourlyRate, setHourlyRate] = useState<number>(15);
  const [facilitiesInput, setFacilitiesInput] = useState("CCTV, EV Charging, Covered Parking");
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("23:59");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParking = async () => {
    try {
      const res = await api.get("/owner/parking");
      if (res.data.success) {
        const data = res.data.data;
        setFacilities(Array.isArray(data) ? data : (data?.parking || []));
      }
    } catch (err) {
      console.error("Error loading facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParking();
  }, []);

  const openCreateModal = () => {
    setEditingFacility(null);
    setName("");
    setDescription("");
    setAddress("");
    setCity("Metropolis");
    setHourlyRate(15);
    setFacilitiesInput("CCTV, EV Charging, Covered Parking");
    setOpeningTime("06:00");
    setClosingTime("23:59");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (fac: ParkingFacility) => {
    setEditingFacility(fac);
    setName(fac.name);
    setDescription(fac.description);
    setAddress(fac.address);
    setCity(fac.city);
    setHourlyRate(fac.hourlyRate);
    setFacilitiesInput(fac.facilities.join(", "));
    setOpeningTime(fac.openingTime);
    setClosingTime(fac.closingTime);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      description,
      address,
      city,
      hourlyRate: Number(hourlyRate),
      facilities: facilitiesInput.split(",").map((s) => s.trim()).filter(Boolean),
      openingTime,
      closingTime,
    };

    try {
      if (editingFacility) {
        await api.put(`/owner/parking/${editingFacility.id}`, payload);
      } else {
        await api.post("/owner/parking", payload);
      }
      setModalOpen(false);
      fetchParking();
    } catch (err: any) {
      setError(err.message || "Failed to save facility");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this parking facility?")) return;
    try {
      await api.delete(`/owner/parking/${id}`);
      fetchParking();
    } catch (err) {
      console.error("Failed to delete facility:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Parking Facilities</h1>
          <p className="text-xs text-slate-400">Manage your parking lots, pricing, operating hours & amenities</p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create New Facility
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-slate-900 rounded-2xl animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map((fac) => (
            <div key={fac.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{fac.name}</h3>
                  <Badge status={fac.status} />
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {fac.address}, {fac.city}
                </p>
                <p className="text-xs text-slate-300 line-clamp-2">{fac.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-800/60 rounded-xl text-xs text-center">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Rate</span>
                  <strong className="text-emerald-400 font-bold">${fac.hourlyRate}/hr</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Bays</span>
                  <strong className="text-white font-bold">{fac.totalSlotsCount || fac.totalSlots} Slots</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Hours</span>
                  <strong className="text-white font-bold">{fac.openingTime} - {fac.closingTime}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button size="sm" variant="outline" icon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEditModal(fac)}>
                  Edit Details
                </Button>
                <Button size="sm" variant="danger" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => handleDelete(fac.id)}>
                  Deactivate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingFacility ? "Edit Parking Facility" : "Add New Parking Facility"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Facility Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Central Garage"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 100 Main Street"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                required
                min="1"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Time</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Closing Time</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Amenities (comma-separated)</label>
            <input
              type="text"
              value={facilitiesInput}
              onChange={(e) => setFacilitiesInput(e.target.value)}
              placeholder="CCTV, EV Charging, Covered Parking"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of security, access & location..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <Button type="submit" variant="primary" isLoading={saving} className="w-full py-2.5">
            {editingFacility ? "Update Facility" : "Create Facility"}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ParkingList;

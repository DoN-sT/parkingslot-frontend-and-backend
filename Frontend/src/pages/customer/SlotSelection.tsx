import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Slot, SlotStatus, VehicleType } from "../../types";
import { Car, Zap, Bike, Check, LayoutGrid, Map as MapIcon, ArrowUp, ArrowDown } from "lucide-react";

interface SlotSelectionProps {
  parkingId: string;
  onSelectSlot: (slot: Slot) => void;
  selectedSlotId?: string;
}

export const SlotSelection: React.FC<SlotSelectionProps> = ({
  parkingId,
  onSelectSlot,
  selectedSlotId,
}) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleFilter, setVehicleFilter] = useState<string>("ALL");
  const [selectionMode, setSelectionMode] = useState<"map" | "grid">("map");

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/parking/${parkingId}/slots`);
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [parkingId]);

  const filteredSlots = slots.filter((s) =>
    vehicleFilter === "ALL" ? true : s.vehicleType === vehicleFilter
  );

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case "EV":
        return <Zap className="w-3.5 h-3.5 text-cyan-600" />;
      case "2-Wheeler":
        return <Bike className="w-3.5 h-3.5 text-amber-600" />;
      case "4-Wheeler":
      default:
        return <Car className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: SlotStatus, isSelected: boolean) => {
    if (isSelected) {
      return "bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400 scale-105 z-10 font-bold";
    }

    switch (status) {
      case "AVAILABLE":
        return "bg-slate-900 hover:bg-slate-800 border-emerald-500/60 text-emerald-300 cursor-pointer hover:border-emerald-400 hover:scale-[1.02]";
      case "RESERVED":
        return "bg-amber-950/40 border-amber-500/30 text-amber-300 cursor-not-allowed opacity-75";
      case "OCCUPIED":
        return "bg-rose-950/40 border-rose-500/30 text-rose-300 cursor-not-allowed opacity-75";
      case "MAINTENANCE":
      default:
        return "bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed opacity-60";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection Mode Toggle & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm">
        {/* Vehicle Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "4-Wheeler", "EV", "2-Wheeler"].map((type) => (
            <button
              key={type}
              onClick={() => setVehicleFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                vehicleFilter === type
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {type === "ALL" ? "All Bays" : type}
            </button>
          ))}
        </div>

        {/* View Mode & Legend */}
        <div className="flex items-center gap-3 justify-between w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectionMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition ${
                selectionMode === "map"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Floor Map
            </button>
            <button
              onClick={() => setSelectionMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition ${
                selectionMode === "grid"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid View
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Open
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Taken
            </span>
          </div>
        </div>
      </div>

      {/* VISUAL PARKING LOT FLOOR MAP VIEW */}
      {selectionMode === "map" ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-inner relative overflow-hidden select-none">
          {/* Driving Lanes Header */}
          <div className="flex items-center justify-between border-b border-dashed border-slate-700 pb-3 mb-5 text-xs text-slate-400 font-mono font-bold">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-lg">
              <ArrowDown className="w-4 h-4 animate-bounce" /> ENTRY GATE A
            </div>
            <span className="hidden sm:inline tracking-widest text-slate-500">PARKING FLOOR LEVEL 1</span>
            <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-lg">
              <ArrowUp className="w-4 h-4" /> EXIT GATE B
            </div>
          </div>

          {/* Interactive Map Bays Layout */}
          {filteredSlots.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/50 rounded-xl">
              No parking bays matching criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Row 1 - Top Bays */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {filteredSlots.slice(0, Math.ceil(filteredSlots.length / 2)).map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isAvailable = slot.status === "AVAILABLE";

                  return (
                    <button
                      key={slot.id}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onSelectSlot(slot)}
                      className={`relative p-3 rounded-xl border flex flex-col justify-between transition-all text-left h-24 ${
                        isSelected
                          ? "bg-blue-600 border-blue-400 text-white shadow-lg ring-4 ring-blue-500/40 scale-105 z-20"
                          : isAvailable
                          ? "bg-slate-800 hover:bg-slate-700 border-emerald-500/60 text-slate-100 cursor-pointer hover:scale-[1.03]"
                          : "bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                          {slot.slotNumber}
                        </span>
                        {getVehicleIcon(slot.vehicleType)}
                      </div>

                      <div className="flex items-end justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {slot.vehicleType}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">${slot.pricePerHour}/h</span>
                      </div>

                      {/* Asphalt Road Line Indicator */}
                      <div className="absolute -bottom-1.5 left-2 right-2 h-0.5 bg-yellow-400/80"></div>
                    </button>
                  );
                })}
              </div>

              {/* Central Driving Lane / Asphalt Strip */}
              <div className="relative h-12 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between px-6">
                <div className="w-full border-t-2 border-dashed border-yellow-500/60"></div>
                <span className="absolute left-1/2 -translate-x-1/2 bg-slate-900 text-slate-400 font-mono text-[10px] px-3 py-0.5 rounded-full border border-slate-800 uppercase font-bold">
                  MAIN DRIVEWAY (15 KM/H)
                </span>
              </div>

              {/* Row 2 - Bottom Bays */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {filteredSlots.slice(Math.ceil(filteredSlots.length / 2)).map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isAvailable = slot.status === "AVAILABLE";

                  return (
                    <button
                      key={slot.id}
                      disabled={!isAvailable}
                      onClick={() => isAvailable && onSelectSlot(slot)}
                      className={`relative p-3 rounded-xl border flex flex-col justify-between transition-all text-left h-24 ${
                        isSelected
                          ? "bg-blue-600 border-blue-400 text-white shadow-lg ring-4 ring-blue-500/40 scale-105 z-20"
                          : isAvailable
                          ? "bg-slate-800 hover:bg-slate-700 border-emerald-500/60 text-slate-100 cursor-pointer hover:scale-[1.03]"
                          : "bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed opacity-60"
                      }`}
                    >
                      {/* Asphalt Road Line Indicator */}
                      <div className="absolute -top-1.5 left-2 right-2 h-0.5 bg-yellow-400/80"></div>

                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                          {slot.slotNumber}
                        </span>
                        {getVehicleIcon(slot.vehicleType)}
                      </div>

                      <div className="flex items-end justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {slot.vehicleType}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">${slot.pricePerHour}/h</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD BAYS GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredSlots.map((slot) => {
            const isSelected = selectedSlotId === slot.id;
            const isAvailable = slot.status === "AVAILABLE";

            return (
              <button
                key={slot.id}
                disabled={!isAvailable}
                onClick={() => isAvailable && onSelectSlot(slot)}
                className={`relative p-3.5 rounded-xl border flex flex-col justify-between transition-all text-left ${getStatusColor(
                  slot.status,
                  isSelected
                )}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-mono font-bold text-sm">{slot.slotNumber}</span>
                  {getVehicleIcon(slot.vehicleType)}
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase tracking-wider block opacity-80 font-bold">
                    {slot.floor || "Ground"}
                  </span>
                  <span className="text-xs font-bold">${slot.pricePerHour}/hr</span>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SlotSelection;


import React, { useState } from "react";
import { ParkingFacility } from "../../types";
import { MapPin, Car, Star, Navigation, Plus, Minus, Compass } from "lucide-react";
import Button from "./Button";

interface MapProps {
  facilities: ParkingFacility[];
  selectedFacilityId?: string;
  onSelectFacility?: (facility: ParkingFacility) => void;
  height?: string;
}

export const Map: React.FC<MapProps> = ({
  facilities,
  selectedFacilityId,
  onSelectFacility,
  height = "h-[500px]",
}) => {
  const [activeFacility, setActiveFacility] = useState<ParkingFacility | null>(
    facilities.find((f) => f.id === selectedFacilityId) || facilities[0] || null
  );
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [gpsStatus, setGpsStatus] = useState<string>("GPS Active (Metropolis)");

  // Mock relative spatial coordinate offsets for map pin distribution
  const pinCoordinates = [
    { x: 35, y: 30, dist: "0.3 km" },
    { x: 68, y: 42, dist: "0.8 km" },
    { x: 22, y: 70, dist: "1.2 km" },
    { x: 75, y: 78, dist: "1.7 km" },
    { x: 50, y: 55, dist: "2.1 km" },
  ];

  const handleSelect = (f: ParkingFacility) => {
    setActiveFacility(f);
    if (onSelectFacility) onSelectFacility(f);
  };

  const handleRecalibrateGPS = () => {
    setGpsStatus("Recalibrating GPS...");
    setTimeout(() => {
      setGpsStatus("GPS Live (Current Location)");
    }, 800);
  };

  return (
    <div
      className={`relative w-full ${height} bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between p-3 sm:p-4 select-none`}
    >
      {/* MAP BACKDROP CANVAS WITH ROADS & GRID */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 0.4) 0%, rgba(226, 232, 240, 0.9) 100%),
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 32px 32px, 32px 32px",
        }}
      >
        {/* Simulated Road Lines & Map Features */}
        <div className="absolute top-1/2 left-0 right-0 h-12 bg-slate-300/60 -rotate-6 transform border-y-2 border-dashed border-slate-400/80 pointer-events-none flex items-center justify-around text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest opacity-60">
          <span>Grand Avenue</span>
          <span>Main Expressway</span>
        </div>
        <div className="absolute left-1/3 top-0 bottom-0 w-10 bg-slate-300/60 rotate-12 transform border-x-2 border-dashed border-slate-400/80 pointer-events-none flex flex-col justify-around text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest opacity-60">
          <span>7th Street</span>
        </div>

        {/* User GPS Pulse Pointer */}
        <div className="absolute top-[48%] left-[45%] z-20 -translate-x-1/2 -translate-y-1/2 group pointer-events-none">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-md"></span>
          </div>
          <span className="absolute left-6 top-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
            You are here
          </span>
        </div>

        {/* INTERACTIVE SPATIAL MAP PINS */}
        {facilities.map((fac, idx) => {
          const coord = pinCoordinates[idx % pinCoordinates.length];
          const isSelected = activeFacility?.id === fac.id;
          const available = fac.availableSlotsCount ?? fac.totalSlots;

          return (
            <div
              key={fac.id}
              className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
            >
              {/* Tap Marker Pin */}
              <button
                onClick={() => handleSelect(fac)}
                className={`relative flex flex-col items-center group focus:outline-none ${
                  isSelected ? "scale-110 z-40" : "hover:scale-105 z-30"
                }`}
              >
                {/* Popover Badge above Marker */}
                <div
                  className={`mb-1 px-2 py-1 rounded-lg shadow-md border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400"
                      : "bg-white text-slate-800 border-slate-200 group-hover:border-blue-400"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      available > 2 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  ></span>
                  <span>{fac.name}</span>
                  <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-mono text-[10px]">
                    ${fac.hourlyRate}/h
                  </span>
                </div>

                {/* Map Pin Icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white border-white ring-4 ring-blue-500/30"
                      : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* TOP FLOATING MAP CONTROLS & STATUS BAR */}
      <div className="z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-2.5 rounded-xl shadow-md">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-600 animate-spin-slow shrink-0" />
          <span className="text-xs font-bold text-slate-900">{gpsStatus}</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Open Bays
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Limited Bays
          </span>
          <button
            onClick={handleRecalibrateGPS}
            className="flex items-center gap-1 text-blue-600 hover:underline font-bold text-[11px] ml-2"
          >
            <Compass className="w-3.5 h-3.5" /> Re-center
          </button>
        </div>
      </div>

      {/* MAP ZOOM SIDE CONTROLS */}
      <div className="absolute right-4 top-20 z-30 flex flex-col gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-md">
        <button
          onClick={() => setZoomLevel((prev) => Math.min(prev + 15, 140))}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-200 my-0.5"></div>
        <button
          onClick={() => setZoomLevel((prev) => Math.max(prev - 15, 80))}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-700 transition"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* SELECTED FACILITY BOTTOM CARD DRAWER */}
      {activeFacility && (
        <div className="z-30 bg-white border border-slate-200 rounded-xl p-3.5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 truncate">{activeFacility.name}</h4>
                <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" /> 4.9
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{activeFacility.address}</p>
              <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-600 font-medium">
                <span className="text-emerald-600 font-bold">${activeFacility.hourlyRate}/hour</span>
                <span>•</span>
                <span className="text-blue-700 font-semibold">
                  {activeFacility.availableSlotsCount ?? activeFacility.totalSlots} Slots Available
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {onSelectFacility && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onSelectFacility(activeFacility)}
                className="w-full sm:w-auto px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Select & Book Facility
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;


import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { ParkingFacility, Slot } from "../../types";
import SlotSelection from "./SlotSelection";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import {
  MapPin,
  Clock,
  Car,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  DollarSign
} from "lucide-react";

export const ParkingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<ParkingFacility | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/parking/${id}`);
        if (res.data.success) {
          setFacility(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load facility:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Parking Facility Not Found</h2>
        <Link to="/customer/search">
          <Button variant="primary">Return to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Back link */}
      <div>
        <Link to="/customer/search" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
        </Link>
      </div>

      {/* Facility Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Photo Gallery */}
          <div className="lg:col-span-1 rounded-2xl overflow-hidden bg-slate-950 h-56 lg:h-full relative">
            <img
              src={facility.images[0]}
              alt={facility.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-700 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
              ${facility.hourlyRate}/hour
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Facility Overview</span>
                <Badge status={facility.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{facility.name}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" /> {facility.address}, {facility.city}
              </p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">{facility.description}</p>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Operating Hours</span>
                <p className="font-semibold text-white mt-0.5">{facility.openingTime} - {facility.closingTime}</p>
              </div>
              <div>
                <span className="text-slate-400">Hourly Rate</span>
                <p className="font-semibold text-emerald-400 mt-0.5">${facility.hourlyRate} / hr</p>
              </div>
              <div>
                <span className="text-slate-400">Total Bays</span>
                <p className="font-semibold text-white mt-0.5">{facility.totalSlotsCount || facility.totalSlots} Slots</p>
              </div>
              <div>
                <span className="text-slate-400">Available Now</span>
                <p className="font-semibold text-indigo-400 mt-0.5">{facility.availableSlotsCount || 0} Open</p>
              </div>
            </div>

            {/* Amenities Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {facility.facilities.map((fac, idx) => (
                <span key={idx} className="text-xs bg-slate-800/80 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg">
                  ✓ {fac}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SLOT SELECTION SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Car className="w-5 h-5 text-indigo-400" /> Choose Your Parking Slot
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click an available slot below to proceed with your booking reservation.
          </p>
        </div>

        <SlotSelection
          parkingId={facility.id}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          selectedSlotId={selectedSlot?.id}
        />

        {/* Selected Slot Footer CTA */}
        {selectedSlot && (
          <div className="p-4 bg-indigo-950/60 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
            <div>
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Selected Bay</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-extrabold text-white font-mono bg-indigo-600 px-3 py-1 rounded-lg">
                  {selectedSlot.slotNumber}
                </span>
                <div className="text-xs text-slate-300">
                  <p>Type: <strong className="text-white">{selectedSlot.vehicleType}</strong> ({selectedSlot.floor || "Ground"})</p>
                  <p>Rate: <strong className="text-emerald-400">${selectedSlot.pricePerHour}/hr</strong></p>
                </div>
              </div>
            </div>

            <Button
              variant="accent"
              size="lg"
              icon={<Calendar className="w-5 h-5" />}
              onClick={() => navigate(`/customer/booking/checkout?parkingId=${facility.id}&slotId=${selectedSlot.id}`)}
              className="w-full sm:w-auto"
            >
              Continue to Reservation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingDetails;

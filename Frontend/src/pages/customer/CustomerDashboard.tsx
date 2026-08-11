import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { ParkingFacility, Booking } from "../../types";
import Map from "../../components/common/Map";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import DashboardCard from "../../components/common/DashboardCard";
import {
  Car,
  Search,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from "lucide-react";

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [facRes, bookRes] = await Promise.all([
        api.get("/parking"),
        api.get("/bookings/my"),
      ]);
      if (facRes.data.success) setFacilities(facRes.data.data);
      if (bookRes.data.success) setMyBookings(bookRes.data.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeBooking = myBookings.find(
    (b) => b.bookingStatus === "ACTIVE" || b.bookingStatus === "CONFIRMED"
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/customer/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-md">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Real-time Smart Reservation
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Find & Reserve Parking Instantly
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Search nearby facilities, select your preferred vehicle bay, pay securely, and get your digital QR pass in seconds.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Enter city, district or parking facility name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button type="submit" variant="primary" icon={<Search className="w-4 h-4" />}>
              Search Parking
            </Button>
          </form>
        </div>
      </div>

      {/* ACTIVE PASS BANNER */}
      {activeBooking && (
        <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <QrCode className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Active Parking Pass</span>
                <Badge status={activeBooking.bookingStatus} />
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{activeBooking.parkingName}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-1">
                <span>Slot: <strong className="text-emerald-400 font-mono font-bold">{activeBooking.slotNumber}</strong></span>
                <span>•</span>
                <span>Vehicle: <strong className="text-white font-mono">{activeBooking.vehicleNumber}</strong></span>
                <span>•</span>
                <span>Time: <strong>{activeBooking.startTime} - {activeBooking.endTime}</strong></span>
              </p>
            </div>
          </div>

          <Link to={`/customer/bookings/${activeBooking.id}`}>
            <Button variant="accent" icon={<QrCode className="w-4 h-4" />}>
              View Digital Pass
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Active Parking Facilities"
          value={facilities.length}
          subtitle="Real-time available lots"
          icon={<Car className="w-5 h-5" />}
          color="indigo"
        />
        <DashboardCard
          title="Total Bookings Made"
          value={myBookings.length}
          subtitle="Reservation history"
          icon={<Calendar className="w-5 h-5" />}
          color="emerald"
        />
        <DashboardCard
          title="Active Pass"
          value={activeBooking ? "1 Active" : "None"}
          subtitle={activeBooking ? `Slot ${activeBooking.slotNumber}` : "Ready to book"}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="cyan"
        />
      </div>

      {/* INTERACTIVE MAP & FEATURED PARKING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" /> Nearby Parking Facilities
          </h2>
          <Link to="/customer/search" className="text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1">
            View All ({facilities.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Interactive Map */}
        <Map
          facilities={facilities}
          onSelectFacility={(fac) => navigate(`/customer/parking/${fac.id}`)}
          height="h-80"
        />

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {facilities.slice(0, 3).map((fac) => (
            <div
              key={fac.id}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl overflow-hidden shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={fac.images[0]}
                  alt={fac.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-emerald-400 shadow-sm">
                  ${fac.hourlyRate}/hr
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-white shadow-sm">
                  {fac.availableSlotsCount ?? fac.totalSlots} Slots Available
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" /> {fac.address}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fac.facilities.slice(0, 3).map((f, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-medium"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    Hours: {fac.openingTime} - {fac.closingTime}
                  </span>
                  <Link to={`/customer/parking/${fac.id}`}>
                    <Button size="sm" variant="primary">
                      Book Slot
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

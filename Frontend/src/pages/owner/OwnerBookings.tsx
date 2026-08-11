import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Booking } from "../../types";
import Badge from "../../components/common/Badge";
import { Calendar, Search, MapPin, Clock, Car, Filter } from "lucide-react";

export const OwnerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchBookings = async () => {
    try {
      const res = await api.get("/owner/bookings");
      if (res.data.success) {
        setBookings(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.bookings || []));
      }
    } catch (err) {
      console.error("Failed to load owner bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filter === "ALL" || b.bookingStatus === filter;
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.customerName && b.customerName.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Facility Reservations Ledger</h1>
        <p className="text-xs text-slate-400">Track all customer bookings, slot allocations & entrance statuses</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-3 justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Booking Ref, Vehicle No, or Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {["ALL", "ACTIVE", "CONFIRMED", "COMPLETED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter === st ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No customer reservations found matching criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Facility & Bay</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Schedule</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-indigo-400">{b.id}</td>
                    <td className="p-3">
                      <p className="font-bold text-white">{b.parkingName}</p>
                      <p className="text-[10px] text-emerald-400 font-mono">Bay {b.slotNumber}</p>
                    </td>
                    <td className="p-3 font-semibold text-white">{b.customerName || "Customer"}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{b.vehicleNumber}</td>
                    <td className="p-3 text-[11px] text-slate-300">
                      <p>{b.date}</p>
                      <p className="text-slate-400">{b.startTime} - {b.endTime}</p>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">${b.totalAmount}</td>
                    <td className="p-3"><Badge status={b.bookingStatus} /></td>
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

export default OwnerBookings;

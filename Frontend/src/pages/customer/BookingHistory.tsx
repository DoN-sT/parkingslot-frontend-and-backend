import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { Booking } from "../../types";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Calendar, QrCode, MapPin, Clock, ArrowRight, Car, CheckCircle2 } from "lucide-react";

export const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my");
      if (res.data.success) {
        setBookings(Array.isArray(res.data.data) ? res.data.data : (res.data.data?.bookings || []));
      }
    } catch (err) {
      console.error("Failed to load booking history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filter === "ALL") return true;
    return b.bookingStatus === filter;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Booking History</h1>
          <p className="text-xs text-slate-400">View active parking passes, upcoming reservations & past receipts</p>
        </div>

        <Link to="/customer/search">
          <Button variant="primary" icon={<Car className="w-4 h-4" />}>
            New Reservation
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        {["ALL", "ACTIVE", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === status
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-2xl animate-pulse border border-slate-800"></div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400">You don't have any bookings matching the selected status.</p>
          <Link to="/customer/search">
            <Button variant="primary" size="sm" className="mt-2">
              Book a Parking Bay
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                    {b.id}
                  </span>
                  <Badge status={b.bookingStatus} />
                  <Badge status={b.paymentStatus} />
                </div>

                <h3 className="text-lg font-bold text-white">{b.parkingName}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {b.parkingAddress}
                  </span>
                  <span>
                    Bay: <strong className="text-emerald-400 font-mono">{b.slotNumber}</strong>
                  </span>
                  <span>
                    Vehicle: <strong className="text-white font-mono">{b.vehicleNumber}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> {b.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {b.startTime} - {b.endTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Amount Paid</span>
                  <p className="text-lg font-extrabold text-emerald-400">${b.totalAmount}</p>
                </div>

                <Link to={`/customer/bookings/${b.id}`}>
                  <Button variant="primary" size="sm" icon={<QrCode className="w-4 h-4" />}>
                    Pass Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;

import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { ParkingFacility, Slot, Booking } from "../../types";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  Car,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  DollarSign
} from "lucide-react";

export const BookingCheckout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const parkingId = searchParams.get("parkingId");
  const slotId = searchParams.get("slotId");

  const [facility, setFacility] = useState<ParkingFacility | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("13:00");
  const [vehicleNumber, setVehicleNumber] = useState<string>("CA-7789-XY");
  const [vehicleType, setVehicleType] = useState<string>("4-Wheeler");

  // Payment states
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<"RAZORPAY" | "STRIPE">("RAZORPAY");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          api.get(`/parking/${parkingId}`),
          api.get(`/parking/${parkingId}/slots`),
        ]);
        if (pRes.data.success) setFacility(pRes.data.data);
        if (sRes.data.success) {
          const found = sRes.data.data.find((s: Slot) => s.id === slotId);
          if (found) {
            setSlot(found);
            setVehicleType(found.vehicleType);
          }
        }
      } catch (err) {
        console.error("Error loading checkout details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (parkingId && slotId) fetchData();
  }, [parkingId, slotId]);

  // Compute total hours & amount
  const startHour = parseInt(startTime.split(":")[0], 10);
  const endHour = parseInt(endTime.split(":")[0], 10);
  const totalHours = Math.max(1, endHour - startHour);
  const rate = slot?.pricePerHour || facility?.hourlyRate || 15;
  const estimatedAmount = totalHours * rate;

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleNumber.trim()) {
      setError("Please enter your vehicle registration number");
      return;
    }

    try {
      const res = await api.post("/bookings", {
        parkingId,
        slotId,
        vehicleNumber,
        vehicleType,
        date,
        startTime,
        endTime,
      });

      if (res.data.success) {
        setBooking(res.data.data);
        setPaymentModalOpen(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create booking reservation");
    }
  };

  const handleVerifyPayment = async () => {
    if (!booking) return;
    setPaying(true);
    setError(null);

    try {
      const mockPaymentId = `pay_${selectedGateway.toLowerCase()}_${Date.now()}`;
      const res = await api.post("/payments/verify", {
        bookingId: booking.id,
        paymentId: mockPaymentId,
        gateway: selectedGateway,
      });

      if (res.data.success) {
        setPaymentModalOpen(false);
        navigate(`/customer/bookings/${booking.id}`);
      }
    } catch (err: any) {
      setError(err.message || "Payment verification failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!facility || !slot) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Invalid Selection</h2>
        <Link to="/customer/search">
          <Button variant="primary">Return to Parking Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <Link to={`/customer/parking/${parkingId}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Facility
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-2">Reserve Parking Slot</h1>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Column */}
        <form onSubmit={handleCreateBooking} className="md:col-span-2 space-y-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> Booking Schedule & Vehicle Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reservation Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Registration No.</label>
              <input
                type="text"
                required
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. CA-7789-XY"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, "0")}:00`).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: 18 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full py-3">
            Proceed to Payment (${estimatedAmount})
          </Button>
        </form>

        {/* Summary Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">Reservation Summary</h3>

            <div className="space-y-3 mt-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-400">Facility</span>
                <p className="font-bold text-white text-sm mt-0.5">{facility.name}</p>
                <p className="text-slate-400 truncate">{facility.address}</p>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Slot Bay</span>
                  <strong className="text-base font-mono text-indigo-400">{slot.slotNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase">Type</span>
                  <strong className="text-xs text-white">{slot.vehicleType}</strong>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <strong className="text-white">${rate}/hr</strong>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <strong className="text-white">{totalHours} Hours</strong>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-slate-800">
                  <span>Total Amount:</span>
                  <span>${estimatedAmount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center gap-1 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Authorized Gate Pass
            </p>
            <p>Digital QR pass will be generated immediately after payment confirmation.</p>
          </div>
        </div>
      </div>

      {/* PAYMENT GATEWAY MODAL */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Complete Payment Gateway Verification"
      >
        <div className="space-y-5">
          <div className="p-4 bg-slate-900 border border-slate-700 rounded-2xl text-center space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Payable</span>
            <h3 className="text-3xl font-extrabold text-emerald-400">${estimatedAmount}.00</h3>
            <p className="text-xs text-slate-300">Booking Ref: <strong className="font-mono text-white">{booking?.id}</strong></p>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedGateway("RAZORPAY")}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                  selectedGateway === "RAZORPAY"
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                💳 Razorpay Gateway
              </button>
              <button
                type="button"
                onClick={() => setSelectedGateway("STRIPE")}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                  selectedGateway === "STRIPE"
                    ? "bg-indigo-600 border-indigo-400 text-white shadow-lg"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                💳 Stripe Gateway
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
            <p className="text-slate-300 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Backend Authorization
            </p>
            <p>Simulating secure token handshake with payment provider.</p>
          </div>

          <Button
            variant="accent"
            size="lg"
            isLoading={paying}
            onClick={handleVerifyPayment}
            className="w-full py-3"
          >
            Confirm & Pay ${estimatedAmount}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default BookingCheckout;

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Booking } from "../../types";
import QRPass from "../../components/common/QRPass";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import { ArrowLeft, AlertCircle, Trash2, ShieldCheck, CheckCircle } from "lucide-react";

export const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      if (res.data.success) {
        setBooking(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load booking pass");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      const res = await api.patch(`/bookings/${booking.id}/cancel`);
      if (res.data.success) {
        setBooking(res.data.data);
        setCancelModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "Cancellation failed");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Booking Pass Not Found</h2>
        <Link to="/customer/bookings">
          <Button variant="primary">Return to My Bookings</Button>
        </Link>
      </div>
    );
  }

  const canCancel = ["CONFIRMED", "PENDING"].includes(booking.bookingStatus);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/customer/bookings" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-2">Digital Parking Pass</h1>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* QR PASS CARD COMPONENT */}
      <QRPass booking={booking} />

      {/* CANCELLATION BUTTON */}
      {canCancel && (
        <div className="pt-4 flex justify-center">
          <Button
            variant="danger"
            size="md"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setCancelModalOpen(true)}
          >
            Cancel Booking Reservation
          </Button>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Cancel Parking Reservation"
        message={`Are you sure you want to cancel booking ${booking.id}? If paid, refund will be processed automatically.`}
        confirmText="Yes, Cancel Booking"
        isLoading={cancelling}
      />
    </div>
  );
};

export const ConfirmModalComponent = ConfirmModal;
export default BookingDetail;

import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Booking } from "../../types";
import { Badge } from "./Badge";
import { Car, Clock, MapPin, QrCode as QrIcon, ShieldCheck, Download, Calendar } from "lucide-react";
import Button from "./Button";

interface QRPassProps {
  booking: Booking;
}

export const QRPass: React.FC<QRPassProps> = ({ booking }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && booking.qrToken) {
      QRCode.toCanvas(
        canvasRef.current,
        booking.qrToken,
        {
          width: 220,
          margin: 1.5,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        },
        (err) => {
          if (err) console.error("QR Code Generation Error:", err);
        }
      );
    }
  }, [booking.qrToken]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `ParkingSpot-Pass-${booking.id}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-md mx-auto">
      {/* Header banner */}
      <div className="bg-blue-600 p-5 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-100 tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" /> Smart Parking Pass
          </div>
          <h3 className="text-lg font-bold mt-0.5">{booking.parkingName}</h3>
        </div>
        <Badge status={booking.bookingStatus} />
      </div>

      {/* QR Code display */}
      <div className="p-6 flex flex-col items-center bg-slate-50 border-b border-slate-200">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 mb-3">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
        <p className="font-mono text-xs text-slate-700 bg-white px-3 py-1 rounded border border-slate-200 tracking-widest font-bold">
          {booking.qrToken}
        </p>
        <p className="text-[11px] text-slate-500 mt-2 text-center">
          Present this QR code to the gate operative or scan at entry/exit terminal.
        </p>
      </div>

      {/* Pass details */}
      <div className="p-5 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Slot Number</span>
            <p className="text-lg font-bold text-emerald-600">{booking.slotNumber}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Vehicle Reg No.</span>
            <p className="text-sm font-bold text-slate-900 font-mono">{booking.vehicleNumber}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Date: <strong className="text-slate-900">{booking.date}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Time: <strong className="text-slate-900">{booking.startTime} - {booking.endTime}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{booking.parkingAddress}</span>
          </div>
        </div>

        {booking.entryTime && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between font-semibold">
            <span>Verified Entry Time:</span>
            <strong className="font-mono">{new Date(booking.entryTime).toLocaleTimeString()}</strong>
          </div>
        )}

        {booking.exitTime && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center justify-between font-semibold">
            <span>Verified Exit Time:</span>
            <strong className="font-mono">{new Date(booking.exitTime).toLocaleTimeString()}</strong>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            className="w-full"
          >
            Download QR Pass
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRPass;

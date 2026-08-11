import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Booking } from "../../types";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Car,
  Clock,
  ShieldCheck,
  LogIn,
  LogOut,
  Search,
  Zap,
  Activity
} from "lucide-react";

export const EmployeeDashboard: React.FC = () => {
  const [tokenInput, setTokenInput] = useState("");
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [shiftLogs, setShiftLogs] = useState<any[]>([]);

  const fetchShiftLogs = async () => {
    try {
      const res = await api.get("/employee/logs");
      if (res.data.success) {
        setShiftLogs(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load shift logs:", err);
    }
  };

  useEffect(() => {
    fetchShiftLogs();
  }, []);

  const handleScanQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    setMessage(null);
    setScannedBooking(null);

    try {
      const res = await api.post("/employee/scan-qr", { token: tokenInput.trim() });
      if (res.data.success) {
        setScannedBooking(res.data.data);
        setMessage({ type: "success", text: "QR Pass Authenticated Successfully!" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Invalid or Expired QR Pass" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEntry = async () => {
    if (!scannedBooking) return;
    setActionLoading(true);
    try {
      const res = await api.post("/employee/confirm-entry", { bookingId: scannedBooking.id });
      if (res.data.success) {
        setScannedBooking(res.data.data);
        setMessage({ type: "success", text: `Vehicle ${scannedBooking.vehicleNumber} checked IN!` });
        fetchShiftLogs();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed entry confirmation" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmExit = async () => {
    if (!scannedBooking) return;
    setActionLoading(true);
    try {
      const res = await api.post("/employee/confirm-exit", { bookingId: scannedBooking.id });
      if (res.data.success) {
        setScannedBooking(res.data.data);
        setMessage({ type: "success", text: `Vehicle ${scannedBooking.vehicleNumber} checked OUT!` });
        fetchShiftLogs();
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed exit confirmation" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
            <ShieldCheck className="w-4 h-4" /> Gate Operative Terminal
          </div>
          <h1 className="text-2xl font-extrabold text-white">QR Gate Pass Verification</h1>
          <p className="text-xs text-slate-300">Scan customer digital tickets to record gate arrivals and departures.</p>
        </div>

        <div className="px-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-2xl text-xs text-center">
          <span className="text-slate-400 block text-[10px] uppercase">Shift Status</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Terminal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SCANNER TERMINAL */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400" /> Pass Validation Terminal
          </h3>

          <form onSubmit={handleScanQR} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Scan or Enter QR Token Code
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. QR-PS-1001-XXXX"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={loading} icon={<QrCode className="w-4 h-4" />} className="w-full py-2.5">
              Verify QR Pass Token
            </Button>
          </form>

          {/* Quick Demo QR Selector */}
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ Hackathon Demo Quick QR Autofill:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTokenInput("QR-PS-1001-X9Y2")}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-xs text-indigo-300 font-mono rounded-lg border border-slate-700 transition"
              >
                QR-PS-1001-X9Y2
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* VERIFIED TICKET DETAILS CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-400" /> Scanned Pass Verification
            </h3>

            {scannedBooking ? (
              <div className="space-y-3 mt-3 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Ref ID:</span>
                  <strong className="font-mono text-indigo-400 text-sm">{scannedBooking.id}</strong>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Target Bay:</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      Bay {scannedBooking.slotNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle Reg:</span>
                    <strong className="font-mono text-white text-sm">{scannedBooking.vehicleNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer:</span>
                    <strong className="text-white">{scannedBooking.customerName || "Verified Driver"}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pass Status:</span>
                    <Badge status={scannedBooking.bookingStatus} />
                  </div>
                </div>

                <div className="space-y-1 text-slate-400">
                  <p>Facility: <strong className="text-white">{scannedBooking.parkingName}</strong></p>
                  <p>Schedule: <strong className="text-white">{scannedBooking.startTime} - {scannedBooking.endTime}</strong></p>
                  {scannedBooking.entryTime && (
                    <p className="text-emerald-400">
                      Entry Logged: {new Date(scannedBooking.entryTime).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                <QrCode className="w-10 h-10 mx-auto opacity-30" />
                <p>No QR ticket scanned yet. Scan token code on left panel.</p>
              </div>
            )}
          </div>

          {/* CHECK IN / OUT CTA */}
          {scannedBooking && (
            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                isLoading={actionLoading}
                disabled={!!scannedBooking.entryTime}
                icon={<LogIn className="w-4 h-4" />}
                onClick={handleConfirmEntry}
              >
                Confirm Entry
              </Button>

              <Button
                variant="accent"
                isLoading={actionLoading}
                disabled={!scannedBooking.entryTime || !!scannedBooking.exitTime}
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleConfirmExit}
              >
                Confirm Exit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* SHIFT LOGS HISTORY TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" /> Recent Gate Events Log
        </h3>

        {shiftLogs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No gate movements logged during current shift.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Bay</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {shiftLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="p-3 font-bold">
                      {log.action.includes("ENTRY") ? (
                        <span className="text-emerald-400 flex items-center gap-1"><LogIn className="w-3.5 h-3.5" /> ENTRY verified</span>
                      ) : (
                        <span className="text-blue-400 flex items-center gap-1"><LogOut className="w-3.5 h-3.5" /> EXIT verified</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{log.bookingId}</td>
                    <td className="p-3 font-mono font-bold text-white">{log.vehicleNumber}</td>
                    <td className="p-3 font-mono text-emerald-400">{log.slotNumber}</td>
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
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

export default EmployeeDashboard;

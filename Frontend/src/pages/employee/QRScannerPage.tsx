import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { Booking } from "../../types";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Car,
  ShieldCheck,
  LogIn,
  LogOut,
  Camera,
  CameraOff,
  Upload,
  Zap,
  RefreshCw,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Check,
  MapPin,
  Clock
} from "lucide-react";

export const QRScannerPage: React.FC = () => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [recentScans, setRecentScans] = useState<Booking[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play audio beep feedback on scan
  const playScanBeep = (isSuccess: boolean) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = isSuccess ? "sine" : "sawtooth";
      osc.frequency.setValueAtTime(isSuccess ? 880 : 300, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // AudioContext not supported or restricted
    }
  };

  // Start real browser camera if supported
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser environment.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera start warning:", err);
      setCameraError(err.message || "Unable to access camera feed.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Process token scan with backend
  const processScanToken = async (qrToken: string) => {
    if (!qrToken.trim()) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.post("/employee/scan-qr", { token: qrToken.trim() });
      if (res.data.success && res.data.data) {
        const booking: Booking = res.data.data;
        setScannedBooking(booking);
        playScanBeep(true);
        setMessage({ type: "success", text: `Pass Verified for ${booking.customerName || "Vehicle"} (Bay ${booking.slotNumber})` });

        // Add to recent scans list
        setRecentScans((prev) => {
          const filtered = prev.filter((b) => b.id !== booking.id);
          return [booking, ...filtered].slice(0, 5);
        });
      }
    } catch (err: any) {
      playScanBeep(false);
      setMessage({ type: "error", text: err.message || "Invalid or Expired QR Gate Pass" });
    } finally {
      setLoading(false);
    }
  };

  // Form submit manual or scanner input
  const handleManualScan = (e: React.FormEvent) => {
    e.preventDefault();
    processScanToken(tokenInput);
  };

  // Image Upload File Scan Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate decoding QR code from image filename / mock token
      processScanToken("PASS-METRO-A102-8801");
    }
  };

  // Gate Entry Confirmation (Backend update)
  const handleConfirmEntry = async () => {
    if (!scannedBooking) return;
    setActionLoading(true);
    try {
      const res = await api.post("/employee/confirm-entry", { bookingId: scannedBooking.id });
      if (res.data.success) {
        const updated = res.data.data;
        setScannedBooking(updated);
        playScanBeep(true);
        setMessage({ type: "success", text: `🟢 VEHICLE ${updated.vehicleNumber} CHECKED IN TO BAY ${updated.slotNumber}!` });
        // Update recent scans
        setRecentScans((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      }
    } catch (err: any) {
      playScanBeep(false);
      setMessage({ type: "error", text: err.message || "Failed to confirm entry" });
    } finally {
      setActionLoading(false);
    }
  };

  // Gate Exit Confirmation (Backend update)
  const handleConfirmExit = async () => {
    if (!scannedBooking) return;
    setActionLoading(true);
    try {
      const res = await api.post("/employee/confirm-exit", { bookingId: scannedBooking.id });
      if (res.data.success) {
        const updated = res.data.data;
        setScannedBooking(updated);
        playScanBeep(true);
        setMessage({ type: "success", text: `🔵 VEHICLE ${updated.vehicleNumber} CHECKED OUT! BAY ${updated.slotNumber} IS NOW FREE.` });
        setRecentScans((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      }
    } catch (err: any) {
      playScanBeep(false);
      setMessage({ type: "error", text: err.message || "Failed to confirm exit" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 text-slate-100">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" /> Live Terminal Gate Scanner
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-7 h-7 text-emerald-400 animate-pulse" /> Automatic QR Pass Scanner
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Point camera at customer digital ticket or scan token to verify pass & update slot status.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
              soundEnabled
                ? "bg-slate-800 border-slate-700 text-emerald-400"
                : "bg-slate-950 border-slate-800 text-slate-500"
            }`}
            title="Toggle audio beep"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Audio On" : "Muted"}</span>
          </button>

          {cameraActive ? (
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <CameraOff className="w-4 h-4" /> Stop Camera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition"
            >
              <Camera className="w-4 h-4" /> Start Camera Stream
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: LIVE CAMERA & SCANNER TERMINAL */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            {/* Viewfinder Title */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> Optical QR Viewfinder
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono font-bold">
                {cameraActive ? "CAMERA LIVE" : "TERMINAL READY"}
              </span>
            </div>

            {/* VIEWFINDER HUD FRAME */}
            <div className="relative w-full h-64 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center group">
              {/* Real Video element */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
              />

              {/* Simulated Camera Feed Overlay if Real Camera is Off/Unavailable */}
              {!cameraActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                    <QrCode className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Live Camera Viewfinder</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Click "Start Camera Stream" or select a sample QR code below to scan instantly.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <Camera className="w-3.5 h-3.5" /> Launch Camera Lens
                  </button>
                </div>
              )}

              {/* VIEW FINDER OVERLAY BRACKETS & SCANNING LASER BEAM */}
              <div className="absolute inset-0 pointer-events-none border-2 border-slate-800/50 rounded-2xl flex items-center justify-center">
                {/* Center Framing Target Box */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
                  {/* Glowing Corner Accents */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                  {/* Animated Laser Sweep Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse"></div>
                </div>
              </div>

              {/* Status Banner */}
              {cameraError && (
                <div className="absolute top-3 left-3 right-3 bg-rose-950/90 border border-rose-500/40 text-rose-300 text-xs p-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>

            {/* MANUAL CODE ENTRY & FILE DROP ZONE */}
            <div className="space-y-3 pt-2">
              <form onSubmit={handleManualScan} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Scan or enter ticket code e.g. PASS-METRO-A102-8801"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <Button type="submit" variant="primary" isLoading={loading} icon={<QrCode className="w-4 h-4" />}>
                  Scan
                </Button>
              </form>

              {/* Quick Image Ticket Scanner */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <span className="flex items-center gap-2 text-slate-300 font-medium">
                  <Upload className="w-4 h-4 text-blue-400" /> Scan QR from Image File:
                </span>
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer text-xs font-semibold transition border border-slate-700">
                  Select Ticket Image
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* QUICK SAMPLE QR PASSES FOR DEMO */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Instant Sample QR Pass Triggers (1-Click Test):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("PASS-METRO-A102-8801");
                    processScanToken("PASS-METRO-A102-8801");
                  }}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-emerald-950 text-xs text-emerald-300 font-mono font-semibold rounded-lg border border-slate-800 hover:border-emerald-500/50 transition flex items-center gap-1.5"
                >
                  <QrCode className="w-3 h-3 text-emerald-400" />
                  PASS-METRO-A102-8801 (Active)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("PASS-METRO-A104-8802");
                    processScanToken("PASS-METRO-A104-8802");
                  }}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-blue-950 text-xs text-blue-300 font-mono font-semibold rounded-lg border border-slate-800 hover:border-blue-500/50 transition flex items-center gap-1.5"
                >
                  <QrCode className="w-3 h-3 text-blue-400" />
                  PASS-METRO-A104-8802 (Confirmed)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("PASS-TECH-T01-8803");
                    processScanToken("PASS-TECH-T01-8803");
                  }}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-amber-950 text-xs text-amber-300 font-mono font-semibold rounded-lg border border-slate-800 hover:border-amber-500/50 transition flex items-center gap-1.5"
                >
                  <QrCode className="w-3 h-3 text-amber-400" />
                  PASS-TECH-T01-8803 (Completed)
                </button>
              </div>
            </div>

            {/* Scan Status Toast Message */}
            {message && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border font-medium ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                )}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SCANNED TICKET VERIFICATION & BACKEND ACTIONS */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-400" /> Gate Pass Verification Result
              </span>
              {scannedBooking && <Badge status={scannedBooking.bookingStatus} />}
            </h3>

            {scannedBooking ? (
              <div className="space-y-4">
                {/* Target Bay & Vehicle Banner */}
                <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Target Parking Bay:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                      {scannedBooking.slotNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Vehicle Reg Number:</span>
                    <span className="font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                      {scannedBooking.vehicleNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Vehicle Type:</span>
                    <span className="text-slate-200 font-medium">{scannedBooking.vehicleType || "4-Wheeler"}</span>
                  </div>
                </div>

                {/* Customer Details & Schedule */}
                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer Name:</span>
                    <strong className="text-white">{scannedBooking.customerName || "Verified Driver"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Phone:</span>
                    <span className="text-slate-300 font-mono">{scannedBooking.customerPhone || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Facility:</span>
                    <span className="text-white font-medium">{scannedBooking.parkingName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reserved Time Slot:</span>
                    <span className="text-amber-300 font-medium">{scannedBooking.startTime} - {scannedBooking.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className="text-emerald-400 font-bold uppercase">{scannedBooking.paymentStatus}</span>
                  </div>

                  {scannedBooking.entryTime && (
                    <div className="pt-2 border-t border-slate-800/80 flex justify-between text-emerald-400 font-semibold">
                      <span>Gate Entry Time:</span>
                      <span>{new Date(scannedBooking.entryTime).toLocaleTimeString()}</span>
                    </div>
                  )}

                  {scannedBooking.exitTime && (
                    <div className="flex justify-between text-blue-400 font-semibold">
                      <span>Gate Exit Time:</span>
                      <span>{new Date(scannedBooking.exitTime).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* REAL-TIME GATE ACTION BUTTONS THAT UPDATE BACKEND */}
                <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    isLoading={actionLoading}
                    disabled={scannedBooking.bookingStatus === "ACTIVE" || scannedBooking.bookingStatus === "COMPLETED"}
                    icon={<LogIn className="w-4 h-4" />}
                    onClick={handleConfirmEntry}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
                  >
                    Confirm Entry
                  </Button>

                  <Button
                    variant="accent"
                    isLoading={actionLoading}
                    disabled={scannedBooking.bookingStatus !== "ACTIVE"}
                    icon={<LogOut className="w-4 h-4" />}
                    onClick={handleConfirmExit}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                  >
                    Confirm Exit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs space-y-3">
                <QrCode className="w-12 h-12 mx-auto opacity-30 text-slate-400" />
                <p>No ticket scanned yet. Use the optical viewfinder or click a sample QR pass to test verification.</p>
              </div>
            )}
          </div>

          {/* RECENT SCAN SESSION LOGS */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Recent Scans this Shift
            </h4>

            {recentScans.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No recent scan history.</p>
            ) : (
              <div className="space-y-2">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => setScannedBooking(scan)}
                    className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <span className="font-bold text-white block">{scan.vehicleNumber}</span>
                      <span className="text-[10px] text-slate-400">Bay {scan.slotNumber} • {scan.customerName}</span>
                    </div>
                    <Badge status={scan.bookingStatus} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerPage;

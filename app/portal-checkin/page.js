"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import imageCompression from "browser-image-compression";
import { Briefcase, Camera, Check, Clock, LogOut, MapPin, RotateCw, ShieldCheck, Undo2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../utils/auth";
import axios from "../utils/axios";
import { LiveClock } from "../components/LiveClock";
import { formatTimeWithSecond } from "../utils/format";
import Notification from "../components/Notification";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation"; // 👈 Disesuaikan untuk Next.js App Router (Ganti "next/router" jika pakai Pages Router)

const PortalCheckin = () => {
    const router = useRouter();
    const { user, authLoading, logout } = useAuth({ middleware: "auth" });

    // React 19 useTransition hook untuk pengelolaan async submit yang aman
    const [isPending, startTransition] = useTransition();

    const userRole = user?.role;
    const userName = user?.name;

    const [notification, setNotification] = useState("");
    const [warehouseId, setWarehouseId] = useState(null);
    const [warehouseName, setWarehouseName] = useState(null);
    const [openingTime, setOpeningTime] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [error, setError] = useState(null);
    const [timeIn, setTimeIn] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [fileLoading, setFileLoading] = useState(false);
    const [statusText, setStatusText] = useState("");

    // 1. FIX: Redirect dimasukkan ke useEffect sesuai aturan React
    useEffect(() => {
        if (user?.has_checked_in) {
            router.push("/transaction");
        }
    }, [user?.has_checked_in, router]);

    const getLocationPromise = () =>
        new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject({ code: 0, message: "Browser tidak mendukung GPS" });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    resolve({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                    });
                },
                (err) => reject(err),
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                },
            );
        });

    const initLocationAndWarehouse = useCallback(async () => {
        setLocationLoading(true);
        setError(null);
        try {
            const loc = await getLocationPromise();
            setLocation(loc);

            const response = await axios.get(`/api/get-nearest-warehouse`, {
                params: {
                    latitude: loc.lat,
                    longitude: loc.lng,
                },
            });

            if (response.data.found && response.data.warehouse) {
                const wh = response.data.warehouse;
                setWarehouseId(wh.id);
                setWarehouseName(wh.name);
                setOpeningTime(wh.opening_time);
            } else {
                setError(response.data.message || "Anda berada di luar jangkauan warehouse manapun.");
                setWarehouseId(null);
                setWarehouseName(null);
                setOpeningTime(null);
            }
        } catch (err) {
            console.error(err);
            if (err.code === 1) alert("Izin lokasi ditolak");
            else if (err.code === 2) alert("Lokasi tidak tersedia");
            else if (err.code === 3) alert("GPS timeout");
            else alert("Gagal mengambil data lokasi & warehouse");
        } finally {
            setLocationLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            initLocationAndWarehouse();
        }, 0);

        return () => clearTimeout(timer);
    }, [initLocationAndWarehouse]);

    const handleFileChange = async (e) => {
        const imageFile = e.target.files?.[0];
        if (!imageFile) return;

        if (!imageFile.type.startsWith("image/")) {
            alert("File harus berupa gambar");
            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setPreview(objectUrl);

        setFileLoading(true);
        try {
            await getAddress(location.lat, location.lng);
            const compressed = await imageCompression(imageFile, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 480,
                useWebWorker: true,
            });

            setFile(compressed);
            setTimeIn(formatTimeWithSecond(new Date()));
        } catch (error) {
            console.error("Compression error:", error);
        } finally {
            setFileLoading(false);
        }
    };

    async function getAddress(lat, lng) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
                headers: {
                    "User-Agent": "YourAppName/1.0 (your-email@example.com)",
                    "Accept-Language": "id",
                },
            });
            const data = await res.json();
            setAddress(data.address);
        } catch (err) {
            console.error("Gagal mendapatkan alamat makro:", err);
        }
    }

    // 2. FIX: Handled dengan React 19 startTransition
    const handleSubmit = () => {
        if (!file) {
            alert("Upload foto dulu!");
            return;
        }
        if (!location) {
            alert("Lokasi belum berhasil diambil!");
            return;
        }
        if (!warehouseId) {
            alert("Anda tidak berada di radius warehouse terdekat!");
            return;
        }

        startTransition(async () => {
            const formData = new FormData();
            formData.append("photo", file);
            formData.append("latitude", location.lat);
            formData.append("longitude", location.lng);
            formData.append("warehouse_id", warehouseId);
            formData.append("role", userRole);
            formData.append("time_in", timeIn);

            try {
                await axios.post("/api/create-attendance", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("Absensi berhasil!");
                setFile(null);
                setPreview(null);
                setLocation(null);
                router.push("/transaction"); // 👈 Pakai router.push agar smooth tanpa reload
            } catch (error) {
                setError(error.response?.data?.message || "Absensi gagal!");
                setNotification(error.response?.data?.message || "Absensi gagal!");
                console.error(error);
            }
        });
    };

    // Mencegah flash UI saat memproses redirect jika user sudah check-in
    if (user?.has_checked_in) {
        return null;
    }

    return (
        <>
            <Notification message={notification} onClose={() => setNotification("")} duration={9000} />
            <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-3 sm:p-4 font-sans antialiased selection:bg-indigo-500 selection:text-white overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-4xl bg-[#111827] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-indigo-950/20"
                >
                    {/* TOP PANEL: STATUS PERIMETER WAREHOUSE */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-[#0d131f] border border-slate-800/80 rounded-xl">
                        <div
                            className={`p-2 rounded-lg border shrink-0 ${
                                warehouseId ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-slate-800/50 border-slate-700 text-slate-500"
                            }`}
                        >
                            <ShieldCheck size={20} strokeWidth={2} className={locationLoading ? "animate-pulse" : ""} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Current Location Perimeter</span>
                            <h1 className="text-sm font-bold text-white truncate">
                                {warehouseName ? (
                                    warehouseName
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                                        <span className="h-1.5 w-1.5 animate-ping rounded-full bg-indigo-500"></span>
                                        {locationLoading ? "Mencari Warehouse..." : "Perimeter Belum Terkunci"}
                                    </span>
                                )}
                            </h1>
                            <p className="text-[11px] text-slate-400 truncate">
                                Logged in: <span className="text-slate-200 font-semibold">{userName}</span> • {statusText}
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={logout}
                            title="Logout"
                            className="p-2 rounded-lg border border-slate-800 bg-[#111827] text-slate-500 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all cursor-pointer"
                        >
                            <LogOut size={15} strokeWidth={2} />
                        </motion.button>
                    </div>

                    {/* GRID DUA KOLOM UNTUK VERIFIKASI (COMPACT) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {/* 1. PHOTO ID VERIFICATION */}
                        <div className="flex flex-col">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">1. Photo ID Verification</h2>

                            <div className="relative flex-1 border border-slate-800/80 bg-[#0d131f] rounded-xl p-3 flex flex-col items-center justify-center text-center min-h-47.5">
                                {preview ? (
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key="preview"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="w-full flex flex-col items-center"
                                        >
                                            <div className="relative w-full h-28 sm:h-32 rounded-lg overflow-hidden border border-slate-800 shadow-md">
                                                <Image src={preview} fill className="object-cover" alt="Preview Absensi" />
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    setFile(null);
                                                    setPreview(null);
                                                    setError(null);
                                                    setTimeIn(null);
                                                    if (preview) URL.revokeObjectURL(preview);
                                                }}
                                                className="mt-2.5 px-3 py-1.5 flex items-center gap-1.5 rounded-lg text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                                            >
                                                <Undo2 size={12} strokeWidth={2.5} /> Retake / Change Image
                                            </motion.button>
                                        </motion.div>
                                    </AnimatePresence>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-full mb-2">
                                            <Camera size={20} strokeWidth={2} />
                                        </div>
                                        <h3 className="text-xs font-semibold text-slate-200 mb-0.5">Image Capture Required</h3>
                                        <p className="text-[10px] text-slate-500 max-w-50 mb-3 leading-tight">
                                            Take a real-time photo to verify your presence.
                                        </p>

                                        <motion.label
                                            whileHover={location ? { scale: 1.02 } : {}}
                                            whileTap={location ? { scale: 0.98 } : {}}
                                            htmlFor="photo"
                                            className={`px-4 py-2 flex gap-2 items-center rounded-lg font-bold text-[11px] uppercase tracking-wider text-white transition-all shadow-md ${
                                                location
                                                    ? "bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-indigo-600/10"
                                                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                                            }`}
                                        >
                                            <Camera size={14} strokeWidth={2.5} /> Capture Image
                                        </motion.label>
                                    </div>
                                )}

                                <input
                                    id="photo"
                                    type="file"
                                    capture="environment"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={!location}
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* 2. GEOGRAPHICAL GPS VERIFICATION */}
                        <div className="flex flex-col">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">2. Geographical GPS Verification</h2>

                            <div className="flex-1 bg-[#0d131f] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`p-1.5 rounded-lg border ${
                                                location
                                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                    : "bg-slate-800/50 border-slate-700 text-slate-500"
                                            }`}
                                        >
                                            <MapPin size={15} strokeWidth={2.5} className={locationLoading ? "animate-spin" : ""} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-semibold text-white">
                                                {location ? "GPS Coordinates Acquired" : "Locking Satellite Signal..."}
                                            </h3>
                                            <p className="text-[10px] text-slate-500">
                                                Status:{" "}
                                                <span className={location ? "text-emerald-400 font-medium" : "text-amber-500 font-medium"}>
                                                    {location ? "Connected & Encrypted" : "Searching..."}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={initLocationAndWarehouse}
                                        disabled={locationLoading}
                                        className="px-2.5 py-1.5 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-300 flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                                    >
                                        <RotateCw size={11} strokeWidth={2.5} className={locationLoading ? "animate-spin" : ""} />
                                        {locationLoading ? "Syncing..." : "Retry GPS"}
                                    </motion.button>
                                </div>

                                {/* Grid Nilai Koordinat */}
                                <div className="grid grid-cols-3 gap-2 text-left font-mono my-2">
                                    <div className="bg-[#111827]/60 p-2 rounded-lg border border-slate-800/50">
                                        <span className="block text-[8px] uppercase font-bold tracking-wider text-slate-500 font-sans">Latitude</span>
                                        <span className="text-[11px] font-semibold text-slate-200 truncate block">{location ? location.lat : "-"}</span>
                                    </div>
                                    <div className="bg-[#111827]/60 p-2 rounded-lg border border-slate-800/50">
                                        <span className="block text-[8px] uppercase font-bold tracking-wider text-slate-500 font-sans">Longitude</span>
                                        <span className="text-[11px] font-semibold text-slate-200 truncate block">{location ? location.lng : "-"}</span>
                                    </div>
                                    <div className="bg-[#111827]/60 p-2 rounded-lg border border-slate-800/50">
                                        <span className="block text-[8px] uppercase font-bold tracking-wider text-slate-500 font-sans">Accuracy</span>
                                        <span className={`text-[11px] font-semibold ${location ? "text-emerald-400" : "text-slate-500"}`}>
                                            {location ? `± ${Math.round(location.accuracy)}m` : "-"}
                                        </span>
                                    </div>
                                </div>

                                {/* Address Box */}
                                <div className="bg-[#111827]/40 px-2.5 py-1.5 rounded-lg border border-slate-800/40 text-left min-h-8.5 flex flex-col justify-center">
                                    <span className="text-[8px] uppercase font-bold tracking-wider text-slate-500 block">Detected Address</span>
                                    <p className="text-[11px] text-slate-400 leading-tight truncate">
                                        {address
                                            ? `${address.road || address.suburb || ""}, ${address.city || address.regency || ""}, ${address.state || ""}`
                                            : "Mencari lokasi spesifik..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. SHIFT CONFIGURATION & METADATA */}
                    <div className="mb-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-lg shrink-0">
                                    <Briefcase size={14} />
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[8px] uppercase font-black tracking-wider text-slate-500">Assigned Position</span>
                                    <span className="text-xs font-bold text-slate-200 truncate block">{user?.role || "Staf"}</span>
                                </div>
                            </div>

                            <div className="bg-[#0d131f] border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5">
                                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-lg shrink-0">
                                    <Clock size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="block text-[8px] uppercase font-black tracking-wider text-slate-500">Timestamp</span>
                                    <div className="text-xs font-mono font-bold text-slate-200">
                                        {timeIn ? (
                                            <span className="text-indigo-400">{timeIn}</span>
                                        ) : (
                                            <LiveClock textSize="text-xs" style="font-mono font-bold text-slate-200" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ERROR FEEDBACK */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="mb-3 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 text-[11px] font-semibold text-rose-400 text-center"
                            >
                                ⚠️ {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* TOMBOL SUBMIT UTAMA */}
                    <div>
                        <motion.button
                            whileHover={location && file && !isPending ? { scale: 1.01 } : {}}
                            whileTap={location && file && !isPending ? { scale: 0.99 } : {}}
                            onClick={handleSubmit}
                            disabled={!location || !file || isPending}
                            className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
                                location && file && !isPending
                                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/15 cursor-pointer"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                            }`}
                        >
                            {isPending ? (
                                <span>Encrypting & Transmitting Data...</span>
                            ) : (
                                <>
                                    <Check size={15} strokeWidth={3} />
                                    {"Submit Today's Attendance Log"}
                                </>
                            )}
                        </motion.button>
                        <p className="text-[9px] font-medium text-slate-500 text-center mt-2 tracking-wide">
                            {fileLoading
                                ? "Mengompresi kualitas gambar..."
                                : !file || !location
                                  ? "Acquire GPS coordinate locks and a verification photo to unlock form submission."
                                  : "Form ready. Proceeding will save this attendance instance."}
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default PortalCheckin;

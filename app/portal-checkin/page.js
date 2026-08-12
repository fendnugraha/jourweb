"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import imageCompression from "browser-image-compression";
import { Camera, Check, Clock, LogOut, MapPin, Navigation, RefreshCw, Sparkles, Undo2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../utils/auth";
import axios from "../utils/axios";
import { LiveClock } from "../components/LiveClock";
import { formatTimeWithSecond } from "../utils/format";
import Notification from "../components/Notification";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import InactiveUserScreen from "./InActiveUserScreen";

const PortalCheckin = () => {
    const router = useRouter();
    const { user, logout } = useAuth({ middleware: "auth" });
    const isUserActive = user?.is_active;

    const [isPending, startTransition] = useTransition();

    const userRole = user?.role;
    const userName = user?.name;

    const [notification, setNotification] = useState("");
    const [warehouseId, setWarehouseId] = useState(null);
    const [warehouseName, setWarehouseName] = useState(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [error, setError] = useState(null);
    const [timeIn, setTimeIn] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [fileLoading, setFileLoading] = useState(false);

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
            } else {
                setError(response.data.message || "Kamu sedang di luar jangkauan lokasi absen.");
                setWarehouseId(null);
                setWarehouseName(null);
            }
        } catch (err) {
            console.error(err);
            if (err.code === 1) alert("Izin lokasi ditolak");
            else if (err.code === 2) alert("Lokasi tidak ditemukan");
            else if (err.code === 3) alert("Gagal mengambil GPS (timeout)");
            else alert("Gagal mengambil data lokasi");
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
            alert("File harus berupa gambar!");
            return;
        }

        if (preview) URL.revokeObjectURL(preview);

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
                    "User-Agent": "YourAppName/1.0",
                    "Accept-Language": "id",
                },
            });
            const data = await res.json();
            setAddress(data.address);
        } catch (err) {
            console.error("Gagal mendapatkan alamat:", err);
        }
    }

    const handleSubmit = () => {
        if (!file) return alert("Ambil foto dulu ya!");
        if (!location) return alert("Lokasi belum ditemukan!");
        if (!warehouseId) return alert("Kamu belum berada di lokasi warehouse!");

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
                router.push("/transaction");
            } catch (error) {
                setError(error.response?.data?.message || "Absensi gagal!");
                setNotification(error.response?.data?.message || "Absensi gagal!");
            }
        });
    };

    if (user?.has_checked_in) return null;

    if (!isUserActive) return <InactiveUserScreen logout={logout} />;

    return (
        <>
            <Notification message={notification} onClose={() => setNotification("")} duration={9000} />
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased selection:bg-indigo-500 selection:text-white">
                {/* Background Ambient Blur */}
                <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="fixed bottom-10 right-10 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative z-10"
                >
                    {/* Header Pengguna */}
                    <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/60">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                                {userName?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-white flex items-center gap-1.5">Halo, {userName || "Teman"} 👋</h1>
                                <p className="text-xs text-slate-400">{userRole ? `Posisi: ${userRole}` : "Siap untuk absen hari ini?"}</p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={logout}
                            className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/40 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Keluar"
                        >
                            <LogOut size={16} />
                        </motion.button>
                    </div>

                    {/* Card Status Lokasi & Akurasi GPS */}
                    <div className="mb-5 p-3.5 bg-slate-800/30 border border-slate-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={`p-2.5 rounded-xl shrink-0 ${warehouseName ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}
                                >
                                    <MapPin size={18} className={locationLoading ? "animate-bounce" : ""} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Lokasi Saat Ini</span>
                                    <p className="text-xs font-semibold text-white truncate">
                                        {warehouseName || (locationLoading ? "Mencari lokasi..." : "Di Luar Jangkauan")}
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={initLocationAndWarehouse}
                                disabled={locationLoading}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                            >
                                <RefreshCw size={12} className={locationLoading ? "animate-spin" : ""} />
                                {locationLoading ? "Sync..." : ""}
                            </motion.button>
                        </div>

                        {/* 🎯 TAMPILAN AKURASI GPS BERBASIS METER */}
                        {location && (
                            <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Navigation size={13} className="text-indigo-400" />
                                    <span>Sinyal GPS:</span>
                                </div>
                                <span
                                    className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                                        location.accuracy <= 50
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    }`}
                                >
                                    ± {Math.round(location.accuracy)} m {location.accuracy <= 30 ? "(High)" : ""}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Area Kamera & Preview Foto */}
                    <div className="mb-5">
                        <label className="text-xs font-medium text-slate-300 block mb-2">Foto Absen Hari Ini</label>
                        <div className="border border-dashed border-slate-700/80 bg-slate-950/40 rounded-2xl p-4 text-center min-h-44 flex flex-col items-center justify-center relative overflow-hidden">
                            {preview ? (
                                <AnimatePresence mode="wait">
                                    <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col items-center">
                                        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-800 shadow-md mb-3">
                                            <Image src={preview} fill className="object-cover" alt="Preview Foto" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFile(null);
                                                setPreview(null);
                                                setTimeIn(null);
                                            }}
                                            className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Undo2 size={13} /> Foto Ulang
                                        </button>
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <div className="flex flex-col items-center py-2">
                                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-2">
                                        <Camera size={22} />
                                    </div>
                                    <p className="text-xs font-medium text-slate-300 mb-1">Ambil Foto Selfie</p>
                                    <p className="text-[11px] text-slate-500 max-w-xs mb-3">
                                        {location ? "Kamera siap, pastikan wajah terlihat jelas ya." : "Nyalakan GPS dulu untuk bisa ambil foto."}
                                    </p>

                                    <label
                                        htmlFor="photo"
                                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                                            location
                                                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                        }`}
                                    >
                                        <Camera size={14} /> Buka Kamera
                                    </label>
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

                    {/* Informasi Waktu & Alamat Singkat */}
                    <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                        <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/50 flex items-center gap-2.5">
                            <Clock size={16} className="text-indigo-400 shrink-0" />
                            <div>
                                <span className="text-[10px] text-slate-500 block">Jam Absen</span>
                                <span className="font-mono font-semibold text-slate-200">
                                    {timeIn || <LiveClock textSize="text-xs" style="font-mono font-semibold text-slate-200" />}
                                </span>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/50 flex items-center gap-2.5">
                            <Sparkles size={16} className="text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                                <span className="text-[10px] text-slate-500 block">Alamat Terdeteksi</span>
                                <span className="text-[11px] text-slate-300 truncate block">
                                    {address ? address.city || address.suburb || "Terdeteksi" : "Menunggu GPS..."}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Error Box */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-medium text-rose-400 text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tombol Simpan / Kirim Absen */}
                    <motion.button
                        whileHover={location && file && !isPending ? { scale: 1.01 } : {}}
                        whileTap={location && file && !isPending ? { scale: 0.99 } : {}}
                        onClick={handleSubmit}
                        disabled={!location || !file || !warehouseId || isPending}
                        className={`w-full py-3.5 rounded-2xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
                            location && file && warehouseId && !isPending
                                ? "bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-600/20 cursor-pointer"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
                        }`}
                    >
                        {isPending ? (
                            <span>Mengirim Absensi...</span>
                        ) : (
                            <>
                                <Check size={16} strokeWidth={2.5} />
                                Kirim Absen Masuk
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </div>
        </>
    );
};

export default PortalCheckin;

"use client";

import { useCallback, useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import {
    AlertCircle,
    Briefcase,
    Camera,
    CameraIcon,
    Check,
    Clock,
    LocateIcon,
    LogOut,
    MapPin,
    RotateCw,
    ShieldCheck,
    Trash2Icon,
    Undo,
    Undo2,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "../utils/auth";
import axios from "../utils/axios";
import { LiveClock } from "../components/LiveClock";
import { formatTimeWithSecond } from "../utils/format";

const PortalCheckin = ({ attCheckMutate, openMessage }) => {
    const { user, authLoading, logout } = useAuth({ middleware: "auth" });
    const [loaded, setLoaded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [warehouseId, setWarehouseId] = useState(null); // 🔥 Simpan ID untuk dikirim ke backend
    const [warehouseName, setWarehouseName] = useState(null);
    const [openingTime, setOpeningTime] = useState(null);
    const userName = user?.name;
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const [type, setType] = useState("Kasir");
    const [error, setError] = useState(null);
    const [timeIn, setTimeIn] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [fileLoading, setFileLoading] = useState(false);
    const [statusText, setStatusText] = useState("");

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

            // 🔥 SESUAIKAN DI SINI (Membaca response.data.warehouse sesuai JSON Laravel)
            if (response.data.found && response.data.warehouse) {
                const wh = response.data.warehouse;
                setWarehouseId(wh.id);
                setWarehouseName(wh.name);
                setOpeningTime(wh.opening_time); // Sekarang tidak akan crash lagi!
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
        // setTimeout dengan angka 0 akan melempar fungsi ini ke antrean event loop berikutnya,
        // sehingga proses render React dijamin sudah selesai 100%
        const timer = setTimeout(() => {
            initLocationAndWarehouse();
        }, 0);

        return () => clearTimeout(timer); // Bersihkan timer jika komponen unmount
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

    // Upload ke Backend Laravel
    const handleSubmit = async () => {
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

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("photo", file);
        formData.append("latitude", location.lat);
        formData.append("longitude", location.lng);
        formData.append("warehouse_id", warehouseId); // 🔥 Kirim ID biar backend bisa validasi ulang posisi user
        formData.append("type", type);
        formData.append("time_in", timeIn);

        try {
            await axios.post("/api/create-attendance", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Absensi berhasil!");
            setFile(null);
            setPreview(null);
            setLocation(null);
            openMessage(true);
        } catch (error) {
            setError(error.response?.data?.message || "Absensi gagal!");
            console.error(error);
            return;
        } finally {
            window.location.href = "/transaction";
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-4 font-sans antialiased selection:bg-indigo-500 selection:text-white">
            <div className="w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/20">
                {/* TOP PANEL: STATUS PERIMETER WAREHOUSE */}
                <div className="flex items-center gap-4 mb-8 p-4 bg-[#0d131f] border border-slate-800 rounded-2xl animate-fadeIn">
                    <div
                        className={`p-3 rounded-xl border ${warehouseId ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-slate-800/50 border-slate-700 text-slate-500"}`}
                    >
                        <ShieldCheck size={24} strokeWidth={2} className={locationLoading ? "animate-pulse" : ""} />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 block">Current Location Perimeter</span>
                        <h1 className="text-base font-bold text-white mt-0.5">
                            {warehouseName ? (
                                warehouseName
                            ) : (
                                <span className="inline-flex items-center gap-2 text-slate-400 font-medium">
                                    <span className="h-2 w-2 animate-ping rounded-full bg-indigo-500"></span>
                                    {locationLoading ? "Mencari Warehouse Terdekat..." : "Perimeter Belum Terkunci"}
                                </span>
                            )}
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Logged in as: <span className="text-slate-200 font-semibold">{userName}</span> • {statusText}
                        </p>
                    </div>
                    {/* 🔥 LOGOUT GANTI IKON */}
                    <button
                        onClick={logout}
                        title="Logout"
                        className="p-2 rounded-xl border border-slate-800 bg-[#111827] text-slate-500 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all active:scale-95 self-start"
                    >
                        <LogOut size={16} strokeWidth={2} />
                    </button>
                </div>

                {/* 1. PHOTO ID VERIFICATION */}
                <div className="mb-8">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">1. Photo ID Verification</h2>

                    <div className="relative border border-slate-800 bg-[#0d131f] rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-65 transition-all">
                        {preview ? (
                            /* Tampilan ketika FOTO SUDAH ADA */
                            <div className="w-full flex flex-col items-center animate-fadeIn">
                                <div className="relative w-full max-w-md h-48 rounded-xl overflow-hidden shadow-md border border-slate-800">
                                    <Image src={preview} fill className="object-cover" alt="Preview Absensi" />
                                </div>
                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setPreview(null);
                                        setError(null);
                                        setTimeIn(null);
                                        if (preview) URL.revokeObjectURL(preview);
                                    }}
                                    className="mt-4 px-5 py-2.5 flex items-center gap-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all active:scale-[0.98]"
                                >
                                    <Undo2 size={14} strokeWidth={2.5} /> Retake / Change Image
                                </button>
                            </div>
                        ) : (
                            /* Tampilan ketika FOTO BELUM ADA */
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-slate-900 border border-slate-800 text-slate-500 rounded-full mb-4 shadow-inner">
                                    <Camera size={26} strokeWidth={2} />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-200 mb-1">Image Capture Required</h3>
                                <p className="text-xs text-slate-500 max-w-70 mb-6">Take a real-time photo using your device camera to verify your presence.</p>

                                <label
                                    htmlFor="photo"
                                    className={`px-6 py-3 flex gap-2.5 items-center rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all shadow-lg active:scale-[0.98] ${
                                        location
                                            ? "bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-indigo-600/10"
                                            : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                                    }`}
                                >
                                    <Camera size={16} strokeWidth={2.5} /> Capture Verification Image
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

                {/* 2. GEOGRAPHICAL GPS VERIFICATION & RETRY */}
                <div className="mb-8">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">2. Geographical GPS Verification</h2>
                    <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60 mb-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`p-2.5 rounded-xl border mt-0.5 ${location ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-slate-800/50 border-slate-700 text-slate-500"}`}
                                >
                                    <MapPin size={18} strokeWidth={2.5} className={locationLoading ? "animate-spin" : ""} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">
                                        {location ? "GPS Coordinates Acquired" : "Locking Satellite Signal..."}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Status:{" "}
                                        <span className={location ? "text-emerald-400 font-medium" : "text-amber-500 font-medium"}>
                                            {location ? "Connected & Encrypted" : "Searching..."}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={initLocationAndWarehouse}
                                disabled={locationLoading}
                                className="px-4 py-2 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/50 flex items-center gap-1.5 transition-all active:scale-[0.97] disabled:opacity-50"
                            >
                                <RotateCw size={12} strokeWidth={2.5} className={locationLoading ? "animate-spin" : ""} />
                                {locationLoading ? "Syncing..." : "Retry GPS Sync"}
                            </button>
                        </div>

                        {/* Grid Nilai Koordinat */}
                        <div className="grid grid-cols-3 gap-3 text-left font-mono mb-3">
                            <div className="bg-[#111827]/60 p-3 rounded-xl border border-slate-800/50">
                                <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 font-sans mb-1">Latitude</span>
                                <span className="text-xs font-semibold text-slate-200">{location ? location.lat : "-"}</span>
                            </div>
                            <div className="bg-[#111827]/60 p-3 rounded-xl border border-slate-800/50">
                                <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 font-sans mb-1">Longitude</span>
                                <span className="text-xs font-semibold text-slate-200">{location ? location.lng : "-"}</span>
                            </div>
                            <div className="bg-[#111827]/60 p-3 rounded-xl border border-slate-800/50">
                                <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 font-sans mb-1">Accuracy</span>
                                <span className={`text-xs font-semibold ${location ? "text-emerald-400" : "text-slate-500"}`}>
                                    {location ? `± ${Math.round(location.accuracy)}m` : "-"}
                                </span>
                            </div>
                        </div>

                        {/* Preview Alamat Terbaca Makro */}
                        {address && (
                            <div className="bg-[#111827]/30 px-3 py-2.5 rounded-xl border border-slate-800/40 text-left">
                                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">Detected Address</span>
                                <p className="text-xs text-slate-400 leading-relaxed truncate">
                                    {address.road || address.suburb || ""}, {address.city || address.regency || ""}, {address.state || ""}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. SHIFT CONFIGURATION & METADATA (FIXED USER ROLE & LIVE CLOCK) */}
                <div className="mb-8">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4">3. Attendance Shift Metadata</h2>
                    <div className="bg-[#0d131f] border border-slate-800 rounded-2xl p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Info Role Bawaan User (Tanpa Select Option) */}
                            <div className="bg-[#111827]/60 border border-slate-800/70 rounded-xl p-4 flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-lg">
                                    <Briefcase size={16} />
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">Assigned Position</span>
                                    <span className="text-sm font-bold text-slate-200 mt-0.5 block">{user?.role || "Staf"}</span>
                                </div>
                            </div>

                            {/* LiveClock terintegrasi dengan penanda absensi */}
                            <div className="bg-[#111827]/60 border border-slate-800/70 rounded-xl p-4 flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-lg">
                                    <Clock size={16} />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500">Time / Timestamp</span>
                                    <div className="mt-0.5 block">
                                        {timeIn ? (
                                            <span className="text-sm font-mono font-bold text-indigo-400">{timeIn}</span>
                                        ) : (
                                            /* 🔥 PANGGIL LIVE CLOCK DI SINI */
                                            <LiveClock textSize="text-sm" style="font-mono font-bold text-slate-200" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Feedback */}
                {error && (
                    <div className="mb-5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs font-semibold text-rose-400 text-center">
                        ⚠️ {error}
                    </div>
                )}

                {/* TOMBOL SUBMIT UTAMA */}
                <div>
                    <button
                        onClick={handleSubmit}
                        disabled={!location || !file || isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                            location && file && !isSubmitting
                                ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/10 cursor-pointer"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60"
                        }`}
                    >
                        {isSubmitting ? (
                            <span>Encrypting & Transmitting Data...</span>
                        ) : (
                            <>
                                <Check size={16} strokeWidth={3} />
                                {"Submit Today's Attendance Log"}
                            </>
                        )}
                    </button>
                    <p className="text-[10px] font-medium text-slate-500 text-center mt-3 tracking-wide">
                        {fileLoading
                            ? "Mengompresi kualitas gambar..."
                            : !file || !location
                              ? "Acquire GPS coordinate locks and a verification photo to unlock form submission."
                              : "Form ready. Proceeding will save this attendance instance to database log hashes."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PortalCheckin;

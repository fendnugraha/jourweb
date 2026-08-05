"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, Clock, User, CheckCircle2, Loader2, ImageOff, Save, ChevronDown } from "lucide-react";
import useEmployee from "@/app/hooks/useEmployee";

const AttendanceDetail = ({ selectedWarehouse, mutate, notification, isModalOpen, userRole }) => {
    const isAdmin = ["Administrator", "Super Admin"].includes(userRole);
    const attendance = selectedWarehouse?.attendance?.[0];

    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        contact_id: "",
        time_in: "",
        approval_status: "",
    });

    const { employees } = useEmployee(); // Assuming you have a custom hook to fetch employees

    useEffect(() => {
        setFormData({
            contact_id: attendance?.contact_id || "",
            time_in: attendance?.time_in || "",
            approval_status: attendance?.approval_status || "Pending",
        });
    }, [selectedWarehouse, attendance]);

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!attendance?.id) return;

        startTransition(async () => {
            try {
                const response = await axios.put(`/api/attendance/${attendance.id}`, formData);

                notification?.({
                    type: "success",
                    message: response.data?.message || "Data berhasil diperbarui!",
                });

                if (mutate) await mutate();
                if (typeof isModalOpen === "function") isModalOpen(false);
            } catch (error) {
                console.error("Error updating attendance:", error);
                notification?.({
                    type: "error",
                    message: error.response?.data?.message || "Gagal memperbarui data.",
                });
            }
        });
    };

    // Badge status selaras dengan warna modal
    const getStatusBadge = (status) => {
        switch (status) {
            case "Good":
            case "Approved":
                return { label: "Approved", class: "bg-emerald-50 text-emerald-600 border-emerald-200" };
            case "Late":
                return { label: "Late", class: "bg-rose-50 text-rose-500 border-rose-200" };
            case "Overtime":
                return { label: "Lembur", class: "bg-indigo-50 text-indigo-600 border-indigo-200" };
            default:
                return { label: "Pending", class: "bg-amber-50 text-amber-600 border-amber-200" };
        }
    };

    const statusInfo = getStatusBadge(attendance?.approval_status);

    return (
        <div className="w-full text-slate-700 font-sans antialiased space-y-2">
            {/* Header Informasi Outlet (Ringkas & Seimbang) */}
            <div className="flex items-center justify-between pb-3">
                <div>
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Lokasi Perimeter</p>
                    <h3 className="text-base font-extrabold text-slate-800 tracking-tight">{selectedWarehouse?.name || "Nama Outlet"}</h3>
                </div>

                {attendance?.approval_status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.class}`}>{statusInfo.label}</span>
                )}
            </div>

            {/* Content Body (2 Kolom Sejajar) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* 1. SEKSI FOTO BUKTI (Tinggi disesuaikan dengan form kanan) */}
                <div className="md:col-span-5 flex flex-col">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Foto Bukti</label>
                    <div className="relative w-full flex-1 min-h-[220px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center group shadow-sm">
                        {attendance?.photo_url || attendance?.photo ? (
                            <Image
                                src={attendance.photo_url || attendance.photo}
                                alt={selectedWarehouse?.name || "Foto Absensi"}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 text-slate-400 p-4 text-center">
                                <ImageOff size={26} strokeWidth={1.5} />
                                <span className="text-xs font-medium">Tidak ada foto</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. SEKSI FORM & DETAIL ALAMAT */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                    {/* Alamat Card (Lebih Terintegrasi) */}
                    <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl space-y-2">
                        <div className="flex items-start gap-2.5">
                            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl shrink-0 mt-0.5">
                                <MapPin size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Alamat Terdeteksi</span>
                                <p className="text-xs text-slate-600 font-medium leading-snug line-clamp-2 mt-0.5">
                                    {selectedWarehouse?.address || "Alamat belum disetting"}
                                </p>
                            </div>
                        </div>

                        {attendance?.latitude && attendance?.longitude && (
                            <div className="pt-2 flex justify-end">
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://www.google.com/maps?q=${attendance.latitude},${attendance.longitude}`}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-all"
                                >
                                    <ExternalLink size={12} />
                                    <span>Buka lokasi di Google Maps</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Inputs Form */}
                    <div className="space-y-3 text-xs">
                        {/* Select Staf / Kasir */}
                        <div>
                            <label className="text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                                <User size={14} className="text-indigo-500" /> Staf / Kasir
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium appearance-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                                    value={formData.contact_id}
                                    onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                                    disabled={!isAdmin || isPending}
                                >
                                    <option value="">-- Pilih Staf --</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.contact_id}>
                                            {emp.contact?.name || emp.name || `Karyawan #${emp.id}`}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Grid Jam Absen & Status */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Input Jam Absen */}
                            <div>
                                <label className="text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                                    <Clock size={14} className="text-indigo-500" /> Jam Absen
                                </label>
                                {attendance?.created_at ? (
                                    <input
                                        type="time"
                                        step="1"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 font-mono font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 shadow-sm"
                                        value={formData.time_in}
                                        onChange={(e) => setFormData({ ...formData, time_in: e.target.value })}
                                        disabled={!isAdmin || isPending}
                                    />
                                ) : (
                                    <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 italic">Belum Absen</div>
                                )}
                            </div>

                            {/* Select Status */}
                            <div>
                                <label className="text-slate-600 font-bold mb-1.5 flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className="text-indigo-500" /> Status
                                </label>
                                {attendance?.created_at ? (
                                    <div className="relative">
                                        <select
                                            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 font-medium appearance-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm truncate"
                                            value={formData.approval_status}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    approval_status: e.target.value,
                                                })
                                            }
                                            disabled={!isAdmin || isPending}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Good">Tepat Waktu (Good)</option>
                                            <option value="Late">Terlambat (Late)</option>
                                            <option value="Overtime">Lembur (Overtime)</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                ) : (
                                    <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 italic">Belum Absen</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action Button (Bersih & Elegan) */}
            {isAdmin && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    {typeof isModalOpen === "function" && (
                        <button
                            type="button"
                            onClick={() => isModalOpen(false)}
                            disabled={isPending}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                    )}

                    <motion.button
                        whileHover={!isPending ? { scale: 1.01 } : {}}
                        whileTap={!isPending ? { scale: 0.99 } : {}}
                        onClick={handleUpdate}
                        disabled={isPending || !formData.approval_status || !attendance?.id}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-md shadow-slate-900/10 flex items-center gap-2 text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Save size={14} />
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default AttendanceDetail;

/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, ExternalLink, Clock, User, CheckCircle2, Loader2, ImageOff, Save, ChevronDown, AlarmClockPlus, Star } from "lucide-react";
import useEmployee from "@/app/hooks/useEmployee";
import axios from "@/app/utils/axios";

const AttendanceDetail = ({ selectedWarehouse, selectedAttendance, mutate, notification, isModalOpen, userRole }) => {
    const isAdmin = ["Administrator", "Super Admin"].includes(userRole);
    const attendance = selectedAttendance || selectedWarehouse?.attendance?.[0];

    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        contact_id: "",
        time_in: "",
        approval_status: "",
    });

    const { employees = [] } = useEmployee();

    useEffect(() => {
        setFormData({
            contact_id: attendance?.contact_id || "",
            time_in: attendance?.time_in || "",
            approval_status: attendance?.approval_status || "Pending",
        });
    }, [selectedWarehouse, selectedAttendance, attendance]);

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!attendance?.id) return;

        startTransition(async () => {
            try {
                const response = await axios.put(`/api/attendance/${attendance.id}`, formData);

                notification?.(response.data?.message || "Data berhasil diperbarui!");

                if (mutate) await mutate();
                if (typeof isModalOpen === "function") isModalOpen(false);
            } catch (error) {
                console.error("Error updating attendance:", error);
                notification?.(error.response?.data?.message || "Gagal memperbarui data.");
            }
        });
    };

    // Badge status selaras dengan Dark Mode
    const getStatusBadge = (status) => {
        switch (status) {
            case "Approved":
                return {
                    label: "Approved",
                    class: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/60",
                    icon: CheckCircle2,
                };
            case "Late":
                return {
                    label: "Telat",
                    class: "bg-rose-50 text-rose-500 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/60",
                    icon: Clock,
                };
            case "Good":
                return {
                    label: "Excellent",
                    class: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/60",
                    icon: Star,
                };
            case "Overtime":
                return {
                    label: "Lembur",
                    class: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900/60",
                    icon: AlarmClockPlus,
                };
            default:
                return {
                    label: "Pending",
                    class: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/60",
                    icon: Clock,
                };
        }
    };

    const statusInfo = getStatusBadge(attendance?.approval_status);

    return (
        <div className="w-full text-slate-700 dark:text-slate-200 font-sans antialiased space-y-4">
            {/* Content Body (2 Kolom Sejajar) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* 1. SEKSI FOTO BUKTI */}
                <div className="md:col-span-5 flex flex-col">
                    <div className="relative w-full flex-1 min-h-55 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-800 flex items-center justify-center group shadow-xs">
                        {attendance?.photo_url || attendance?.photo ? (
                            <Image
                                src={attendance.photo_url || attendance.photo}
                                alt={selectedWarehouse?.name || "Foto Absensi"}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                unoptimized
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-500 p-4 text-center">
                                <ImageOff size={26} strokeWidth={1.5} />
                                <span className="text-xs font-medium">Tidak ada foto</span>
                            </div>
                        )}
                        {attendance?.approval_status && (
                            <span
                                className={`absolute flex items-center gap-1 top-2.5 right-2.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-xs ${statusInfo.class}`}
                            >
                                <statusInfo.icon className="w-3 h-3" />
                                {statusInfo.label}
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. SEKSI FORM & DETAIL ALAMAT */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                    {/* Alamat Card */}
                    <div className="p-3.5 bg-slate-50/80 border border-slate-200/60 dark:bg-slate-800/40 dark:border-slate-800 rounded-2xl space-y-2">
                        <div className="flex items-start gap-2.5">
                            <div className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 rounded-xl shrink-0 mt-0.5">
                                <MapPin size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                                    Alamat Terdeteksi
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug line-clamp-2 mt-0.5">
                                    {selectedWarehouse?.address || "Alamat belum disetting"}
                                </p>
                            </div>
                        </div>

                        {attendance?.latitude && attendance?.longitude && (
                            <div className="pt-1 flex justify-end">
                                <Link
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`https://www.google.com/maps?q=${attendance.latitude},${attendance.longitude}`}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 px-2.5 py-1 rounded-lg transition-all"
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
                            <label className="text-slate-600 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                                <User size={14} className="text-indigo-500 dark:text-indigo-400" /> Staf / Kasir
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 font-medium appearance-none focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                                    value={formData.contact_id}
                                    onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                                    disabled={!isAdmin || isPending}
                                >
                                    <option value="" className="dark:bg-slate-800">
                                        -- Pilih Staf --
                                    </option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.contact_id} className="dark:bg-slate-800">
                                            {emp.contact?.name || emp.name || `Karyawan #${emp.id}`}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={14}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                                />
                            </div>
                        </div>

                        {/* Grid Jam Absen & Status */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Input Jam Absen */}
                            <div>
                                <label className="text-slate-600 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                                    <Clock size={14} className="text-indigo-500 dark:text-indigo-400" /> Jam Absen
                                </label>
                                {attendance?.created_at ? (
                                    <input
                                        type="time"
                                        step="1"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 font-mono font-medium focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 shadow-xs"
                                        value={formData.time_in}
                                        onChange={(e) => setFormData({ ...formData, time_in: e.target.value })}
                                        disabled={!isAdmin || isPending}
                                    />
                                ) : (
                                    <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 italic">
                                        Belum Absen
                                    </div>
                                )}
                            </div>

                            {/* Select Status */}
                            <div>
                                <label className="text-slate-600 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className="text-indigo-500 dark:text-indigo-400" /> Status
                                </label>
                                {attendance?.created_at ? (
                                    <div className="relative">
                                        <select
                                            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 font-medium appearance-none focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-xs truncate"
                                            value={formData.approval_status}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    approval_status: e.target.value,
                                                })
                                            }
                                            disabled={!isAdmin || isPending}
                                        >
                                            <option value="Pending" className="dark:bg-slate-800">
                                                Pending
                                            </option>
                                            <option value="Approved" className="dark:bg-slate-800">
                                                Approved
                                            </option>
                                            <option value="Good" className="dark:bg-slate-800">
                                                Excellent
                                            </option>
                                            <option value="Late" className="dark:bg-slate-800">
                                                Terlambat
                                            </option>
                                            <option value="Overtime" className="dark:bg-slate-800">
                                                Lembur
                                            </option>
                                        </select>
                                        <ChevronDown
                                            size={14}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                                        />
                                    </div>
                                ) : (
                                    <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 italic">
                                        Belum Absen
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action Button */}
            {isAdmin && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                    {typeof isModalOpen === "function" && (
                        <button
                            type="button"
                            onClick={() => isModalOpen(false)}
                            disabled={isPending}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                            Batal
                        </button>
                    )}

                    <motion.button
                        whileHover={!isPending ? { scale: 1.01 } : {}}
                        whileTap={!isPending ? { scale: 0.99 } : {}}
                        onClick={handleUpdate}
                        disabled={isPending || !formData.approval_status || !attendance?.id}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/10 flex items-center gap-2 text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

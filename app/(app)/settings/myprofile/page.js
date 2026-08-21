"use client";

import { useAuth } from "@/app/utils/auth";
import MainContent from "../../main";
import imageCompression from "browser-image-compression";
import { motion, AnimatePresence } from "motion/react";
import {
    User,
    Mail,
    ShieldCheck,
    Building2,
    Wallet,
    MapPin,
    Clock,
    ExternalLink,
    Calendar as CalendarIcon,
    BadgeCheck,
    CheckCircle2,
    XCircle,
    Navigation,
    KeyRound,
    PiggyBank,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Camera,
    ClockAlert,
    Star,
    AlarmClockPlus,
    Check,
    Briefcase,
    UserCheck,
    CalendarCheck2,
    Loader2,
} from "lucide-react";
import { calculateWorkDuration, DateTimeNow, formatDateTime, formatRupiah } from "@/app/utils/format";
import { useRef, useState } from "react";
import Image from "next/image";
import Modal from "@/app/components/Modal";
import { useUserAttendanceByContactMonthly } from "@/app/hooks/useUserAttendance";
import useCashBankBalance from "@/app/hooks/useCashBankBalance";
import MobileNavDrawer from "@/app/components/MobileNavDrawer";
import axios from "@/app/utils/axios";

export default function MyProfile() {
    const { user } = useAuth();
    const { today } = DateTimeNow();

    // State untuk Tab (Profil vs Absensi)
    const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'attendance'

    // State Kalender & Modal Absensi
    const [currentDate, setCurrentDate] = useState(new Date(today));
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0, 12).getDate();
    const firstDayOfWeek = new Date(year, month, 1, 12).getDay();

    // Navigasi bulan
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1, 12));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1, 12));

    // Fetching Data Absensi
    const { contactMonthly } = useUserAttendanceByContactMonthly({
        contactId: user?.contact_id,
        year,
        month: month + 1,
    });

    const attendanceMap = (contactMonthly?.attendances || []).reduce((acc, curr) => {
        if (curr?.date) {
            const cleanDate = curr.date.slice(0, 10);
            acc[cleanDate] = curr;
        }
        return acc;
    }, {});

    // Destrukturisasi Data User
    const contact = user?.contact;
    const employee = contact?.employee;
    const warehouse = user?.warehouse;
    const primaryCash = warehouse?.primary_cash;
    const warning = employee?.warning_active;

    const [contactEmail, setContactEmail] = useState(contact?.email || "");
    const [contactPhone, setContactPhone] = useState(contact?.phone || "");
    const [contactAddress, setContactAddress] = useState(contact?.address || "");
    const [telegramChatId, setTelegramChatId] = useState(contact?.telegram_chat_id || "");

    const { cashBankBalanceData, error: balanceError, isLoading, isValidating, mutate: mutateBalance } = useCashBankBalance(warehouse?.id, today);
    const primaryCashLiveBalance = cashBankBalanceData?.data.chartOfAccounts.find((account) => account.id === primaryCash?.id).balance;

    // Hitung Pemakaian Limit Kas
    const limitAmount = Number(primaryCash?.limit?.limit_amount) || 0;
    const diffAmount = Number(primaryCash?.limit?.diff_amount) || 0;
    const usedAmount = limitAmount - primaryCashLiveBalance;
    const usedPercentage = limitAmount > 0 ? Math.min(Math.round((usedAmount / limitAmount) * 100), 100) : 0;

    const STATUS_CONFIG = {
        Late: {
            label: "Telat",
            Icon: ClockAlert,
            color: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20",
            iconStyle: "w-3 h-3",
        },
        Good: {
            label: "Excellent",
            Icon: Star,
            color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200/60 dark:border-amber-500/20",
            iconStyle: "w-3 h-3 fill-amber-400 text-amber-500",
        },
        Overtime: {
            label: "Overtime",
            Icon: AlarmClockPlus,
            color: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border-violet-200/60 dark:border-violet-500/20",
            iconStyle: "w-3 h-3",
        },
        Normal: {
            label: "Normal",
            Icon: Check,
            color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20",
            iconStyle: "w-3 h-3",
        },
    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const navTabs = [
        { id: "profile", label: "Detail Profil & Penugasan", icon: UserCheck },
        { id: "attendance", label: "Kalender & Riwayat Absensi", icon: CalendarCheck2 },
    ];

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
            fileType: "image/jpeg",
        };

        try {
            setUploading(true);

            const compressedFile = await imageCompression(file, compressionOptions);

            const formData = new FormData();
            formData.append("photo", compressedFile, compressedFile.name);
            formData.append("name", user.contact?.name || user?.name);
            formData.append("phone", contactPhone);
            formData.append("telegram_chat_id", telegramChatId);
            formData.append("address", contactAddress);

            // Method Spoofing untuk Laravel Multipart Request
            formData.append("_method", "PUT");

            // Kirim via POST
            await axios.post(`/api/contacts/${user?.contact?.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (typeof mutate === "function") mutate();
        } catch (error) {
            console.error("Gagal mengompres/mengunggah foto:", error);
            alert(error.response?.data?.message || "Gagal memperbarui foto profil.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // State loading untuk tombol
    const [updatingContact, setUpdatingContact] = useState(false);

    const handleUpdateContact = async () => {
        try {
            setUpdatingContact(true);

            const formData = new FormData();
            formData.append("name", user.contact?.name || user?.name);
            formData.append("email", contactEmail);
            formData.append("phone", contactPhone);
            formData.append("telegram_chat_id", telegramChatId);
            formData.append("address", contactAddress);

            // Method spoofing agar Laravel membaca FormData
            formData.append("_method", "PUT");

            await axios.post(`/api/contacts/${user?.contact?.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Informasi pribadi berhasil diperbarui!");
            if (typeof mutate === "function") mutate();
        } catch (error) {
            console.error("Gagal mengupdate informasi kontak:", error);
            alert(error.response?.data?.message || "Gagal memperbarui profil.");
        } finally {
            setUpdatingContact(false);
        }
    };

    return (
        <MainContent headerTitle="My Profile">
            <div className="max-w-6xl mx-auto space-y-6 pb-12 text-slate-800 dark:text-slate-100">
                {/* 1. HEADER PROFILE */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                    {/* Hidden File Input */}
                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/png, image/jpeg, image/webp" className="hidden" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            {/* Avatar Container dengan Overlay Kamera */}
                            <div className="relative group shrink-0">
                                {user?.contact?.contact_photo_url ? (
                                    <Image
                                        src={user.contact.contact_photo_url}
                                        alt="Profile"
                                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
                                        width={80}
                                        height={80}
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-500 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                                    </div>
                                )}

                                {/* Overlay Action Button */}
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
                                    title="Ubah Foto Profil"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5" />
                                            <span className="text-[10px] font-medium mt-0.5">Ubah</span>
                                        </>
                                    )}
                                </button>

                                {/* Mobile Badge Trigger (Agat mudah ditekan di layar HP tanpa hover) */}
                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="sm:hidden absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-xl shadow-md cursor-pointer"
                                >
                                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-bold capitalize tracking-tight text-slate-900 dark:text-white">
                                        {user?.contact?.name || user?.name}
                                    </h1>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        {user?.role}
                                    </span>
                                    {user?.is_active === 1 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Aktif
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    {user?.email}
                                    {user?.email_verified_at ? (
                                        <BadgeCheck className="w-4 h-4 text-sky-500 inline shrink-0" title="Terverifikasi" />
                                    ) : (
                                        <span className="text-[10px] text-amber-500 font-sans font-medium">(Belum Verifikasi)</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Card Status Check-in Hari Ini */}
                        <div className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between sm:justify-start gap-4">
                            <div className="text-left">
                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                    Status Absensi Hari Ini
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-xs">
                                    {user?.has_checked_in ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <span className="text-emerald-600 dark:text-emerald-400">Sudah Check-in</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 text-amber-500" />
                                            <span className="text-amber-600 dark:text-amber-400">Belum Check-in</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. ALERT SANSI / WARNING (Jika Ada SP) */}
                {warning && (
                    <div className="bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
                        <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 flex-1 text-xs">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h3 className="font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                                    Sanksi Aktif: {warning.level} ({warning.letter_number})
                                </h3>
                                <span className="font-medium text-rose-600 dark:text-rose-400 bg-rose-100/80 dark:bg-rose-900/50 px-2 py-0.5 rounded">
                                    Berlaku s/d {formatDateOnly(warning.expired_date)}
                                </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                Alasan: <span className="italic">{warning.reason}</span>
                            </p>
                        </div>
                    </div>
                )}

                <MobileNavDrawer menuList={navTabs} activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* 4. TAB CONTENT 1: PROFIL & PENUGASAN */}
                <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* KOLOM KIRI (2-SPAN): DETAIL PEGAWAI & CABANG */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* CARD DETAIL PEGAWAI */}
                                        {contact && (
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                                                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                                        <Briefcase className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Informasi Pribadi</h2>
                                                        <p className="text-[11px] text-slate-400">Informasi kontak dan user login</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Alamat Email</span>
                                                        <input
                                                            type="email"
                                                            value={contactEmail}
                                                            onChange={(e) => setContactEmail(e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Username</span>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                                                            {user?.name || "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">No. Telepon</span>
                                                        <input
                                                            type="tel"
                                                            value={contactPhone}
                                                            onChange={(e) => setContactPhone(e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Telegram Chat ID</span>
                                                        <input
                                                            type="text"
                                                            value={telegramChatId}
                                                            onChange={(e) => setTelegramChatId(e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <span className="text-slate-400 block text-[11px]">Alamat</span>
                                                        <input
                                                            type="text"
                                                            value={contactAddress}
                                                            onChange={(e) => setContactAddress(e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {/* Action Button dengan Status Loading */}
                                                <div className="flex justify-end pt-2">
                                                    <button
                                                        type="button"
                                                        disabled={updatingContact}
                                                        onClick={handleUpdateContact}
                                                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition duration-200 disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {updatingContact ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span>Menyimpan...</span>
                                                            </>
                                                        ) : (
                                                            <span>Simpan Perubahan</span>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {employee && (
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                                                <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                                        <Briefcase className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Data Kepegawaian</h2>
                                                        <p className="text-[11px] text-slate-400">Informasi pribadi dan status kerja</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Tempat, Tgl Lahir</span>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                                            {employee.place_of_birth || "-"}, {formatDateOnly(employee.birth_date)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Agama</span>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                                                            {employee.religion || "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Status Pernikahan</span>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                                                            {employee.marital_status || "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Tanggal Bergabung</span>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                                                            {formatDateOnly(employee.hire_date)}{" "}
                                                            <span className="text-slate-400 font-normal">{`(${calculateWorkDuration(employee.hire_date)})`}</span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Tipe Pekerjaan</span>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase mt-0.5">
                                                            {employee.employment_type?.replace("_", " ")}{" "}
                                                            <span className="text-slate-400 font-normal capitalize">
                                                                {employee.employment_type === "contract" &&
                                                                    "(Berakhir: " + formatDateOnly(employee.contract_end) + ")"}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px]">Gaji Pokok</span>
                                                        <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                            {formatRupiah(employee.base_salary)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* CARD CABANG PENUGASAN */}
                                        {warehouse && (
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                                            <Building2 className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cabang Penugasan</h2>
                                                            <p className="text-[11px] text-slate-400">Informasi lokasi unit kerja aktif</p>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        KODE: {warehouse.code}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="text-slate-400 block text-[11px] mb-1">Nama Outlet / Konter</span>
                                                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{warehouse.name}</p>
                                                    </div>

                                                    <div>
                                                        <span className="text-slate-400 block text-[11px] mb-1">Jam Operasional & Status</span>
                                                        <div className="flex items-center gap-2 font-medium">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Buka Pukul {warehouse.opening_time} WIB</span>
                                                        </div>
                                                    </div>

                                                    <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                                                        <span className="text-slate-400 block text-[11px] mb-1">Alamat Lengkap</span>
                                                        <p className="text-slate-700 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
                                                            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                                            {warehouse.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* KOLOM KANAN (1-SPAN): KAS UTAMA & DETAIL AKUN */}
                                    <div className="space-y-6">
                                        {/* CARD KAS UTAMA & LIMIT */}
                                        {primaryCash && (
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                                                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                                        <Wallet className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                                            Akun Kas Utama ({primaryCash.code})
                                                        </h2>
                                                        <p className="text-[10px] text-slate-400">{primaryCash.name}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500 dark:text-slate-400">Sisa Saldo (Live)</span>
                                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                                            {formatRupiah(primaryCashLiveBalance)}
                                                        </span>
                                                    </div>

                                                    {primaryCash.limit && (
                                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                                            <div className="flex items-center justify-between text-[11px]">
                                                                <span className="text-slate-500">Saldo Awal Kas</span>
                                                                <span className="font-bold">{formatRupiah(limitAmount)}</span>
                                                            </div>
                                                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all ${usedPercentage > 80 ? "bg-rose-500" : "bg-indigo-500"}`}
                                                                    style={{ width: `${usedPercentage}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                                                <span>Selisih: {formatRupiah(usedAmount)}</span>
                                                                <span className="text-rose-500 font-semibold">{usedPercentage.toFixed(2)}%</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* CARD DETAIL INFORMASI AKUN */}
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                                                Detail Akun Sistem
                                            </h3>

                                            <div className="space-y-3 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                                                        User ID
                                                    </span>
                                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{user?.id}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                        <PiggyBank className="w-3.5 h-3.5 text-slate-400" />
                                                        Contact ID
                                                    </span>
                                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{user?.contact_id}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                                                        Terdaftar Sejak
                                                    </span>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDateTime(user?.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 5. TAB CONTENT 2: KALENDER ABSENSI BULANAN */}
                    {activeTab === "attendance" && (
                        <motion.div
                            key="attendance"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Kalender Kehadiran</h2>
                                            <p className="text-xs text-slate-400">Klik tanggal berpeta untuk melihat rincian presensi & koordinat GPS</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button
                                            onClick={prevMonth}
                                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-bold font-mono min-w-32 text-center">
                                            {currentDate.toLocaleDateString("id-ID", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <button
                                            onClick={nextMonth}
                                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Indikator Legenda */}
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span>Normal / Tepat Waktu</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        <span>Terlambat (Late)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        <span>Excellent</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                                        <span>Overtime</span>
                                    </div>
                                </div>

                                {/* Matriks Grid Kalender */}
                                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
                                    {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day, idx) => (
                                        <div key={idx} className="text-center text-[11px] font-semibold text-slate-400 py-1">
                                            {day}
                                        </div>
                                    ))}

                                    {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                                        <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/40 dark:bg-slate-800/20" />
                                    ))}

                                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                                        const dayNum = idx + 1;
                                        const dateFormatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                                        const attendance = attendanceMap[dateFormatted];

                                        return (
                                            <div
                                                key={dayNum}
                                                onClick={() => {
                                                    if (attendance) {
                                                        setSelectedAttendance(attendance);
                                                        setIsModalOpen(true);
                                                    }
                                                }}
                                                className={`h-16 sm:h-20 p-1.5 rounded-xl border transition flex flex-col justify-between text-left relative ${
                                                    attendance
                                                        ? "cursor-pointer hover:border-indigo-500 hover:shadow-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80"
                                                        : "border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40"
                                                }`}
                                            >
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{dayNum}</span>

                                                {attendance && (
                                                    <>
                                                        <span className="hidden sm:inline font-semibold text-[11px] text-right font-mono text-slate-600 dark:text-slate-400">
                                                            {attendance.time_in?.slice(0, 5)}
                                                        </span>
                                                        <div className="space-y-1">
                                                            {(() => {
                                                                const config = STATUS_CONFIG[attendance.approval_status] || STATUS_CONFIG.Normal;
                                                                const { Icon, label, color, iconStyle } = config;

                                                                return (
                                                                    <span
                                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center justify-between border ${color}`}
                                                                    >
                                                                        <Icon className={iconStyle} />
                                                                        <span className="truncate">{label}</span>
                                                                    </span>
                                                                );
                                                            })()}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* 6. MODAL DETAIL ABSENSI */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Kehadiran">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <Camera className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Detail Kehadiran ({formatDateTime(selectedAttendance?.date)})
                            </h3>
                        </div>

                        {selectedAttendance?.photo_url && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 relative">
                                <Image
                                    src={selectedAttendance?.photo_url}
                                    alt="Bukti Absensi"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                    width={400}
                                    height={225}
                                    unoptimized
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                                <span className="text-slate-400 block mb-0.5">Jam Masuk</span>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">{selectedAttendance?.time_in} WIB</span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                                <span className="text-slate-400 block mb-0.5">Status Approval</span>
                                <span className="font-bold text-amber-600 dark:text-amber-400">{selectedAttendance?.approval_status}</span>
                            </div>

                            <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg space-y-1">
                                <span className="text-slate-400 block">Koordinat GPS Absen:</span>
                                <a
                                    href={`https://maps.google.com/?q=${selectedAttendance?.latitude},${selectedAttendance?.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline font-semibold"
                                >
                                    <Navigation className="w-3.5 h-3.5" />
                                    {selectedAttendance?.latitude}, {selectedAttendance?.longitude}
                                    <ExternalLink className="w-3 h-3 ml-auto" />
                                </a>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </MainContent>
    );
}

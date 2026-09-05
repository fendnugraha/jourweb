import { Warehouse, Trophy, TrendingUp, Star, Clock, CheckCircle2, AlertTriangle, Loader2, Lock, BadgeCheck, Wallet2, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../utils/auth";
import useRankByProfit from "../hooks/useRankByProfit";
import { getWarehouseRating } from "../hooks/JournalActionService";
import Image from "next/image";
import { formatNumber, formatRupiah } from "../utils/format";
import { useState } from "react";
import Modal from "../components/Modal";

export default function HeaderProfile() {
    const { user } = useAuth({ middleware: "auth" });
    const { rankByProfit, isLoading } = useRankByProfit();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        contact_id: user?.contact?.id || "",
        amount: "",
        type: "kasbon",
        description: "",
    });

    const labelClass = "text-xs font-semibold text-slate-500 dark:text-slate-400";
    const inputClass =
        "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600";

    const isUserCheckedIn = user?.has_checked_in;
    const contactWarningStatus = user?.contact?.employee?.warning_active || false;

    const userPhoto = user?.contact?.contact_photo_url || user?.attendances?.[0]?.photo_url || "/default.png";
    const userWarehouseId = user?.warehouse_id;
    const userWarehouseName = user?.warehouse?.name || "No Warehouse";
    const userWarehouseStatus = user?.warehouse?.is_open || 0;

    const empReceivable = parseFloat(user?.contact?.employee_receivables_sum?.total || 0);
    const instReceivable = parseFloat(user?.contact?.installment_receivables_sum?.total || 0);
    const totalReceivables = empReceivable + instReceivable;

    // Hitung Rank & Metric Profit
    const warehouseRankIndex = rankByProfit?.data?.revenue?.findIndex((item) => Number(item.warehouse_id) === Number(userWarehouseId));
    const WarehouseRank = warehouseRankIndex !== -1 && warehouseRankIndex !== undefined ? warehouseRankIndex + 1 : 0;
    const WarehouseRankProfit = rankByProfit?.data?.revenue?.find((item) => Number(item.warehouse_id) === Number(userWarehouseId))?.total || 0;
    const WarehouseMonthlyProfit =
        rankByProfit?.data?.totalProfitMonthly?.find((item) => Number(item.warehouse_id) === Number(userWarehouseId))?.average_profit || 0;
    const WarehouseRating = getWarehouseRating(WarehouseMonthlyProfit);

    const [imgError, setImgError] = useState(false);

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        alert("Pengajuan ditolak!");
    };

    const getShortName = (fullName) => {
        if (!fullName) return "Pengguna";

        const words = fullName.trim().split(/\s+/);
        if (words.length <= 1) return fullName;

        const firstName = words[0];
        const initials = words
            .slice(1)
            .map((word) => word[0]?.toUpperCase())
            .filter(Boolean)
            .join(".");

        return `${firstName} ${initials}.`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 sm:p-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 shadow-xs"
        >
            {/* Subtle Ambient Glow */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl dark:bg-indigo-500/15" />

            <div className="relative space-y-3">
                {/* 1. BARIS ATAS: Foto + Nama User & Rating/Performa Cabang (JUSTIFY BETWEEN) */}
                <div className="flex items-center justify-between gap-2.5">
                    {/* Sisi Kiri: Foto, Nama, Badges */}
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar User */}
                        <div className="relative shrink-0">
                            <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-2 ring-indigo-500/20 sm:h-12 sm:w-12 dark:bg-slate-800 dark:ring-indigo-400/20">
                                {userPhoto && !imgError ? (
                                    <Image
                                        src={userPhoto}
                                        alt={user?.name || "User Avatar"}
                                        className="h-full w-full object-cover"
                                        onError={() => setImgError(true)}
                                        width={48}
                                        height={48}
                                        unoptimized
                                        loading="eager"
                                    />
                                ) : (
                                    <span className="font-extrabold text-indigo-600 text-xs sm:text-sm dark:text-indigo-400">{getInitials(user?.name)}</span>
                                )}
                            </div>

                            {/* Status Indicator Dot */}
                            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center">
                                {isUserCheckedIn && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                                <span
                                    className={`relative h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                                        isUserCheckedIn ? "bg-emerald-500" : "bg-amber-500"
                                    }`}
                                />
                            </span>
                        </div>

                        {/* Name & Role Badges */}
                        <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1">
                                <h2 className="truncate text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                                    Hi, <span className="text-indigo-600 dark:text-indigo-400">{getShortName(user?.name)}</span>
                                </h2>
                                {user?.email_verified_at && <BadgeCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" fill="#246de3" />}
                            </div>

                            <div className="flex flex-wrap items-center gap-1 text-[10px]">
                                {/* Badge Cabang */}
                                <span className="inline-flex items-center gap-0.5 font-bold text-slate-600 dark:text-slate-300">
                                    {userWarehouseStatus && userWarehouseId !== 1 ? (
                                        <Warehouse className="h-3 w-3 text-indigo-500" />
                                    ) : (
                                        <Lock className="h-3 w-3 text-rose-500" />
                                    )}
                                    <span className="max-w-20 sm:max-w-none truncate">{userWarehouseName}</span>
                                </span>

                                <span className="text-slate-300 dark:text-slate-700">•</span>

                                {/* Status Absensi Badge Ringkas */}
                                <span
                                    className={`font-bold ${isUserCheckedIn ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                                >
                                    {isUserCheckedIn ? "Checked In" : "Belum Absen"}
                                </span>

                                {contactWarningStatus && (
                                    <>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span className="inline-flex items-center gap-0.5 font-bold text-rose-500">
                                            <AlertTriangle className="h-3 w-3" />
                                            {contactWarningStatus.level}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sisi Kanan: Mini Stats Performa / Rating Cabang (Compact & Justified) */}
                    {userWarehouseId !== 1 && (
                        <div className="shrink-0">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            ) : (
                                <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 p-1.5 sm:px-2.5 sm:py-1.5 border border-slate-200/50 dark:border-slate-700/50">
                                    {/* Rank Badge */}
                                    <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 text-xs font-black" title="Peringkat Cabang">
                                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                        <span>{WarehouseRank > 0 ? `#${WarehouseRank}` : "-"}</span>
                                    </div>

                                    <span className="text-slate-300 dark:text-slate-700">|</span>

                                    {/* Profit Badge (Sembunyi di HP Sangat Kecil agar Tetap Muat) */}
                                    <div
                                        className="hidden sm:flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-xs font-black"
                                        title="Profit"
                                    >
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        <span>{formatRupiah(WarehouseRankProfit)}</span>
                                    </div>

                                    <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>

                                    {/* Rating Badge */}
                                    <div className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 text-xs font-black" title="Rating Performa">
                                        <Star className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500/20" />
                                        <span>{WarehouseRating || "N/A"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. BARIS BAWAH: Info Piutang & Tombol Kasbon (Fit Mobile Baris Tunggal) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                    {/* Ringkasan Piutang */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 shrink-0">
                            <Receipt className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                                Piutang: <strong className="text-slate-800 dark:text-slate-200">{formatRupiah(totalReceivables)}</strong>
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                Kasbon {formatRupiah(empReceivable)} • Cicilan {formatRupiah(instReceivable)}
                            </div>
                        </div>
                    </div>

                    {/* Button Pengajuan Kasbon (Compact) */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all shrink-0 cursor-pointer"
                    >
                        <Wallet2 className="h-3.5 w-3.5" />
                        <span>Ajukan Kasbon</span>
                    </motion.button>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pengajuan Kasbon">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="tx-amount" className={labelClass}>
                            Jumlah (Rp IDR)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                            <input
                                id="tx-amount"
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="50000"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
                            />
                        </div>
                        {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                Preview: {formatRupiah(formData.amount)}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>Deskripsi</label>
                        <textarea
                            placeholder="Masukkan deskripsi pengajuan"
                            className={inputClass}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex space-x-2 bg-slate-300 p-1 rounded-xl">
                        <button
                            type="button"
                            className={`w-full px-4 py-1 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formData.type === "kasbon" ? "bg-indigo-600 text-white" : "text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
                            onClick={() => setFormData({ ...formData, type: "kasbon" })}
                        >
                            Kasbon
                        </button>
                        <button
                            type="button"
                            className={`w-full px-4 py-1 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formData.type === "cicilan" ? "bg-indigo-600 text-white" : "text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
                            onClick={() => setFormData({ ...formData, type: "cicilan" })}
                        >
                            Cicilan
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                        >
                            Batal
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-60 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Ajukan Sekarang"}
                        </motion.button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}

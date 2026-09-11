import { Warehouse, Trophy, TrendingUp, Star, Clock, CheckCircle2, AlertTriangle, Loader2, Lock, BadgeCheck, Wallet2, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../utils/auth";
import { useFinances } from "../hooks/useFinance";
import useRankByProfit from "../hooks/useRankByProfit";
import { getWarehouseRating } from "../hooks/JournalActionService";
import Image from "next/image";
import { formatNumber, formatRupiah } from "../utils/format";
import { useState } from "react";
import Modal from "../components/Modal";
import EmpReceivableRequest from "./employee/EmpReceivableRequest";

export default function HeaderProfile() {
    const { user } = useAuth({ middleware: "auth" });
    const { rankByProfit, isLoading } = useRankByProfit();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState("form");

    // Periksa status pengajuan pending untuk tombol kasbon
    const contactId = user?.contact?.id;
    const { finances: userFinances, mutate: mutateFinances } = useFinances({
        contact: contactId || "null",
        financeType: "All",
        start: "2025-01-01",
        end: "2027-12-31",
    });

    const pendingRequest = userFinances?.find((f) => f.finance_type?.endsWith(" R"));
    const hasPendingRequest = Boolean(pendingRequest);

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

    // Memotong nama ke format "Aditya R.P." HANYA jika panjang nama > 15 karakter
    const getShortName = (fullName) => {
        if (!fullName) return "Pengguna";

        const trimmed = fullName.trim();
        // Jika 15 karakter atau kurang, tampilkan nama utuh
        if (trimmed.length <= 15) return trimmed;

        const words = trimmed.split(/\s+/);
        if (words.length <= 1) return trimmed;

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
                                {user?.email_verified_at && <BadgeCheck className="h-4 w-4 text-white shrink-0" fill="#246de3" />}
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
                    {/* Ringkasan Piutang (Clickable untuk langsung melihat riwayat) */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            setModalTab("history");
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer group"
                        title="Klik untuk melihat riwayat pengajuan & pembayaran"
                    >
                        <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 shrink-0 group-hover:bg-amber-500/20 transition-colors">
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
                    </button>

                    {/* Button Pengajuan Kasbon (Compact) */}
                    {hasPendingRequest ? (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={(e) => {
                                e.preventDefault();
                                setModalTab("history");
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-300/40 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/60 shadow-xs hover:bg-amber-500/25 transition-all shrink-0 cursor-pointer"
                            title="Pengajuan Anda sedang diproses. Klik untuk memantau status."
                        >
                            <Clock className="h-3.5 w-3.5 animate-pulse text-amber-600 dark:text-amber-400" />
                            <span>Sedang Diproses</span>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={(e) => {
                                e.preventDefault();
                                setModalTab("form");
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all shrink-0 cursor-pointer"
                        >
                            <Wallet2 className="h-3.5 w-3.5" />
                            <span>Ajukan Kasbon</span>
                        </motion.button>
                    )}
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalTab === "history" ? "Riwayat Kasbon & Cicilan" : "Pengajuan Kasbon & Cicilan"}
                maxWidth="max-w-md"
            >
                <EmpReceivableRequest
                    key={`${modalTab}-${hasPendingRequest}`}
                    defaultTab={modalTab}
                    onClose={() => setIsModalOpen(false)}
                    mutate={mutateFinances}
                    hasPendingRequest={hasPendingRequest}
                    pendingRequest={pendingRequest}
                />
            </Modal>
        </motion.div>
    );
}

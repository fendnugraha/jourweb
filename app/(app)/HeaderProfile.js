import { Warehouse, Trophy, TrendingUp, Star, Clock, CheckCircle2, AlertTriangle, Loader2, Lock, BadgeCheck, UserRoundCog } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../utils/auth";
import useRankByProfit from "../hooks/useRankByProfit";
import { getWarehouseRating } from "../hooks/JournalActionService";
import Image from "next/image";
import { formatRupiah } from "../utils/format";
import { useState } from "react";

export default function HeaderProfile() {
    const { user } = useAuth({ middleware: "auth" });
    const { rankByProfit, isLoading } = useRankByProfit();

    const isUserCheckedIn = user?.has_checked_in;
    const contactWarningStatus = user?.contact?.employee?.warning_active || false;

    // Foto dari absensi atau default avatar
    const userPhoto = user.contact?.contact_photo_url || user?.attendances?.[0]?.photo_url || "/default.png";

    const userWarehouseId = user?.warehouse_id;
    const userWarehouseName = user?.warehouse?.name || "No Warehouse";
    const userWarehouseStatus = user?.warehouse?.is_open || 0;

    // Hitung Rank & Metric Profit
    const warehouseRankIndex = rankByProfit?.data?.revenue?.findIndex((item) => Number(item.warehouse_id) === Number(userWarehouseId));
    const WarehouseRank = warehouseRankIndex !== -1 && warehouseRankIndex !== undefined ? warehouseRankIndex + 1 : 0;
    const WarehouseRankProfit = rankByProfit?.data?.revenue?.find((item) => Number(item.warehouse_id) === Number(userWarehouseId))?.total || 0;
    const WarehouseMonthlyProfit =
        rankByProfit?.data?.totalProfitMonthly?.find((item) => Number(item.warehouse_id) === Number(userWarehouseId))?.average_profit || 0;
    const WarehouseRating = getWarehouseRating(WarehouseMonthlyProfit);

    const [imgError, setImgError] = useState(false);

    // Ambil inisial nama untuk avatar fallback
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md transition-all sm:p-5 md:p-6 dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xs"
        >
            {/* Background Ambient Glow Accent */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* SISI KIRI: Foto Profil, Nama, Role & Badges */}
                <div className="flex items-center gap-3.5 sm:gap-4">
                    {/* Frame Foto User dengan Status Indicator */}
                    <div className="relative shrink-0">
                        <div className="relative flex h-13 w-13 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-indigo-500/20 sm:h-15 sm:w-15 dark:bg-slate-800 dark:ring-indigo-400/20 shadow-xs">
                            {userPhoto && !imgError ? (
                                <Image
                                    src={userPhoto}
                                    alt={user?.name || "User Avatar"}
                                    className="h-full w-full object-cover"
                                    onError={() => setImgError(true)}
                                    width={60}
                                    height={60}
                                    unoptimized
                                    loading="eager"
                                />
                            ) : (
                                <span className="font-extrabold text-indigo-600 text-sm sm:text-base dark:text-indigo-400">{getInitials(user?.name)}</span>
                            )}
                        </div>

                        {/* Status Check-in Indicator Dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
                            {isUserCheckedIn && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                            <span
                                className={`relative h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                                    isUserCheckedIn ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                                title={isUserCheckedIn ? "Checked In" : "Belum Absen"}
                            />
                        </span>
                    </div>

                    {/* Info Profil & Badges */}
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {/* Badge Cabang */}
                            <span className="inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50/80 px-2 py-0.5 text-[10px] font-bold text-indigo-700 sm:text-xs dark:border-indigo-900/40 dark:bg-indigo-950/50 dark:text-indigo-300">
                                {userWarehouseStatus && userWarehouseId !== 1 ? (
                                    <Warehouse className="h-3 w-3 shrink-0 text-indigo-500" />
                                ) : (
                                    <Lock className="h-3 w-3 shrink-0 text-rose-500" />
                                )}
                                <span className="max-w-27.5 truncate sm:max-w-none">{userWarehouseName || "Pusat"}</span>
                            </span>

                            {/* Badge Status Absensi */}
                            {isUserCheckedIn ? (
                                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-100 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 sm:text-xs dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                                    <span>Checked In</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-md border border-amber-100 bg-amber-50/80 px-2 py-0.5 text-[10px] font-semibold text-amber-700 sm:text-xs dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400">
                                    <Clock className="h-3 w-3 shrink-0 text-amber-500" />
                                    <span>Belum Absen</span>
                                </span>
                            )}

                            {/* Badge Peringatan Kontak */}
                            {contactWarningStatus && (
                                <span className="inline-flex items-center gap-1 rounded-md border border-rose-100 bg-rose-50/80 px-2 py-0.5 text-[10px] font-semibold text-rose-700 sm:text-xs dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                                    <AlertTriangle className="h-3 w-3 shrink-0 text-rose-500" />
                                    <span>{contactWarningStatus.level}</span>
                                </span>
                            )}
                        </div>

                        {/* Name & Role */}
                        <div>
                            <h2 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                                Hi, <span className="text-indigo-600 dark:text-indigo-400">{user?.name || "Pengguna"}</span>
                            </h2>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400 font-medium inline-flex gap-1 items-center">
                                {user.email}{" "}
                                {user.email_verified_at ? (
                                    <BadgeCheck className="h-4 w-4 text-blue-100 " fill="#246de3" />
                                ) : (
                                    <BadgeCheck className="h-4 w-4 text-slate-300" />
                                )}{" "}
                                <span>•</span> {user?.role || "Staff"} <UserRoundCog className="h-4 w-4" />
                            </p>
                        </div>
                    </div>
                </div>

                {/* SISI KANAN: Mini Bento Stats (Ditampilkan jika bukan gudang/cabang pusat ID 1) */}
                {userWarehouseId !== 1 && (
                    <div className="pt-2 lg:pt-0">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-400 dark:border-slate-800/60 dark:bg-slate-800/30">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                <span>Memuat performa toko...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                                {/* Bento 1: Rank Cabang */}
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-slate-50/60 p-2.5 sm:px-3.5 sm:py-2.5 dark:border-slate-800/60 dark:bg-slate-800/40 backdrop-blur-xs">
                                    <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500 dark:bg-amber-500/20">
                                        <Trophy className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">RANK</div>
                                        <div className="truncate text-xs font-black text-slate-800 sm:text-sm dark:text-slate-100">
                                            {WarehouseRank > 0 ? `#${WarehouseRank}` : "-"}
                                        </div>
                                    </div>
                                </div>

                                {/* Bento 2: Profit Bulanan */}
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-slate-50/60 p-2.5 sm:px-3.5 sm:py-2.5 dark:border-slate-800/60 dark:bg-slate-800/40 backdrop-blur-xs">
                                    <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500 dark:bg-emerald-500/20">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">PROFIT</div>
                                        <div className="truncate text-xs font-black text-slate-800 sm:text-sm dark:text-slate-100">
                                            {formatRupiah ? formatRupiah(WarehouseRankProfit) : WarehouseRankProfit}
                                        </div>
                                    </div>
                                </div>

                                {/* Bento 3: Rating Performa Toko */}
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-slate-50/60 p-2.5 sm:px-3.5 sm:py-2.5 dark:border-slate-800/60 dark:bg-slate-800/40 backdrop-blur-xs">
                                    <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500 dark:bg-indigo-500/20">
                                        <Star className="h-4 w-4 text-indigo-500 fill-indigo-500/20" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">RATING</div>
                                        <div className="truncate text-xs font-black text-slate-800 sm:text-sm dark:text-slate-100">
                                            {WarehouseRating || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

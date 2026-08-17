import { Warehouse, Trophy, TrendingUp, Star, Clock, CheckCircle2, AlertTriangle, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../utils/auth";
import useRankByProfit from "../hooks/useRankByProfit";
import { getWarehouseRating } from "../hooks/JournalActionService";
import Image from "next/image";
import { formatRupiah } from "../utils/format";

export default function HeaderProfile() {
    const { user } = useAuth({ middleware: "auth" });
    const { rankByProfit, isLoading } = useRankByProfit();

    const isUserCheckedIn = user?.has_checked_in;
    const contactWarningStatus = user?.contact?.employee?.warning_active || false;

    // Foto dari absensi atau default avatar
    const userPhoto = user?.attendances?.[0]?.photo_url || "/default.png";

    const userWarehouseId = user?.warehouse_id;
    const userWarehouseName = user?.warehouse?.name || "No Warehouse";
    const userWarehouseStatus = user?.warehouse?.is_open || 0;

    // Hitung Rank & Metric Profit
    const warehouseRankIndex = rankByProfit?.revenue?.findIndex((item) => Number(item.warehouse_id) === Number(userWarehouseId));
    const WarehouseRank = warehouseRankIndex !== -1 && warehouseRankIndex !== undefined ? warehouseRankIndex + 1 : 0;
    const WarehouseRankProfit = rankByProfit?.revenue?.find((item) => Number(item.warehouse_id) === Number(userWarehouseId))?.total || 0;
    const WarehouseMonthlyProfit = rankByProfit?.totalProfitMonthly?.find((item) => Number(item.warehouse_id) === Number(userWarehouseId))?.average_profit || 0;
    const WarehouseRating = getWarehouseRating(WarehouseMonthlyProfit);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 md:p-6 rounded-2xl shadow-xs transition-all"
        >
            {/* Background Accent Gradient */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* SISI KIRI: Foto Profil, Nama, Role & Badges */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                    {/* Frame Foto User dengan Status Indicator */}
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden ring-2 ring-indigo-500/20 dark:ring-indigo-500/30 bg-slate-100 dark:bg-slate-800 shadow-sm">
                            <Image
                                src={userPhoto}
                                alt={user?.name || "User Avatar"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // FIXED: Menggunakan e.currentTarget tanpa type assertion
                                    e.currentTarget.src = "/default.png";
                                }}
                                width={30}
                                height={30}
                                unoptimized
                                loading="eager"
                            />
                        </div>
                        {/* Dot Indicator Status Check-in */}
                        <span
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                                isUserCheckedIn ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            title={isUserCheckedIn ? "Checked In" : "Belum Absen"}
                        />
                    </div>

                    {/* Info Profil */}
                    <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Badge Cabang */}
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                                {userWarehouseStatus && userWarehouseId !== 1 ? (
                                    <Warehouse className="h-3 w-3 text-indigo-500 shrink-0" />
                                ) : (
                                    <Lock className="h-3 w-3 text-red-500 shrink-0" />
                                )}
                                {/* FIXED: Menggunakan max-w-30 menggantikan max-w-[120px] */}
                                <span className="truncate max-w-30 sm:max-w-none">{userWarehouseName}</span>
                            </span>

                            {/* Badge Check-in Mobile Friendly */}
                            {isUserCheckedIn ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                    <span className="hidden sm:inline">Checked In</span>
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
                                    <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                                    <span>Belum Absen</span>
                                </span>
                            )}

                            {contactWarningStatus && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                                    <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />
                                    <span>{contactWarningStatus.level}</span>
                                </span>
                            )}
                        </div>

                        <h2 className="text-sm sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 truncate">
                            Hi, <span className="text-indigo-600 dark:text-indigo-400">{user?.name}</span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role || "Staff"}</p>
                    </div>
                </div>

                {/* SISI KANAN: Mini Bento Stats */}
                {userWarehouseId !== 1 && (
                    <div className="grid sm:grid-cols-3 items-center gap-2.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        {isLoading ? (
                            <div className="flex items-center gap-2 text-xs text-slate-400 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                                <span>Memuat performa...</span>
                            </div>
                        ) : (
                            <>
                                {/* Bento 1: Rank Cabang */}
                                <div className="flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 shrink-0">
                                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                                        <Trophy className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 capitalize">Rank</div>
                                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                                            {WarehouseRank > 0 ? `#${WarehouseRank}` : "-"}
                                        </div>
                                    </div>
                                </div>

                                {/* Bento 2: Rata-rata Profit Bulanan */}
                                <div className="flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 shrink-0 overflow-x-hidden">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 capitalize truncate">Profit</div>
                                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">
                                            {formatRupiah(WarehouseRankProfit)}
                                        </div>
                                    </div>
                                </div>

                                {/* Bento 3: Rating Performa Toko */}
                                <div className="flex items-center gap-2.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 shrink-0">
                                    <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                                        <Star className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <div className="text-[9px] sm:text-[10px] font-bold tracking-wider text-slate-400 capitalize">Rating</div>
                                        <div className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">{WarehouseRating || "N/A"}</div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

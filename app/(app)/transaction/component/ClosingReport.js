import { changeLockStatus } from "@/app/hooks/JournalActionService";
import axios from "@/app/utils/axios";
import { ClosingShift } from "@/app/utils/ClosingShift";
import { DateTimeNow, formatDateTime, formatNumber } from "@/app/utils/format";
import { Check, CircleAlert, ReceiptText, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";

export default function ClosingReport({ dailyDashboard, openingCash = 9000000, totalSetoran, warehouseName, warehouseId, warehouseCashId, notification }) {
    const { today } = DateTimeNow();
    const [isClosingComplete, setIsClosingComplete] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [rawTelegramData, setRawTelegramData] = useState(null);
    const [countdown, setCountdown] = useState(0); // Menyimpan sisa waktu dalam detik (300 detik = 5 menit)
    const [isLocking, setIsLocking] = useState(false);
    const [loading, setLoading] = useState(false);

    const data = dailyDashboard?.data || {};
    const totalCash = data.totalCash ?? 0;
    const totalVoucher = data.totalVoucher?.total ?? 0;
    const totalAccessories = data.totalAccessories?.total ?? 0;
    const totalDeposit = data.totalCashDeposit?.total ?? 0;
    const totalCorrection = data.totalCorrection ?? 0;
    const totalFee = data.totalFee ?? 0;
    const totalExpense = data.totalExpense ?? 0;
    const profit = data.profit ?? 0;

    // Pre-calculated values
    const totalPendapatanGross = totalCash + totalDeposit + totalAccessories + totalVoucher;
    const totalPendapatanNett = totalFee + totalCash + totalDeposit + totalAccessories + totalVoucher + totalExpense;
    const isCashLess = totalCash < openingCash;
    const finalSetoran = totalCash > openingCash ? totalSetoran - openingCash : totalSetoran;

    const copyDailyReport = () => {
        const dailyReportData = [
            { name: "Kas", value: formatNumber(dailyDashboard?.data?.totalCash - openingCash) },
            { name: "Voucher", value: formatNumber(dailyDashboard?.data?.totalVoucher?.total) },
            { name: "Deposit", value: formatNumber(dailyDashboard?.data?.totalCashDeposit?.total) },
            { name: "Koreksi", value: formatNumber(dailyDashboard?.data?.totalCorrection ?? 0) },
            { name: "Acc", value: formatNumber(dailyDashboard?.data?.totalAccessories?.total) },
            { name: "Laba", value: formatNumber(dailyDashboard?.data?.profit) },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `${formatDateTime(today, true)}\nReport ${warehouseName}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${formatNumber(
            dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran,
        )}`;
    };

    const closingStatus = () => {
        setIsClosingComplete(true);
        setStatusText("Selesai.");
        setTimeout(() => {
            setIsClosingComplete(false);
            setStatusText("");
        }, 300000);
    };

    const handleCloseStore = async () => {
        // Variabel menggunakan bahasa Inggris pro (isConfirmed)
        const isConfirmed = confirm("Anda yakin ingin menutup shift, pastikan semua data sudah diinput?\n(Semua input data akan terkunci setelah kas disetor)");
        if (!isConfirmed) return;

        setLoading(true);
        setStatusText("Menutup shift...");

        try {
            setStatusText("Memeriksa status gudang...");
            const { data: warehouseStatus } = await axios.get(`/api/check-warehouse-status/${warehouseId}`);
            console.log(warehouseStatus);
            if (!warehouseStatus?.data?.is_open) {
                // throw new Error("Gudang sudah ditutup");
                setStatusText("Gudang sudah ditutup");
                notification("Proses gagal: Gudang sudah ditutup");
                return;
            }

            setStatusText("Mengunci cabang...");
            await changeLockStatus(warehouseId);

            setStatusText("Mengambil data transaksi...");

            const result = await ClosingShift({
                cred_id: warehouseCashId,
                amount: dailyDashboard?.data?.totalCash - openingCash,
                warehouse: warehouseName,
                message: copyDailyReport(),
                warehouseId: warehouseId,
            });

            const telegramResponseObj = result.telegramData.data;
            setRawTelegramData(telegramResponseObj);
            localStorage.setItem("last_telegram_data", JSON.stringify(telegramResponseObj));

            // set duration in milliseconds
            const LOCK_DURATION_MS = 1 * 60 * 1000;
            const lockTargetTime = Date.now() + LOCK_DURATION_MS;

            localStorage.setItem("target_lock_time", lockTargetTime);
            localStorage.setItem("lock_warehouse_id", warehouseId);

            setCountdown(LOCK_DURATION_MS / 1000); // Menghitung detik
            setIsLocking(true);

            // Timer otomatis menggunakan durasi milidetik yang benar
            setTimeout(() => {
                setRawTelegramData(null);
                localStorage.removeItem("last_telegram_data");
            }, LOCK_DURATION_MS);

            setStatusText("Menutup shift...");
            alert("Shift berhasil ditutup!");
            closingStatus();
        } catch (error) {
            console.error("Closing shift error:", error);
            // alert("Terjadi kesalahan saat menutup shift.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="text-sm space-y-3">
            {/* SECTION 1: RINCIAN PENERIMAAN */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Uang Tunai</span>
                    <span className={`font-mono font-bold ${isCashLess ? "text-rose-500" : "text-slate-800 dark:text-slate-100"}`}>
                        {formatNumber(totalCash)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Voucher & SP</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatNumber(totalVoucher)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Accessories</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatNumber(totalAccessories)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Deposit</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatNumber(totalDeposit)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Fee Admin</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatNumber(totalFee)}</span>
                </div>

                {totalCorrection !== 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Koreksi</span>
                        <span className="font-mono font-semibold text-amber-500 dark:text-amber-400">{formatNumber(totalCorrection)}</span>
                    </div>
                )}

                {/* SUB-TOTAL PENDAPATAN */}
                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
                    <span className="text-slate-700 dark:text-slate-200">Pendapatan Kotor</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatNumber(totalPendapatanGross)}</span>
                </div>
            </div>

            {/* SECTION 2: BIAYA & PROFIT */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Biaya Ops</span>
                    <span className="font-mono font-semibold text-rose-500 dark:text-rose-400">{formatNumber(totalExpense)}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            Profit (Laba)
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatNumber(profit)}</span>
                    </div>

                    <div className="flex justify-between items-center font-bold text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Total Pendapatan Bersih</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatNumber(totalPendapatanNett)}</span>
                    </div>
                </div>
            </div>

            {/* SECTION 3: TOTAL SETORAN CARD (HIGHLIGHT) */}
            <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Total Uang Disetor
                    </span>
                </div>

                {/* Status Warning & Deductions */}
                {isCashLess && (
                    <div className="flex items-center gap-1.5 text-rose-500 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 p-2 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                        <CircleAlert className="w-4 h-4 shrink-0" />
                        <span>Kas kurang dari uang awal!</span>
                    </div>
                )}

                {openingCash > 0 && totalCash > openingCash && (
                    <div className="flex justify-between items-center text-[11px] text-indigo-700/80 dark:text-indigo-300/80 font-mono">
                        <span>Potongan Modal Awal:</span>
                        <span>-{formatNumber(openingCash)}</span>
                    </div>
                )}

                {/* Final Amount */}
                <div className="pt-1 flex justify-end items-baseline gap-1 border-t border-indigo-200/50 dark:border-indigo-800/50">
                    <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">{formatNumber(finalSetoran)}</span>
                </div>
            </div>

            {isClosingComplete ? (
                <span className="text-xs text-slate-500 dark:text-slate-300 py-2 flex items-center gap-1">
                    Setoran selesai <Check size={14} className="text-green-500" />
                </span>
            ) : (
                <button
                    type="button"
                    onClick={handleCloseStore}
                    disabled={!!statusText}
                    className="w-full py-2 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow-sm hover:bg-amber-400 active:scale-95 transition-all disabled:bg-slate-500"
                >
                    {statusText ? statusText : "Tutup toko dan setorkan kas"}
                </button>
            )}
        </div>
    );
}

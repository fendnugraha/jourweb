/* eslint-disable react-hooks/set-state-in-effect */
import { changeLockStatus } from "@/app/hooks/JournalActionService";
import axios from "@/app/utils/axios";
import { ClosingShift } from "@/app/utils/ClosingShift";
import { DateTimeNow, formatDateTime, formatNumber } from "@/app/utils/format";
import { Check, CircleAlert, Clock, Copy, ExternalLink, QrCode, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ClosingReport({
    accountBalance,
    dailyDashboard,
    openingCash = 9000000,
    totalSetoran,
    warehouseName,
    warehouseId,
    warehouseCashId,
    notification,
}) {
    const { today } = DateTimeNow();
    const [isClosingComplete, setIsClosingComplete] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [rawTelegramData, setRawTelegramData] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [isLocking, setIsLocking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const limitPlusSummary = accountBalance?.data?.chartOfAccounts
        ?.filter((acc) => acc.balance - acc.limit?.limit_amount > 0 && acc.account_id === 2)
        .reduce((total, account) => total + Number(account.balance - account.limit?.limit_amount), 0);

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

    // Restore saved closing shift telegram data & lock state from localStorage on mount
    useEffect(() => {
        if (!warehouseId) return;

        const lockWhId = localStorage.getItem(`lock_warehouse_id_${warehouseId}`) || localStorage.getItem("lock_warehouse_id");
        const targetLockTime = localStorage.getItem(`target_lock_time_${warehouseId}`) || localStorage.getItem("target_lock_time");
        const savedTelegram = localStorage.getItem(`last_telegram_data_${warehouseId}`) || localStorage.getItem("last_telegram_data");

        if (targetLockTime && String(lockWhId) === String(warehouseId)) {
            const remainingMs = Number(targetLockTime) - Date.now();
            if (remainingMs > 0) {
                setCountdown(Math.ceil(remainingMs / 1000));
                setIsLocking(true);
                setIsClosingComplete(true);

                if (savedTelegram) {
                    try {
                        setRawTelegramData(JSON.parse(savedTelegram));
                    } catch (e) {
                        console.error("Gagal membaca last_telegram_data", e);
                        setRawTelegramData(null);
                    }
                } else {
                    setRawTelegramData(null);
                }
            } else {
                localStorage.removeItem(`target_lock_time_${warehouseId}`);
                localStorage.removeItem(`lock_warehouse_id_${warehouseId}`);
                localStorage.removeItem(`last_telegram_data_${warehouseId}`);
                localStorage.removeItem("target_lock_time");
                localStorage.removeItem("lock_warehouse_id");
                localStorage.removeItem("last_telegram_data");
                setRawTelegramData(null);
                setIsLocking(false);
                setIsClosingComplete(false);
                setCountdown(0);
            }
        } else {
            // If the lock belongs to a different warehouse (or no lock exists for current warehouseId),
            // reset component state so old telegram data from another warehouse is NOT displayed!
            setRawTelegramData(null);
            setIsLocking(false);
            setIsClosingComplete(false);
            setCountdown(0);
        }
    }, [warehouseId]);

    // Countdown timer for shift lock duration
    useEffect(() => {
        let timer;
        if (isLocking && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setIsLocking(false);
                        setIsClosingComplete(false);
                        if (warehouseId) {
                            localStorage.removeItem(`target_lock_time_${warehouseId}`);
                            localStorage.removeItem(`lock_warehouse_id_${warehouseId}`);
                            localStorage.removeItem(`last_telegram_data_${warehouseId}`);
                        }
                        localStorage.removeItem("target_lock_time");
                        localStorage.removeItem("lock_warehouse_id");
                        localStorage.removeItem("last_telegram_data");
                        setRawTelegramData(null);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isLocking, countdown, warehouseId]);

    const copyDailyReport = () => {
        const dailyReportData = [
            {
                name: "Kas",
                value: formatNumber(dailyDashboard?.data?.totalCash - openingCash),
            },
            {
                name: "Voucher",
                value: formatNumber(dailyDashboard?.data?.totalVoucher?.total),
            },
            {
                name: "Deposit",
                value: formatNumber(dailyDashboard?.data?.totalCashDeposit?.total),
            },
            {
                name: "Koreksi",
                value: formatNumber(dailyDashboard?.data?.totalCorrection ?? 0),
            },
            {
                name: "Acc",
                value: formatNumber(dailyDashboard?.data?.totalAccessories?.total),
            },
            { name: "Laba", value: formatNumber(dailyDashboard?.data?.profit) },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `${formatDateTime(today, true)}\nReport ${warehouseName}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${formatNumber(
            dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran,
        )}`;
    };

    const handleCloseStore = async () => {
        const isConfirmed = confirm("Anda yakin ingin menutup shift, pastikan semua data sudah diinput?\n(Semua input data akan terkunci setelah kas disetor)");
        if (!isConfirmed) return;

        setLoading(true);
        setStatusText("Memeriksa status gudang...");

        try {
            const { data: warehouseStatus } = await axios.get(`/api/check-warehouse-status/${warehouseId}`);

            if (!warehouseStatus?.data?.is_open) {
                setStatusText("Gudang sudah ditutup");
                if (notification) notification("Proses gagal: Gudang sudah ditutup");
                return;
            }

            setStatusText("Mengunci cabang...");
            await changeLockStatus(warehouseId);

            setStatusText("Mengirim laporan Telegram...");

            const result = await ClosingShift({
                cred_id: warehouseCashId,
                amount: dailyDashboard?.data?.totalCash - openingCash,
                warehouse: warehouseName,
                message: copyDailyReport(),
                warehouseId: warehouseId,
            });

            const telegramResponseObj = result?.telegramData?.data || result?.telegramData;
            setRawTelegramData(telegramResponseObj);
            localStorage.setItem(`last_telegram_data_${warehouseId}`, JSON.stringify(telegramResponseObj));
            localStorage.setItem("last_telegram_data", JSON.stringify(telegramResponseObj));

            const LOCK_DURATION_MS = 2 * 60 * 1000;
            // eslint-disable-next-line react-hooks/purity
            const lockTargetTime = Date.now() + LOCK_DURATION_MS;

            localStorage.setItem(`target_lock_time_${warehouseId}`, lockTargetTime);
            localStorage.setItem(`lock_warehouse_id_${warehouseId}`, String(warehouseId));
            localStorage.setItem("target_lock_time", lockTargetTime);
            localStorage.setItem("lock_warehouse_id", String(warehouseId));

            setCountdown(LOCK_DURATION_MS / 1000);
            setIsLocking(true);
            setIsClosingComplete(true);

            if (notification) notification("Shift berhasil ditutup & Laporan Telegram dikirim!");
            alert("Shift berhasil ditutup!");
        } catch (error) {
            console.error("Closing shift error:", error);
            if (notification) notification("Terjadi kesalahan saat menutup shift.");
        } finally {
            setLoading(false);
            setStatusText("");
        }
    };

    const rawText = rawTelegramData?.result?.text || rawTelegramData?.text || "";

    // Helper ekstraksi data menggunakan Regex dari rawTelegramData text
    const extractValue = (regex, text) => {
        if (!text) return "-";
        const match = text.match(regex);
        return match ? match[1].trim() : "-";
    };

    const cabang = rawText ? extractValue(/📍 Sumber:\s*([^\n]+)/, rawText) : warehouseName;
    const tanggal = rawText ? extractValue(/📝 Detail:\s*\n([^\n]+)/, rawText) : today;

    const kasTelegram = extractValue(/Kas:\s*([^\n]+)/, rawText);
    const voucherTelegram = extractValue(/Voucher:\s*([^\n]+)/, rawText);
    const depositTelegram = extractValue(/Deposit:\s*([^\n]+)/, rawText);
    const koreksiTelegram = extractValue(/Koreksi:\s*([^\n]+)/, rawText);
    const accTelegram = extractValue(/Acc:\s*([^\n]+)/, rawText);
    const labaTelegram = extractValue(/Laba:\s*([^\n]+)/, rawText);

    const totalSetoranTelegram = extractValue(/Total Setoran:\s*([^\n]+)/, rawText);

    const copyDailyReportTelegram = () => {
        if (rawText) return rawText;

        const dailyReportData = [
            { name: "Kas", value: kasTelegram },
            { name: "Voucher", value: voucherTelegram },
            { name: "Deposit", value: depositTelegram },
            { name: "Koreksi", value: koreksiTelegram },
            { name: "Acc", value: accTelegram },
            { name: "Laba", value: labaTelegram },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `${formatDateTime(tanggal)}\nReport ${cabang}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${totalSetoranTelegram !== "-" ? totalSetoranTelegram : formatNumber(finalSetoran)}`;
    };

    // Safely extract Telegram response details
    const tgDataInner = rawTelegramData?.data || rawTelegramData;
    const tgResult = tgDataInner?.result || tgDataInner;
    const telegramMsgId = tgResult?.message_id;
    const chatInfo = tgResult?.chat;
    const chatTitle = chatInfo?.title || "Grup Telegram";
    const chatId = chatInfo?.id;
    const dispatchTime = tgResult?.date ? new Date(tgResult.date * 1000) : new Date();

    let telegramLink = "";
    if (chatInfo?.username && telegramMsgId) {
        telegramLink = `https://t.me/${chatInfo.username}/${telegramMsgId}`;
    } else if (chatId && telegramMsgId) {
        const cleanId = String(chatId).replace("-100", "");
        telegramLink = `https://t.me/c/${cleanId}/${telegramMsgId}`;
    }

    const qrValue =
        rawText || copyDailyReportTelegram() || `CLOSING_SHIFT|STORE:${warehouseName}|AMOUNT:${finalSetoran}|DATE:${today}|TG_MSG:${telegramMsgId || "OK"}`;

    const copyQrData = async () => {
        try {
            await navigator.clipboard.writeText(qrValue);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 3000);
        } catch (err) {
            console.error("Gagal menyalin data QR:", err);
        }
    };

    // 1. Ambil waktu sekarang
    const now = new Date();

    // 2. Gunakan Intl.DateTimeFormat untuk ambil jam & menit khusus timezone Asia/Jakarta
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        hour: "numeric",
        minute: "numeric",
        hour12: false, // Pakai format 24 jam agar tidak ada AM/PM
    });

    // Hasilnya berupa string format 24 jam, misal: "20:30"
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour").value, 10);
    const minute = parseInt(parts.find((p) => p.type === "minute").value, 10);

    // 3. Hitung total menit saat ini
    const currentMinutes = hour * 60 + minute;

    // 4. Range waktu (20:00 - 23:45)
    const start = 20 * 60; // 1200 menit
    const end = 23 * 60 + 45; // 1425 menit

    const isWithinTime = currentMinutes >= start && currentMinutes <= end;

    return (
        <div className="text-sm space-y-3.5">
            {/* SECTION 1: RINCIAN PENERIMAAN CARD */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pb-1 border-b border-slate-100 dark:border-slate-800">
                    Rincian Penerimaan Kasir
                </h4>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Uang Tunai</span>
                        <span className={`font-mono font-bold ${isCashLess ? "text-rose-500" : "text-slate-800 dark:text-slate-100"}`}>
                            {formatNumber(totalCash)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Voucher & SP</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatNumber(totalVoucher)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Accessories</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatNumber(totalAccessories)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Deposit</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatNumber(totalDeposit)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">Fee Admin</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">{formatNumber(totalFee)}</span>
                    </div>

                    {totalCorrection !== 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 dark:text-slate-400">Koreksi</span>
                            <span className="font-mono font-semibold text-amber-500 dark:text-amber-400">{formatNumber(totalCorrection)}</span>
                        </div>
                    )}

                    {/* SUB-TOTAL PENDAPATAN */}
                    <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
                        <span className="text-slate-700 dark:text-slate-200">Pendapatan Kotor</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatNumber(totalPendapatanGross)}</span>
                    </div>
                </div>
            </div>

            {/* SECTION 2: BIAYA & PROFIT CARD */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2.5">
                <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Biaya Ops</span>
                    <span className="font-mono font-semibold text-rose-500 dark:text-rose-400">{formatNumber(totalExpense)}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            Profit (Laba)
                        </span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">{formatNumber(profit)}</span>
                    </div>

                    <div className="flex justify-between items-center font-semibold text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Total Pendapatan Bersih</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatNumber(totalPendapatanNett)}</span>
                    </div>
                </div>
            </div>

            {/* SECTION 3: TOTAL SETORAN HIGHLIGHT CARD */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-indigo-50/90 to-blue-50/60 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/50 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Total Uang Disetor
                    </span>
                    {openingCash > 0 && (
                        <span className="text-[10px] font-medium text-indigo-600/80 dark:text-indigo-400/80 bg-indigo-100/60 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                            Modal Awal: {formatNumber(openingCash)}
                        </span>
                    )}
                </div>

                {/* Status Warning & Deductions */}
                {isCashLess && (
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                        <CircleAlert className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>Kas kurang dari uang awal!</span>
                    </div>
                )}

                {openingCash > 0 && totalCash > openingCash && (
                    <div className="flex justify-between items-center text-xs text-indigo-700/80 dark:text-indigo-300/80 font-mono">
                        <span>Potongan Modal Awal:</span>
                        <span>-{formatNumber(openingCash)}</span>
                    </div>
                )}

                {/* Final Amount */}
                <div className="pt-1.5 flex justify-between items-baseline border-t border-indigo-200/60 dark:border-indigo-800/60">
                    <span className="text-xs text-indigo-900/70 dark:text-indigo-300/70 font-semibold">Setoran Akhir Shift</span>
                    <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 tracking-tight">{formatNumber(finalSetoran)}</span>
                </div>
            </div>

            {/* SECTION 4: TELEGRAM QR CODE REPORT CARD */}
            {rawTelegramData && (
                <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md space-y-3 border border-slate-800 transition-all duration-300">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">Laporan Telegram Terverifikasi</h4>
                                <p className="text-[10px] text-slate-400">
                                    {chatTitle} • {formatDateTime(dispatchTime)}
                                </p>
                            </div>
                        </div>
                        {telegramMsgId && (
                            <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                                ID: #{telegramMsgId}
                            </span>
                        )}
                    </div>

                    {/* QR CODE DISPLAY & DETAILS */}
                    <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                        <div className="relative group shrink-0 bg-white p-2 rounded-xl shadow-md">
                            <Image
                                width={500}
                                height={500}
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrValue)}`}
                                alt="QR Code Laporan Telegram"
                                className="w-28 h-28 object-contain rounded-lg"
                                loading="lazy"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                        </div>

                        <div className="space-y-1.5 text-xs w-full text-slate-300">
                            <div className="flex justify-between items-center text-[11px] pb-1 border-b border-slate-800">
                                <span className="text-slate-400">Status Telegram</span>
                                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Berhasil Dikirim
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-400">Gudang / Cabang</span>
                                <span className="font-semibold text-slate-200">{cabang !== "-" ? cabang : warehouseName}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-400">Total Setoran</span>
                                <span className="font-mono font-bold text-indigo-300">
                                    {totalSetoranTelegram !== "-" ? totalSetoranTelegram : formatNumber(finalSetoran)}
                                </span>
                            </div>
                            {telegramMsgId && (
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-400">Telegram Msg ID</span>
                                    <span className="font-mono text-slate-300">#{telegramMsgId}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={copyQrData}
                                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-slate-700"
                                >
                                    <Copy className="w-3 h-3" />
                                    {isCopied ? "Tersalin!" : "Salin Data QR"}
                                </button>

                                {telegramLink && (
                                    <a
                                        href={telegramLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-[11px] font-medium text-white flex items-center justify-center gap-1.5 transition-colors active:scale-95 shrink-0"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Telegram
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 5: ACTION BUTTON & LOCK COUNTDOWN */}
            <div className="pt-1">
                {isLocking && countdown > 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-medium">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
                            Shift terkunci, input data dinonaktifkan
                        </span>
                        <span className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
                            {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
                        </span>
                    </div>
                ) : isClosingComplete ? (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Setoran Kas Shift Selesai</span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleCloseStore}
                        disabled={loading || !isWithinTime || limitPlusSummary > 0}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow-sm hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Clock className="w-4 h-4 animate-spin" />
                                <span>{statusText || "Memproses tutup shift..."}</span>
                            </>
                        ) : (
                            <span>Tutup Toko dan Setorkan Kas</span>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Building2, Check, Copy, Settings2 } from "lucide-react";
import { formatNumber } from "@/app/utils/format";
import { useEffect, useState } from "react";
import Modal from "@/app/components/Modal";

export default function RevenueTable({ revenue, hasData }) {
    const sumByTrxType = (trxType) => {
        return revenue.revenue.reduce((total, item) => {
            return total + Number(item[trxType]);
        }, 0);
    };

    const [depositData, setDepositData] = useState({});
    const [selectedItemForSetting, setSelectedItemForSetting] = useState(null);
    const [tempDepId, setTempDepId] = useState("");
    const [copiedId, setCopiedId] = useState(null);

    // Load depositData dari localStorage saat mount (Client-side)
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("depositData");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        const map = {};
                        parsed.forEach((d) => {
                            if (d?.warehouseId) map[String(d.warehouseId)] = d.dep_id || "";
                            if (d?.warehouse) map[String(d.warehouse)] = d.dep_id || "";
                        });
                        setDepositData(map);
                    } else if (typeof parsed === "object" && parsed !== null) {
                        setDepositData(parsed);
                    }
                }
            } catch (e) {
                console.error("Gagal membaca depositData dari localStorage", e);
            }
        }
    }, []);

    const getDepositId = (item) => {
        if (!item) return "";
        const keyById = item.warehouseId ? String(item.warehouseId) : null;
        const keyByName = item.warehouse ? String(item.warehouse) : null;

        if (keyById && depositData[keyById] !== undefined) {
            const val = depositData[keyById];
            return typeof val === "object" ? val?.dep_id || "" : String(val);
        }
        if (keyByName && depositData[keyByName] !== undefined) {
            const val = depositData[keyByName];
            return typeof val === "object" ? val?.dep_id || "" : String(val);
        }
        return "";
    };

    const handleOpenSetting = (item) => {
        setSelectedItemForSetting(item);
        setTempDepId(getDepositId(item));
    };

    const handleSaveDepositId = (item, value) => {
        const key = String(item.warehouseId || item.warehouse || "");
        const trimmed = String(value || "").trim();

        setDepositData((prev) => {
            const updated = {
                ...prev,
                [key]: trimmed,
            };
            if (item.warehouseId) {
                updated[String(item.warehouseId)] = trimmed;
            }
            if (item.warehouse) {
                updated[String(item.warehouse)] = trimmed;
            }
            if (typeof window !== "undefined") {
                try {
                    localStorage.setItem("depositData", JSON.stringify(updated));
                } catch (e) {
                    console.error("Gagal menyimpan depositData ke localStorage", e);
                }
            }
            return updated;
        });

        setSelectedItemForSetting(null);
    };

    const handleCopy = async (item) => {
        const key = String(item.warehouseId || item.warehouse || "");
        const depId = getDepositId(item);

        if (!depId) {
            // Jika ID Deposit belum diisi, langsung buka modal setting untuk cabang ini
            setSelectedItemForSetting(item);
            setTempDepId("");
            return;
        }

        const depositAmount = Math.round(Number(item.deposit || 0));
        // Format: (ID Deposit).(item.deposit).300891
        const textToCopy = `${depId}.${depositAmount}.300891`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedId(key);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Gagal menyalin teks deposit:", err);
        }
    };

    const renderDepositActions = (item, isMobile = false) => {
        const key = String(item.warehouseId || item.warehouse || "");
        const depId = getDepositId(item);
        const isCopied = copiedId === key;
        const depositAmount = Math.round(Number(item.deposit || 0));

        return (
            <div
                className={`flex items-center gap-1 text-slate-400 dark:text-slate-500 ${isMobile ? "" : "opacity-0 group-hover:opacity-100 transition-opacity"}`}
            >
                <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="p-1 rounded hover:text-slate-700 dark:hover:text-slate-200 transition-colors relative"
                    title={depId ? `Salin: ${depId}.${depositAmount}.300891` : "Klik untuk atur ID Deposit"}
                >
                    {isCopied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                    {isCopied && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-30 font-sans">
                            Tersalin!
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => handleOpenSetting(item)}
                    className="p-1 rounded hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title="Atur ID Deposit"
                >
                    <Settings2 size={15} />
                </button>
            </div>
        );
    };

    return (
        <div className=" rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* ========================================================= */}
            {/* 2. CARD RINGKASAN TOTAL (UNTUK LAYAR HP) */}
            {/* ========================================================= */}
            {hasData && (
                <div className="sm:hidden p-4 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Ringkasan Laporan Pendapatan</span>

                    {/* High Level Numbers */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                            <span className="text-[10px] font-sans font-medium text-emerald-700 dark:text-emerald-400 block">Total Laba Bersih</span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(sumByTrxType("fee"))}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                            <span className="text-[10px] font-sans font-medium text-slate-400 block">Total Setoran Kas</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatNumber(sumByTrxType("cash"))}</span>
                        </div>
                    </div>

                    {/* Detail Ringkasan Transaksi */}
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] font-mono grid grid-cols-2 gap-y-2 gap-x-4">
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-slate-400">Transfer</span>
                            <span className="text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("transfer"))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-slate-400">Tarik Tunai</span>
                            <span className="text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("tarikTunai"))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-slate-400">Voucher</span>
                            <span className="text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("voucher"))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-slate-400">Acc.</span>
                            <span className="text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("accessories"))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-slate-400">Bank Fee</span>
                            <span className="text-rose-500 font-medium">{formatNumber(sumByTrxType("bank_fee"))}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-sans text-slate-400">Biaya</span>
                            <span className="text-rose-500 font-medium">{formatNumber(sumByTrxType("expense"))}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 3. TAMPILAN MOBILE: LIST OF CARDS (HANYA MUNCUL DI HP) */}
            {/* ========================================================= */}
            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60 ">
                {hasData ? (
                    revenue.revenue.map((item, i) => (
                        <div key={i} className="p-4 space-y-3">
                            {/* Header Cabang */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                                            {item.warehouse.replace(/^konter\s*/i, "")}
                                        </span>
                                        {getDepositId(item) && (
                                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                ID: {getDepositId(item)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {renderDepositActions(item, true)}
                            </div>

                            {/* Main Metric Highlight (Laba Bersih & Setoran) */}
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30">
                                    <span className="text-[10px] font-sans text-emerald-700 dark:text-emerald-400 block">Laba Bersih</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatNumber(item.fee)}</span>
                                </div>
                                <div className="bg-slate-50/70 dark:bg-slate-850/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-sans text-slate-400 block">Setoran Kas</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatNumber(item.cash)}</span>
                                </div>
                            </div>

                            {/* Rincian Transaksi */}
                            <div className="bg-slate-50/50 dark:bg-slate-850/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2 text-xs font-mono">
                                <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Breakdown Transaksi</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Transfer:</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.transfer)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Tarik Tunai:</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.tarikTunai)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Voucher:</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.voucher)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Acc.:</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.accessories)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Deposit:</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.deposit)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Tx Total:</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.trx)}</span>
                                    </div>
                                </div>

                                {/* Biaya & Fee Bank */}
                                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Bank Fee:</span>
                                        <span className="text-rose-500 font-medium">{formatNumber(item.bank_fee)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-sans text-slate-400">Biaya Ops:</span>
                                        <span className="text-rose-500 font-medium">{formatNumber(item.expense)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-slate-400 font-sans text-xs">Tidak ada data transaksi ditemukan.</div>
                )}
            </div>

            {/* ========================================================= */}
            {/* 4. TAMPILAN DESKTOP: FULL TABLE (HANYA MUNCUL DI DESKTOP) */}
            {/* ========================================================= */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/25">
                            <th scope="col" className="px-6 py-4 text-left">
                                Cabang
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Transfer
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Tarik Tunai
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Voucher
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Acc.
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Deposit
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Tx
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Bank Fee
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Biaya
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Laba Bersih
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Setoran Kas
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 font-mono">
                        {hasData ? (
                            revenue.revenue.map((item, i) => (
                                <tr key={i} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                    <td className="px-6 py-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span>{item.warehouse.replace(/^konter\s*/i, "")}</span>
                                                {getDepositId(item) && (
                                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        ID: {getDepositId(item)}
                                                    </span>
                                                )}
                                            </div>
                                            {renderDepositActions(item, false)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">{formatNumber(item.transfer)}</td>
                                    <td className="px-6 py-4 text-right">{formatNumber(item.tarikTunai)}</td>
                                    <td className="px-6 py-4 text-right">{formatNumber(item.voucher)}</td>
                                    <td className="px-6 py-4 text-right">{formatNumber(item.accessories)}</td>
                                    <td className="px-6 py-4 text-right">{formatNumber(item.deposit)}</td>
                                    <td className="px-6 py-4 text-right">{formatNumber(item.trx)}</td>
                                    <td className="px-6 py-4 text-right text-rose-500">{formatNumber(item.bank_fee)}</td>
                                    <td className="px-6 py-4 text-right text-rose-500">{formatNumber(item.expense)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(item.fee)}</td>
                                    <td className="px-6 py-4 text-right font-bold">{formatNumber(item.cash)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="px-6 py-8 text-center text-slate-400 font-sans">
                                    Tidak ada data transaksi ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>

                    {/* FOOTER TOTAL (DESKTOP) */}
                    {hasData && (
                        <tfoot className="">
                            <tr className="border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/25">
                                <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Total</th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                    {formatNumber(sumByTrxType("transfer"))}
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                    {formatNumber(sumByTrxType("tarikTunai"))}
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                    {formatNumber(sumByTrxType("voucher"))}
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                    {formatNumber(sumByTrxType("accessories"))}
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                    {formatNumber(sumByTrxType("deposit"))}
                                </th>
                                <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("trx"))}</th>
                                <th className="px-6 py-4 text-right font-semibold dark:text-slate-300 text-rose-500">
                                    {formatNumber(sumByTrxType("bank_fee"))}
                                </th>
                                <th className="px-6 py-4 text-right font-semibold dark:text-slate-300 text-rose-500">
                                    {formatNumber(sumByTrxType("expense"))}
                                </th>
                                <th className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(sumByTrxType("fee"))}</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-100">{formatNumber(sumByTrxType("cash"))}</th>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Modal Setting ID Deposit */}
            <Modal isOpen={!!selectedItemForSetting} onClose={() => setSelectedItemForSetting(null)} title="Setting ID Deposit" maxWidth="max-w-sm">
                {selectedItemForSetting && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveDepositId(selectedItemForSetting, tempDepId);
                        }}
                        className="space-y-4 font-sans text-xs"
                    >
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Cabang</span>
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                                {selectedItemForSetting.warehouse.replace(/^konter\s*/i, "")}
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">ID Deposit</label>
                            <input
                                type="text"
                                autoFocus
                                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                placeholder="Contoh: 12345"
                                value={tempDepId}
                                onChange={(e) => setTempDepId(e.target.value)}
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                ID ini dipakai untuk format copy:{" "}
                                <span className="font-mono text-slate-600 dark:text-slate-300">
                                    {tempDepId || "[ID]"}.{Math.round(Number(selectedItemForSetting.deposit || 0))}.300891
                                </span>
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setSelectedItemForSetting(null)}
                                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                            >
                                Simpan
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}

"use client";
import axios from "@/app/utils/axios";
import { formatNumber, formatRupiah, DateTimeNow } from "@/app/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeftRight, Building2, Coins, Loader2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import Dropdown from "@/app/components/Dropdown";

const inputClass =
    "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60";

const TransferWarehouseCash = ({ sourceWarehouse, warehouses = [], selectedDate, onSuccess, onClose }) => {
    const { today } = DateTimeNow();
    const [fromWarehouseId, setFromWarehouseId] = useState(sourceWarehouse?.id || "");
    const [toWarehouseId, setToWarehouseId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(selectedDate || today);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [isSwapping, setIsSwapping] = useState(false);

    // List cabang tujuan yang tersedia (tidak sama dengan cabang asal)
    const availableDestinationWarehouses = useMemo(() => {
        return warehouses.filter((w) => Number(w.id) !== Number(fromWarehouseId) && (w.status === undefined || w.status === 1));
    }, [warehouses, fromWarehouseId]);

    const destinationOptions = useMemo(() => {
        return [
            { value: "", label: "Pilih Cabang Tujuan" },
            ...availableDestinationWarehouses.map((w) => ({
                value: w.id,
                label: w.name?.replace(/^konter\s*/i, ""),
            })),
        ];
    }, [availableDestinationWarehouses]);

    const sourceWarehouseData = useMemo(() => {
        return warehouses.find((w) => Number(w.id) === Number(fromWarehouseId)) || sourceWarehouse;
    }, [warehouses, fromWarehouseId, sourceWarehouse]);

    const targetWarehouseData = useMemo(() => {
        return warehouses.find((w) => Number(w.id) === Number(toWarehouseId));
    }, [warehouses, toWarehouseId]);

    // Saldo kas tunai cabang asal (dari warehouse data jika ada properti cash)
    const sourceCashBalance = Number(sourceWarehouseData?.cash) || 0;

    const isInsufficientBalance = Boolean(amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > sourceCashBalance);

    const remainingCash = useMemo(() => {
        if (!amount || isNaN(parseFloat(amount))) return null;
        return sourceCashBalance - parseFloat(amount);
    }, [amount, sourceCashBalance]);

    // Swap asal dan tujuan
    const handleSwap = () => {
        if (!toWarehouseId) return;
        setIsSwapping(true);
        const tempFrom = fromWarehouseId;
        setFromWarehouseId(toWarehouseId);
        setToWarehouseId(tempFrom);
        setTimeout(() => setIsSwapping(false), 250);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!fromWarehouseId) return setFormError("Cabang asal harus ditentukan.");
        if (!toWarehouseId) return setFormError("Silakan pilih cabang tujuan transfer.");
        if (Number(fromWarehouseId) === Number(toWarehouseId)) return setFormError("Cabang asal dan tujuan tidak boleh sama.");
        if (!amount || parseFloat(amount) <= 0) return setFormError("Nominal transfer kas harus lebih dari 0.");

        setLoading(true);
        try {
            const payload = {
                from_warehouse_id: Number(fromWarehouseId),
                to_warehouse_id: Number(toWarehouseId),
                amount: parseFloat(amount),
                date_issued: date,
                description: description || "Transfer Kas Antar Cabang",
            };

            const response = await axios.post("/api/create-warehouse-cash-mutation", payload);
            if (typeof onSuccess === "function") {
                onSuccess(response?.data?.message || "Transfer kas antar cabang berhasil dikirim.");
            }
            if (typeof onClose === "function") {
                onClose();
            }
        } catch (error) {
            setFormError(error?.response?.data?.message || "Terjadi kesalahan saat menyimpan mutasi kas.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Error Banner */}
            <AnimatePresence>
                {formError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 overflow-hidden"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span>{formError}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tanggal Transaksi */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal Mutasi Kas</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>

            {/* Transfer Route Card */}
            <div className="p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-800/30 space-y-2.5">
                {/* Cabang Asal */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
                            <span>Cabang Sumber (Dari)</span>
                        </span>
                        {sourceCashBalance > 0 && (
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40 text-[11px]">
                                Kas: {formatNumber(sourceCashBalance)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-2xs">
                        <Building2 className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="truncate">{sourceWarehouseData?.name?.replace(/^konter\s*/i, "") || "Pilih Cabang"}</span>
                    </div>
                </div>

                {/* Swap Divider Button */}
                <div className="relative flex items-center justify-center my-0.5">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700/60" />
                    </div>
                    <div className="relative flex justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={handleSwap}
                            disabled={!toWarehouseId}
                            title="Tukar Cabang Asal & Tujuan"
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 shadow-2xs text-[11px] font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <motion.div animate={{ rotate: isSwapping ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                            </motion.div>
                            <span>Tukar Arah</span>
                        </motion.button>
                    </div>
                </div>

                {/* Cabang Tujuan */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                            <span>Cabang Penerima (Ke)</span>
                        </span>
                        {targetWarehouseData?.cash !== undefined && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                Kas Saat Ini: {formatNumber(targetWarehouseData.cash)}
                            </span>
                        )}
                    </div>
                    <Dropdown
                        id="transfer-target-warehouse"
                        label="Pilih Cabang Penerima"
                        options={destinationOptions}
                        selectedValue={toWarehouseId}
                        onChange={(val) => setToWarehouseId(val)}
                    />
                </div>
            </div>

            {/* Nominal Transfer Kas */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Jumlah Kas Tunai (Rp)</label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                    <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Contoh: 1000000"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                {/* Preview Saldo */}
                {amount && !isNaN(parseFloat(amount)) && (
                    <div className="pt-0.5">
                        {isInsufficientBalance ? (
                            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>Nominal melebihi saldo kas cabang asal ({formatRupiah(sourceCashBalance)})</span>
                            </p>
                        ) : remainingCash !== null ? (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                Estimasi Sisa Kas Asal: -{formatRupiah(amount)} = {formatRupiah(remainingCash)}
                            </p>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Keterangan / Memo */}
            <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Keterangan / Berita Acara</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Drop kas tunai operasional, titipan kurir"
                    className={inputClass}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || !fromWarehouseId || !toWarehouseId || !amount}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengirim...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim Transfer Kas</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default TransferWarehouseCash;

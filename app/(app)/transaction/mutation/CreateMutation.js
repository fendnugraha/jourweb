/* eslint-disable react-hooks/set-state-in-effect */
import Dropdown from "@/app/components/Dropdown";
import TabSwitcher from "@/app/components/TabSwitcher";
import { useAuth } from "@/app/utils/auth";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatNumber, formatRupiah } from "@/app/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeftRight, Landmark, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const labelClass = "text-xs font-semibold text-slate-500 dark:text-slate-400";
const inputClass =
    "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600";

const CreateMutation = ({ accountBalance = [], accounts = [], mutate, mutateBalance, isModalOpen, notification, warehouses = [], userRole }) => {
    const { user } = useAuth();
    const warehouseId = user.warehouse_id;
    const [newType, setNewType] = useState("self");
    const { today } = DateTimeNow();
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false); // State untuk animasi spin
    const [isReversed, setIsReversed] = useState(false); // State pelacak status reverse/swap

    // Cek apakah role diizinkan swap
    const canSwap = ["Administrator", "Super Admin"].includes(userRole);

    const [formData, setFormData] = useState({
        date_issued: today,
        debt_id: "",
        cred_id: "",
        is_confirmed: true,
        amount: "",
        fee_amount: 0,
        admin_fee: 0,
        trx_type: "Mutasi Kas",
        description: "",
        warehouse_id: warehouseId,
    });

    const availableWarehouses = useMemo(() => warehouses.filter((w) => w.status === 1), [warehouses]);

    const [selectedDestinationWarehouseId, setSelectedDestinationWarehouseId] = useState(() => availableWarehouses[0]?.id || 1);

    const effectiveDestinationId = useMemo(() => {
        if (
            availableWarehouses.length > 0 &&
            availableWarehouses.account_id === 2 &&
            !availableWarehouses.some((w) => Number(w.id) === Number(selectedDestinationWarehouseId))
        ) {
            return availableWarehouses[0].id;
        }
        return selectedDestinationWarehouseId;
    }, [availableWarehouses, selectedDestinationWarehouseId]);

    const handleTypeChange = (val) => {
        setNewType(val);
        setIsReversed(false); // Reset status reverse saat ganti tab
        setFormData((prev) => ({ ...prev, debt_id: "", cred_id: "" }));
        const defaultDestId = ["Administrator", "Super Admin"].includes(userRole) ? null : 1;
        setSelectedDestinationWarehouseId(defaultDestId);
    };

    const patch = (fields) => setFormData((prev) => ({ ...prev, ...fields }));

    // Function Swap dengan Animasi & Pembalikan Opsi Filter
    const handleSwapAccounts = () => {
        setIsSwapping(true);
        setIsReversed((prev) => !prev); // Toggle status reverse

        setFormData((prev) => ({
            ...prev,
            cred_id: prev.debt_id,
            debt_id: prev.cred_id,
        }));

        setTimeout(() => setIsSwapping(false), 300); // Durasi animasi putar
    };

    // Filter Creditor (Rekening Asal) - Disesuaikan dengan isReversed
    const credOptions = useMemo(() => {
        const sourceWarehouseId = isReversed ? (newType === "self" ? warehouseId : effectiveDestinationId) : warehouseId;

        return [
            { value: "", label: "Pilih Akun" },
            ...accounts
                .filter((a) => {
                    const matchWarehouse = Number(a.warehouse_id) === Number(sourceWarehouseId);
                    const matchRole = ["Administrator", "Super Admin"].includes(userRole) ? true : a.account_id === 2;
                    const notSameAsDebt = newType === "self" ? Number(a.id) !== Number(formData.debt_id) : true;
                    return matchWarehouse && matchRole && notSameAsDebt;
                })
                .map((a) => ({
                    value: a.id,
                    label: a.group + (isReversed && newType !== "self" ? ` (${a.warehouse?.code === "HQT" ? "Pusat" : a.warehouse?.code})` : ""),
                })),
        ];
    }, [accounts, warehouseId, effectiveDestinationId, userRole, formData.debt_id, isReversed, newType]);

    // Filter Debtor (Rekening Tujuan) - Disesuaikan dengan isReversed
    const debtOptions = useMemo(() => {
        const targetWarehouseId = isReversed ? warehouseId : newType === "self" ? warehouseId : effectiveDestinationId;

        return [
            { value: "", label: "Pilih Akun" },
            ...accounts
                .filter((a) => {
                    const matchWarehouse = Number(a.warehouse_id) === Number(targetWarehouseId);
                    const notSameAsCred = newType === "self" ? Number(a.id) !== Number(formData.cred_id) : true;
                    return matchWarehouse && notSameAsCred;
                })
                .map((a) => ({
                    value: a.id,
                    label: a.group + (!isReversed && newType !== "self" ? ` (${a.warehouse?.code === "HQT" ? "Pusat" : a.warehouse?.code})` : ""),
                })),
        ];
    }, [accounts, warehouseId, effectiveDestinationId, formData.cred_id, isReversed, newType]);

    const warehouseOptions = [{ value: "", label: "Select Warehouse" }, ...availableWarehouses.map((w) => ({ value: w.id, label: w.name }))];

    useEffect(() => {
        if (newType !== "other" || !formData.cred_id || formData.debt_id || !accounts?.length || !effectiveDestinationId) return;

        const selectedCred = accounts.find((a) => Number(a.id) === Number(formData.cred_id));
        if (!selectedCred) return;

        const targetWId = isReversed ? warehouseId : effectiveDestinationId;
        const matchingDebt = accounts.find((a) => a.group === selectedCred.group && Number(a.warehouse_id) === Number(targetWId));
        if (matchingDebt) patch({ debt_id: matchingDebt.id });
    }, [formData.cred_id, formData.debt_id, accounts, effectiveDestinationId, warehouseId, newType, isReversed]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!formData.cred_id) return setFormError("Silakan pilih Rekening Asal (Dari).");
        if (!formData.debt_id) return setFormError("Silakan pilih Akun/Cabang Tujuan.");
        if (Number(formData.cred_id) === Number(formData.debt_id) && newType === "self")
            return setFormError("Rekening Asal dan Rekening Tujuan tidak boleh sama.");
        if (!formData.amount || parseFloat(formData.amount) <= 0) return setFormError("Jumlah mutasi harus lebih besar dari 0.");

        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            if (typeof notification === "function") notification(response.data?.message || "Mutasi kas berhasil disimpan");
            setFormData({
                date_issued: today,
                debt_id: "",
                cred_id: "",
                is_confirmed: true,
                amount: "",
                fee_amount: 0,
                trx_type: "Mutasi Kas",
                description: "",
                admin_fee: 0,
                warehouse_id: warehouseId,
            });
            setIsReversed(false);
            if (typeof mutate === "function") mutate();
            if (typeof mutateBalance === "function") mutateBalance();
        } catch (error) {
            setFormError(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setLoading(false);
        }
    };
    const findSourceBalance = accountBalance?.data?.chartOfAccounts?.find((acc) => Number(acc.id) === Number(formData.cred_id))?.balance;

    return (
        <>
            <TabSwitcher
                buttonList={[
                    { icon: Warehouse, value: "self", label: "Akun Sendiri" },
                    { icon: Landmark, value: "other", label: "Cabang Lain / Pusat" },
                ]}
                activeTab={newType}
                setActiveTab={handleTypeChange}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Alert Error dengan Motion */}
                    <AnimatePresence>
                        {formError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -6 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 overflow-hidden"
                            >
                                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                                <span>{formError}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1" hidden={!["Administrator", "Super Admin"].includes(userRole)}>
                        <label htmlFor="tx-date" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Tanggal Transaksi
                        </label>

                        <input
                            id="tx-date"
                            type="datetime-local"
                            required
                            value={formData.date_issued}
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                    </div>

                    {/* Destination / Source Warehouse Dropdown Header */}
                    {["Administrator", "Super Admin"].includes(userRole) && newType === "other" && (
                        <div className="space-y-1">
                            <label htmlFor="tx-destination-warehouse" className={labelClass}>
                                {isReversed ? "Cabang Asal Mutasi" : "Cabang Tujuan Mutasi"}
                            </label>
                            <Dropdown
                                id="tx-destination-warehouse"
                                label="Warehouse Selector"
                                options={warehouseOptions}
                                selectedValue={selectedDestinationWarehouseId}
                                onChange={(val) => {
                                    setSelectedDestinationWarehouseId(val);
                                    setFormData({ ...formData, date_issued: today });
                                }}
                            />
                        </div>
                    )}

                    {/* Source & Destination Accounts */}
                    <div className={`grid grid-cols-1 ${canSwap ? "sm:grid-cols-[1fr_auto_1fr]" : "sm:grid-cols-2"} items-end gap-2`}>
                        <div className="space-y-1">
                            <label htmlFor="tx-cred-account" className={labelClass}>
                                Rekening Asal (Dari)
                            </label>
                            <Dropdown
                                id="tx-cred-account"
                                label="Rekening Asal"
                                options={credOptions}
                                selectedValue={formData.cred_id}
                                onChange={(val) => patch({ cred_id: val })}
                            />
                        </div>

                        {/* Tombol Swap / Tukar */}
                        {canSwap && (
                            <div className="flex justify-center pb-0.5">
                                <motion.button
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    type="button"
                                    onClick={handleSwapAccounts}
                                    title="Tukar Rekening Asal & Tujuan"
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-xs"
                                >
                                    <motion.div animate={{ rotate: isSwapping ? 180 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                                        <ArrowLeftRight className="w-4 h-4" />
                                    </motion.div>
                                </motion.button>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label htmlFor="tx-debt-account" className={labelClass}>
                                Ke {newType === "self" ? "Akun" : isReversed ? "Cabang Saat Ini" : "Cabang Lain / Pusat"}
                            </label>
                            <Dropdown
                                id="tx-debt-account"
                                label="Rekening Tujuan"
                                options={debtOptions}
                                selectedValue={formData.debt_id}
                                onChange={(val) => patch({ debt_id: val })}
                            />
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="grid sm:grid-cols-3 gap-3">
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
                                    onChange={(e) => patch({ amount: e.target.value })}
                                    placeholder="50000"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
                                    disabled={!formData.cred_id || !formData.debt_id}
                                />
                            </div>
                            {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: {formatNumber(findSourceBalance)} - {formatNumber(formData.amount)} ={" "}
                                    {formatRupiah(findSourceBalance - formData.amount)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="tx-admin-fee" className={labelClass}>
                                Admin Bank
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-admin-fee"
                                    type="number"
                                    required
                                    value={formData.admin_fee}
                                    onChange={(e) => patch({ admin_fee: e.target.value })}
                                    placeholder="2500"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
                                    disabled={!formData.amount}
                                />
                            </div>
                            {formData.admin_fee !== 0 && !isNaN(parseFloat(formData.admin_fee)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: Rp {parseFloat(formData.admin_fee).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label htmlFor="tx-desc" className={labelClass}>
                            Keterangan / Memo
                        </label>
                        <input
                            id="tx-desc"
                            type="text"
                            value={formData.description}
                            onChange={(e) => patch({ description: e.target.value })}
                            placeholder="e.g. Kelebihan Saldo"
                            className={inputClass}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => typeof isModalOpen === "function" && isModalOpen(false)}
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
                            {loading ? "Menyimpan data..." : "Tambah Mutasi"}
                        </motion.button>
                    </div>
                </form>
            </TabSwitcher>
        </>
    );
};

export default CreateMutation;

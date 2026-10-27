/* eslint-disable react-hooks/set-state-in-effect */
import Dropdown from "@/app/components/Dropdown";
import TabSwitcher from "@/app/components/TabSwitcher";
import { useAuth } from "@/app/utils/auth";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatNumber, formatRupiah } from "@/app/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, ArrowDown, ArrowLeftRight, Building2, CheckCircle2, Landmark, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const labelClass = "text-xs font-semibold text-slate-600 dark:text-slate-300";
const inputClass =
    "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60";

const CreateMutation = ({ accountBalance = [], accounts = [], mutate, mutateBalance, isModalOpen, notification, warehouses = [], userRole }) => {
    const { user } = useAuth();
    const warehouseId = user.warehouse_id;
    const [newType, setNewType] = useState("self");
    const { today } = DateTimeNow();
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [isReversed, setIsReversed] = useState(false);

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
        setIsReversed(false);
        setFormData((prev) => ({ ...prev, debt_id: "", cred_id: "", admin_fee: 0 }));
        const defaultDestId = ["Administrator", "Super Admin"].includes(userRole) ? null : 1;
        setSelectedDestinationWarehouseId(defaultDestId);
    };

    const patch = (fields) => setFormData((prev) => ({ ...prev, ...fields }));

    const handleSwapAccounts = () => {
        setIsSwapping(true);
        setIsReversed((prev) => !prev);

        setFormData((prev) => ({
            ...prev,
            cred_id: prev.debt_id,
            debt_id: prev.cred_id,
        }));

        setTimeout(() => setIsSwapping(false), 300);
    };

    // Filter Creditor (Rekening Asal)
    const credOptions = useMemo(() => {
        const sourceWarehouseId = isReversed ? (newType === "self" ? warehouseId : effectiveDestinationId) : warehouseId;

        return [
            { value: "", label: "Pilih Rekening Asal" },
            ...accounts
                .filter((a) => {
                    const matchWarehouse = Number(a.warehouse_id) === Number(sourceWarehouseId);
                    const matchRole = ["Administrator", "Super Admin"].includes(userRole) ? true : a.account_id === 2;
                    const notSameAsDebt = newType === "self" ? Number(a.id) !== Number(formData.debt_id) : true;
                    return matchWarehouse && matchRole && notSameAsDebt;
                })
                .map((a) => {
                    const branchSuffix = isReversed && newType !== "self" ? ` (${a.warehouse?.code === "HQT" ? "Pusat" : a.warehouse?.code || ""})` : "";
                    const nameLabel = a.name && a.name !== a.group ? `${a.group} - ${a.name}` : a.group;
                    return {
                        value: a.id,
                        label: `${nameLabel}${branchSuffix}`,
                    };
                }),
        ];
    }, [accounts, warehouseId, effectiveDestinationId, userRole, formData.debt_id, isReversed, newType]);

    // Filter Debtor (Rekening Tujuan)
    const debtOptions = useMemo(() => {
        const targetWarehouseId = isReversed ? warehouseId : newType === "self" ? warehouseId : effectiveDestinationId;

        return [
            { value: "", label: "Pilih Rekening Tujuan" },
            ...accounts
                .filter((a) => {
                    const matchWarehouse = Number(a.warehouse_id) === Number(targetWarehouseId);
                    const notSameAsCred = newType === "self" ? Number(a.id) !== Number(formData.cred_id) : true;
                    return matchWarehouse && notSameAsCred;
                })
                .map((a) => {
                    const branchSuffix = !isReversed && newType !== "self" ? ` (${a.warehouse?.code === "HQT" ? "Pusat" : a.warehouse?.code || ""})` : "";
                    const nameLabel = a.name && a.name !== a.group ? `${a.group} - ${a.name}` : a.group;
                    return {
                        value: a.id,
                        label: `${nameLabel}${branchSuffix}`,
                    };
                }),
        ];
    }, [accounts, warehouseId, effectiveDestinationId, formData.cred_id, isReversed, newType]);

    const warehouseOptions = [{ value: "", label: "Pilih Cabang" }, ...availableWarehouses.map((w) => ({ value: w.id, label: w.name }))];

    const selectedCredAccount = useMemo(() => {
        if (!formData.cred_id) return null;
        return accounts.find((a) => Number(a.id) === Number(formData.cred_id));
    }, [accounts, formData.cred_id]);

    const selectedDebtAccount = useMemo(() => {
        if (!formData.debt_id) return null;
        return accounts.find((a) => Number(a.id) === Number(formData.debt_id));
    }, [accounts, formData.debt_id]);

    const hasBothAccounts = Boolean(selectedCredAccount && selectedDebtAccount);
    const isGroupMismatch = Boolean(
        hasBothAccounts &&
        selectedCredAccount?.group &&
        selectedDebtAccount?.group &&
        selectedCredAccount.group.trim().toUpperCase() !== selectedDebtAccount.group.trim().toUpperCase(),
    );
    const isGroupMatched = Boolean(
        hasBothAccounts &&
        selectedCredAccount?.group &&
        selectedDebtAccount?.group &&
        selectedCredAccount.group.trim().toUpperCase() === selectedDebtAccount.group.trim().toUpperCase(),
    );

    // Cari akun dengan grup yang sama di cabang tujuan untuk opsi quick match
    const matchingDestAccountWithSameGroup = useMemo(() => {
        if (!selectedCredAccount?.group) return null;
        const targetWId = isReversed ? warehouseId : newType === "self" ? warehouseId : effectiveDestinationId;
        return accounts.find(
            (a) =>
                Number(a.warehouse_id) === Number(targetWId) &&
                a.group?.trim().toUpperCase() === selectedCredAccount.group?.trim().toUpperCase() &&
                Number(a.id) !== Number(formData.cred_id),
        );
    }, [selectedCredAccount, accounts, isReversed, warehouseId, newType, effectiveDestinationId, formData.cred_id]);

    const sourceWarehouseInfo = useMemo(() => {
        const srcWId = isReversed ? (newType === "self" ? warehouseId : effectiveDestinationId) : warehouseId;
        return warehouses.find((w) => Number(w.id) === Number(srcWId));
    }, [warehouses, isReversed, newType, warehouseId, effectiveDestinationId]);

    const destWarehouseInfo = useMemo(() => {
        const targetWId = isReversed ? warehouseId : newType === "self" ? warehouseId : effectiveDestinationId;
        return warehouses.find((w) => Number(w.id) === Number(targetWId));
    }, [warehouses, isReversed, newType, warehouseId, effectiveDestinationId]);

    const findSourceBalance = useMemo(() => {
        if (!formData.cred_id || !accountBalance?.data?.chartOfAccounts) return null;
        const acc = accountBalance.data.chartOfAccounts.find((a) => Number(a.id) === Number(formData.cred_id));
        return acc ? acc.balance : null;
    }, [accountBalance, formData.cred_id]);

    const isInsufficientBalance = Boolean(
        findSourceBalance !== null &&
        findSourceBalance !== undefined &&
        formData.amount &&
        !isNaN(parseFloat(formData.amount)) &&
        parseFloat(formData.amount) > parseFloat(findSourceBalance),
    );

    const remainingBalance = useMemo(() => {
        if (findSourceBalance === null || findSourceBalance === undefined || !formData.amount) return null;
        const numAmount = parseFloat(formData.amount);
        if (isNaN(numAmount)) return null;
        return parseFloat(findSourceBalance) - numAmount;
    }, [findSourceBalance, formData.amount]);

    useEffect(() => {
        if (newType !== "other" || !formData.cred_id || !accounts?.length || !effectiveDestinationId) return;

        const selectedCred = accounts.find((a) => Number(a.id) === Number(formData.cred_id));
        if (!selectedCred) return;

        const targetWId = isReversed ? warehouseId : effectiveDestinationId;
        const matchingDebt = accounts.find((a) => a.group === selectedCred.group && Number(a.warehouse_id) === Number(targetWId));

        patch({ debt_id: matchingDebt ? matchingDebt.id : "" });
    }, [formData.cred_id, accounts, effectiveDestinationId, warehouseId, newType, isReversed]);

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

    return (
        <div className="w-full text-xs">
            <TabSwitcher
                buttonList={[
                    { icon: Warehouse, value: "self", label: "Akun Sendiri" },
                    { icon: Landmark, value: "other", label: "Cabang Lain / Pusat" },
                ]}
                activeTab={newType}
                setActiveTab={handleTypeChange}
            >
                <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                    {/* Alert Error */}
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

                    {/* Section 1: Tanggal & Cabang */}
                    {["Administrator", "Super Admin"].includes(userRole) ? (
                        <div className={`grid gap-2.5 ${newType === "other" ? "grid-cols-2" : "grid-cols-1"}`}>
                            {newType === "other" && (
                                <div className="space-y-1 min-w-0">
                                    <label htmlFor="tx-destination-warehouse" className={labelClass}>
                                        {isReversed ? "Cabang Asal" : "Cabang Tujuan"}
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
                            <div className="space-y-1">
                                <label htmlFor="tx-date" className={labelClass}>
                                    Tanggal Transaksi
                                </label>
                                <input
                                    id="tx-date"
                                    type="datetime-local"
                                    required
                                    value={formData.date_issued}
                                    onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    ) : (
                        newType === "other" && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300">
                                <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span>
                                    Tujuan Mutasi: <strong>Kantor Pusat (HQT)</strong>
                                </span>
                            </div>
                        )
                    )}

                    {/* Section 2: Card Rekening Asal & Tujuan */}
                    <div className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700/70 bg-slate-50/60 dark:bg-slate-800/30 space-y-2.5">
                        {/* Rekening Asal (Dari) */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <label htmlFor="tx-cred-account" className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
                                    <span>Asal (Dari)</span>
                                </label>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-400 dark:text-slate-500">
                                        Cabang:{" "}
                                        <strong className="text-slate-700 dark:text-slate-300">
                                            {sourceWarehouseInfo?.name || sourceWarehouseInfo?.code || "Asal"}
                                        </strong>
                                    </span>
                                    {findSourceBalance !== null && findSourceBalance !== undefined && (
                                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                                            {formatRupiah(findSourceBalance)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Dropdown
                                id="tx-cred-account"
                                label="Asal"
                                options={credOptions}
                                selectedValue={formData.cred_id}
                                onChange={(val) => patch({ cred_id: val })}
                                disabled={selectedDestinationWarehouseId === null && newType !== "self"}
                            />
                        </div>

                        {/* Divider & Tombol Swap di Tengah */}
                        <div className="relative flex items-center justify-center my-0.5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-slate-700/60" />
                            </div>
                            <div className="relative flex justify-center">
                                {canSwap ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={handleSwapAccounts}
                                        title="Tukar Asal & Tujuan"
                                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 shadow-2xs text-[11px] font-medium cursor-pointer transition-colors"
                                    >
                                        <motion.div animate={{ rotate: isSwapping ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
                                        </motion.div>
                                        <span>Tukar Rekening</span>
                                    </motion.button>
                                ) : (
                                    <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                        <ArrowDown className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tujuan (Ke) */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <label htmlFor="tx-debt-account" className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                                    <span>Tujuan ({newType === "self" ? "Akun Sendiri" : isReversed ? "Cabang Saat Ini" : "Cabang / Pusat"})</span>
                                </label>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                    <span className="text-slate-400 dark:text-slate-500">
                                        Cabang:{" "}
                                        <strong className="text-slate-700 dark:text-slate-300">
                                            {destWarehouseInfo?.name || destWarehouseInfo?.code || "Tujuan"}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                            <div className={isGroupMismatch ? "ring-2 ring-amber-400/80 rounded-xl" : ""}>
                                <Dropdown
                                    id="tx-debt-account"
                                    label="Rekening Tujuan"
                                    options={debtOptions}
                                    selectedValue={formData.debt_id}
                                    onChange={(val) => patch({ debt_id: val })}
                                    disabled={!formData.cred_id}
                                />
                            </div>
                        </div>

                        {/* Indikator Peringatan Beda Grup */}
                        <AnimatePresence>
                            {isGroupMismatch && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50/90 dark:bg-amber-950/40 text-xs text-amber-900 dark:text-amber-200 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span className="truncate">
                                                <strong>Transfer Antar Bank!</strong> ({selectedCredAccount?.group} ➔{" "}
                                                <strong>{selectedDebtAccount?.group}</strong>)
                                            </span>
                                        </div>
                                        {matchingDestAccountWithSameGroup && (
                                            <button
                                                type="button"
                                                onClick={() => patch({ debt_id: matchingDestAccountWithSameGroup.id })}
                                                className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-200/90 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 font-semibold text-[11px] text-amber-900 dark:text-amber-100 cursor-pointer transition-colors shadow-2xs"
                                            >
                                                Samakan ke {matchingDestAccountWithSameGroup.group}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mt-1">
                                        Pastikan mutasi antar-bank atau kas ke bank ini sudah sesuai.
                                    </p>
                                </motion.div>
                            )}

                            {isGroupMatched && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-2.5 py-1.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 overflow-hidden"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>
                                        Transfer ke sesama <strong>{selectedCredAccount.group}</strong>
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Section 3: Nominal & Admin Bank */}
                    <div className="grid grid-cols-[1fr_130px] gap-2.5">
                        {/* Jumlah */}
                        <div className="space-y-1">
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
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                                    disabled={!formData.cred_id || !formData.debt_id}
                                />
                            </div>

                            {/* Info Sisa Saldo Real-Time */}
                            {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                                <div className="pt-0.5">
                                    {isInsufficientBalance ? (
                                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                                Melebihi saldo - {formatRupiah(formData.amount)} ({formatRupiah(findSourceBalance)})
                                            </span>
                                        </p>
                                    ) : findSourceBalance !== null && remainingBalance !== null ? (
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                            Sisa: - {formatRupiah(formData.amount)} {"->"} {formatRupiah(remainingBalance)}
                                        </p>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Admin Bank */}
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
                                    placeholder="0"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                                    disabled={!formData.amount}
                                />
                            </div>

                            {/* Quick Buttons Fee saat Beda Grup */}
                            {isGroupMismatch && (
                                <div className="flex items-center gap-1 pt-1">
                                    {[0, 2500, 6500].map((fee) => (
                                        <button
                                            key={fee}
                                            type="button"
                                            onClick={() => patch({ admin_fee: fee })}
                                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                                                Number(formData.admin_fee) === fee
                                                    ? "bg-indigo-600 text-white border-indigo-600"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                                            }`}
                                        >
                                            {fee === 0 ? "0" : fee === 2500 ? "2.5k" : "6.5k"}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 4: Keterangan (Memo) */}
                    <div className="space-y-1">
                        <label htmlFor="tx-desc" className={labelClass}>
                            Keterangan / Memo
                        </label>
                        <input
                            id="tx-desc"
                            type="text"
                            value={formData.description}
                            onChange={(e) => patch({ description: e.target.value })}
                            placeholder="Contoh: Kelebihan Saldo, Setor Kasir"
                            className={inputClass}
                        />
                    </div>

                    {/* Section 5: Footer Actions */}
                    <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => typeof isModalOpen === "function" && isModalOpen(false)}
                            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-colors"
                        >
                            Batal
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: loading || !formData.cred_id || !formData.debt_id || !formData.amount ? 1 : 1.02 }}
                            whileTap={{ scale: loading || !formData.cred_id || !formData.debt_id || !formData.amount ? 1 : 0.98 }}
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs flex items-center gap-1.5"
                            disabled={loading || !formData.cred_id || !formData.debt_id || !formData.amount}
                        >
                            {loading ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                "Simpan Mutasi"
                            )}
                        </motion.button>
                    </div>
                </form>
            </TabSwitcher>
        </div>
    );
};

export default CreateMutation;

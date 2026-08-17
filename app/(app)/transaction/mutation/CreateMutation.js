/* eslint-disable react-hooks/set-state-in-effect */
import Dropdown from "@/app/components/Dropdown";
import TabSwitcher from "@/app/components/TabSwitcher";
import axios from "@/app/utils/axios";
import { DateTimeNow } from "@/app/utils/format";
import { AlertCircle, Landmark, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const labelClass = "text-xs font-semibold text-slate-500 dark:text-slate-400";
const inputClass =
    "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600";

const CreateMutation = ({ accounts = [], mutate, mutateBalance, isModalOpen, warehouseId, notification, warehouses = [], userRole }) => {
    const [newType, setNewType] = useState("self");
    const { today } = DateTimeNow();
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date_issued: today,
        debt_id: "",
        cred_id: "",
        is_confirmed: true,
        amount: "",
        fee_amount: 0,
        trx_type: "Mutasi Kas",
        description: "",
    });

    const availableWarehouses = useMemo(() => warehouses.filter((w) => Number(w.id) !== Number(warehouseId) && w.status === 1), [warehouses, warehouseId]);

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
        setFormData((prev) => ({ ...prev, debt_id: "" }));
    };

    const patch = (fields) => setFormData((prev) => ({ ...prev, ...fields }));

    const credOptions = [
        { value: "", label: "Select Account" },
        ...accounts.filter((a) => Number(a.warehouse_id) === Number(warehouseId) && a.account_id === 2).map((a) => ({ value: a.id, label: a.group })),
    ];

    const debtOptions = [
        { value: "", label: "Select Account" },
        ...accounts
            .filter((a) => {
                const targetId = newType === "self" ? warehouseId : effectiveDestinationId;
                return Number(a.warehouse_id) === Number(targetId) && Number(a.id) !== Number(formData.cred_id);
            })
            .map((a) => ({
                value: a.id,
                label: a.group + (newType === "self" ? "" : ` (${a.warehouse?.code})`),
            })),
    ];

    const warehouseOptions = [{ value: "", label: "Select Warehouse" }, ...availableWarehouses.map((w) => ({ value: w.id, label: w.name }))];

    // Auto-match destination account for inter-branch mutations
    useEffect(() => {
        if (newType !== "other" || !formData.cred_id || !accounts?.length || !effectiveDestinationId) return;

        const selectedCred = accounts.find((a) => Number(a.id) === Number(formData.cred_id));
        if (!selectedCred) return;

        const matchingDebt = accounts.find((a) => a.group === selectedCred.group && Number(a.warehouse_id) === Number(effectiveDestinationId));
        if (matchingDebt) patch({ debt_id: matchingDebt.id });
    }, [formData.cred_id, accounts, effectiveDestinationId, newType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!formData.cred_id) return setFormError("Silakan pilih Rekening Asal (Dari).");
        if (!formData.debt_id) return setFormError("Silakan pilih Akun/Cabang Tujuan.");
        if (Number(formData.cred_id) === Number(formData.debt_id)) return setFormError("Rekening Asal dan Rekening Tujuan tidak boleh sama.");
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
            });
            if (typeof mutate === "function") mutate();
            if (typeof mutateBalance === "function") mutateBalance();
            // if (typeof isModalOpen === "function") isModalOpen(false);
        } catch (error) {
            setFormError(error.response?.data?.message || "Terjadi kesalahan saat menyimpan data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-2">
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Mutasi Ke</span>
                <TabSwitcher
                    buttonList={[
                        { icon: Warehouse, value: "self", label: "Akun Sendiri" },
                        { icon: Landmark, value: "other", label: "Cabang Lain / Pusat" },
                    ]}
                    activeTab={newType}
                    setActiveTab={handleTypeChange}
                />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

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

                {/* Destination Warehouse */}
                <div className="space-y-1">
                    <label htmlFor="tx-destination-warehouse" className={labelClass}>
                        Cabang Tujuan Mutasi
                    </label>
                    <Dropdown
                        id="tx-destination-warehouse"
                        label="Warehouse Selector"
                        options={warehouseOptions}
                        selectedValue={selectedDestinationWarehouseId}
                        onChange={(val) => setSelectedDestinationWarehouseId(val)}
                        disabled={!["Administrator", "Super Admin"].includes(userRole) || newType === "self"}
                    />
                </div>

                {/* Source & Destination Accounts */}
                <div className="grid sm:grid-cols-2 gap-2">
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
                    <div className="space-y-1">
                        <label htmlFor="tx-debt-account" className={labelClass}>
                            Ke {newType === "self" ? "Akun" : "Cabang Lain / Pusat"}
                        </label>
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

                {/* Amount */}
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
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
                            disabled={!formData.cred_id || !formData.debt_id}
                        />
                    </div>
                    {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                            Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                        </p>
                    )}
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
                    <button
                        type="button"
                        onClick={() => typeof isModalOpen === "function" && isModalOpen(false)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Menyimpan data..." : "Tambah Mutasi"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateMutation;

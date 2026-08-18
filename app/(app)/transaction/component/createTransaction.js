import Dropdown from "@/app/components/Dropdown";

import axios from "@/app/utils/axios";

import { calculateFee, DateTimeNow } from "@/app/utils/format";

import { AlertCircle, Loader2, Sparkles, ArrowRightLeft, Banknote, ArrowUp, ArrowDown } from "lucide-react";

import { useState } from "react";

import { motion, AnimatePresence } from "motion/react";

import TabSwitcher from "@/app/components/TabSwitcher";

const CreateTransaction = ({
    warehouseCashId,

    selectedBankAccount,

    setSelectedBankAccount,

    accounts,

    warehouseId,

    mutate,

    mutateBalance,

    isModalOpen,

    notification,

    setPersonalSetting,

    feeAuto,
    userRole,
}) => {
    const { today } = DateTimeNow();

    const [newType, setNewType] = useState("transfer");

    const [isFeeActive, setIsFeeActive] = useState(false);

    const [loading, setLoading] = useState(false);

    const [formError, setFormError] = useState("");

    const [formData, setFormData] = useState({
        date_issued: today,

        debt_id: warehouseCashId,

        cred_id: selectedBankAccount,

        amount: "",

        fee_amount: "",

        trx_type: "Transfer Uang",

        description: "",

        custName: "",
    });

    const accountOptions = [
        { value: "", label: "-- Select Account --" },

        ...accounts

            .filter((account) => account.account_id === 2 && account.warehouse_id === warehouseId)

            .map((account) => ({ value: account.id, label: account.group })),
    ];

    const handleAddTxSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        setFormError("");

        try {
            const response = await axios.post("/api/create-transfer", formData);

            const successMessage = response.data.message;

            notification(successMessage);

            setFormData({
                date_issued: today,

                debt_id: newType === "transfer" ? warehouseCashId : formData.debt_id,

                cred_id: newType === "transfer" ? formData.cred_id : warehouseCashId,

                amount: "",

                trx_type: newType === "transfer" ? "Transfer Uang" : "Tarik Tunai",

                fee_amount: "",

                description: "",

                custName: newType === "transfer" ? "" : "Walk In Customer",
            });

            mutate();

            mutateBalance();
            setIsFeeActive(false);
        } catch (error) {
            const errMsg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan transaksi.";

            setFormError(errMsg);

            notification("Error: " + errMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFee = () => {
        const nextState = !isFeeActive;

        setIsFeeActive(nextState);

        setFormData((prev) => {
            const numAmount = Number(prev.amount) || 0;

            const newFeeAmount = nextState ? prev.amount : feeAuto ? calculateFee(numAmount) : prev.fee_amount;

            return {
                ...prev,
                fee_amount: newFeeAmount,
                trx_type: nextState ? "Bank Fee" : "Tarik Tunai",
            };
        });
    };

    const handleAmountChange = (e) => {
        const val = e.target.value;

        const numVal = Number(val) || 0;

        setFormData((prev) => ({
            ...prev,

            amount: val,

            fee_amount: isFeeActive ? val : feeAuto ? calculateFee(numVal) : prev.fee_amount,
        }));
    };

    const handleToggleFeeAuto = () => {
        const nextFeeAuto = !feeAuto;

        setPersonalSetting((prev) => ({ ...prev, feeAdminAuto: nextFeeAuto }));

        setFormData((prev) => {
            const numAmount = Number(prev.amount) || 0;

            return {
                ...prev,
                fee_amount: isFeeActive ? prev.amount : nextFeeAuto ? calculateFee(numAmount) : prev.fee_amount,
            };
        });
    };

    const buttonList = [
        {
            icon: ArrowUp,
            value: "transfer",
            label: "Transfer Uang",
            onClick: () =>
                setFormData((prev) => ({
                    ...prev,
                    trx_type: "Transfer Uang",
                    debt_id: warehouseCashId,
                    cred_id: selectedBankAccount,
                    custName: "",
                })),
        },
        {
            icon: ArrowDown,
            value: "withdrawal",
            label: "Tarik Tunai",
            onClick: () =>
                setFormData((prev) => ({
                    ...prev,
                    trx_type: "Tarik Tunai",
                    debt_id: selectedBankAccount,
                    cred_id: warehouseCashId,
                    custName: "Walk In Customer",
                })),
        },
    ];

    return (
        <div className="space-y-4">
            <TabSwitcher buttonList={buttonList} activeTab={newType} setActiveTab={setNewType}>
                <form onSubmit={handleAddTxSubmit} className="space-y-4">
                    {/* Alert Error Animation */}

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

                    {/* Input Tanggal */}

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

                    {/* Dropdown Akun Bank */}

                    <div className="space-y-1">
                        <label id="tx-category-label" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Rekening Agen
                        </label>

                        <Dropdown
                            id="tx-category"
                            label="Transaction Category Selector"
                            options={accountOptions}
                            selectedValue={newType === "transfer" ? formData.cred_id : formData.debt_id}
                            onChange={(val) => {
                                setSelectedBankAccount(val);

                                setFormData({
                                    ...formData,

                                    [newType === "transfer" ? "cred_id" : "debt_id"]: val,
                                });
                            }}
                        />
                    </div>

                    {/* Nominal & Fee Admin Inputs */}

                    <div className="grid gap-3 sm:grid-cols-5">
                        <div className="space-y-1 sm:col-span-3">
                            <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Jumlah {newType === "transfer" ? "Transfer" : "Penarikan"} (Rp IDR)
                            </label>

                            <div className="relative flex items-center">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-mono text-xs select-none">Rp</span>

                                <input
                                    id="tx-amount"
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={handleAmountChange}
                                    placeholder="50000"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3.5 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                                />
                                {newType === "withdrawal" && (
                                    <button
                                        type="button"
                                        onClick={handleToggleFee}
                                        className={`absolute right-1.5 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                            isFeeActive
                                                ? "bg-indigo-600 text-white shadow-xs"
                                                : "bg-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                        }`}
                                    >
                                        <Sparkles className="w-3 h-3 text-amber-300" />
                                        Fee/Bunga
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold"
                                    >
                                        Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <label htmlFor="tx-fee" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Fee Admin (Jasa)
                            </label>

                            <div className="relative flex items-center">
                                <span className="absolute left-3.5 font-mono text-xs text-slate-400 select-none">Rp</span>

                                <input
                                    id="tx-fee"
                                    type="number"
                                    required
                                    value={formData.fee_amount}
                                    onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
                                    min={0}
                                    placeholder="0"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-16 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                                />

                                <button
                                    type="button"
                                    onClick={handleToggleFeeAuto}
                                    className={`absolute right-1.5 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                        feeAuto
                                            ? "bg-indigo-600 text-white shadow-xs"
                                            : "bg-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                    }`}
                                >
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                    Auto
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Nama Customer */}

                    <div className="grid sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label htmlFor="cust-name" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Customer Name
                            </label>

                            <input
                                id="cust-name"
                                type="text"
                                required
                                value={formData.custName}
                                onChange={(e) => setFormData({ ...formData, custName: e.target.value })}
                                placeholder="e.g. Ibu Budi"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                            />
                        </div>

                        {/* Description / Memo */}

                        <div className="space-y-1">
                            <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Catatan / Memo
                            </label>

                            <input
                                id="tx-desc"
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. BRIVA, PLN, BPJS, etc."
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => isModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                        >
                            Cancel
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.97 }}
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />

                                    <span>Adding...</span>
                                </>
                            ) : (
                                <span>Add Entry</span>
                            )}
                        </motion.button>
                    </div>
                </form>
            </TabSwitcher>
        </div>
    );
};

export default CreateTransaction;

import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { calculateFee, DateTimeNow } from "@/app/utils/format";
import { AlertCircle, Check, CheckCircle } from "lucide-react";
import { useState } from "react";

const CreateTransaction = ({
    warehouseCashId,
    selectedBankAccount,
    setSelectedBankAccount,
    accountOptions,
    mutate,
    mutateBalance,
    isModalOpen,
    notification,
    setPersonalSetting,
    feeAuto,
}) => {
    const { today } = DateTimeNow();
    const [newType, setNewType] = useState("transfer");

    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [errors, setErrors] = useState([]);
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
    const handleAddTxSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-transfer", formData);
            const successMessage = response.data.message;
            notification(successMessage);
            setFormData({
                date_issued: today,
                debt_id: warehouseCashId,
                cred_id: formData.cred_id,
                amount: "",
                trx_type: "Transfer Uang",
                fee_amount: "",
                description: "",
                custName: "",
            });
            mutate();
            mutateBalance();
            // isModalOpen(false);
            // setErrors([]);
            setFormError("");
            setLoading(false);
            setNewType(newType);
        } catch (error) {
            // setErrors(error.response.data.errors);
            setFormError(error.response?.data?.message);
            notification("Error: " + error.response?.data?.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Type selection toggle tabs */}
            <div className="mb-2">
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">Transaction Type</span>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <button
                        type="button"
                        onClick={() => {
                            setNewType("transfer");
                            setFormData((prevData) => ({
                                ...prevData,
                                trx_type: "Transfer Uang",
                                debt_id: warehouseCashId,
                                cred_id: selectedBankAccount,
                                custName: "",
                            }));
                        }}
                        className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            newType === "transfer"
                                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-300"
                        }`}
                    >
                        Transfer Uang
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setNewType("tarik tunai");
                            setFormData((prevData) => ({
                                ...prevData,
                                trx_type: "Tarik Tunai",
                                debt_id: selectedBankAccount,
                                cred_id: warehouseCashId,
                                custName: "General Customer",
                            }));
                        }}
                        className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            newType === "tarik tunai"
                                ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-300"
                        }`}
                    >
                        Tarik Tunai
                    </button>
                </div>
            </div>
            <form onSubmit={handleAddTxSubmit} className="space-y-4">
                {formError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                {/* Date input */}
                <div className="space-y-1">
                    <label htmlFor="tx-date" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Date Registered
                    </label>
                    <input
                        id="tx-date"
                        type="datetime-local"
                        required
                        value={formData.date_issued}
                        onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                {/* Category drop down */}
                <div className="space-y-1">
                    <label id="tx-category-label" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Account
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

                {/* Amount and Date input rows */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Amount (Rp IDR)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                            <input
                                id="tx-amount"
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => {
                                    const val = e.target.value; // 1. Ambil nilai ketikan paling baru
                                    const numericAmount = Number(val) || 0; // 2. Ubah jadi angka bersih

                                    setFormData({
                                        ...formData,
                                        amount: val,
                                        // 3. Masukkan 'numericAmount' yang baru, BUKAN 'formData.amount' yang lama
                                        fee_amount: feeAuto ? calculateFee(numericAmount) : formData.fee_amount,
                                    });
                                }}
                                placeholder="50000"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                        {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="tx-fee" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Fee (Rp IDR)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                            <input
                                id="tx-fee"
                                type="number"
                                required
                                value={formData.fee_amount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fee_amount: e.target.value,
                                    })
                                }
                                placeholder="50000"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                        {formData.fee_amount && !isNaN(parseFloat(formData.fee_amount)) && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                Preview: Rp {parseFloat(formData.fee_amount).toLocaleString("id-ID")}
                            </p>
                        )}
                    </div>
                </div>

                {/* Description input */}
                <div className="space-y-1">
                    <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Customer Name
                    </label>
                    <input
                        id="tx-desc"
                        type="text"
                        required
                        value={formData.custName}
                        onChange={(e) => setFormData({ ...formData, custName: e.target.value })}
                        placeholder="e.g. Leonardo Da Vinci"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                {/* Description input */}
                <div className="space-y-1">
                    <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Description / Memo
                    </label>
                    <input
                        id="tx-desc"
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. BRIVA, PLN, BPJS, etc."
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                <div>
                    <button
                        type="button"
                        className={`border ${feeAuto ? "border-indigo-400 dark:border-indigo-700 text-slate-500 dark:text-slate-300" : "border-slate-400 dark:border-slate-600 text-slate-500 dark:text-slate-400"} rounded-full p-1 flex items-center`}
                        onClick={() => setPersonalSetting((prev) => ({ ...prev, feeAdminAuto: !feeAuto }))}
                    >
                        <span>
                            <Check className={`h-4 w-4 ${feeAuto ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                        </span>
                        <span className="ml-2 text-xs mr-1">Fee Admin Auto</span>
                    </button>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => isModalOpen(false)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add Entry"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateTransaction;

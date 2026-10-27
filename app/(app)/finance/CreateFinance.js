"use client";
import Dropdown from "@/app/components/Dropdown";
import TabSwitcher from "@/app/components/TabSwitcher";
import axios from "@/app/utils/axios";
import { DateTimeNow } from "@/app/utils/format";
import { AlertCircle, CreditCard, Wallet2 } from "lucide-react";
import { useState } from "react";

const CreateFinance = ({ contacts, accounts, notification, mutate, onClose }) => {
    const { today } = DateTimeNow();
    const [type, setType] = useState("Payable");
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formData, setFormData] = useState({
        date_issued: today,
        contact_id: "",
        amount: "",
        description: "",
        debt_id: "",
        cred_id: "",
        type: "Payable",
    });

    const accountOptions = [
        { value: "", label: "Pilih Rekening" },
        ...accounts
            .filter((account) => account.warehouse_id === 1)
            .map((account) => ({
                value: account.id,
                label: account.name,
            })),
    ];

    const payableOptions = [
        { value: "", label: `Pilih Akun ${type === "Payable" ? "Hutang" : "Piutang"}` },
        ...accounts
            .filter((account) => (type === "Payable" ? account.account_id === 19 : account.account_id === 4))
            .map((account) => ({
                value: account.id,
                label: account.name,
            })),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError("");

        try {
            const response = await axios.post("/api/finance", formData);
            notification(response.data.message);
            mutate();
            setFormData({
                date_issued: today,
                contact_id: "",
                amount: "",
                description: "",
                debt_id: "",
                cred_id: "",
                type: type, // Pertahankan tipe tab aktif
            });
            if (onClose) onClose(); // Tutup modal jika sukses (opsional)
        } catch (error) {
            // Ambil pesan error dengan aman (ubah array/objek jadi string jika perlu)
            const errData = error.response?.data?.errors;
            const errorMsg = Array.isArray(errData)
                ? errData[0]
                : typeof errData === "string"
                  ? errData
                  : error.response?.data?.message || "Something went wrong.";

            setFormError(errorMsg);
            notification(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const tabList = [
        {
            icon: CreditCard,
            value: "Payable",
            label: "Hutang Usaha",
            onClick: () => {
                setType("Payable");
                setFormData((prev) => ({
                    ...prev,
                    type: "Payable",
                    debt_id: "",
                    cred_id: "",
                }));
            },
        },
        {
            icon: Wallet2,
            value: "Receivable",
            label: "Piutang Usaha",
            onClick: () => {
                setType("Receivable");
                setFormData((prev) => ({
                    ...prev,
                    type: "Receivable",
                    debt_id: "",
                    cred_id: "",
                }));
            },
        },
    ];

    return (
        <>
            <div className="mb-2">
                <TabSwitcher buttonList={tabList} activeTab={type} setActiveTab={setType} />
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kontak</label>
                    <Dropdown
                        id="tx-contact_id"
                        label="Contact Selector"
                        options={contacts}
                        selectedValue={formData.contact_id}
                        onChange={(val) => {
                            setFormData({ ...formData, contact_id: val });
                        }}
                    />
                </div>

                {/* Category drop down */}
                <div className="grid sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Akun {type === "Payable" ? "Hutang" : "Piutang"}</label>
                        <Dropdown
                            id="tx-payable"
                            label="payable Selector"
                            options={payableOptions}
                            selectedValue={type === "Payable" ? formData.cred_id : formData.debt_id}
                            onChange={(val) => {
                                setFormData({ ...formData, [type === "Payable" ? "cred_id" : "debt_id"]: val });
                            }}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Rekening</label>
                        <Dropdown
                            id="tx-rekening"
                            label="Account Selector"
                            options={accountOptions}
                            selectedValue={type === "Payable" ? formData.debt_id : formData.cred_id}
                            onChange={(val) => {
                                setFormData({ ...formData, [type === "Payable" ? "debt_id" : "cred_id"]: val });
                            }}
                        />
                    </div>
                </div>

                {/* Amount input */}
                <div className="space-y-1">
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
                                setFormData({
                                    ...formData,
                                    amount: e.target.value,
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
                        placeholder="e.g. Pinjaman Modal"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => onClose?.()}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add Entry"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateFinance;

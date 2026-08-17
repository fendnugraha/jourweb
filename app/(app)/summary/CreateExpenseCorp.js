import Dropdown from "@/app/components/Dropdown";
import TabSwitcher from "@/app/components/TabSwitcher";
import axios from "@/app/utils/axios";
import { DateTimeNow } from "@/app/utils/format";
import { AlertCircle, ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

export default function CreateExpenseCorp({ setIsModalOpen, notification, fetchCorpCashFlows, fetchCorpExpense }) {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        type: "expense",
        amount: "",
        description: "",
        category: "",
        is_corporate: 1,
    });

    const [type, setType] = useState("expense");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTypeChange = (newType) => {
        setType(newType);
        setFormData((prev) => ({
            ...prev,
            type: newType,
            category: "",
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError("");

        try {
            const response = await axios.post("api/cash-flows", formData);
            notification(response.data.message || "Berhasil mencatat transaksi corporate");
            // setIsModalOpen(false);
            setFormData({
                date_issued: today,
                type: "expense",
                amount: "",
                description: "",
                category: "",
                is_corporate: 1,
            });
            if (typeof fetchCorpCashFlows === "function") {
                fetchCorpCashFlows();
            } else if (typeof fetchCorpExpense === "function") {
                fetchCorpExpense();
            }
        } catch (error) {
            notification("Gagal menambahkan pengeluaran. Silakan coba lagi.");
            setFormError("Gagal menambahkan pengeluaran. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        {
            id: "sewa-gedung",
            value: "Sewa Gedung Kantor",
            label: "Sewa Gedung Kantor",
            type: "expense",
        },
        {
            id: "cicilan-bank",
            value: "Cicilan Bank",
            label: "Cicilan Bank",
            type: "expense",
        },
        {
            id: "paket-cod",
            value: "Paket COD",
            label: "Paket COD",
            type: "expense",
        },
        {
            id: "rumah-tangga",
            value: "Rumah Tangga",
            label: "Rumah Tangga",
            type: "expense",
        },
        {
            id: "biaya-administrasi-bank",
            value: "Biaya Administrasi Bank",
            label: "Biaya Administrasi Bank",
            type: "expense",
        },
        {
            id: "cicilan-kendaraan",
            value: "Cicilan Kendaraan",
            label: "Cicilan Kendaraan",
            type: "expense",
        },
        {
            id: "asuransi-kantor",
            value: "Asuransi Kantor",
            label: "Asuransi Kantor",
            type: "expense",
        },
        {
            id: "gaji-manajemen",
            value: "Gaji Manajemen",
            label: "Gaji Manajemen",
            type: "expense",
        },
        {
            id: "software-it",
            value: "Software & IT",
            label: "Software & IT",
            type: "expense",
        },
        {
            id: "marketing-promosi",
            value: "Marketing & Promosi",
            label: "Marketing & Promosi",
            type: "expense",
        },
        {
            id: "lainnya",
            value: "Lainnya",
            label: "Lainnya",
            type: "expense",
        },
        {
            id: "pengembalian-modal",
            value: "Pengembalian Modal",
            label: "Pengembalian Modal",
            type: "income",
        },
    ];

    const categoryOptions = [{ id: "", value: "", label: "Pilih Kategori" }, ...categories.filter((category) => category.type === type)];

    const typeTabs = [
        {
            icon: ArrowUp,
            value: "expense",
            label: "Biaya Operasional",
        },
        {
            icon: ArrowDown,
            value: "income",
            label: "Pemasukan",
        },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-start gap-2 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                </div>
            )}

            <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipe Transaksi</span>

                <TabSwitcher buttonList={typeTabs} activeTab={type} setActiveTab={handleTypeChange} />
            </div>

            {/* Date Input */}
            <div className="space-y-1">
                <label htmlFor="tx-date" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Tanggal Registrasi
                </label>
                <input
                    id="tx-date"
                    type="datetime-local"
                    required
                    value={formData.date_issued}
                    onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Jumlah Biaya */}
            <div className="space-y-1">
                <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Jumlah {type === "expense" ? "Pengeluaran" : "Pemasukan"} (Rp)
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
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-9 pr-3 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-mono mt-1 font-semibold">
                    Preview: Rp {formData.amount ? parseFloat(formData.amount).toLocaleString("id-ID") : "0"}
                </p>
            </div>

            <div className="space-y-1">
                <label id="tx-category-label" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Kategori {type === "expense" ? "Pengeluaran" : "Pemasukan"}
                </label>

                <Dropdown
                    id="tx-category"
                    label="Transaction Category Selector"
                    options={categoryOptions}
                    selectedValue={formData.category}
                    onChange={(val) => {
                        setFormData({
                            ...formData,
                            category: val,
                        });
                    }}
                />
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Keterangan / Memo
                </label>
                <input
                    id="tx-desc"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Listrik, Wifi, Biaya Admin"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Submit Action */}
            <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed mt-2"
                disabled={loading || formData.amount === ""}
            >
                {loading ? "Menyimpan..." : "+ Catat Transaksi"}
            </button>
        </form>
    );
}

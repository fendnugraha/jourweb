import { formatNumber } from "@/app/utils/format";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

const PayableTable = ({ financeGroup = [], selectedContactId, setSelectedContactId, searchTerm, setIsPaymentActive, setIsModalOpen, setModalTitle }) => {
    const searchedGroup = useMemo(() => {
        if (!Array.isArray(financeGroup)) return [];
        if (!searchTerm.trim()) return financeGroup;

        const term = searchTerm.toLowerCase();
        return financeGroup.filter((f) => f.contact_name?.toLowerCase().includes(term));
    }, [financeGroup, searchTerm]);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Daftar Kontak</h3>
            </div>
            <div className="max-h-125 overflow-y-auto">
                <table className="w-full border-collapse text-left">
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                        {searchedGroup.length > 0 ? (
                            searchedGroup.map((finance) => {
                                const isSelected = selectedContactId === finance.contact_id;

                                return (
                                    <tr
                                        key={finance.contact_id}
                                        onClick={() => setSelectedContactId(finance.contact_id)}
                                        className={`group cursor-pointer transition-colors ${
                                            isSelected ? "bg-indigo-50/80 dark:bg-indigo-950/40" : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                        }`}
                                    >
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${isSelected ? "bg-indigo-600 dark:bg-indigo-400" : "bg-transparent"}`} />
                                                <span
                                                    className={`font-medium ${isSelected ? "font-semibold text-indigo-900 dark:text-indigo-200" : "text-slate-700 dark:text-slate-300"}`}
                                                >
                                                    {finance.contact_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                                            {formatNumber(finance.sisa)}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text.xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:text-indigo-300 dark:hover:bg-indigo-900 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Mencegah pemicu row click ganda
                                                    setSelectedContactId(finance.contact_id);
                                                    setIsPaymentActive(true);
                                                    setIsModalOpen(true);
                                                    setModalTitle("Catat Pembayaran");
                                                }}
                                            >
                                                <span>Bayar</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-xs text-slate-400">
                                    Kontak tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayableTable;

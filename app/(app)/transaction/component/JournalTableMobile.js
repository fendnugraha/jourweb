import DropdownMenu from "@/app/components/DropdownMenu";
import { formatDateTime, formatNumber } from "@/app/utils/format";
import { AlertCircle, ArrowRightLeft, Calendar, Coins, CreditCard, Ellipsis, FileText, FileWarning, MoreHorizontal, Tag } from "lucide-react";

export default function JournalTableMobile({
    isJournalLoading,
    filteredTransactions,
    paginatedTransactions,
    hqAccountIds,
    accountFilter,
    warehouseCashId,
    userRole,
    warehouseId,
    setSelectedJournal,
    setModalTitle,
    setTypeTransaction,
    setIsModalOpen,
    setTxToDelete,
    getCategoryBadgeClass,
}) {
    return (
        <div className="space-y-3">
            {/* ========================================================================= */}
            {/* 1. MOBILE VIEW (Tampil di Layar HP/Tablet Kecil: < md)                     */}
            {/* ========================================================================= */}
            <div className="block md:hidden space-y-3">
                {/* 1.1 STATE LOADING MOBILE (SKELETON CARDS) */}
                {isJournalLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse space-y-3"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                                <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0" />
                            </div>
                            <div className="flex gap-2">
                                <div className="h-5 bg-slate-100 dark:bg-slate-800/60 rounded-md w-24" />
                                <div className="h-5 bg-slate-100 dark:bg-slate-800/60 rounded-md w-20" />
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-20" />
                                <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-lg w-28" />
                            </div>
                        </div>
                    ))
                ) : filteredTransactions.length === 0 ? (
                    /* 1.2 STATE EMPTY MOBILE */
                    <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400">
                        <AlertCircle className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5] mb-2" />
                        <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">No matching transactions found</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    /* 1.3 STATE DATA MOBILE (LIST KARTU) */
                    paginatedTransactions.map((tx) => {
                        const accountToCheck = accountFilter !== "all" ? Number(accountFilter) : Number(warehouseCashId);
                        const isInflow = Number(tx.debt_id) === accountToCheck;

                        return (
                            <div
                                key={tx.id}
                                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 relative"
                            >
                                {/* Header Kartu: Judul Transaksi & Menu Action */}
                                <div className="flex justify-between items-start gap-2">
                                    <div className="space-y-1 pr-2">
                                        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-100 leading-snug wrap-break-word">
                                            {tx.description}
                                        </h4>
                                        <div className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                            <span>{formatDateTime(tx.date_issued)}</span>
                                        </div>
                                    </div>

                                    {/* Action Menu (Atas Kanan Kartu) */}
                                    <div className="shrink-0 -mr-1 -mt-1">
                                        <DropdownMenu
                                            title={
                                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                                    <Ellipsis className="h-4 w-4" />
                                                </div>
                                            }
                                            position="auto"
                                            items={[
                                                ["Deposit"].includes(tx.trx_type) && {
                                                    type: "button",
                                                    label: "Edit Deposit",
                                                    onClick: () => {
                                                        setSelectedJournal(tx);
                                                        setModalTitle("Edit Deposit");
                                                        setTypeTransaction("edit-deposit");
                                                        setIsModalOpen(true);
                                                    },
                                                },
                                                ["Transfer Uang", "Tarik Tunai"].includes(tx.trx_type) && {
                                                    type: "button",
                                                    label: "Edit Transaksi",
                                                    onClick: () => {
                                                        setSelectedJournal(tx);
                                                        setModalTitle("Edit Transaksi");
                                                        setTypeTransaction("edit-transaksi");
                                                        setIsModalOpen(true);
                                                    },
                                                },
                                                ["Mutasi Kas"].includes(tx.trx_type) &&
                                                    !hqAccountIds.includes(tx.cred_id) && {
                                                        type: "button",
                                                        label: "Edit Mutasi",
                                                        onClick: () => {
                                                            setSelectedJournal(tx);
                                                            setModalTitle("Edit Mutasi");
                                                            setTypeTransaction("edit-mutasi-kas");
                                                            setIsModalOpen(true);
                                                        },
                                                    },
                                                {
                                                    type: "button",
                                                    attributes: {
                                                        disabled:
                                                            ["Voucher & SP", "Accessories", null].includes(tx.trx_type) ||
                                                            (!["Administrator", "Super Admin"].includes(userRole) && hqAccountIds.includes(tx.cred_id)),
                                                    },
                                                    label: "Hapus Transaksi",
                                                    onClick: () => {
                                                        setTxToDelete(tx.id);
                                                    },
                                                },
                                            ].filter(Boolean)}
                                        />
                                    </div>
                                </div>

                                {/* Badges Info: Category & Settlement Channel */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    {/* Category */}
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-medium border ${getCategoryBadgeClass(tx.trx_type)}`}
                                    >
                                        <Tag className="h-2.5 w-2.5 shrink-0 opacity-70" />
                                        <span>{tx.trx_type || "Uncategorized"}</span>
                                    </span>

                                    {/* Settlement Channel */}
                                    {tx.trx_type === "Mutasi Kas" ? (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                            <ArrowRightLeft className="h-2.5 w-2.5 shrink-0" />
                                            <span className="truncate max-w-45">
                                                {tx.cred?.group}
                                                {tx.cred?.warehouse?.id !== warehouseId && (
                                                    <span className="text-slate-400 font-normal"> ({tx.cred?.warehouse?.name.replace(/^konter\s*/i, "")})</span>
                                                )}
                                                {" → "}
                                                {tx.debt?.group}
                                                {tx.debt?.warehouse?.id !== warehouseId && (
                                                    <span className="text-slate-400 font-normal"> ({tx.debt?.warehouse?.name.replace(/^konter\s*/i, "")})</span>
                                                )}
                                            </span>
                                            {tx.debt?.group !== tx.cred?.group && <FileWarning className="h-3 w-3 text-amber-500 shrink-0" />}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                            <CreditCard className="h-2.5 w-2.5 shrink-0" />
                                            <span>{tx.cred_id === warehouseCashId ? tx.debt?.group || "Cash" : tx.cred?.group || "Cash"}</span>
                                        </span>
                                    )}
                                </div>

                                {/* Footer Kartu: Amount & Fee */}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center font-mono">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-sans font-semibold">Nominal</span>

                                    <div className="text-right">
                                        <span
                                            className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block border ${
                                                isInflow
                                                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100/30"
                                                    : "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border-rose-100/30"
                                            }`}
                                        >
                                            {isInflow ? "+" : "-"} {formatNumber(tx.amount)}
                                        </span>

                                        {!tx.fee_amount || tx.fee_amount === 0 ? null : (
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Fee: {formatNumber(tx.fee_amount)}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

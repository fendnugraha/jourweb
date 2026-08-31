/* eslint-disable react-hooks/set-state-in-effect */
import DropdownMenu from "@/app/components/DropdownMenu";
import Modal from "@/app/components/Modal";
import { calculateFee, formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import {
    FileText,
    Tag,
    CreditCard,
    Coins,
    MoreHorizontal,
    Calendar,
    ArrowRightLeft,
    FileWarning,
    AlertCircle,
    Ellipsis,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Layers,
    User,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import EditMutationJournal from "./EditMutationJournal";
import EditTxJournal from "./EditTxJournal";
import EditDeposit from "../deposit/EditDeposit";
import JournalTableMobile from "./JournalTableMobile";

const JournalTable = ({
    filteredTransactions = [],
    setTxToDelete,
    warehouseCashId,
    warehouseId,
    userRole,
    accounts,
    hqAccountIds = [],
    isJournalLoading = false,
    isJournalValidating = false,
    whAccounts = [],
    mutate,
    mutateBalance,
    notification,
    accountFilter,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [typeTransaction, setTypeTransaction] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Reset to page 1 when filtered transactions change length
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredTransactions.length]);

    const whAccountIds = useMemo(() => {
        if (!Array.isArray(whAccounts)) return [];

        return whAccounts
            .map((acc) => Number(acc?.id)) // Ambil ID akunnya
            .filter((id) => !isNaN(id) && id > 0); // Hilangkan NaN, null (0), atau undefined
    }, [whAccounts]);

    // Calculate totals
    const totals = useMemo(() => {
        const accountToCheck = accountFilter !== "all" ? Number(accountFilter) : Number(warehouseCashId);
        let inflow = 0;
        let outflow = 0;

        filteredTransactions.forEach((tx) => {
            const amount = Number(tx.amount || 0);
            if (Number(tx.debt_id) === accountToCheck) {
                inflow += amount;
            } else {
                outflow += amount;
            }
        });

        return {
            totalCount: filteredTransactions.length,
            totalInflow: inflow,
            totalOutflow: outflow,
            netFlow: inflow - outflow,
        };
    }, [accountFilter, warehouseCashId, filteredTransactions]);

    // Paginated Slices
    const totalPages = useMemo(() => {
        if (pageSize === "all") return 1;
        return Math.max(1, Math.ceil(filteredTransactions.length / Number(pageSize)));
    }, [filteredTransactions.length, pageSize]);

    const paginatedTransactions = useMemo(() => {
        if (pageSize === "all") return filteredTransactions;
        const start = (currentPage - 1) * Number(pageSize);
        return filteredTransactions.slice(start, start + Number(pageSize));
    }, [filteredTransactions, currentPage, pageSize]);

    const startItemIndex = useMemo(() => {
        if (filteredTransactions.length === 0) return 0;
        if (pageSize === "all") return 1;
        return (currentPage - 1) * Number(pageSize) + 1;
    }, [filteredTransactions.length, currentPage, pageSize]);

    const endItemIndex = useMemo(() => {
        if (pageSize === "all") return filteredTransactions.length;
        return Math.min(currentPage * Number(pageSize), filteredTransactions.length);
    }, [filteredTransactions.length, currentPage, pageSize]);

    // Category badge helper
    const getCategoryBadgeClass = (trxType) => {
        switch (trxType) {
            case "Mutasi Kas":
                return "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/50";
            case "Transfer Uang":
                return "bg-sky-50/80 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/50";
            case "Tarik Tunai":
                return "bg-amber-50/80 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/50";
            case "Deposit":
                return "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/50";
            default:
                return "bg-slate-100/80 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/50";
        }
    };
    return (
        <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4 p-4">
            {/* BACKGROUND REVALIDATING INDICATOR */}
            {isJournalValidating && !isJournalLoading && (
                <div className="absolute top-3 right-5 z-10 flex items-center gap-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/80 px-2.5 py-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 backdrop-blur-xs">
                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                    <span>Syncing...</span>
                </div>
            )}

            {/* SUMMARY DASHBOARD HEADER */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-200/60 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
                        <Layers className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Entri</p>
                        <p className="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-slate-100">{totals.totalCount} TRX</p>
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/40 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Kas Masuk (+)</p>
                        <p className="text-xs sm:text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">{formatRupiah(totals.totalInflow)}</p>
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/40 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
                        <TrendingDown className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Kas Keluar (-)</p>
                        <p className="text-xs sm:text-sm font-bold font-mono text-rose-700 dark:text-rose-300">{formatRupiah(totals.totalOutflow)}</p>
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/40 flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400">
                        <Coins className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Net Arus Kas</p>
                        <p
                            className={`text-xs sm:text-sm font-bold font-mono ${totals.netFlow >= 0 ? "text-indigo-700 dark:text-indigo-300" : "text-rose-600 dark:text-rose-400"}`}
                        >
                            {formatRupiah(totals.netFlow)}
                        </p>
                    </div>
                </div>
            </div>

            <JournalTableMobile
                isJournalLoading={isJournalLoading}
                filteredTransactions={filteredTransactions}
                paginatedTransactions={paginatedTransactions}
                hqAccountIds={hqAccountIds}
                whAccountIds={whAccountIds}
                accountFilter={accountFilter}
                warehouseCashId={warehouseCashId}
                userRole={userRole}
                warehouseId={warehouseId}
                setSelectedJournal={setSelectedJournal}
                setModalTitle={setModalTitle}
                setTypeTransaction={setTypeTransaction}
                setIsModalOpen={setIsModalOpen}
                setTxToDelete={setTxToDelete}
                getCategoryBadgeClass={getCategoryBadgeClass}
            />

            {/* ========================================================================= */}
            {/* 2. DESKTOP VIEW (Hanya Tampil di Layar Sedang/Besar: >= md)               */}
            {/* ========================================================================= */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Transaction Details</span>
                                </div>
                            </th>
                            <th scope="col" className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    <span>Category</span>
                                </div>
                            </th>
                            <th scope="col" className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Settle Channel</span>
                                </div>
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    <Coins className="w-3.5 h-3.5" />
                                    <span>Cash Amount</span>
                                </div>
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                    <span>Actions</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                        {/* 1. STATE LOADING DESKTOP */}
                        {isJournalLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="animate-pulse">
                                    <td className="px-5 py-4 space-y-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                                        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/3" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-32" />
                                    </td>
                                    <td className="px-5 py-4 text-right space-y-1">
                                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-24 ml-auto" />
                                        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-12 ml-auto" />
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : filteredTransactions.length === 0 ? (
                            /* 2. STATE EMPTY DESKTOP */
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                        <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">No matching transactions found</p>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500">Try adjusting your filters or search query</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            /* 3. STATE DATA DESKTOP */
                            paginatedTransactions.map((tx) => {
                                const selectedAccId = Number(accountFilter);
                                const isFiltered = accountFilter !== "all" && !isNaN(selectedAccId);

                                // Menentukan apakah transaksi adalah Inflow (Uang Masuk)
                                const isInflow = isFiltered ? Number(tx.debt_id) === selectedAccId : whAccountIds.includes(Number(tx.debt_id));

                                // Menentukan apakah transaksi adalah Outflow (Uang Keluar)
                                const isOutflow = isFiltered ? Number(tx.cred_id) === selectedAccId : whAccountIds.includes(Number(tx.cred_id));

                                return (
                                    <tr key={tx.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150">
                                        <td className="px-5 py-4 max-w-xs md:max-w-md">
                                            <div className="space-y-1">
                                                <span className="font-semibold text-slate-800 dark:text-slate-100 block wrap-break-word">{tx.description}</span>
                                                <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 border border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                                    <span>{formatDateTime(tx.date_issued)}</span>
                                                    <User className="h-3 w-3 text-slate-400 shrink-0" /> <span className="truncate">{tx.user?.name}</span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium border ${getCategoryBadgeClass(tx.trx_type)}`}
                                            >
                                                <Tag className="h-3 w-3 shrink-0 opacity-70" />
                                                <span>{tx.trx_type || "Uncategorized"}</span>
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap">
                                            {tx.trx_type === "Mutasi Kas" ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                                    <ArrowRightLeft className="h-3 w-3 shrink-0" />
                                                    <span>
                                                        {tx.cred?.group}
                                                        {tx.cred?.warehouse?.id !== warehouseId && (
                                                            <span className="text-slate-500 dark:text-slate-400 font-normal">
                                                                {" "}
                                                                ({tx.cred?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                            </span>
                                                        )}
                                                        {" → "}
                                                        {tx.debt?.group}
                                                        {tx.debt?.warehouse?.id !== warehouseId && (
                                                            <span className="text-slate-500 dark:text-slate-400 font-normal">
                                                                {" "}
                                                                ({tx.debt?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                            </span>
                                                        )}
                                                    </span>
                                                    {tx.debt?.group !== tx.cred?.group && (
                                                        <FileWarning className="h-3.5 w-3.5 animate-bounce text-amber-500 ml-0.5 shrink-0" />
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                                    <CreditCard className="h-3 w-3 shrink-0" />
                                                    <span>{tx.cred_id === warehouseCashId ? tx.debt?.group || "Cash" : tx.cred?.group || "Cash"}</span>
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-right whitespace-nowrap font-mono">
                                            <div className="font-semibold text-slate-800 dark:text-slate-100">
                                                <span
                                                    className={`text-sm font-bold px-2 py-1 rounded-lg inline-block border ${
                                                        isInflow
                                                            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100/30"
                                                            : "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border-rose-100/30"
                                                    }`}
                                                >
                                                    {isInflow ? "+" : "-"} {formatNumber(tx.amount)}
                                                </span>
                                            </div>
                                            {!tx.fee_amount || tx.fee_amount === 0 ? null : (
                                                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                    Fee:{" "}
                                                    <span
                                                        className={`font-semibold ${calculateFee(tx.amount) !== tx.fee_amount && ["Tarik Tunai", "Transfer Uang"].includes(tx.trx_type) ? "text-rose-600 dark:text-rose-400 animate-ping" : "text-emerald-600 dark:text-emerald-400"}`}
                                                    >
                                                        {formatNumber(tx.fee_amount)}{" "}
                                                        {calculateFee(tx.amount) !== tx.fee_amount &&
                                                            ["Tarik Tunai", "Transfer Uang"].includes(tx.trx_type) &&
                                                            "!!"}
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap text-center">
                                            <div className="flex justify-center">
                                                <DropdownMenu
                                                    title={
                                                        <div className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                            <Ellipsis className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
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
                                                        ["Mutasi Kas"].includes(tx.trx_type) && {
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
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION FOOTER CONTROLS */}
            {filteredTransactions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <span>
                            Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{startItemIndex}</span> -{" "}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{endItemIndex}</span> dari{" "}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredTransactions.length}</span> transaksi
                        </span>

                        <span className="text-slate-300 dark:text-slate-700">|</span>

                        <div className="flex items-center gap-1">
                            <span className="text-[11px]">Tampilkan:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(e.target.value === "all" ? "all" : Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value="all">Semua</option>
                            </select>
                        </div>
                    </div>

                    {pageSize !== "all" && totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <div className="flex items-center gap-1 font-mono font-semibold px-2">
                                <span className="text-indigo-600 dark:text-indigo-400">{currentPage}</span>
                                <span>/</span>
                                <span>{totalPages}</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                {typeTransaction === "edit-mutasi-kas" && (
                    <EditMutationJournal
                        journal={selectedJournal}
                        mutate={mutate}
                        mutateBalance={mutateBalance}
                        notification={notification}
                        isModalOpen={setIsModalOpen}
                        accounts={accounts}
                        userRole={userRole}
                        warehouseId={warehouseId}
                    />
                )}

                {typeTransaction === "edit-transaksi" && (
                    <EditTxJournal
                        journal={selectedJournal}
                        mutate={mutate}
                        whAccounts={whAccounts}
                        mutateBalance={mutateBalance}
                        notification={notification}
                        isModalOpen={setIsModalOpen}
                    />
                )}

                {typeTransaction === "edit-deposit" && (
                    <EditDeposit journal={selectedJournal} mutate={mutate} notification={notification} isModalOpen={setIsModalOpen} />
                )}
            </Modal>
        </div>
    );
};
export default JournalTable;

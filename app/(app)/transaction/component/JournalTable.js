/* eslint-disable react-hooks/set-state-in-effect */
import DropdownMenu from "@/app/components/DropdownMenu";
import Modal from "@/app/components/Modal";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
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

    // Calculate totals
    const totals = useMemo(() => {
        const accountToCheck = Number(accountFilter) || warehouseCashId;
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
                accountFilter={accountFilter}
                warehouseCashId={warehouseCashId}
                userRole={userRole}
                warehouseId={warehouseId}
                setSelectedJournal={setSelectedJournal}
                setModalTitle={setModalTitle}
                setTypeTransaction={setTypeTransaction}
                setIsModalOpen={setIsModalOpen}
                setTxToDelete={setTxToDelete}
            />

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

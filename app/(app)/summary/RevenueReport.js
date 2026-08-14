/* eslint-disable react-hooks/set-state-in-effect */
import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import SubTabSwitcher from "@/app/components/SubTabSwitcher";
import TabSwitcher from "@/app/components/TabSwitcher";
import useRevenueReport from "@/app/hooks/useRevenueReport";
import { DateTimeNow, formatNumber } from "@/app/utils/format";
import { BarChart, Building2, Calendar, Loader2, Plus, Search, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import RevenueTable from "./RevenueTable";
import DailyReport from "./DailyReport";
import Modal from "@/app/components/Modal";
import CreateExpenseCorp from "./CreateExpenseCorp";
import Notification from "@/app/components/Notification";
import axios from "@/app/utils/axios";

const RevenueReport = ({ warehouseBalance }) => {
    const { today } = DateTimeNow();
    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: today,
        endDate: today,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [corpExpense, setCorpExpense] = useState([]);
    const [corpExpenseGrouped, setCorpExpenseGrouped] = useState([]);

    const { revenue, error, isLoading, isValidating } = useRevenueReport(dateFilter.startDate, dateFilter.endDate);

    const [activeSubTab, setActiveSubTab] = useState("revenue");
    const hasData = revenue?.revenue && revenue.revenue.length > 0;

    const fetchCorpExpense = useCallback(async () => {
        try {
            const response = await axios.get(`/api/cash-flows`, {
                params: {
                    start_date: dateFilter.startDate,
                    end_date: dateFilter.endDate,
                },
            });
            setCorpExpense(response.data?.data?.cash_flows);
            setCorpExpenseGrouped(response.data?.data?.cash_flows_grouped);
        } catch (err) {
            setNotification(err.response?.data?.message || "Failed to fetch corp expense data");
            console.error("Error fetching corp expense data:", err);
        }
    }, [dateFilter.startDate, dateFilter.endDate]);

    useEffect(() => {
        fetchCorpExpense();
    }, [fetchCorpExpense]); // Gunakan property spesifik sebagai dependency

    const subMenuTabs = [
        {
            id: "revenue",
            label: "Rekapitulasi Penjualan",
            icon: Calendar,
        },
        {
            id: "report",
            label: "Laporan Harian",
            icon: TrendingUp,
        },
    ];

    return (
        <>
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side Filters */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    {/* Search SKU/Name */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            aria-label="Search finance records"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <DateFilterDropdown
                            selectedPreset={dateFilter.preset}
                            customStartDate={dateFilter.startDate}
                            customEndDate={dateFilter.endDate}
                            onChange={(val) => setDateFilter(val)}
                            label="Transaction Date"
                        />
                    </div>
                </div>

                {/* Status Refreshing / Validating */}
                <div className="flex items-center gap-2">
                    {isValidating && !isLoading && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Validating...</span>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="truncate">Pengeluaran Owner</span>
                    </button>
                </div>
            </div>

            <SubTabSwitcher subMenuTabs={subMenuTabs} activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />

            <div className="relative overflow-hidden">
                {/* Visual Progress Bar di Atas Card/Tabel saat Revalidating */}
                {isValidating && !isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/20 overflow-hidden z-20">
                        <div className="w-full h-full bg-indigo-600 animate-pulse" />
                    </div>
                )}

                {/* ========================================================= */}
                {/* 1. KONDISI LOADING (HP & DESKTOP) */}
                {/* ========================================================= */}
                {isLoading ? (
                    <div className="p-10 text-center text-slate-400 font-sans">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                            <span className="text-xs sm:text-sm font-medium">Memuat data pendapatan...</span>
                        </div>
                    </div>
                ) : activeSubTab === "revenue" ? (
                    <RevenueTable revenue={revenue} hasData={hasData} />
                ) : (
                    <DailyReport
                        revenue={revenue}
                        hasData={hasData}
                        date={dateFilter.endDate || today}
                        corpExpense={corpExpense}
                        warehouseBalance={warehouseBalance}
                    />
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Pengeluaran Owner/Corporate">
                <CreateExpenseCorp setIsModalOpen={setIsModalOpen} notification={setNotification} fetchCorpExpense={fetchCorpExpense} />
            </Modal>
        </>
    );
};

export default RevenueReport;

import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import Dropdown from "@/app/components/Dropdown";
import { useLogActivities } from "@/app/hooks/useLogActivities";
import useWarehouse from "@/app/hooks/useWarehouse";
import { formatDateTime } from "@/app/utils/format";
import { Building2, Clock, Loader2, PencilRuler, Search, Trash2, User } from "lucide-react";
import { useState } from "react";

const LogTrack = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState("all");
    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: "",
        endDate: "",
    });
    const { warehouses } = useWarehouse();

    const warehouseOptions = [
        { value: "all", label: "All Warehouses" },
        ...warehouses.map((warehouse) => ({
            value: warehouse.id,
            label: warehouse.name,
        })),
    ];

    const { logActivities, isLoading, isValidating, error, mutate } = useLogActivities({
        warehouse: selectedWarehouse,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
    });

    const filteredLogActivities = logActivities.filter((activity) => {
        const matchesSearch =
            activity.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || activity.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesWarehouse = selectedWarehouse === "all" || activity.warehouse_id === selectedWarehouse;
        return matchesSearch && matchesWarehouse;
    });

    const hasData = filteredLogActivities && filteredLogActivities.length > 0;
    return (
        <>
            {/* HEADER BAR (FILTER & SEARCH) */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side: Filter Search */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari aktivitas atau user..."
                            aria-label="Search log activities"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                    {/* Warehouse Dropdown */}
                    <div>
                        <Dropdown
                            id="warehouse-filter"
                            label="Warehouse Filter"
                            options={warehouseOptions}
                            selectedValue={selectedWarehouse}
                            onChange={(val) => setSelectedWarehouse(val)}
                            ariaLabel="Filter by warehouse"
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

                {/* Right Side: Refreshing/Validating Status Indicator */}
                <div className="flex items-center gap-3">
                    {isValidating && !isLoading && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="hidden sm:inline">Refreshing...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN TABLE CONTAINER */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {/* Line Progress Bar Top Effect saat Revalidating */}
                {isValidating && !isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/20 overflow-hidden z-20">
                        <div className="w-full h-full bg-indigo-600 animate-pulse" />
                    </div>
                )}

                {/* ========================================================= */}
                {/* 1. KONDISI LOADING (SKELETON / SPINNER) */}
                {/* ========================================================= */}
                {isLoading ? (
                    <div className="p-10 text-center text-slate-400 font-sans">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                            <span className="text-xs sm:text-sm font-medium">Memuat log aktivitas...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ========================================================= */}
                        {/* 2. TAMPILAN MOBILE: TIMELINE CARD FEED (HANYA DI HP) */}
                        {/* ========================================================= */}
                        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                            {hasData ? (
                                filteredLogActivities.map((activity) => {
                                    const isUpdate = activity.activity === "Updated Journal";

                                    return (
                                        <div key={activity.id} className="p-4 space-y-2.5">
                                            {/* Header Card: Icon Activity + Status Badge + Timestamp */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {isUpdate ? (
                                                        <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                                                            <PencilRuler className="h-3.5 w-3.5" />
                                                        </span>
                                                    ) : (
                                                        <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 shrink-0">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`text-[11px] font-bold uppercase tracking-wider ${
                                                            isUpdate ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
                                                        }`}
                                                    >
                                                        {activity.activity || "Activity"}
                                                    </span>
                                                </div>

                                                {/* Timestamp */}
                                                <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDateTime(activity.created_at)}</span>
                                                </div>
                                            </div>

                                            {/* Description Log */}
                                            <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50/60 dark:bg-slate-850/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                                {activity.description}
                                            </div>

                                            {/* User & Warehouse Footer */}
                                            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                                                <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400 truncate">
                                                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">{activity.user?.name || "System"}</span>
                                                </div>
                                                <div className="flex items-center gap-1 font-sans shrink-0">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{activity.warehouse?.name || "No Warehouse"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-6 text-center text-slate-400 font-sans text-xs">Tidak ada riwayat aktivitas ditemukan.</div>
                            )}
                        </div>

                        {/* ========================================================= */}
                        {/* 3. TAMPILAN DESKTOP: TABLE (HANYA DI TABLET & LAPTOP) */}
                        {/* ========================================================= */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                        <th scope="col" className="px-6 py-4 text-center w-16">
                                            Activity
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left">
                                            User & Warehouse
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                                    {hasData ? (
                                        filteredLogActivities.map((activity) => {
                                            const isUpdate = activity.activity === "Updated Journal";
                                            const isLogin = activity.activity === "Login";

                                            return (
                                                <tr
                                                    key={activity.id}
                                                    className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-center">
                                                        <div className="flex justify-center">
                                                            {isUpdate ? (
                                                                <span
                                                                    className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40"
                                                                    title="Updated Journal"
                                                                >
                                                                    <PencilRuler className="h-4 w-4" />
                                                                </span>
                                                            ) : isLogin ? (
                                                                <span
                                                                    className="p-1.5 rounded-lg bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400 border border-green-200/50 dark:border-green-900/40"
                                                                    title="Login"
                                                                >
                                                                    <User className="h-4 w-4" />
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40"
                                                                    title="Deleted Journal"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                                            {activity.user?.name || "System"}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                                                            ({activity.warehouse?.name || "No Warehouse"})
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-normal wrap-break-word px-6 py-4">
                                                        <span className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-0.5">
                                                            {formatDateTime(activity.created_at)}
                                                        </span>
                                                        <span className="text-slate-600 dark:text-slate-300">{activity.description}</span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                                                Tidak ada riwayat aktivitas ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default LogTrack;

import Dropdown from "@/app/components/Dropdown";
import Notification from "@/app/components/Notification";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import CashBankSummary from "../component/CashBankSummary";
import DateFilterDropdown from "@/app/components/DateFilterDropdown";

const CashBankMutation = ({
    journals = [],
    accountBalance,
    accounts = [],
    dateFilter,
    setDateFilter,
    warehouseId,
    onWarehouseChange,
    setIsModalAddMutationOpen,
    mutate,
    mutateBalance,
    warehouses = [],
    userRole,
}) => {
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [localWarehouseId, setLocalWarehouseId] = useState(warehouseId);

    const activeWarehouseId = onWarehouseChange ? warehouseId : localWarehouseId;

    const handleWarehouseChange = (val) => {
        setLocalWarehouseId(val);
        if (typeof onWarehouseChange === "function") onWarehouseChange(val);
    };

    const accountOptions = [
        { value: "all", label: "Semua akun" },
        ...accounts.filter((a) => Number(a.warehouse_id) === Number(activeWarehouseId)).map((a) => ({ value: a.id, label: a.group })),
    ];

    const warehouseOptions = useMemo(() => warehouses.filter((w) => Number(w.status) === 1).map((w) => ({ value: w.id, label: w.name })), [warehouses]);

    const isAdmin = ["Administrator", "Super Admin"].includes(userRole);

    return (
        <div className="space-y-6">
            <Notification message={notification} onClose={() => setNotification(null)} />

            {/* Toolbar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
                {/* FILTER GROUP (Search, Filter Akun, Tanggal, & Cabang) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full lg:max-w-5xl">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            aria-label="Search mutation history"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 transition-colors"
                        />
                    </div>

                    {/* Account Filter */}
                    <div className="w-full">
                        <Dropdown
                            id="account-filter"
                            label="Filter Akun"
                            options={accountOptions}
                            selectedValue={accountFilter}
                            onChange={(val) => setAccountFilter(val)}
                            ariaLabel="Filter by account"
                        />
                    </div>

                    {/* Date Filter */}
                    <div className="w-full">
                        <DateFilterDropdown
                            selectedPreset={dateFilter.preset}
                            customStartDate={dateFilter.startDate}
                            customEndDate={dateFilter.endDate}
                            onChange={(val) => setDateFilter(val)}
                            label="Transaction Date"
                        />
                    </div>

                    {/* Branch Filter (Admin only) */}
                    {isAdmin && (
                        <div className="w-full">
                            <Dropdown
                                id="admin-warehouse-selector"
                                label="Filter Cabang"
                                options={warehouseOptions}
                                selectedValue={activeWarehouseId}
                                onChange={handleWarehouseChange}
                            />
                        </div>
                    )}
                </div>

                {/* ACTION BUTTON */}
                <div className="flex items-center justify-end w-full lg:w-auto">
                    <button
                        type="button"
                        onClick={() => setIsModalAddMutationOpen?.(true)}
                        className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-amber-500 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="truncate">Add Mutation</span>
                    </button>
                </div>
            </div>

            <CashBankSummary
                accountBalance={accountBalance}
                journals={journals}
                warehouseId={activeWarehouseId}
                notification={setNotification}
                mutate={mutate}
                mutateBalance={mutateBalance}
                searchTerm={searchTerm}
                accountFilter={accountFilter}
                accountOptions={accountOptions}
                userRole={userRole}
            />
        </div>
    );
};

export default CashBankMutation;

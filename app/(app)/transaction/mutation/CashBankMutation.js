import Dropdown from "@/app/components/Dropdown";
import Notification from "@/app/components/Notification";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import CashBankSummary from "../component/CashBankSummary";

const CashBankMutation = ({
    journals = [],
    accountBalance,
    accounts = [],
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
        ...accounts
            .filter((a) => Number(a.warehouse_id) === Number(activeWarehouseId))
            .map((a) => ({ value: a.id, label: a.group })),
    ];

    const warehouseOptions = useMemo(
        () => warehouses.filter((w) => Number(w.status) === 1).map((w) => ({ value: w.id, label: w.name })),
        [warehouses],
    );

    const isAdmin = ["Administrator", "Super Admin"].includes(userRole);

    return (
        <div className="space-y-6">
            <Notification message={notification} onClose={() => setNotification(null)} />

            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                <div className={`flex-1 grid gap-3 ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"} max-w-2xl`}>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            aria-label="Search mutation history"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    {/* Account Filter */}
                    <Dropdown
                        id="account-filter"
                        label="Filter Akun"
                        options={accountOptions}
                        selectedValue={accountFilter}
                        onChange={(val) => setAccountFilter(val)}
                        ariaLabel="Filter by account"
                    />

                    {/* Branch Filter (Admin only) */}
                    {isAdmin && (
                        <Dropdown
                            id="admin-warehouse-selector"
                            label="Filter Cabang"
                            options={warehouseOptions}
                            selectedValue={activeWarehouseId}
                            onChange={handleWarehouseChange}
                        />
                    )}
                </div>

                {/* Add Button */}
                <button
                    type="button"
                    onClick={() => setIsModalAddMutationOpen?.(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Mutation</span>
                </button>
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

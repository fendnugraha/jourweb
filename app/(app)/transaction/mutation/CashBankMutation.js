"use client";

import Dropdown from "@/app/components/Dropdown";
import Notification from "@/app/components/Notification";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import CashBankSummary from "./CashBankSummary";
import DateFilterDropdown from "@/app/components/DateFilterDropdown";

const CashBankMutation = ({
    journals = [],
    accountBalance,
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
    const [localWarehouseId, setLocalWarehouseId] = useState(warehouseId);

    const activeWarehouseId = onWarehouseChange ? warehouseId : localWarehouseId;

    const handleWarehouseChange = (val) => {
        setLocalWarehouseId(val);
        if (typeof onWarehouseChange === "function") onWarehouseChange(val);
    };

    const warehouseOptions = useMemo(() => warehouses.filter((w) => Number(w.status) === 1).map((w) => ({ value: w.id, label: w.name })), [warehouses]);

    const isAdmin = ["Administrator", "Super Admin"].includes(userRole);

    return (
        <div className="space-y-6">
            <Notification message={notification} onClose={() => setNotification(null)} />

            {/* Global Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-xs">
                <div className="grid sm:grid-cols-2 gap-3 w-full sm:w-auto">
                    {/* Date Filter */}
                    <div className="w-full sm:w-60">
                        <DateFilterDropdown
                            selectedPreset={dateFilter?.preset}
                            customStartDate={dateFilter?.startDate}
                            customEndDate={dateFilter?.endDate}
                            onChange={(val) => setDateFilter?.(val)}
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

                {/* Add Mutation Button */}
                <button
                    type="button"
                    onClick={() => setIsModalAddMutationOpen?.(true)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-amber-500 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add Mutation</span>
                </button>
            </div>

            {/* Core View */}
            <CashBankSummary
                accountBalance={accountBalance}
                journals={journals}
                setNotification={setNotification}
                mutate={mutate}
                mutateBalance={mutateBalance}
            />
        </div>
    );
};

export default CashBankMutation;

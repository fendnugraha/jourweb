import Dropdown from "@/app/components/Dropdown";
import { DateTimeNow, formatNumber } from "@/app/utils/format";
import { Search, Plus, ArrowLeftRight, Warehouse, ArrowUpDown, Ticket, ListCheck, Signal, Sparkles, Landmark, AlertCircle } from "lucide-react";
import { useState } from "react";

const CashBankMutation = ({ journals, notification, mutate, accountBalance, accounts, warehouseId, endDate, setIsModalAddMutationOpen }) => {
    const { today } = DateTimeNow();
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");

    const accountOptions = [
        { value: "all", label: "All Accounts" },
        ...accounts.filter((account) => account.warehouse_id === warehouseId).map((account) => ({ value: account.id, label: account.group })),
    ];
    const mutationInSumById = (acc_id) => {
        return journals.reduce(
            (sum, journal) => (Number(journal.debt_id) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0,
        );
    };

    const mutationOutSumById = (acc_id) => {
        return journals.reduce(
            (sum, journal) => (Number(journal.cred_id) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
            0,
        );
    };

    const mutationInSum = accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + mutationInSumById(acc.id), 0);

    const mutationOutSum = accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + mutationOutSumById(acc.id), 0);
    return (
        <>
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
                            placeholder="Search by SKU or Name..."
                            aria-label="Search stock item list"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    {/* Account Dropdown */}
                    <div>
                        <Dropdown
                            id="stock-account-filter"
                            label="Stock Account Filter"
                            options={accountOptions}
                            selectedValue={accountFilter}
                            onChange={(val) => setAccountFilter(val)}
                            ariaLabel="Filter inventory by account"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setIsModalAddMutationOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Mutation</span>
                    </button>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                <th scope="col" className="px-6 py-4">
                                    Akun
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Saldo
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Masuk
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Keluar
                                </th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                <th scope="col" className="px-6 py-4">
                                    Total
                                </th>
                                <th scope="col" className="px-6 py-4 text-right">
                                    {formatNumber(accountBalance?.data?.chartOfAccounts?.reduce((sum, acc) => sum + acc.balance, 0))}
                                </th>
                                <th scope="col" className="px-6 py-4 text-right">
                                    {formatNumber(mutationInSum)}
                                </th>
                                <th scope="col" className="px-6 py-4 text-right">
                                    {formatNumber(mutationOutSum)}
                                </th>
                            </tr>
                        </tfoot>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                            {accountBalance?.data?.chartOfAccounts?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                                            <p className="font-semibold text-xs">No matching transactions found</p>
                                            <p className="text-[10px] text-slate-400">Try adjusting your filters or search query</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                accountBalance?.data?.chartOfAccounts?.map((account, index) => (
                                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                                        <td className="px-6 py-4">{account.name}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(account.balance)}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(mutationInSumById(account.id))}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(mutationOutSumById(account.id))}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                                <td className="font-bold px-6 py-4">
                                    {Number(warehouseId) === 1 ? "Penambahan saldo ke Cabang" : "Penambahan saldo dari HQ"}
                                    <h1 className="font-bold text-blue-500 block sm:hidden">
                                        {(() => {
                                            const remaining = mutationInSum - mutationOutSum;

                                            if (remaining === 0) {
                                                return <span className="text-green-600">Completed</span>;
                                            }

                                            return <span className="text-red-600 dark:text-red-400">{formatNumber(remaining)}</span>;
                                        })()}
                                    </h1>
                                </td>
                                <td className="px-6 py-4 text-end font-bold hidden sm:table-cell"></td>
                                <td className="px-6 py-4 text-end font-bold hidden sm:table-cell"></td>
                                <td className="px-6 py-4 text-end font-bold hidden sm:table-cell">
                                    {(() => {
                                        const remaining = mutationInSum - mutationOutSum;

                                        if (remaining === 0) {
                                            return "Completed";
                                        }

                                        return <span className="text-red-600 dark:text-red-400">{formatNumber(remaining)}</span>;
                                    })()}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};
export default CashBankMutation;

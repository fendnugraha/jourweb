import { formatNumber } from "@/app/utils/format";
import { AlertCircle } from "lucide-react";

const CashBankSummary = ({ journals, accountBalance, warehouseId }) => {
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
    );
};

export default CashBankSummary;

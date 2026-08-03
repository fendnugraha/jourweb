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
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 w-full">
            {/* CONTAINER SCROLL TABLE */}
            <div className="overflow-x-auto no-scrollbar w-full">
                <table className="w-full border-collapse text-left table-fixed sm:table-auto">
                    {/* COLGROUP (Membagi porsi lebar kolom secara presisi di mobile) */}
                    <colgroup>
                        <col className="w-[40%] sm:w-auto" />
                        <col className="w-[20%] sm:w-auto" />
                        <col className="w-[20%] sm:w-auto" />
                        <col className="w-[20%] sm:w-auto" />
                    </colgroup>

                    {/* HEADER TABLE */}
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            {/* Padding kiri-kanan disamakan (px-3 sm:px-6) */}
                            <th scope="col" className="px-3 sm:px-6 py-3.5">
                                Akun
                            </th>
                            <th scope="col" className="px-2 sm:px-6 py-3.5 text-right">
                                Saldo
                            </th>
                            <th scope="col" className="px-2 sm:px-6 py-3.5 text-right">
                                Masuk
                            </th>
                            <th scope="col" className="px-3 sm:px-6 py-3.5 text-right pr-4 sm:pr-6">
                                Keluar
                            </th>
                        </tr>
                    </thead>

                    {/* BODY TABLE */}
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                        {accountBalance?.data?.chartOfAccounts?.map((account, index) => (
                            <tr key={account.id || index} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                {/* Kolom 1: Akun */}
                                <td className="px-3 sm:px-6 py-3.5 font-medium text-slate-800 dark:text-slate-100 wrap-break-word">{account.name}</td>
                                {/* Kolom 2: Saldo */}
                                <td className="px-2 sm:px-6 py-3.5 text-right font-medium whitespace-nowrap">{formatNumber(account.balance)}</td>
                                {/* Kolom 3: Masuk */}
                                <td className="px-2 sm:px-6 py-3.5 text-right text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                                    {formatNumber(mutationInSumById(account.id))}
                                </td>
                                {/* Kolom 4: Keluar (Beri padding kanan ekstra 'pr-4' agar simetris dengan kiri) */}
                                <td className="px-3 sm:px-6 py-3.5 text-right text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap pr-4 sm:pr-6">
                                    {formatNumber(mutationOutSumById(account.id))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CashBankSummary;

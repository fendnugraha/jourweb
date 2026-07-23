import useCashBankBalance from "@/app/hooks/useCashBankBalance";
import { formatNumber } from "@/app/utils/format";
import { Coins } from "lucide-react";

const CashBankBalance = ({ accountBalance, warehouseId, endDate }) => {
    const summarizeBalance = accountBalance?.data?.chartOfAccounts?.reduce((total, account) => total + account.balance, 0);

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-indigo-500" />
                        KAS/BANK
                    </h3>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 px-2.5 py-1 rounded-lg">
                        Total : {formatNumber(summarizeBalance)}
                    </span>
                </div>
            </div>
            <div>
                {accountBalance?.data?.chartOfAccounts?.map((account) => (
                    <div
                        key={account.id}
                        // title={account.name} berfungsi memunculkan tooltip bawaan browser saat hover
                        title={account.name}
                        className="group flex items-center justify-between py-2.5 transition-colors hover:bg-slate-50/50 -mx-3 px-3 rounded-lg dark:hover:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                    >
                        {/* Bagian Kiri: Info Akun */}
                        {/* 'min-w-0' di bawah ini WAJIB ada agar efek truncate di dalamnya berfungsi */}
                        <div className="min-w-0 flex-1 pr-3">
                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                {account.group}
                            </h4>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{account.name}</p>
                        </div>

                        {/* Bagian Kanan: Saldo */}
                        <div className="text-right shrink-0">
                            <span
                                className={`text-sm font-bold font-mono ${
                                    account.balance < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-200"
                                }`}
                            >
                                {formatNumber(account.balance)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CashBankBalance;

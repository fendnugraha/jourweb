"use client";

import { formatNumber } from "@/app/utils/format";
import { Wallet, Landmark, ArrowDownLeft, ArrowUpRight, Coins } from "lucide-react";
import React, { useCallback, useMemo } from "react";
import MutationHistoryLog from "./MutationHistoryLog";

const accountBadgeConfig = {
    1: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400", Icon: Wallet },
    2: { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400", Icon: Landmark },
};

const AccountBadge = ({ accountId }) => {
    const config = accountBadgeConfig[Number(accountId)] ?? {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-500 dark:text-slate-400",
        Icon: Coins,
    };
    return (
        <div className={`p-2 rounded-xl shrink-0 ${config.bg} ${config.text}`}>
            <config.Icon className="w-4 h-4" />
        </div>
    );
};

const SummaryCard = ({ title, count, balance, inflow, outflow, percentage, accentColor, Icon }) => {
    const colorMap = {
        amber: {
            iconBg: "bg-amber-50 dark:bg-amber-950/40",
            iconText: "text-amber-600 dark:text-amber-400",
            badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
            bar: "bg-amber-500",
        },
        indigo: {
            iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
            iconText: "text-indigo-600 dark:text-indigo-400",
            badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400",
            bar: "bg-indigo-500",
        },
    };
    const c = colorMap[accentColor];

    return (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${c.iconBg} ${c.iconText}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider truncate">{title}</h4>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold font-mono shrink-0 ${c.badge}`}>
                                {percentage}%
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{count} Akun Terdaftar</p>
                    </div>
                </div>
                <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-50 shrink-0">{formatNumber(balance)}</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className={`${c.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, percentage)}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                        <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> Masuk
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatNumber(inflow)}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                        <ArrowUpRight className="w-3 h-3 text-rose-500" /> Keluar
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{formatNumber(outflow)}</span>
                </div>
            </div>
        </div>
    );
};

const CashBankSummary = ({ journals = [], accountBalance, setNotification, mutate, mutateBalance }) => {
    const mutationInSumById = useCallback(
        (acc_id) => journals.reduce((sum, j) => (Number(j.debt_id) === Number(acc_id) && j.trx_type === "Mutasi Kas" ? sum + Number(j.amount) : sum), 0),
        [journals],
    );

    const mutationOutSumById = useCallback(
        (acc_id) => journals.reduce((sum, j) => (Number(j.cred_id) === Number(acc_id) && j.trx_type === "Mutasi Kas" ? sum + Number(j.amount) : sum), 0),
        [journals],
    );

    const accounts = useMemo(() => accountBalance?.data?.chartOfAccounts || [], [accountBalance]);

    const totals = useMemo(() => {
        const kasAccounts = accounts.filter((a) => Number(a.account_id) === 1);
        const bankAccounts = accounts.filter((a) => Number(a.account_id) === 2);
        const sum = (arr, fn) => arr.reduce((s, a) => s + (Number(fn(a)) || 0), 0);

        const kasBalance = sum(kasAccounts, (a) => a.balance);
        const bankBalance = sum(bankAccounts, (a) => a.balance);
        const grandTotalBalance = sum(accounts, (a) => a.balance);

        return {
            kas: {
                balance: kasBalance,
                in: sum(kasAccounts, (a) => mutationInSumById(a.id)),
                out: sum(kasAccounts, (a) => mutationOutSumById(a.id)),
                count: kasAccounts.length,
                percentage: grandTotalBalance > 0 ? Math.max(0, (kasBalance / grandTotalBalance) * 100).toFixed(1) : "0.0",
            },
            bank: {
                balance: bankBalance,
                in: sum(bankAccounts, (a) => mutationInSumById(a.id)),
                out: sum(bankAccounts, (a) => mutationOutSumById(a.id)),
                count: bankAccounts.length,
                percentage: grandTotalBalance > 0 ? Math.max(0, (bankBalance / grandTotalBalance) * 100).toFixed(1) : "0.0",
            },
            grandTotalBalance,
        };
    }, [accounts, mutationInSumById, mutationOutSumById]);

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                <SummaryCard
                    title="Total Kas"
                    count={totals.kas.count}
                    balance={totals.kas.balance}
                    inflow={totals.kas.in}
                    outflow={totals.kas.out}
                    percentage={totals.kas.percentage}
                    accentColor="amber"
                    Icon={Wallet}
                />
                <SummaryCard
                    title="Total Bank"
                    count={totals.bank.count}
                    balance={totals.bank.balance}
                    inflow={totals.bank.in}
                    outflow={totals.bank.out}
                    percentage={totals.bank.percentage}
                    accentColor="indigo"
                    Icon={Landmark}
                />

                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-700 dark:bg-slate-900 text-white border border-slate-800 dark:border-indigo-900/50 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-white/10 text-amber-400 shrink-0">
                                <Coins className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <h5 className="text-[11px] font-medium text-slate-300 truncate">Grand Total Saldo</h5>
                                <p className="text-[9px] text-slate-400 truncate">Akumulasi Seluruh Akun</p>
                            </div>
                        </div>
                        <span className="text-sm sm:text-base font-extrabold font-mono text-amber-400 shrink-0">{formatNumber(totals.grandTotalBalance)}</span>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Kas {totals.kas.percentage}%</span>
                            <span>Bank {totals.bank.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                            <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, totals.kas.percentage)}%` }} />
                            <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, totals.bank.percentage)}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Split: Account Table + Mutation Log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Account Table */}
                <div className="lg:col-span-7 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                    <th className="px-4 py-3">Akun</th>
                                    <th className="px-3 py-3 text-right">Saldo</th>
                                    <th className="px-3 py-3 text-right">Masuk</th>
                                    <th className="px-4 py-3 text-right">Keluar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                                {accounts.map((account, index) => (
                                    <tr key={account.id || index} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-2.5 font-medium">
                                            <div className="flex items-center gap-2.5">
                                                <AccountBadge accountId={account.account_id} />
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold block text-slate-800 dark:text-slate-100 truncate">{account.group}</span>
                                                    <span className="text-[10px] text-slate-400 block truncate">{account.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-bold font-mono text-xs whitespace-nowrap">
                                            {formatNumber(account.balance)}
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-medium font-mono whitespace-nowrap">
                                            {formatNumber(mutationInSumById(account.id))}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-rose-600 dark:text-rose-400 font-medium font-mono whitespace-nowrap">
                                            {formatNumber(mutationOutSumById(account.id))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mutation History Log */}
                <div className="lg:col-span-5 w-full">
                    <MutationHistoryLog
                        journals={journals}
                        accounts={accounts}
                        setNotification={setNotification}
                        mutate={mutate}
                        mutateBalance={mutateBalance}
                    />
                </div>
            </div>
        </div>
    );
};

export default CashBankSummary;

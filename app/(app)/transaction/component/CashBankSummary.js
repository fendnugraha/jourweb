"use client";

import { formatNumber } from "@/app/utils/format";
import { Wallet, Landmark, ArrowDownLeft, ArrowUpRight, Coins } from "lucide-react";
import React, { useCallback, useMemo } from "react";

const CashBankSummary = ({ journals = [], accountBalance, warehouseId }) => {
    // 1. Perbaikan useCallback dengan dependency array yang benar
    const mutationInSumById = useCallback(
        (acc_id) => {
            return journals.reduce(
                (sum, journal) => (Number(journal.debt_id) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
                0,
            );
        },
        [journals],
    );

    const mutationOutSumById = useCallback(
        (acc_id) => {
            return journals.reduce(
                (sum, journal) => (Number(journal.cred_id) === Number(acc_id) && journal.trx_type === "Mutasi Kas" ? sum + Number(journal.amount) : sum),
                0,
            );
        },
        [journals],
    );

    const totals = useMemo(() => {
        const accounts = accountBalance?.data?.chartOfAccounts || [];

        const kasAccounts = accounts.filter((acc) => Number(acc.account_id ?? acc.account_id) === 1);
        const bankAccounts = accounts.filter((acc) => Number(acc.account_id ?? acc.account_id) === 2);

        const kasBalance = kasAccounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
        const kasIn = kasAccounts.reduce((sum, acc) => sum + (Number(mutationInSumById(acc.id)) || 0), 0);
        const kasOut = kasAccounts.reduce((sum, acc) => sum + (Number(mutationOutSumById(acc.id)) || 0), 0);

        const bankBalance = bankAccounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
        const bankIn = bankAccounts.reduce((sum, acc) => sum + (Number(mutationInSumById(acc.id)) || 0), 0);
        const bankOut = bankAccounts.reduce((sum, acc) => sum + (Number(mutationOutSumById(acc.id)) || 0), 0);

        const grandTotalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);

        const kasPercent = grandTotalBalance > 0 ? (kasBalance / grandTotalBalance) * 100 : 0;
        const bankPercent = grandTotalBalance > 0 ? (bankBalance / grandTotalBalance) * 100 : 0;

        return {
            kas: {
                balance: kasBalance,
                in: kasIn,
                out: kasOut,
                count: kasAccounts.length,
                percentage: Math.max(0, kasPercent).toFixed(1),
            },
            bank: {
                balance: bankBalance,
                in: bankIn,
                out: bankOut,
                count: bankAccounts.length,
                percentage: Math.max(0, bankPercent).toFixed(1),
            },
            grandTotalBalance,
        };
    }, [accountBalance, mutationInSumById, mutationOutSumById]);

    const getAccountBadge = (accountId) => {
        switch (Number(accountId)) {
            case 1:
                return (
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
                        <Wallet className="w-4 h-4" />
                    </div>
                );
            case 2:
                return (
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0">
                        <Landmark className="w-4 h-4" />
                    </div>
                );
            default:
                return (
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                        <Coins className="w-4 h-4" />
                    </div>
                );
        }
    };

    const accounts = accountBalance?.data?.chartOfAccounts || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* ========================================================================= */}
            {/* KIRI: DAFTAR AKUN (Card List di Mobile & Tabel di Desktop)               */}
            {/* ========================================================================= */}
            <div className="lg:col-span-7 w-full space-y-3">
                {/* 1. MOBILE VIEW (Card Stack) */}
                <div className="block sm:hidden space-y-2.5">
                    {accounts.map((account, index) => {
                        const mIn = mutationInSumById(account.id);
                        const mOut = mutationOutSumById(account.id);

                        return (
                            <div
                                key={account.id || index}
                                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3"
                            >
                                {/* Header Card: Icon, Name & Total Saldo */}
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        {getAccountBadge(account.account_id ?? account.account_id)}
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{account.group}</h4>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{account.name}</p>
                                        </div>
                                    </div>
                                    <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-slate-100 shrink-0">
                                        {formatNumber(account.balance)}
                                    </span>
                                </div>

                                {/* Detail Masuk & Keluar di Mobile */}
                                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                                            <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> Masuk
                                        </span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatNumber(mIn)}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                                            <ArrowUpRight className="w-3 h-3 text-rose-500" /> Keluar
                                        </span>
                                        <span className="font-semibold text-rose-600 dark:text-rose-400">{formatNumber(mOut)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. DESKTOP VIEW (Table) */}
                <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 w-full">
                    <div className="overflow-x-auto no-scrollbar w-full">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                    <th scope="col" className="px-5 py-3.5">
                                        Akun
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-right">
                                        Saldo
                                    </th>
                                    <th scope="col" className="px-4 py-3.5 text-right">
                                        Masuk
                                    </th>
                                    <th scope="col" className="px-5 py-3.5 text-right">
                                        Keluar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                                {accounts.map((account, index) => (
                                    <tr key={account.id || index} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-100">
                                            <div className="flex items-center gap-3">
                                                {getAccountBadge(account.account_id ?? account.account_id)}
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-slate-800 dark:text-slate-100 block truncate leading-snug">
                                                        {account.group}
                                                    </span>
                                                    <span className="font-medium text-slate-500 dark:text-slate-400 block text-[11px] truncate">
                                                        {account.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-sm whitespace-nowrap font-mono">{formatNumber(account.balance)}</td>
                                        <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap font-mono">
                                            {formatNumber(mutationInSumById(account.id))}
                                        </td>
                                        <td className="px-5 py-3 text-right text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap font-mono">
                                            {formatNumber(mutationOutSumById(account.id))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* KANAN: RINGKASAN TOTAL KAS & BANK DENGAN PERSENTASE                      */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 space-y-3 w-full">
                {/* Card Total Kas */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider truncate">Total Kas</h4>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-mono shrink-0">
                                        {totals.kas.percentage}%
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{totals.kas.count} Akun Terdaftar</p>
                            </div>
                        </div>
                        <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-50 shrink-0">
                            {formatNumber(totals.kas.balance)}
                        </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, totals.kas.percentage)}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                                <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> Masuk
                            </span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatNumber(totals.kas.in)}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                                <ArrowUpRight className="w-3 h-3 text-rose-500" /> Keluar
                            </span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">{formatNumber(totals.kas.out)}</span>
                        </div>
                    </div>
                </div>

                {/* Card Total Bank */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Landmark className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider truncate">Total Bank</h4>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-mono shrink-0">
                                        {totals.bank.percentage}%
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">{totals.bank.count} Akun Terdaftar</p>
                            </div>
                        </div>
                        <span className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-slate-50 shrink-0">
                            {formatNumber(totals.bank.balance)}
                        </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, totals.bank.percentage)}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                                <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> Masuk
                            </span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatNumber(totals.bank.in)}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                                <ArrowUpRight className="w-3 h-3 text-rose-500" /> Keluar
                            </span>
                            <span className="font-semibold text-rose-600 dark:text-rose-400">{formatNumber(totals.bank.out)}</span>
                        </div>
                    </div>
                </div>

                {/* Card Grand Total Saldo */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 dark:bg-indigo-950/40 text-white border border-slate-800 dark:border-indigo-900/50 space-y-3 shadow-sm">
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

                    {/* Progress Bar Gabungan */}
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                                Kas {totals.kas.percentage}%
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                                Bank {totals.bank.percentage}%
                            </span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${Math.min(100, totals.kas.percentage)}%` }} />
                            <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, totals.bank.percentage)}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashBankSummary;

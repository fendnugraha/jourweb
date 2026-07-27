import { formatDateTime, formatRupiah } from "@/app/utils/format";

const FinanceMutationHistory = ({ finances, findContact, selectedContactId }) => {
    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{findContact.contact_name}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sisa: {formatRupiah(findContact.sisa)}</p>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                <th scope="col" className="px-6 py-4 text-center">
                                    Description
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                            {finances
                                .filter((finance) => finance.contact_id === selectedContactId)
                                .map((finance) => (
                                    <tr key={finance.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <span className="font-medium capitalize">{finance.description}</span>
                                            <span className="text-[10px] block font-normal">{formatDateTime(finance.date_issued)}</span>
                                        </td>
                                        <td className={`px-6 py-4 text-right ${finance.bill_amount > 0 ? "text-green-500" : "text-red-500"}`}>
                                            <span>{finance.bill_amount > 0 ? "+" : "-"}</span>{" "}
                                            <span className="font-bold">
                                                {formatRupiah(finance.bill_amount > 0 ? finance.bill_amount : finance.payment_amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default FinanceMutationHistory;

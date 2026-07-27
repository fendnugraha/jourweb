import { formatNumber } from "@/app/utils/format";

const PayableTable = ({ financeGroup, selectedContactId, setSelectedContactId, searchTerm, setIsPaymentActive, setIsModalOpen, setModalTitle }) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4 text-center">
                                Name
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
                        {financeGroup
                            .filter((finance) => {
                                if (!searchTerm) return true;
                                return finance.contact_name.toLowerCase().includes(searchTerm.toLowerCase());
                            })
                            .map((finance) => (
                                <tr key={finance.contact_id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                    <td className="px-6 py-4">
                                        <button
                                            type="button"
                                            className={`${selectedContactId === finance.contact_id ? "text-indigo-600 dark:text-indigo-400" : ""}`}
                                            onClick={() => setSelectedContactId(finance.contact_id)}
                                        >
                                            {finance.contact_name}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">{formatNumber(finance.sisa)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => {
                                                setSelectedContactId(finance.contact_id);
                                                setIsPaymentActive(true);
                                                setIsModalOpen(true);
                                                setModalTitle("Edit Finance Mutation");
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayableTable;

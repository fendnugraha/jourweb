import useContacts from "@/app/hooks/useContacts";

const ContactTable = () => {
    const { contacts, loading, mutate } = useContacts();
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Phone
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Address
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {contacts?.map((contact) => (
                            <tr key={contact.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="px-6 py-4">
                                    {contact.name}
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">{contact.email || "-"}</span>
                                </td>
                                <td className="px-6 py-4">{contact.phone}</td>
                                <td className="px-6 py-4 wrap-break-word whitespace-normal">{contact.address}</td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactTable;

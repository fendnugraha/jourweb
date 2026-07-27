import useProducts from "@/app/hooks/useProducts";
import { formatNumber } from "@/app/utils/format";

const ProductTable = () => {
    const { products, loading, mutate } = useProducts();
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
                                Price
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Cost
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {products?.map((product) => (
                            <tr key={product.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="px-6 py-4">
                                    {product.name}
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">{product.category || "-"}</span>
                                </td>
                                <td className="px-6 py-4 text-right">{formatNumber(product.price)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(product.cost)}</td>
                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${
                                            product.status === "active"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                        }`}
                                    >
                                        {product.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
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

export default ProductTable;

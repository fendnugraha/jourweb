/**
 * DataTable - A modern financial bookkeeping table component.
 *
 * Props:
 *   columns: Array<{ label: string, align?: 'left'|'center'|'right' }>
 *   children: <tbody> row content (tr elements)
 *   loading?: boolean
 *   emptyMessage?: string
 *   isEmpty?: boolean
 *   colSpan?: number
 *   footer?: ReactNode — optional <tfoot> content
 */

const DataTable = ({
    columns = [],
    children,
    loading = false,
    emptyMessage = "No data found.",
    isEmpty = false,
    footer,
}) => {
    const alignClass = (align) => {
        if (align === "center") return "text-center";
        if (align === "right") return "text-right";
        return "text-left";
    };

    return (
        <div className="data-table-wrapper">
            <table className="table w-full">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i} className={alignClass(col.align)}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Loading...
                                </span>
                            </td>
                        </tr>
                    ) : isEmpty ? (
                        <tr>
                            <td colSpan={columns.length} className="py-10 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        children
                    )}
                </tbody>
                {footer && <tfoot>{footer}</tfoot>}
            </table>
        </div>
    );
};

export default DataTable;

import { useFinances } from "@/app/hooks/useFinance";
import { DateTimeNow, formatLongDate, formatNumber } from "@/app/utils/format";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    Download,
    Loader2,
    Pencil,
    Plus,
    Printer,
    Receipt,
    Sparkles,
    Store,
    Trash2,
    TrendingDown,
    TrendingUp,
    UserMinus,
    Wallet,
    X,
} from "lucide-react";
import { useRef, useState } from "react";

export default function DailyReport({ revenue, hasData, date, corpCashFlows = [], warehouseBalance }) {
    const totalHqCash = warehouseBalance?.warehouse?.find((w) => w.id === 1)?.cash || 0;

    const sumByTrxType = (trxType) => {
        if (!revenue?.revenue) return 0;
        return revenue.revenue.reduce((total, item) => {
            return total + Number(item[trxType] || 0);
        }, 0);
    };

    const filteredCorpCashFlows = (corpCashFlows || []).filter((cashFlow) => cashFlow.is_corporate === 1);

    const corpIncomes = filteredCorpCashFlows.filter((c) => c.type === "income");
    const corpExpenses = filteredCorpCashFlows.filter((c) => c.type === "expense");

    const totalCorpIncome = corpIncomes.reduce((total, item) => total + Number(item.amount || 0), 0);
    const totalCorpExpense = corpExpenses.reduce((total, item) => total + Number(item.amount || 0), 0);

    const reportRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const [editingIndex, setEditingIndex] = useState(null);
    const [editForm, setEditForm] = useState({ note: "", amount: "" });

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);

        try {
            const dataUrl = await toPng(reportRef.current, {
                quality: 0.95,
                pixelRatio: 2,
            });

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(dataUrl);

            const widthRatio = pdfWidth / imgProps.width;
            const heightRatio = pdfHeight / imgProps.height;
            const ratio = Math.min(widthRatio, heightRatio);

            const finalWidth = imgProps.width * ratio;
            const finalHeight = imgProps.height * ratio;

            const xOffset = (pdfWidth - finalWidth) / 2;
            const yOffset = (pdfHeight - finalHeight) / 2;

            pdf.addImage(dataUrl, "PNG", xOffset, yOffset, finalWidth, finalHeight);
            pdf.save(`Laporan-Harian-${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (error) {
            console.error("Gagal membuat PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const { finances } = useFinances({
        contact: "All",
        financeType: "All",
        start: date,
        end: date,
    });

    const filteredFinances = finances?.filter(
        (item) =>
            new Date(item.date_issued).toDateString() === new Date(date).toDateString() &&
            ["EmployeeReceivable", "InstallmentReceivable"].includes(item.finance_type),
    );

    const totalReceivable = (filteredFinances || []).reduce((sum, finance) => sum + Number(finance.bill_amount || 0), 0);
    const totalFee = revenue?.revenue?.reduce((sum, item) => sum + Number(item.fee || 0), 0) || 0;

    const diffTotal =
        revenue?.revenue?.reduce((acc, item) => {
            const rawCash = item.cash || 0;
            const roundedCash = Math.floor(rawCash / 1000) * 1000;
            const selisih = rawCash - roundedCash;
            return acc + selisih;
        }, 0) || 0;

    const [cashdetail, setCashDetail] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("cashDetail");
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    const handleAddCashDetail = (note, amount) => {
        const updated = [...cashdetail, { note, amount }];
        setCashDetail(updated);
        if (typeof window !== "undefined") {
            localStorage.setItem("cashDetail", JSON.stringify(updated));
        }
    };

    const handleRemoveCashDetail = (index) => {
        const newCashDetail = [...cashdetail];
        newCashDetail.splice(index, 1);
        setCashDetail(newCashDetail);
        if (typeof window !== "undefined") {
            localStorage.setItem("cashDetail", JSON.stringify(newCashDetail));
        }
        if (editingIndex === index) setEditingIndex(null);
    };

    const handleStartEdit = (index, item) => {
        setEditingIndex(index);
        setEditForm({ note: item.note, amount: item.amount });
    };

    const handleSaveEdit = (index) => {
        if (!editForm.note.trim() || isNaN(parseFloat(editForm.amount))) return;

        const updated = cashdetail.map((item, i) => (i === index ? { note: editForm.note.trim(), amount: parseFloat(editForm.amount) } : item));

        setCashDetail(updated);
        if (typeof window !== "undefined") {
            localStorage.setItem("cashDetail", JSON.stringify(updated));
        }
        setEditingIndex(null);
    };

    const netProfit = Number(totalFee) + Number(totalCorpIncome) - Number(totalReceivable) - Number(totalCorpExpense + diffTotal);

    return (
        <div className="space-y-4 font-sans text-slate-800">
            <div ref={reportRef} className="p-5 bg-white rounded-2xl border border-indigo-100 space-y-4 font-sans text-slate-900">
                {/* 1. HEADER LAPORAN DOKUMEN */}
                <div className="flex justify-between items-end pb-3 border-b-2 border-indigo-200">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-600">FINANCIAL REPORT</span>
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-indigo-700">Laporan Keuangan Harian</h1>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">
                            📅 Tanggal Rekap: <strong className="text-indigo-900">{formatLongDate(date, true)}</strong>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleDownloadPDF}
                        hidden={isExporting}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                    >
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        <span>Export Laporan (PDF)</span>
                    </button>
                </div>

                {/* 2. MINI METRICS STRIP */}
                <div className="grid grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Outlets Aktif</span>
                            <span className="text-sm font-bold font-mono text-indigo-950 mt-0.5 block">{revenue?.revenue?.length || 0} Cabang</span>
                        </div>
                        <Store className="w-4 h-4 text-indigo-400" />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Biaya Cabang</span>
                            <span className="text-sm font-bold font-mono text-rose-600 mt-0.5 block">Rp {formatNumber(sumByTrxType("expense"))}</span>
                        </div>
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Total Kasbon</span>
                            <span className="text-sm font-bold font-mono text-amber-600 mt-0.5 block">Rp {formatNumber(totalReceivable)}</span>
                        </div>
                        <UserMinus className="w-4 h-4 text-amber-500" />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Corp Expense</span>
                            <span className="text-sm font-bold font-mono text-indigo-600 mt-0.5 block">Rp {formatNumber(totalCorpExpense + diffTotal)}</span>
                        </div>
                        <Receipt className="w-4 h-4 text-indigo-400" />
                    </div>
                </div>

                {/* 3. HERO CARD: LABA DITRANSFER */}
                <div className="p-4 rounded-xl bg-indigo-700 text-white flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Laba Ditransfer (Net Profit)</span>
                        </div>
                        <div className="text-2xl font-black font-mono tracking-tight text-white">Rp {formatNumber(netProfit)}</div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-indigo-200/70 space-y-0.5 border-l border-indigo-300/60 pl-4">
                        <p className="text-indigo-200 font-semibold">Formula Otomatis:</p>
                        <p className="text-indigo-300/80">Total Laba (+ Income) - (Kasbon + Corp Expense)</p>
                    </div>
                </div>

                {/* 4. GRID DATA TABEL */}
                <div className="grid grid-cols-12 gap-4 items-start">
                    {/* TABEL KIRI: OPERASIONAL CABANG */}
                    <div className="col-span-7 rounded-xl border border-indigo-100 overflow-hidden bg-white">
                        <div className="px-3.5 py-2 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Operasional Cabang</h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">Live Data</span>
                        </div>

                        <table className="w-full text-left text-xs font-mono">
                            <thead>
                                <tr className="text-[9px] uppercase font-sans text-slate-400 border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-3 py-1.5 font-semibold">Cabang</th>
                                    <th className="px-3 py-1.5 text-right font-semibold">Biaya</th>
                                    <th className="px-3 py-1.5 text-right font-semibold">Laba Bersih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {hasData ? (
                                    revenue.revenue.map((item, i) => (
                                        <tr key={i} className="hover:bg-indigo-50/30">
                                            <td className="px-3 py-2 font-sans font-medium text-slate-700">{item.warehouse.replace(/^konter\s*/i, "")}</td>
                                            <td className="px-3 py-2 text-right text-slate-400">{formatNumber(item.expense)}</td>
                                            <td className="px-3 py-2 text-right font-bold text-indigo-950">Rp {formatNumber(item.fee)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-3 py-6 text-center text-slate-400 font-sans">
                                            Tidak ada data transaksi cabang.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {hasData && (
                                <tfoot className="bg-indigo-50/50 border-t border-indigo-100 font-bold">
                                    <tr>
                                        <td className="px-3 py-2 font-sans text-indigo-950">TOTAL</td>
                                        <td className="px-3 py-2 text-right text-rose-500">Rp {formatNumber(sumByTrxType("expense"))}</td>
                                        <td className="px-3 py-2 text-right text-indigo-600">Rp {formatNumber(sumByTrxType("fee"))}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* TABEL KANAN: KASBON, CORPORATE & TOTAL KAS AKHIR */}
                    <div className="col-span-5 space-y-3">
                        {/* KASBON KARYAWAN */}
                        {filteredFinances?.length > 0 && (
                            <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white shadow-xs">
                                <div className="px-3.5 py-2 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <UserMinus className="w-3.5 h-3.5 text-amber-500" />
                                        <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Kasbon Karyawan</h3>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{filteredFinances?.length || 0} Org</span>
                                </div>

                                <div className="divide-y divide-slate-100 font-mono text-xs">
                                    {filteredFinances.map((finance) => (
                                        <div key={finance.id} className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                            <span className="font-sans text-slate-700">{finance.contact?.name || "Karyawan"}</span>
                                            <span className="font-bold text-amber-600">Rp {formatNumber(finance.bill_amount)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-3.5 py-2 bg-indigo-50/50 border-t border-indigo-100 flex justify-between font-mono font-bold text-xs">
                                    <span className="font-sans text-indigo-950">Total Kasbon</span>
                                    <span className="text-amber-600">Rp {formatNumber(totalReceivable)}</span>
                                </div>
                            </div>
                        )}

                        {/* CORPORATE INCOME */}
                        {corpIncomes.length > 0 && (
                            <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white shadow-xs">
                                <div className="px-3.5 py-2 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                        <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Corporate Income</h3>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{corpIncomes.length} Item</span>
                                </div>

                                <div className="divide-y divide-slate-100 font-mono text-xs">
                                    {corpIncomes.map((cashflow) => (
                                        <div key={cashflow.id} className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                            <span className="font-sans text-slate-700 truncate max-w-54">
                                                {cashflow.description || cashflow.category || "Pemasukan"}
                                            </span>
                                            <span className="font-bold text-emerald-600">Rp {formatNumber(cashflow.amount)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-3.5 py-2 bg-indigo-50/50 border-t border-indigo-100 flex justify-between font-mono font-bold text-xs">
                                    <span className="font-sans text-indigo-950">Total Corporate Income</span>
                                    <span className="text-emerald-600">Rp {formatNumber(totalCorpIncome)}</span>
                                </div>
                            </div>
                        )}

                        {/* CORPORATE EXPENSE */}
                        {(corpExpenses.length > 0 || diffTotal !== 0) && (
                            <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white shadow-xs">
                                <div className="px-3.5 py-2 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                                        <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Corporate Expense</h3>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{corpExpenses.length + (diffTotal !== 0 ? 1 : 0)} Item</span>
                                </div>

                                <div className="divide-y divide-slate-100 font-mono text-xs">
                                    {diffTotal !== 0 && (
                                        <div className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                            <span className="font-sans text-slate-700 truncate max-w-54">Pembulatan Setoran</span>
                                            <span className="font-bold text-indigo-600">Rp {formatNumber(diffTotal)}</span>
                                        </div>
                                    )}

                                    {corpExpenses.map((expense) => (
                                        <div key={expense.id} className="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                            <span className="font-sans text-slate-700 truncate max-w-54">
                                                {expense.description || expense.category || "Pengeluaran"}
                                            </span>
                                            <span className="font-bold text-indigo-600">Rp {formatNumber(expense.amount)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="px-3.5 py-2 bg-indigo-50/50 border-t border-indigo-100 flex justify-between font-mono font-bold text-xs">
                                    <span className="font-sans text-indigo-950">Total Corporate Expense</span>
                                    <span className="text-indigo-600">Rp {formatNumber(totalCorpExpense + diffTotal)}</span>
                                </div>
                            </div>
                        )}

                        {/* TOTAL KAS AKHIR & CASH DETAIL LIST */}
                        <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white shadow-xs">
                            <div className="px-3.5 py-2 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                                    <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Total Kas Akhir</h3>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{cashdetail?.length || 0} Item</span>
                            </div>

                            <div className="divide-y divide-slate-100 font-mono text-xs">
                                <div className="px-3.5 py-2 flex items-center justify-between">
                                    <span className="font-sans text-slate-700 truncate max-w-54">Setoran Cabang</span>
                                    <span className="font-bold text-indigo-600">Rp {formatNumber(sumByTrxType("cash"))}</span>
                                </div>

                                {cashdetail?.map((detail, index) => (
                                    <div key={index} className="px-3.5 py-2 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                                        {editingIndex === index ? (
                                            /* FORM INLINE EDIT ITEM */
                                            <div className="flex items-center gap-1.5 w-full">
                                                <input
                                                    type="text"
                                                    value={editForm.note}
                                                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                                    className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-sans text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                                                    placeholder="Catatan"
                                                />
                                                <input
                                                    type="number"
                                                    step="any"
                                                    value={editForm.amount}
                                                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                                    className="w-28 rounded-lg border border-slate-300 px-2 py-1 text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-right"
                                                    placeholder="Nominal"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveEdit(index)}
                                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer shrink-0"
                                                    title="Simpan"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingIndex(null)}
                                                    className="p-1 text-slate-400 hover:bg-slate-100 rounded-md cursor-pointer shrink-0"
                                                    title="Batal"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            /* TAMPILAN ITEM: TOMBOL EDIT DISAMPING TEKS NOTE (TIDAK HALANGI ANGKA NOMINAL) */
                                            <>
                                                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                                    <span className="font-sans text-slate-700 truncate">{detail.note}</span>

                                                    {!isExporting && (
                                                        <div className="inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStartEdit(index, detail)}
                                                                className="p-0.5 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveCashDetail(index)}
                                                                className="p-0.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <span className="font-bold text-indigo-600 shrink-0">Rp {formatNumber(detail.amount)}</span>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Form Tambah Item Kas Detail */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.currentTarget);
                                    const note = formData.get("note")?.toString().trim();
                                    const amount = parseFloat(formData.get("amount")?.toString() || "");

                                    if (note && !isNaN(amount)) {
                                        handleAddCashDetail(note, amount);
                                        e.currentTarget.reset();
                                    }
                                }}
                                className="p-2.5 bg-slate-50/50 border-t border-indigo-100"
                                hidden={isExporting}
                            >
                                <div className="grid grid-cols-6 gap-2">
                                    <input
                                        name="note"
                                        type="text"
                                        required
                                        placeholder="Note"
                                        className="rounded-xl col-span-3 border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <input
                                        name="amount"
                                        type="number"
                                        step="any"
                                        required
                                        placeholder="Amount"
                                        className="rounded-xl col-span-2 border border-slate-200 bg-white py-1.5 px-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer"
                                    >
                                        Add
                                    </button>
                                </div>
                            </form>

                            {/* Ringkasan Akumulasi Kas */}
                            <div className="divide-y divide-indigo-100/60 border-t border-indigo-100 font-mono font-bold text-xs bg-indigo-50/30">
                                <div className="px-3.5 py-2 flex justify-between">
                                    <span className="font-sans text-indigo-950">Total Actual</span>
                                    <span className="text-indigo-600">Rp {formatNumber(sumByTrxType("cash"))}</span>
                                </div>
                                <div className="px-3.5 py-2 flex justify-between">
                                    <span className="font-sans text-indigo-950">Total System</span>
                                    <span className="text-indigo-600">Rp {formatNumber(totalHqCash)}</span>
                                </div>
                                <div className="px-3.5 py-2 flex justify-between bg-indigo-50/80">
                                    <span className="font-sans text-indigo-950">Selisih</span>
                                    {(() => {
                                        const totalCashDetail = cashdetail.reduce((acc, curr) => acc + curr.amount, 0);
                                        const selisih = sumByTrxType("cash") + totalCashDetail - totalHqCash;
                                        return (
                                            <span className={selisih < 0 ? "text-rose-600" : selisih > 0 ? "text-emerald-600" : "text-indigo-600"}>
                                                Rp {formatNumber(selisih)}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useFinances } from "@/app/hooks/useFinance";
import { DateTimeNow, formatLongDate, formatNumber } from "@/app/utils/format";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
    Building2,
    Calendar,
    CheckCircle2,
    Download,
    Loader2,
    Plus,
    Printer,
    Receipt,
    Sparkles,
    Store,
    TrendingDown,
    TrendingUp,
    UserMinus,
    Wallet,
} from "lucide-react";
import { useRef, useState } from "react";

export default function DailyReport({ revenue, hasData, date, corpExpense }) {
    const sumByTrxType = (trxType) => {
        return revenue.revenue.reduce((total, item) => {
            return total + Number(item[trxType]);
        }, 0);
        // console.log(revenue.revenue?.[0][trxType]);
    };

    const reportRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    // FUNGSI EXPORT LANGSUNG JADI FILE .PDF
    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);

        try {
            // 1. Convert DOM ke gambar PNG
            const dataUrl = await toPng(reportRef.current, {
                quality: 0.95,
                pixelRatio: 2, // Menjaga gambar tetap tajam saat di-scale
            });

            // 2. Inisialisasi PDF A4 (Landscape/Portrait)
            const pdf = new jsPDF({
                orientation: "landscape", // Gunakan "portrait" jika tampilan memanjang ke bawah
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(dataUrl);

            // 3. Hitung rasio skala agar PASTI MUAT di 1 halaman
            const widthRatio = pdfWidth / imgProps.width;
            const heightRatio = pdfHeight / imgProps.height;

            // Ambil rasio terkecil agar tidak ada bagian yang terpotong
            const ratio = Math.min(widthRatio, heightRatio);

            const finalWidth = imgProps.width * ratio;
            const finalHeight = imgProps.height * ratio;

            // 4. Posisikan konten tepat di tengah halaman (Center alignment)
            const xOffset = (pdfWidth - finalWidth) / 2;
            const yOffset = (pdfHeight - finalHeight) / 2;

            // 5. Render ke PDF
            pdf.addImage(dataUrl, "PNG", xOffset, yOffset, finalWidth, finalHeight);
            pdf.save(`Laporan-Harian-${new Date().toISOString().split("T")[0]}.pdf`);
        } catch (error) {
            console.error("Gagal membuat PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const { finances, financeGroup, loading, error, mutate } = useFinances({
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

    const totalReceivable = filteredFinances.reduce((sum, finance) => sum + Number(finance.bill_amount), 0);
    const totalFee = revenue?.revenue?.reduce((sum, item) => sum + Number(item.fee), 0) || 0;
    const totalCorpExpense = corpExpense.data?.reduce((total, expense) => total + Number(expense.amount), 0) || 0;
    return (
        <div className="space-y-4 font-sans text-slate-800">
            {/* ========================================================= */}
            {/* AREA KHUSUS PDF CONTAINER (THEME: FULL INDIGO SLATE)      */}
            {/* ========================================================= */}
            <div ref={reportRef} className="p-5 bg-white rounded-2xl border border-indigo-100 space-y-4 font-sans text-slate-900">
                {/* 1. HEADER LAPORAN DOKUMEN (DIJAMIN TANGGAL TERBACA) */}
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

                {/* 2. MINI METRICS STRIP (SOFT INDIGO SLATE BOXES) */}
                <div className="grid grid-cols-4 gap-2.5">
                    {/* Outlets */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Outlets Aktif</span>
                            <span className="text-sm font-bold font-mono text-indigo-950 mt-0.5 block">{revenue?.revenue?.length || 0} Cabang</span>
                        </div>
                        <Store className="w-4 h-4 text-indigo-400" />
                    </div>

                    {/* Biaya Cabang */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Biaya Cabang</span>
                            <span className="text-sm font-bold font-mono text-rose-600 mt-0.5 block">Rp {formatNumber(sumByTrxType("expense"))}</span>
                        </div>
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                    </div>

                    {/* Kasbon */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Total Kasbon</span>
                            <span className="text-sm font-bold font-mono text-amber-600 mt-0.5 block">Rp {formatNumber(totalReceivable)}</span>
                        </div>
                        <UserMinus className="w-4 h-4 text-amber-500" />
                    </div>

                    {/* Corporate Expense */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">Corp Expense</span>
                            <span className="text-sm font-bold font-mono text-indigo-600 mt-0.5 block">Rp {formatNumber(totalCorpExpense)}</span>
                        </div>
                        <Receipt className="w-4 h-4 text-indigo-400" />
                    </div>
                </div>

                {/* 3. HERO CARD: LABA DITRANSFER (DEEP INDIGO DECK) */}
                <div className="p-4 rounded-xl bg-indigo-700 text-white flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Laba Ditransfer (Net Profit)</span>
                        </div>
                        <div className="text-2xl font-black font-mono tracking-tight text-white">
                            Rp {formatNumber(Number(totalFee) - Number(totalReceivable) - Number(totalCorpExpense))}
                        </div>
                    </div>

                    <div className="text-right text-[10px] font-mono text-indigo-200/70 space-y-0.5 border-l border-indigo-300/60 pl-4">
                        <p className="text-indigo-200 font-semibold">Formula Otomatis:</p>
                        <p className="text-indigo-300/80">Total Laba - (Kasbon + Corporate)</p>
                    </div>
                </div>

                {/* 4. GRID DATA TABEL */}
                <div className="grid grid-cols-12 gap-4 items-start">
                    {/* TABEL KIRI: OPERASIONAL CABANG (7 KOLOM) */}
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

                    {/* TABEL KANAN: KASBON & CORPORATE (5 KOLOM) */}
                    <div className="col-span-5 space-y-3">
                        {/* KASBON KARYAWAN */}
                        <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white">
                            <div className="px-3.5 py-2 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <UserMinus className="w-3.5 h-3.5 text-amber-500" />
                                    <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Kasbon Karyawan</h3>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{filteredFinances?.length || 0} Org</span>
                            </div>

                            <div className="divide-y divide-slate-100 font-mono text-xs">
                                {filteredFinances?.length > 0 ? (
                                    filteredFinances.map((finance) => (
                                        <div key={finance.id} className="px-3.5 py-1.5 flex items-center justify-between">
                                            <span className="font-sans text-slate-700">{finance.contact?.name || "Karyawan"}</span>
                                            <span className="font-bold text-amber-600">Rp {formatNumber(finance.bill_amount)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-2.5 text-center text-[11px] font-sans text-slate-400">Nihil / Tidak ada kasbon.</p>
                                )}
                            </div>

                            <div className="px-3.5 py-2 bg-indigo-50/50 border-t border-indigo-100 flex justify-between font-mono font-bold text-xs">
                                <span className="font-sans text-indigo-950">Total Kasbon</span>
                                <span className="text-amber-600">Rp {formatNumber(totalReceivable)}</span>
                            </div>
                        </div>

                        {/* CORPORATE EXPENSE */}
                        <div className="rounded-xl border border-indigo-100 overflow-hidden bg-white">
                            <div className="px-3.5 py-2 border-b border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                                    <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Corporate Expense</h3>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">{corpExpense.data?.length || 0} Item</span>
                            </div>

                            <div className="divide-y divide-slate-100 font-mono text-xs">
                                {corpExpense.data?.length > 0 ? (
                                    corpExpense.data.map((expense) => (
                                        <div key={expense.id} className="px-3.5 py-1.5 flex items-center justify-between">
                                            <span className="font-sans text-slate-700 truncate max-w-32.5">{expense.description}</span>
                                            <span className="font-bold text-indigo-600">Rp {formatNumber(expense.amount)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-2.5 text-center text-[11px] font-sans text-slate-400">Nihil / Tidak ada pengeluaran.</p>
                                )}
                            </div>

                            <div className="px-3.5 py-2 bg-indigo-50/50 border-t border-indigo-100 flex justify-between font-mono font-bold text-xs">
                                <span className="font-sans text-indigo-950">Total Corporate</span>
                                <span className="text-indigo-600">Rp {formatNumber(totalCorpExpense)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

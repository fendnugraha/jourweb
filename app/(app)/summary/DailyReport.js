import { useFinances } from "@/app/hooks/useFinance";
import { DateTimeNow, formatNumber } from "@/app/utils/format";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Building2, Download, Loader2, Plus, Printer, Receipt, TrendingUp, UserMinus, Wallet } from "lucide-react";
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
    const totalCorpExpense = corpExpense.data?.reduce((total, expense) => total + expense.amount, 0);
    return (
        <div className="space-y-4">
            {/* BAR ATAS: TOMBOL DOWNLOAD FILE PDF */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Laporan Keuangan Harian</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ringkasan operasional cabang & pengeluaran corporate</p>
                </div>

                <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-500 active:scale-95 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Membuat File PDF...</span>
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            <span>Download PDF</span>
                        </>
                    )}
                </button>
            </div>

            {/* ELEMEN YANG DIJADIKAN PDF */}
            <div ref={reportRef} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start font-sans p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                {/* TABEL KIRI: OPERASIONAL CABANG */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-950/30">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">Laporan Operasional Cabang</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/20">
                                    <th scope="col" className="px-5 py-2.5 text-left">
                                        Cabang
                                    </th>
                                    <th scope="col" className="px-5 py-2.5 text-right">
                                        Biaya
                                    </th>
                                    <th scope="col" className="px-5 py-2.5 text-right">
                                        Laba Bersih
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono dark:divide-slate-800/60">
                                {hasData ? (
                                    revenue.revenue.map((item, i) => (
                                        <tr key={i}>
                                            <td className="px-5 py-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                                                {item.warehouse.replace(/^konter\s*/i, "")}
                                            </td>
                                            <td className="px-5 py-2.5 text-right font-medium text-rose-500">{formatNumber(item.expense)}</td>
                                            <td className="px-5 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatNumber(item.fee)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center text-slate-400 font-sans">
                                            Tidak ada data transaksi ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {hasData && (
                                <tfoot className="border-t border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50 font-mono">
                                    <tr className="text-xs font-bold uppercase tracking-wider">
                                        <th className="px-5 py-2.5 text-left font-semibold text-slate-700 dark:text-slate-300 font-sans">Total</th>
                                        <th className="px-5 py-2.5 text-right font-bold text-rose-500">{formatNumber(sumByTrxType("expense"))}</th>
                                        <th className="px-5 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatNumber(sumByTrxType("fee"))}
                                        </th>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                {/* TABEL KANAN: KASBON & CORPORATE */}
                <div className="space-y-4">
                    {/* KASBON KARYAWAN */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 px-4 py-3 bg-slate-50/50 dark:bg-slate-950/30">
                            <UserMinus className="h-4 w-4 text-amber-500" />
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Kasbon Karyawan</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs font-mono">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/20">
                                        <th scope="col" className="px-4 py-2 text-left font-sans">
                                            Nama
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-right font-sans">
                                            Jumlah
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {filteredFinances?.map((finance) => (
                                        <tr key={finance.id}>
                                            <td className="px-4 py-2 font-sans font-medium text-slate-800 dark:text-slate-200">{finance.contact?.name}</td>
                                            <td className="px-4 py-2 text-right font-medium text-rose-500">{formatNumber(finance.bill_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
                                    <tr className="font-bold">
                                        <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-sans">Total Kasbon</th>
                                        <th className="px-4 py-2 text-right text-rose-500">{formatNumber(totalReceivable)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* PENGELUARAN OWNER / CORPORATE */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 px-4 py-3 bg-slate-50/50 dark:bg-slate-950/30">
                            <Receipt className="h-4 w-4 text-rose-500" />
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Pengeluaran Owner / Corporate</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs font-mono">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/20">
                                        <th scope="col" className="px-4 py-2 text-left font-sans">
                                            Deskripsi
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-right font-sans">
                                            Jumlah
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {corpExpense.data?.map((expense) => (
                                        <tr key={expense.id}>
                                            <td className="px-4 py-2 font-sans font-medium text-slate-800 dark:text-slate-200">{expense.description}</td>
                                            <td className="px-4 py-2 text-right font-medium text-rose-500">{formatNumber(expense.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
                                    <tr className="font-bold">
                                        <th className="px-4 py-2 text-left text-slate-700 dark:text-slate-300 font-sans">Total Pengeluaran</th>
                                        <th className="px-4 py-2 text-right text-rose-500">{formatNumber(totalCorpExpense)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* CARD HIGHLIGHT TOTAL DITRANSFER */}
                    <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-linear-to-br from-emerald-50/60 to-emerald-100/30 p-4 dark:border-emerald-800/50 dark:from-emerald-950/30 dark:to-slate-900 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>Laba Ditransfer Hari Ini</span>
                                </div>
                                <h2 className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                                    {formatNumber(totalFee - totalReceivable - totalCorpExpense)}
                                </h2>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm dark:bg-emerald-600">
                                <Wallet className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

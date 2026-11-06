"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import axios from "@/app/utils/axios";
import { Upload, FileSpreadsheet, Download, AlertCircle, Loader2, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import MainContent from "../../main";

// Color-coded badge selaras dengan Calendar.jsx & EmployeeDayOff.js
const TYPE_CONFIG = {
    weekly_off: {
        label: "Libur Mingguan",
        style: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    },
    leave: { label: "Cuti", style: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800" },
    company_event: {
        label: "Event Perusahaan",
        style: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
    },
    holiday: {
        label: "Hari Libur",
        style: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    },
    event: {
        label: "Event",
        style: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
    },
};

const STATUS_CONFIG = {
    approved: { label: "Disetujui", style: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
    pending: { label: "Menunggu", style: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
    rejected: { label: "Ditolak", style: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
};

function TypeBadge({ type }) {
    const cfg = TYPE_CONFIG[type];
    if (!cfg)
        return (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {type || "-"}
            </span>
        );
    return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${cfg.style}`}>{cfg.label}</span>;
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status || "-", style: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" };
    return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${cfg.style}`}>{cfg.label}</span>;
}

export default function ImportSchedulePage() {
    const router = useRouter();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // 1. Download Template Excel Contoh
    const downloadTemplate = () => {
        const templateData = [
            { employee_id: 1, date: "2026-11-01", type: "weekly_off", title: "Libur Mingguan", status: "approved" },
            { employee_id: 2, date: "2026-11-15", type: "company_event", title: "Gathering Kantor", status: "approved" },
            { employee_id: 3, date: "2026-11-20", type: "leave", title: "Cuti Tahunan", status: "pending" },
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Jadwal");
        XLSX.writeFile(workbook, "template_import_jadwal.xlsx");
    };

    // 2. Handle File Upload dan Parsing dengan SheetJS (xlsx)
    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setError(null);
        setSuccess(false);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const workbook = XLSX.read(bstr, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);

                if (data.length === 0) {
                    setError("File Excel kosong atau format tidak sesuai.");
                    return;
                }

                setPreviewData(data);
            } catch {
                setError("Gagal membaca file Excel. Pastikan format file benar.");
            }
        };
        reader.readAsBinaryString(uploadedFile);
    };

    // 3. Hapus baris dari pratinjau
    const handleRemoveRow = (index) => {
        setPreviewData((prev) => prev.filter((_, i) => i !== index));
    };

    // 4. Kirim Data ke Backend Laravel
    const handleSubmitImport = async () => {
        if (previewData.length === 0) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post("/api/employee-schedules/import-excel", {
                schedules: previewData,
            });

            setSuccess(response.data?.message || "Jadwal berhasil diimport!");
            setPreviewData([]);
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data ke server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainContent headerTitle="Employee Schedules Import">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={15} /> Kembali
                    </button>
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                        <Download size={15} /> Download Template
                    </button>
                </div>

                {/* Kartu Utama */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                    {/* Title */}
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
                            <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0">
                                <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={18} />
                            </span>
                            Import Jadwal &amp; Libur Karyawan
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-11">
                            Upload file Excel (.xlsx, .xls) untuk memasukkan jadwal mingguan, cuti, atau event perusahaan secara massal.
                        </p>
                    </div>

                    {/* Legend tipe */}
                    <div className="flex flex-wrap gap-2 ml-11">
                        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                            <span key={key} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${cfg.style}`}>
                                {cfg.label}
                            </span>
                        ))}
                    </div>

                    {/* Banner Error */}
                    {error && (
                        <div className="p-3.5 bg-rose-50 text-rose-700 text-xs rounded-2xl flex items-center gap-2 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Banner Sukses */}
                    {success && (
                        <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs rounded-2xl flex items-center gap-2 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Dropzone Upload */}
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/20">
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" id="excel-file-input" />
                        <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                                <Upload size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {file ? (
                                        <span className="text-emerald-600 dark:text-emerald-400">{file.name}</span>
                                    ) : (
                                        "Klik untuk pilih file Excel atau seret ke sini"
                                    )}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Mendukung .xlsx, .xls, .csv</p>
                            </div>
                        </label>
                    </div>

                    {/* Tabel Pratinjau */}
                    {previewData.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Pratinjau Data</h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{previewData.length} baris — periksa sebelum disimpan</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewData([]);
                                        setFile(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                                >
                                    <Trash2 size={13} /> Hapus Semua
                                </button>
                            </div>

                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">#</th>
                                            <th className="p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact ID</th>
                                            <th className="p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tanggal</th>
                                            <th className="p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipe</th>
                                            <th className="p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Keterangan</th>
                                            <th className="p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                                            <th className="p-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {previewData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                                                <td className="p-3.5 text-slate-400 font-mono">{idx + 1}</td>
                                                <td className="p-3.5 font-mono font-semibold text-slate-700 dark:text-slate-200">{row.employee_id}</td>
                                                <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">{row.date}</td>
                                                <td className="p-3.5">
                                                    <TypeBadge type={row.type} />
                                                </td>
                                                <td className="p-3.5 text-slate-600 dark:text-slate-400 max-w-45 truncate">
                                                    {row.title || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                                                </td>
                                                <td className="p-3.5">
                                                    <StatusBadge status={row.status} />
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRow(idx)}
                                                        className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                                        title="Hapus baris ini"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tombol Simpan */}
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleSubmitImport}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet size={15} />
                                            Simpan &amp; Masukkan ke Kalender
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainContent>
    );
}

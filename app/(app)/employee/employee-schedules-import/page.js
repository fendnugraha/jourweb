"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import axios from "@/app/utils/axios";
import useEmployee from "@/app/hooks/useEmployee";
import Modal from "@/app/components/Modal";
import {
    Upload,
    FileSpreadsheet,
    Download,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Trash2,
    CheckCircle2,
    Bed,
    CalendarDays,
    Sparkles,
    Users,
    Search,
    FileCheck,
    Calendar,
    ArrowRight,
} from "lucide-react";
import MainContent from "../../main";

// Config tipe jadwal selaras dengan Calendar.jsx & EmployeeDayOff.js
const TYPE_CONFIG = {
    weekly_off: {
        label: "Libur Mingguan",
        style: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
        dot: "bg-amber-500",
        icon: Bed,
    },
    leave: {
        label: "Cuti",
        style: "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
        dot: "bg-rose-500",
        icon: CalendarDays,
    },
    company_event: {
        label: "Event Kantor",
        style: "bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
        dot: "bg-indigo-500",
        icon: Sparkles,
    },
};

const STATUS_CONFIG = {
    approved: {
        label: "Disetujui",
        style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    },
    pending: {
        label: "Menunggu",
        style: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    },
    rejected: {
        label: "Ditolak",
        style: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    },
};

function TypeBadge({ type }) {
    const cfg = TYPE_CONFIG[type];
    if (!cfg) {
        return (
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {type || "-"}
            </span>
        );
    }
    const IconComp = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${cfg.style}`}>
            <IconComp size={12} className="shrink-0" />
            <span>{cfg.label}</span>
        </span>
    );
}

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? {
        label: status || "approved",
        style: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    };
    return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border capitalize ${cfg.style}`}>{cfg.label}</span>;
}

export default function ImportSchedulePage() {
    const router = useRouter();
    const { employees = [] } = useEmployee();

    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [searchFilter, setSearchFilter] = useState("");
    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [empSearch, setEmpSearch] = useState("");

    // Map ID karyawan ke nama untuk visualisasi cepat
    const employeeMap = useMemo(() => {
        const map = new Map();
        employees.forEach((emp) => {
            const name = emp.contact?.name || emp.name || `Karyawan #${emp.id}`;
            map.set(Number(emp.id), name);
        });
        return map;
    }, [employees]);

    // Download template Excel
    const downloadTemplate = () => {
        const sampleEmp1 = employees[0]?.id || 1;
        const sampleEmp2 = employees[1]?.id || 2;
        const sampleEmp3 = employees[2]?.id || 3;

        const templateData = [
            { employee_id: sampleEmp1, date: "2026-11-01", type: "weekly_off", title: "Libur Mingguan", status: "approved" },
            { employee_id: sampleEmp2, date: "2026-11-15", type: "company_event", title: "Gathering Kantor", status: "approved" },
            { employee_id: sampleEmp3, date: "2026-11-20", type: "leave", title: "Cuti Tahunan", status: "pending" },
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template Jadwal");
        XLSX.writeFile(workbook, "template_import_jadwal.xlsx");
    };

    // Parsing Excel
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
                const workbook = XLSX.read(bstr, { type: "binary", cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const rawData = XLSX.utils.sheet_to_json(sheet);

                if (rawData.length === 0) {
                    setError("File Excel kosong atau format tidak sesuai.");
                    return;
                }

                // Normalisasi tanggal dan data
                const normalized = rawData.map((row) => {
                    let formattedDate = row.date;
                    if (row.date instanceof Date) {
                        formattedDate = format(row.date, "yyyy-MM-dd");
                    } else if (typeof row.date === "string") {
                        formattedDate = row.date.trim();
                    }
                    return {
                        employee_id: row.employee_id || row.contact_id || "",
                        date: formattedDate,
                        type: row.type || "weekly_off",
                        title: row.title || "",
                        status: row.status || "approved",
                    };
                });

                setPreviewData(normalized);
            } catch {
                setError("Gagal membaca file Excel. Pastikan format file benar.");
            }
        };
        reader.readAsBinaryString(uploadedFile);
    };

    const handleRemoveRow = (index) => {
        setPreviewData((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitImport = async () => {
        if (previewData.length === 0) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await axios.post("/api/employee-schedules/import-excel", {
                schedules: previewData,
            });

            setSuccess(response.data?.message || "Jadwal berhasil diimport ke kalender!");
            setPreviewData([]);
            setFile(null);
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat menyimpan data ke server.");
        } finally {
            setLoading(false);
        }
    };

    // Filter preview table
    const filteredPreview = useMemo(() => {
        if (!searchFilter.trim()) return previewData;
        const q = searchFilter.toLowerCase();
        return previewData.filter((row) => {
            const empName = employeeMap.get(Number(row.employee_id))?.toLowerCase() || "";
            return (
                String(row.employee_id).includes(q) ||
                empName.includes(q) ||
                String(row.date).includes(q) ||
                String(row.type).toLowerCase().includes(q) ||
                String(row.title).toLowerCase().includes(q)
            );
        });
    }, [previewData, searchFilter, employeeMap]);

    // Ringkasan per tipe jadwal
    const counts = useMemo(() => {
        const res = { weekly_off: 0, leave: 0, company_event: 0 };
        previewData.forEach((row) => {
            if (res[row.type] !== undefined) res[row.type]++;
        });
        return res;
    }, [previewData]);

    const filteredEmployees = useMemo(() => {
        if (!empSearch.trim()) return employees;
        const q = empSearch.toLowerCase();
        return employees.filter((emp) => {
            const name = (emp.contact?.name || emp.name || "").toLowerCase();
            return name.includes(q) || String(emp.id).includes(q);
        });
    }, [employees, empSearch]);

    return (
        <MainContent headerTitle="Import Jadwal Karyawan">
            <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">
                {/* ── TOP ACTION BAR ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/employee")}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    >
                        <ArrowLeft size={14} /> Kembali ke Karyawan
                    </button>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <button
                            type="button"
                            onClick={() => setIsEmpModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                        >
                            <Users size={14} className="text-indigo-500" /> Lihat ID Karyawan
                        </button>

                        <button
                            type="button"
                            onClick={downloadTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                            <Download size={14} /> Download Template Excel
                        </button>
                    </div>
                </div>

                {/* ── ALERT SUCCESS ── */}
                {success && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl flex items-center justify-between gap-3 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                                <p className="font-bold text-sm">Import Berhasil!</p>
                                <p className="text-[11px] opacity-90">{success}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push("/employee")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shrink-0"
                        >
                            <Calendar size={13} /> Buka Kalender <ArrowRight size={13} />
                        </button>
                    </div>
                )}

                {/* ── ALERT ERROR ── */}
                {error && (
                    <div className="p-4 bg-rose-50 text-rose-800 text-xs rounded-2xl flex items-center gap-3 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 shadow-xs">
                        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                        <div>
                            <p className="font-bold text-sm">Gagal Mengimpor</p>
                            <p className="text-[11px] opacity-90">{error}</p>
                        </div>
                    </div>
                )}

                {/* ── MAIN CARD: UPLOAD & FORMAT GUIDE ── */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center shrink-0 shadow-xs">
                                <FileSpreadsheet className="text-emerald-600 dark:text-emerald-400" size={20} />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">Upload File Jadwal &amp; Libur</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Mendukung format file spreadsheet{" "}
                                    <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">.xlsx, .xls, .csv</span>
                                </p>
                            </div>
                        </div>

                        {/* Format guide chips */}
                        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
                            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                                const IconComp = cfg.icon;
                                return (
                                    <span
                                        key={key}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${cfg.style}`}
                                    >
                                        <IconComp size={11} className="shrink-0" />
                                        {cfg.label}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upload Dropzone */}
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 sm:p-8 text-center transition-all bg-slate-50/40 dark:bg-slate-800/20 group">
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" id="excel-file-input" />
                        <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 group-hover:text-emerald-600 group-hover:scale-105 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs transition-all">
                                <Upload size={20} />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                                    {file ? (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                                            <FileCheck size={16} /> {file.name}
                                        </span>
                                    ) : (
                                        "Klik untuk memilih file Excel atau seret file ke sini"
                                    )}
                                </p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                                    Kolom wajib: <span className="font-mono font-semibold text-slate-600 dark:text-slate-400">employee_id, date, type</span>{" "}
                                    (optional: <span className="font-mono">title, status</span>)
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* ── PREVIEW SECTION ── */}
                    {previewData.length > 0 && (
                        <div className="space-y-4 pt-2">
                            {/* Stats Summary Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Data</span>
                                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono">{previewData.length}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block tracking-wider">
                                        Libur Mingguan
                                    </span>
                                    <span className="text-lg font-bold text-amber-700 dark:text-amber-300 font-mono">{counts.weekly_off}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
                                    <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block tracking-wider">Cuti</span>
                                    <span className="text-lg font-bold text-rose-700 dark:text-rose-300 font-mono">{counts.leave}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40">
                                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block tracking-wider">
                                        Event Kantor
                                    </span>
                                    <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300 font-mono">{counts.company_event}</span>
                                </div>
                            </div>

                            {/* Header row & search input */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input
                                        type="text"
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        placeholder="Cari karyawan, tanggal..."
                                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewData([]);
                                        setFile(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer self-end sm:self-auto"
                                >
                                    <Trash2 size={13} /> Reset Semua
                                </button>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800">
                                        <tr>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">#</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Karyawan</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tanggal</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipe Jadwal</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Keterangan</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                                            <th className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {filteredPreview.map((row, idx) => {
                                            const empName = employeeMap.get(Number(row.employee_id));
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                                                    <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                                                    <td className="p-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-800 dark:text-slate-100">{empName || "Karyawan"}</span>
                                                            <span className="font-mono text-[10px] text-slate-400">ID: {row.employee_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 font-mono font-medium text-slate-700 dark:text-slate-300">{row.date}</td>
                                                    <td className="p-3">
                                                        <TypeBadge type={row.type} />
                                                    </td>
                                                    <td className="p-3 text-slate-600 dark:text-slate-400 max-w-45 truncate">
                                                        {row.title || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                                                    </td>
                                                    <td className="p-3">
                                                        <StatusBadge status={row.status} />
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveRow(idx)}
                                                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                                                            title="Hapus baris ini"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Submit Button */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-xs text-slate-400">
                                    Siap menyimpan <strong className="text-slate-700 dark:text-slate-200 font-mono">{previewData.length}</strong> jadwal ke
                                    sistem.
                                </span>

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={handleSubmitImport}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            Menyimpan ke Kalender...
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

            {/* ── MODAL DAFTAR ID KARYAWAN ── */}
            <Modal isOpen={isEmpModalOpen} onClose={() => setIsEmpModalOpen(false)} title="Daftar ID Karyawan" maxWidth="max-w-md">
                <div className="space-y-3 text-xs">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Gunakan nomor ID ini pada kolom <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">employee_id</span> file
                        Excel Anda:
                    </p>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            value={empSearch}
                            onChange={(e) => setEmpSearch(e.target.value)}
                            placeholder="Cari nama karyawan..."
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl pr-1">
                        {filteredEmployees.map((emp) => (
                            <div
                                key={emp.id}
                                className="p-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <span className="font-medium text-slate-800 dark:text-slate-200">{emp.contact?.name || emp.name || `Karyawan #${emp.id}`}</span>
                                <span className="px-2 py-0.5 rounded-lg font-mono font-bold text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    ID: {emp.id}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </MainContent>
    );
}

"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import {
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    ArrowRight,
    User,
    Navigation,
    Search,
    Filter,
    X,
    RotateCw,
    Wallet,
    TrendingUp,
    Building,
    Plus,
    Edit3,
    AlertCircle,
} from "lucide-react";
import { calculateDeliveryETA } from "@/app/utils/format";

const HEADQUARTER_NAME = "Headquarter (HQ Pusat)";

// 1. DATA DUMMY AWAL
const DUMMY_DELIVERIES = [
    {
        id: "DEL-001",
        reference_no: "TRF/2026/08/0012",
        created_at: "2026-08-02 14:30",
        amount: 15000000,
        fee: 6500,
        status: "in_transit",
        sender_name: "Tim Kas Vault HQ",
        source_warehouse: { name: HEADQUARTER_NAME },
        source_account: "Vault Utama (Kas Besar)",
        receiver_name: "Bendahara Utama",
        destination_warehouse: { name: "Bank BCA Pusat", lat: -6.917464, lng: 107.619122 },
        destination_account: "BCA - 8830123991",
        courier_name: "Budi Santoso",
        courier_phone: "081234567890",
        courier_location: { lat: -6.89148, lng: 107.61065 },
    },
    {
        id: "DEL-002",
        reference_no: "TRF/2026/08/0013",
        created_at: "2026-08-02 15:10",
        amount: 8500000,
        fee: 0,
        status: "delivered",
        sender_name: "Tim Kas Vault HQ",
        source_warehouse: { name: HEADQUARTER_NAME },
        source_account: "Vault Utama (Kas Besar)",
        receiver_name: "Spv Operational",
        destination_warehouse: { name: "Konter Cabang Dago" },
        destination_account: "Kas Vault Brankas",
        courier_name: "Eko Prasetyo",
        courier_phone: "085712349988",
    },
    {
        id: "DEL-003",
        reference_no: "TRF/2026/08/0014",
        created_at: "2026-08-02 16:00",
        amount: 25000000,
        fee: 12500,
        status: "pending",
        sender_name: "Tim Kas Vault HQ",
        source_warehouse: { name: HEADQUARTER_NAME },
        source_account: "Vault Utama (Kas Besar)",
        receiver_name: "Admin Bank",
        destination_warehouse: { name: "Bank Mandiri" },
        destination_account: "Mandiri - 13100098231",
        courier_name: "Petugas Pick-up Bank",
        courier_phone: "-",
    },
];

// Fetcher mock dummy (akan diganti fetch asli saat API ready)
const mockFetcher = async () => DUMMY_DELIVERIES;

export default function DeliveryContent({ formatNumber = (val) => new Intl.NumberFormat("id-ID").format(val), formatDateTime = (val) => val }) {
    // 2. MENGGUNAKAN SWR DENGAN FALLBACK DATA DUMMY (TANPA EFFECT)
    const {
        data: deliveries = [],
        isValidating,
        mutate,
    } = useSWR("/api/deliveries-dummy", mockFetcher, {
        fallbackData: DUMMY_DELIVERIES,
        revalidateOnFocus: false,
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    // State Modal Edit Status
    const [editingItem, setEditingItem] = useState(null);
    const [newStatusValue, setNewStatusValue] = useState("");
    const [updateReason, setUpdateReason] = useState("");

    // State Modal Buat Pengiriman Baru
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newDeliveryForm, setNewDeliveryForm] = useState({
        destination_name: "",
        destination_account: "",
        amount: "",
        courier_name: "",
        receiver_name: "",
    });

    // 3. STATISTIK (Dihitung Reaktif dari Data SWR)
    const stats = useMemo(() => {
        const totalAmount = deliveries.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const inTransitCount = deliveries.filter((i) => i.status === "in_transit").length;
        const deliveredCount = deliveries.filter((i) => i.status === "delivered").length;
        return { totalAmount, inTransitCount, deliveredCount };
    }, [deliveries]);

    // 4. HITUNG JUMLAH STATUS
    const statusCounts = useMemo(() => {
        return {
            all: deliveries.length,
            in_transit: deliveries.filter((i) => i.status === "in_transit").length,
            delivered: deliveries.filter((i) => i.status === "delivered").length,
            pending: deliveries.filter((i) => i.status === "pending").length,
            cancelled: deliveries.filter((i) => i.status === "cancelled").length,
        };
    }, [deliveries]);

    // 5. FILTER DATA SWR
    const filteredData = useMemo(() => {
        return deliveries.filter((item) => {
            const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
            const query = searchTerm.toLowerCase().trim();
            const matchesSearch =
                !query ||
                item.reference_no?.toLowerCase().includes(query) ||
                item.courier_name?.toLowerCase().includes(query) ||
                item.destination_warehouse?.name?.toLowerCase().includes(query) ||
                item.receiver_name?.toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [deliveries, searchTerm, selectedStatus]);

    // 6. UPDATE STATUS VIA SWR MUTATE
    const handleSaveStatus = (e) => {
        e.preventDefault();
        if (!editingItem) return;

        // Mutate cache SWR lokal secara instan
        const updatedList = deliveries.map((item) => (item.id === editingItem.id ? { ...item, status: newStatusValue } : item));
        mutate(updatedList, false);

        setEditingItem(null);
        setUpdateReason("");
    };

    // 7. TAMBAH PENGIRIMAN BARU VIA SWR MUTATE
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        const newEntry = {
            id: `DEL-${Date.now().toString().slice(-3)}`,
            reference_no: `TRF/2026/08/00${Math.floor(10 + Math.random() * 90)}`,
            created_at: new Date().toISOString().replace("T", " ").slice(0, 16),
            amount: Number(newDeliveryForm.amount) || 0,
            fee: 0,
            status: "pending",
            sender_name: "Tim Kas Vault HQ",
            source_warehouse: { name: HEADQUARTER_NAME },
            source_account: "Vault Utama (Kas Besar)",
            receiver_name: newDeliveryForm.receiver_name || "Penerima",
            destination_warehouse: { name: newDeliveryForm.destination_name },
            destination_account: newDeliveryForm.destination_account,
            courier_name: newDeliveryForm.courier_name || "Belum Ditentukan",
            courier_phone: "-",
        };

        // Tambah data baru ke SWR cache
        mutate([newEntry, ...deliveries], false);

        setIsCreateModalOpen(false);
        setNewDeliveryForm({
            destination_name: "",
            destination_account: "",
            amount: "",
            courier_name: "",
            receiver_name: "",
        });
    };

    const renderStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "delivered":
            case "selesai":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                        <CheckCircle2 className="w-3 h-3" /> Selesai
                    </span>
                );
            case "in_transit":
            case "dalam_proses":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                        <Truck className="w-3 h-3 animate-pulse" /> Proses
                    </span>
                );
            case "cancelled":
            case "batal":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                        <XCircle className="w-3 h-3" /> Batal
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                );
        }
    };

    const statusOptions = [
        { key: "all", label: "Semua", count: statusCounts.all },
        { key: "in_transit", label: "Proses", icon: Truck, count: statusCounts.in_transit },
        { key: "delivered", label: "Selesai", icon: CheckCircle2, count: statusCounts.delivered },
        { key: "pending", label: "Pending", icon: Clock, count: statusCounts.pending },
        { key: "cancelled", label: "Batal", icon: XCircle, count: statusCounts.cancelled },
    ];

    return (
        <div className="space-y-4">
            {/* HEADER CARD & ACTION BUTTONS */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Building className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                    Pengiriman dari HQ Pusat
                                </h3>
                                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-md">
                                    ORIGIN FIXED
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-400">Pusat kontrol & distribusi dana kas ke cabang/bank</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Buat Pengiriman Baru</span>
                    </button>
                </div>

                {/* STATS SUMMARY */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Disalurkan</span>
                            <span className="text-sm sm:text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                                Rp {formatNumber(stats.totalAmount)}
                            </span>
                        </div>
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sedang OTW</span>
                            <span className="text-sm sm:text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                                {stats.inTransitCount} <span className="text-xs font-normal text-slate-400">Kurir</span>
                            </span>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                            <Truck className="w-4 h-4 animate-pulse" />
                        </div>
                    </div>

                    <div className="hidden sm:flex bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-xl items-center justify-between">
                        <div>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Sampai Tujuan</span>
                            <span className="text-sm sm:text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                {stats.deliveredCount} <span className="text-xs font-normal text-slate-400">Berhasil</span>
                            </span>
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* SEARCH & REFRESH */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari Ref, Kurir, Cabang Tujuan / Bank..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => mutate()}
                        title="Muat ulang data SWR"
                        className="p-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors shrink-0"
                    >
                        <RotateCw className={`w-4 h-4 ${isValidating ? "animate-spin text-indigo-500" : ""}`} />
                    </button>
                </div>

                {/* STATUS FILTER PILLS */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-1 flex items-center gap-1 shrink-0 select-none">
                        <Filter className="w-3 h-3 text-indigo-500" /> Status:
                    </span>
                    {statusOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = selectedStatus === opt.key;

                        return (
                            <button
                                key={opt.key}
                                onClick={() => setSelectedStatus(opt.key)}
                                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 select-none ${
                                    isActive
                                        ? "text-white"
                                        : "text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/60"
                                }`}
                            >
                                {/* Background aktif yang meluncur/sliding */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeStatusTab"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        className="absolute inset-0 bg-indigo-600 rounded-xl shadow-sm shadow-indigo-500/30"
                                    />
                                )}

                                {/* Konten Tab (diberi z-10 & motion.span agar animasi angka count mulus) */}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {Icon && <Icon className="w-3.5 h-3.5" />}
                                    <span>{opt.label}</span>
                                    <motion.span
                                        key={opt.count} // Bikin angka mentransisi jika nilainya berubah
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.15 }}
                                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full transition-colors ${
                                            isActive ? "bg-white/20 text-white" : "bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                        }`}
                                    >
                                        {opt.count}
                                    </motion.span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* LIST / TABLE CONTENT */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {/* MOBILE CARDS */}
                <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredData.length > 0 ? (
                        filteredData.map((item) => {
                            const eta =
                                typeof calculateDeliveryETA === "function"
                                    ? calculateDeliveryETA(
                                          item.courier_location?.lat,
                                          item.courier_location?.lng,
                                          item.destination_warehouse?.lat,
                                          item.destination_warehouse?.lng,
                                      )
                                    : { estimatedText: "-", distanceKm: "0" };

                            return (
                                <div key={item.id} className="p-4 space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <Send className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                                    {item.reference_no}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block font-mono">{formatDateTime(item.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {renderStatusBadge(item.status)}
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setNewStatusValue(item.status);
                                                }}
                                                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {item.status === "in_transit" && item.courier_location && (
                                        <div className="flex items-center justify-between bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 px-3 py-2 rounded-xl text-xs">
                                            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                                                <Navigation className="w-3.5 h-3.5 animate-bounce" />
                                                <span>Estimasi Tiba:</span>
                                            </div>
                                            <div className="font-mono font-bold text-indigo-700 dark:text-indigo-300">
                                                {eta.estimatedText} <span className="text-[10px] font-normal text-indigo-400">({eta.distanceKm} km)</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-slate-50/70 dark:bg-slate-850/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Nominal Disalurkan</span>
                                        <span className="font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                                            Rp {formatNumber(item.amount)}
                                        </span>
                                    </div>

                                    <div className="bg-slate-50/40 dark:bg-slate-850/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] text-indigo-500 font-bold uppercase inline-flex items-center gap-0.5">
                                                    <Building className="w-2.5 h-2.5" /> HQ Pusat
                                                </span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300 block">Vault Utama</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mx-2" />
                                            <div className="space-y-0.5 text-right">
                                                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tujuan</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                                    {item.destination_warehouse?.name || item.receiver_name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block font-mono">{item.destination_account}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-slate-400" />
                                            <span>
                                                Kurir: <strong className="text-slate-600 dark:text-slate-300 font-medium">{item.courier_name}</strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                            <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                            <p>Tidak ada data yang sesuai kriteria pencarian.</p>
                        </div>
                    )}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                <th scope="col" className="px-6 py-4">
                                    No. Ref & Waktu
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Tujuan Pengiriman
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Kurir / ETA
                                </th>
                                <th scope="col" className="px-6 py-4 text-right">
                                    Nominal
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Aksi Pusat
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 font-mono">
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => {
                                    const eta =
                                        typeof calculateDeliveryETA === "function"
                                            ? calculateDeliveryETA(
                                                  item.courier_location?.lat,
                                                  item.courier_location?.lng,
                                                  item.destination_warehouse?.lat,
                                                  item.destination_warehouse?.lng,
                                              )
                                            : { estimatedText: "-", distanceKm: "0" };

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.reference_no}</span>
                                                <span className="text-[11px] text-slate-400 font-normal block">{formatDateTime(item.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4 font-sans">
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                                    {item.destination_warehouse?.name || item.receiver_name}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-mono block">{item.destination_account}</span>
                                            </td>
                                            <td className="px-6 py-4 font-sans">
                                                <span className="text-slate-700 dark:text-slate-300 font-medium block">{item.courier_name}</span>
                                                {item.status === "in_transit" && item.courier_location ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                                        <Navigation className="w-3 h-3" /> {eta.estimatedText} ({eta.distanceKm} km)
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 block">{item.courier_phone}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                                Rp {formatNumber(item.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">{renderStatusBadge(item.status)}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap font-sans">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setNewStatusValue(item.status);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 rounded-lg transition-colors"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-sans">
                                        <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                        <p>Tidak ada pengiriman dari HQ yang sesuai pencarian.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL EDIT STATUS */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <Edit3 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Update Status Manual (Pusat)</h3>
                                    <p className="text-[11px] text-slate-400 font-mono">{editingItem.reference_no}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveStatus} className="p-4 space-y-4 text-xs">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-start gap-2 text-amber-700 dark:text-amber-400">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="text-[11px]">Status akan diperbarui secara langsung di memori SWR.</p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Pilih Status Baru:</label>
                                <select
                                    value={newStatusValue}
                                    onChange={(e) => setNewStatusValue(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                                >
                                    <option value="pending">Pending (Menunggu Pick-up)</option>
                                    <option value="in_transit">Proses (Dalam Pengiriman)</option>
                                    <option value="delivered">Selesai (Sampai Tujuan)</option>
                                    <option value="cancelled">Batal (Dibatalkan Pusat)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Alasan (Opsional):</label>
                                <textarea
                                    rows={3}
                                    placeholder="Catatan update manual..."
                                    value={updateReason}
                                    onChange={(e) => setUpdateReason(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL BUAT PENGIRIMAN */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                    <Plus className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Buat Pengiriman Kas Baru</h3>
                                    <p className="text-[11px] text-slate-400">Asal: Vault Utama (HQ Pusat)</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-4 space-y-3.5 text-xs">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-slate-300">Tujuan (Cabang / Bank):</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Konter Cabang Dago / Bank BCA Pusat"
                                    value={newDeliveryForm.destination_name}
                                    onChange={(e) => setNewDeliveryForm({ ...newDeliveryForm, destination_name: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">Akun / Rekening Tujuan:</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: BCA - 8830123991"
                                        value={newDeliveryForm.destination_account}
                                        onChange={(e) => setNewDeliveryForm({ ...newDeliveryForm, destination_account: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">Nominal Uang (Rp):</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Contoh: 10000000"
                                        value={newDeliveryForm.amount}
                                        onChange={(e) => setNewDeliveryForm({ ...newDeliveryForm, amount: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Kurir:</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Budi Santoso"
                                        value={newDeliveryForm.courier_name}
                                        onChange={(e) => setNewDeliveryForm({ ...newDeliveryForm, courier_name: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="font-semibold text-slate-700 dark:text-slate-300">Penerima Target:</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Bendahara Utama"
                                        value={newDeliveryForm.receiver_name}
                                        onChange={(e) => setNewDeliveryForm({ ...newDeliveryForm, receiver_name: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl"
                                >
                                    Batal
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm">
                                    Rilis Pengiriman
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

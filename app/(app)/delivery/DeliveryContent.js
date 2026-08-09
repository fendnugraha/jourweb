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
    Bike,
    Footprints,
    Flame,
    AlertTriangle,
    ArrowUpRight,
    Minus,
} from "lucide-react";
import { calculateDeliveryETA, formatDateTime, formatNumber } from "@/app/utils/format";
import useWarehouse from "@/app/hooks/useWarehouse";
import Modal from "@/app/components/Modal";
import DeliveryForm from "./DeliveryForm";
import useEmployee from "@/app/hooks/useEmployee";
import Notification from "@/app/components/Notification";
import { useDeliveries } from "@/app/hooks/useDeliveries";
import UpdateDelivery from "./UpdateDelivery";

export default function DeliveryContent() {
    // 2. MENGGUNAKAN SWR DENGAN FALLBACK DATA DUMMY (TANPA EFFECT)
    const { deliveries, isLoading, isValidating, mutate } = useDeliveries();

    const deliveriesData = deliveries?.map((item) => ({
        id: item.id,
        // Invoice, amount, description ada di relasi journal
        reference_no: item.journal?.invoice ?? "-",
        journal_id: item.journal?.id ?? "-",
        created_at: item.created_at,
        amount: item.journal?.amount ?? 0,
        fee: item.journal?.fee_amount ?? 0,
        status: item.status,
        priority: item.priority,

        // Source / Pengirim
        sender_name: item.source_account?.warehouse?.name ?? "-",
        source_warehouse: {
            name: item.source_account?.warehouse?.name ?? "-",
            lat: item.source_account?.warehouse?.latitude ? Number(item.source_account.warehouse.latitude) : null,
            lng: item.source_account?.warehouse?.longitude ? Number(item.source_account.warehouse.longitude) : null,
        },
        source_account: item.source_account?.name ?? "-", // Nama Akun Kas / COA

        // Destination / Penerima
        receiver_name: item.receiver?.contact?.name ?? "-",
        destination_warehouse: {
            name: item.destination_account?.warehouse?.name ?? "-",
            lat: item.destination_account?.warehouse?.latitude ? Number(item.destination_account.warehouse.latitude) : null,
            lng: item.destination_account?.warehouse?.longitude ? Number(item.destination_account.warehouse.longitude) : null,
        },
        destination_account: item.destination_account?.name ?? "-", // Nama Akun Kas / COA

        // Courier
        courier_name: item.courier?.contact?.name ?? "Tanpa Kurir",
        courier_phone: item.courier?.contact?.phone ?? "-", // Pakai phone, bukan email
        courier_location: item.courier?.contact?.user?.latitude
            ? {
                  lat: Number(item.courier.contact.user.latitude),
                  lng: Number(item.courier.contact.user.longitude),
              }
            : null,
    }));

    const [notification, setNotification] = useState(null);

    const { warehouses } = useWarehouse();
    const { employees } = useEmployee();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    // State Modal Buat Pengiriman Baru
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalName, setModalName] = useState("create");
    const [modalTitle, setModalTitle] = useState("Buat Pengiriman");
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    // 3. STATISTIK (Dihitung Reaktif dari Data SWR)
    const stats = useMemo(() => {
        const totalAmount = deliveriesData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const inTransitCount = deliveriesData.filter((i) => i.status === "in_transit").length;
        const deliveredCount = deliveriesData.filter((i) => i.status === "delivered").length;
        return { totalAmount, inTransitCount, deliveredCount };
    }, [deliveriesData]);

    // 4. HITUNG JUMLAH STATUS
    const statusCounts = useMemo(() => {
        return {
            all: deliveriesData.length,
            in_transit: deliveriesData.filter((i) => i.status === "in_transit").length,
            delivered: deliveriesData.filter((i) => i.status === "delivered").length,
            pending: deliveriesData.filter((i) => i.status === "pending").length,
            picked_up: deliveriesData.filter((i) => i.status === "picked_up").length,
        };
    }, [deliveriesData]);

    // 5. FILTER DATA SWR
    const filteredData = useMemo(() => {
        return deliveriesData.filter((item) => {
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
    }, [deliveriesData, searchTerm, selectedStatus]);

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
                        <Bike className="w-3 h-3 animate-pulse" /> Proses
                    </span>
                );
            case "picked_up":
            case "diambil":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40">
                        <Footprints className="w-3 h-3" /> Di Ambil
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

    const renderPriorityBadge = (priority) => {
        const normalizedPriority = priority?.toLowerCase() || "low";

        const config = {
            low: {
                label: "Low",
                icon: Minus,
                className: "bg-slate-50 text-slate-500 ring-slate-200/60 dark:bg-slate-900/60 dark:text-slate-400 dark:ring-slate-800",
            },
            medium: {
                label: "Medium",
                icon: ArrowUpRight,
                className: "bg-sky-50/80 text-sky-600 ring-sky-200/60 dark:bg-sky-950/40 dark:text-sky-400 dark:ring-sky-800/60",
            },
            high: {
                label: "High",
                icon: AlertTriangle,
                className: "bg-amber-50/80 text-amber-700 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-800/60",
            },
            urgent: {
                label: "Urgent",
                icon: Flame,
                className:
                    "bg-rose-50 text-rose-600 ring-rose-300/80 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-800/80 shadow-sm shadow-rose-500/10",
                isPulse: true,
            },
        };

        const current = config[normalizedPriority] || config.low;
        const Icon = current.icon;

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ring-1 ring-inset transition-all ${current.className}`}
            >
                {current.isPulse ? (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                ) : (
                    <Icon className="w-3 h-3 stroke-[2.5]" />
                )}
                <span>{current.label}</span>
            </span>
        );
    };

    const statusOptions = [
        { key: "all", label: "Semua", count: statusCounts.all },
        {
            key: "in_transit",
            label: "Proses",
            icon: Bike,
            count: statusCounts.in_transit,
        },
        {
            key: "delivered",
            label: "Selesai",
            icon: CheckCircle2,
            count: statusCounts.delivered,
        },
        {
            key: "pending",
            label: "Pending",
            icon: Clock,
            count: statusCounts.pending,
        },
        {
            key: "picked_up",
            label: "Di Ambil",
            icon: Footprints,
            count: statusCounts.picked_up,
        },
    ];

    return (
        <div className="space-y-4">
            <Notification message={notification} onClose={() => setNotification(null)} />
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
                        onClick={() => {
                            setModalName("create");
                            setModalTitle("Buat Pengiriman");
                            setSelectedDelivery(null);
                            setIsModalOpen(true);
                        }}
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
                <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
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
                                                    setModalName("edit");
                                                    setModalTitle("Edit Pengiriman");
                                                    setSelectedDelivery(item);
                                                    setIsModalOpen(true);
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
                                            {/* <div className="space-y-0.5">
                        <span className="text-[10px] text-indigo-500 font-bold uppercase inline-flex items-center gap-0.5">
                          <Building className="w-2.5 h-2.5" /> HQ Pusat
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          Vault Utama
                        </span>
                      </div> */}
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
                <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200/60 bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800/60 dark:bg-slate-950/40">
                                    <th scope="col" className="px-6 py-4">
                                        No. Ref & Waktu
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Tujuan Pengiriman
                                    </th>
                                    <th scope="col" className="px-6 py-4">
                                        Kurir / ETA
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center">
                                        Prioritas
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right">
                                        Nominal
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
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
                                            <tr
                                                key={item.id}
                                                className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 ease-in-out"
                                            >
                                                {/* No Ref & Waktu */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-100 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {item.reference_no}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                                                        {formatDateTime(item.created_at)}
                                                    </span>
                                                </td>

                                                {/* Tujuan */}
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-45">
                                                        {item.destination_warehouse?.name || item.receiver_name}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{item.destination_account}</span>
                                                </td>

                                                {/* Kurir / ETA */}
                                                <td className="px-6 py-4">
                                                    <span className="text-slate-700 dark:text-slate-300 font-medium block">{item.courier_name}</span>
                                                    {item.status === "in_transit" && item.courier_location ? (
                                                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full mt-1 border border-indigo-100 dark:border-indigo-900/50">
                                                            <Navigation className="w-2.5 h-2.5 animate-pulse" />
                                                            {eta.estimatedText} ({eta.distanceKm} km)
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 block font-mono mt-0.5">{item.courier_phone}</span>
                                                    )}
                                                </td>

                                                {/* Prioritas */}
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    {renderPriorityBadge(item.priority || item.priority_level)}
                                                </td>

                                                {/* Nominal */}
                                                <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                                                    <span className="text-slate-400 text-xs font-normal mr-1">Rp</span>
                                                    {formatNumber(item.amount)}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 text-center whitespace-nowrap">{renderStatusBadge(item.status)}</td>

                                                {/* Aksi */}
                                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            setModalName("edit");
                                                            setModalTitle("Edit Pengiriman");
                                                            setSelectedDelivery(item);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-100/80 hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 dark:hover:border-indigo-800 rounded-xl transition-all shadow-2xs hover:shadow-sm active:scale-95"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span>Edit</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                            <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                            <p className="font-medium text-sm">Tidak ada pengiriman yang sesuai pencarian.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                {modalName === "create" && (
                    <DeliveryForm warehouses={warehouses} employees={employees} isModalOpen={setIsModalOpen} notification={setNotification} mutate={mutate} />
                )}
                {modalName === "edit" && (
                    <UpdateDelivery selectedDelivery={selectedDelivery} isModalOpen={setIsModalOpen} notification={setNotification} mutate={mutate} />
                )}
            </Modal>
        </div>
    );
}

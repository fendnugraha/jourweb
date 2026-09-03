"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  PackageCheck,
  ShieldCheck,
  AlertTriangle,
  Siren,
  Search,
  CheckCircle,
  Undo,
  Loader2,
  Truck,
  UserCheck,
  Building2,
  FileText,
  Sparkles,
  AlertCircle,
  Banknote,
  Calculator,
  RotateCcw,
  Store,
} from "lucide-react";
import MainContent from "@/app/(app)/main";
import Dropdown from "@/app/components/Dropdown";
import useWarehouse from "@/app/hooks/useWarehouse";
import useEmployee from "@/app/hooks/useEmployee";
import Notification from "@/app/components/Notification";
import TabSwitcher from "@/app/components/TabSwitcher";
import axios from "@/app/utils/axios";
import { formatRupiah, formatNumber } from "@/app/utils/format";

export default function CreateDeliveryPage() {
  return (
    <MainContent headerTitle="Buat Pengiriman Kas">
      <CreateDeliveryContent />
    </MainContent>
  );
}

function CreateDeliveryContent() {
  const router = useRouter();
  const { warehouses } = useWarehouse();
  const { employees } = useEmployee();

  const [inputMode, setInputMode] = useState("single");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Single Form State
  const [cart, setCart] = useState([]);
  const [singleForm, setSingleForm] = useState({
    destination_id: "",
    amount: "",
    courier_id: "",
    description: "",
    trx_type: "Mutasi Kas",
    type: "delivery",
    priority: "low",
  });

  // Multiple Form State
  const [multipleSearch, setMultipleSearch] = useState("");
  const [multipleForm, setMultipleForm] = useState({
    destination_ids: [],
    amount: "",
    courier_id: "",
    description: "",
    trx_type: "Mutasi Kas",
    type: "delivery",
    priority: "low",
  });

  // Options Data
  const warehouseOptions = [
    { value: "", label: "Pilih Cabang Tujuan" },
    ...(warehouses || [])
      .filter((w) => w.id !== 1 && w.status === 1)
      .map((w) => ({ value: w.id, label: w.name })),
  ];

  const employeeOptions = [
    { value: "", label: "Pilih Kurir Pengantar" },
    ...(employees || [])
      .filter((emp) => emp.contact?.user?.role === "Courier")
      .map((emp) => ({ value: emp.id, label: emp.contact?.name })),
  ];

  const filteredWarehouses = (warehouses || []).filter(
    (wh) =>
      wh.name?.toLowerCase().includes(multipleSearch.toLowerCase()) &&
      wh.id !== 1 &&
      wh.status === 1,
  );

  // Quick amount chips helper
  const quickAmounts = [100000, 500000, 1000000, 5000000, 10000000];

  const handleAddQuickAmountSingle = (addVal) => {
    const current = parseFloat(singleForm.amount) || 0;
    setSingleForm((prev) => ({
      ...prev,
      amount: (current + addVal).toString(),
    }));
  };

  const handleAddQuickAmountMultiple = (addVal) => {
    const current = parseFloat(multipleForm.amount) || 0;
    setMultipleForm((prev) => ({
      ...prev,
      amount: (current + addVal).toString(),
    }));
  };

  // --- HANDLERS ---
  const handleAddToCart = (e) => {
    e.preventDefault();

    if (
      !singleForm.destination_id ||
      !singleForm.amount ||
      parseFloat(singleForm.amount) <= 0
    ) {
      setNotification("Cabang Tujuan dan Nominal Kas valid wajib diisi!");
      return;
    }

    if (singleForm.type === "delivery" && !singleForm.courier_id) {
      setNotification(
        "Kurir pengantar wajib dipilih untuk pengiriman via kurir!",
      );
      return;
    }

    const selectedWarehouse = warehouses?.find(
      (w) => w.id === parseInt(singleForm.destination_id),
    );
    const selectedCourier = employees?.find(
      (e) => e.id === parseInt(singleForm.courier_id),
    );

    setCart((prevCart) => [
      ...prevCart,
      {
        ...singleForm,
        id: Date.now(),
        destination_name: selectedWarehouse?.name || "Cabang Tujuan",
        courier_name:
          singleForm.type === "delivery"
            ? selectedCourier?.contact?.name || "Kurir Belum Dipilih"
            : "Ambil Sendiri (HQ)",
      },
    ]);

    // Keep courier_id & type for convenience when queuing multiple items for the same courier
    setSingleForm((prev) => ({
      ...prev,
      destination_id: "",
      amount: "",
      description: "",
      priority: "low",
    }));
  };

  const handleRemoveFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
  };

  const handleSubmitSingle = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const response = await axios.post("/api/create-delivery", {
        deliveries: cart,
      });
      setNotification(response.data.message || "Pengiriman berhasil dirilis!");
      setTimeout(() => router.push("/delivery"), 1000);
    } catch (e) {
      setNotification(
        e.response?.data?.message ||
          "Terjadi kesalahan sistem saat merilis pengiriman.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWhSelect = (cashId) => {
    if (!cashId) return;
    setMultipleForm((prev) => {
      const exists = prev.destination_ids.includes(cashId);
      return {
        ...prev,
        destination_ids: exists
          ? prev.destination_ids.filter((id) => id !== cashId)
          : [...prev.destination_ids, cashId],
      };
    });
  };

  const handleSelectAll = () => {
    const allCashIds = filteredWarehouses
      .map((w) => w.primary_cash?.id)
      .filter(Boolean);
    setMultipleForm((prev) => ({
      ...prev,
      destination_ids: Array.from(
        new Set([...prev.destination_ids, ...allCashIds]),
      ),
    }));
  };

  const handleDeselectAll = () => {
    setMultipleForm((prev) => ({ ...prev, destination_ids: [] }));
  };

  const handleSubmitMultiple = async (e) => {
    e.preventDefault();
    if (multipleForm.destination_ids.length === 0) {
      setNotification("Pilih minimal satu cabang tujuan.");
      return;
    }

    if (!multipleForm.amount || parseFloat(multipleForm.amount) <= 0) {
      setNotification("Nominal per cabang wajib diisi!");
      return;
    }

    if (multipleForm.type === "delivery" && !multipleForm.courier_id) {
      setNotification(
        "Pilih kurir terlebih dahulu untuk pengiriman via kurir!",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "/api/create-delivery-multiple",
        multipleForm,
      );
      setNotification(
        response.data.message || "Pengiriman masal berhasil dirilis!",
      );
      setTimeout(() => router.push("/delivery"), 1000);
    } catch (e) {
      setNotification(
        e.response?.data?.message ||
          "Terjadi kesalahan sistem saat memproses transaksi masal.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/50">
            <Siren className="w-3.5 h-3.5 animate-pulse" /> Urgent
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/50">
            <AlertTriangle className="w-3.5 h-3.5" /> Tinggi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5" /> Normal
          </span>
        );
    }
  };

  // Calculate sum for multiple mode
  const multipleTotalAmount =
    (multipleForm.destination_ids.length || 0) *
    (parseFloat(multipleForm.amount) || 0);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <Notification
        message={notification}
        onClose={() => setNotification(null)}
      />

      {/* HEADER NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 px-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/delivery")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Daftar Pengiriman</span>
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>
                {inputMode === "single"
                  ? "Input Pengiriman Satuan"
                  : "Input Pengiriman Masal"}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {inputMode === "single"
                ? "Tambahkan satu per satu transaksi kas ke antrean pengiriman"
                : "Kirim alokasi kas secara serentak ke banyak cabang sekaligus"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400 font-medium hidden md:inline-block">
            Mode Input:
          </span>
          <TabSwitcher
            buttonList={[
              { value: "single", label: "Single Mode" },
              { value: "multiple", label: "Multiple Mode" },
            ]}
            activeTab={inputMode}
            setActiveTab={setInputMode}
          />
        </div>
      </div>

      {/* SINGLE MODE SECTION */}
      {inputMode === "single" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT COLUMN: FORM INPUT */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Form Detail Pengiriman
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Kelengkapan data pengeluaran kas
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddToCart} className="p-4 space-y-4">
              {/* Cabang Tujuan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Cabang
                    Tujuan
                  </span>
                  <span className="text-[10px] text-rose-500 font-medium">
                    * Wajib
                  </span>
                </label>
                <Dropdown
                  options={warehouseOptions}
                  selectedValue={singleForm.destination_id}
                  onChange={(val) =>
                    setSingleForm({ ...singleForm, destination_id: val })
                  }
                />
              </div>

              {/* Amount Input & Quick Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-slate-400" /> Nominal
                    Kas
                  </span>
                  <span className="text-[10px] text-rose-500 font-medium">
                    * Wajib
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-xs font-mono font-bold select-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={singleForm.amount}
                    onChange={(e) =>
                      setSingleForm({ ...singleForm, amount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-2.5 pl-10 pr-3.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddQuickAmountSingle(amt)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                    >
                      +
                      {amt >= 1000000
                        ? `${amt / 1000000}Jt`
                        : `${amt / 1000}Rb`}
                    </button>
                  ))}
                  {singleForm.amount ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSingleForm({ ...singleForm, amount: "" })
                      }
                      className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-medium border border-rose-200/50 dark:border-rose-900/50 transition-colors"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>

                {/* Formatted Nominal Preview */}
                {singleForm.amount && !isNaN(parseFloat(singleForm.amount)) && (
                  <div className="flex items-center gap-1.5 pt-1 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatRupiah(parseFloat(singleForm.amount))}</span>
                  </div>
                )}
              </div>

              {/* Tipe & Kurir Section */}
              <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Metode Pengiriman
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        singleForm.type === "delivery"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                      onClick={() =>
                        setSingleForm({ ...singleForm, type: "delivery" })
                      }
                    >
                      Di Kirim (Kurir)
                    </button>
                    <button
                      type="button"
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        singleForm.type === "pick_up"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                      onClick={() =>
                        setSingleForm({ ...singleForm, type: "pick_up" })
                      }
                    >
                      Ambil Sendiri
                    </button>
                  </div>
                </div>

                {/* Dynamic Kurir Input */}
                {singleForm.type === "delivery" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        <UserCheck className="w-3.5 h-3.5" /> Kurir Pengantar
                      </span>
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900/40">
                        * Wajib
                      </span>
                    </label>
                    <Dropdown
                      options={employeeOptions}
                      selectedValue={singleForm.courier_id}
                      onChange={(val) =>
                        setSingleForm({ ...singleForm, courier_id: val })
                      }
                    />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-start gap-2 text-amber-700 dark:text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Cabang penerima akan datang mengambil dana langsung ke
                      Pusat (HQ).
                    </span>
                  </div>
                )}
              </div>

              {/* Prioritas Pengiriman */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tingkat Prioritas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "low",
                      label: "Normal",
                      icon: ShieldCheck,
                      activeClass:
                        "border-slate-400 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
                    },
                    {
                      id: "high",
                      label: "Tinggi",
                      icon: AlertTriangle,
                      activeClass:
                        "border-amber-500 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
                    },
                    {
                      id: "urgent",
                      label: "Urgent",
                      icon: Siren,
                      activeClass:
                        "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
                    },
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = singleForm.priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setSingleForm({ ...singleForm, priority: p.id })
                        }
                        className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? p.activeClass +
                              " ring-2 ring-slate-400/10 shadow-2xs"
                            : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 ${p.id === "urgent" && isSelected ? "animate-pulse" : ""}`}
                        />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description Memo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deskripsi / Catatan Transaksi
                </label>
                <input
                  type="text"
                  value={singleForm.description}
                  onChange={(e) =>
                    setSingleForm({
                      ...singleForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Tulis catatan pendukung jika ada..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" /> Masukkan Antrean
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: ANTREAN LIST */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col min-h-115 max-h-[640px]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <span>Antrean Pengiriman</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {cart.length} Item
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Daftar item yang siap dirilis serentak
                  </p>
                </div>
              </div>

              {cart.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-[11px] font-medium text-slate-400 hover:text-rose-500 transition-colors"
                    title="Kosongkan Antrean"
                  >
                    Kosongkan
                  </button>
                  <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Total Rilis Kas
                    </span>
                    <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(
                        cart.reduce(
                          (sum, item) => sum + (parseFloat(item.amount) || 0),
                          0,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* LIST CONTENT */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <div className="h-full min-h-75 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="p-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3 shadow-2xs">
                      <PackageCheck className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Antrean Pengiriman Kosong
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-relaxed">
                      Lengkapi form di sebelah kiri lalu klik &quot;Masukkan
                      Antrean&quot; untuk mengumpulkan item sebelum dirilis.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3 group hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                            {item.destination_name}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(parseFloat(item.amount))}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">
                            •
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />{" "}
                            {item.courier_name}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate pt-0.5">
                            &quot;{item.description}&quot;
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors shrink-0"
                        title="Hapus dari Antrean"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* SUBMIT BUTTON BAR */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2 shrink-0">
              <div className="text-xs text-slate-400 font-medium hidden sm:block">
                {cart.length > 0
                  ? `${cart.length} pengiriman siap dirilis`
                  : "Belum ada item"}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => router.push("/delivery")}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={loading || cart.length === 0}
                  onClick={handleSubmitSingle}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading
                    ? "Memproses Rilis..."
                    : `Rilis ${cart.length} Pengiriman Sekarang`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTIPLE MODE SECTION */}
      {inputMode === "multiple" && (
        <form
          onSubmit={handleSubmitMultiple}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Pengiriman Masal Multiple Cabang
                </h2>
                <p className="text-[11px] text-slate-400">
                  Kirim nominal serentak ke banyak cabang sekaligus
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: CABANG SELECTOR */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Pilih Cabang Tujuan</span>
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                  {multipleForm.destination_ids.length} Cabang Dipilih
                </span>
              </div>

              {/* Search & Bulk Select Controls */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={multipleSearch}
                    onChange={(e) => setMultipleSearch(e.target.value)}
                    placeholder="Cari nama cabang..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-9 pr-3 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 rounded-xl text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shrink-0"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  title="Reset Pilihan Cabang"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Branch Selection List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {filteredWarehouses.length > 0 ? (
                  filteredWarehouses.map((wh) => {
                    const cashId = wh.primary_cash?.id;
                    const isSelected =
                      cashId && multipleForm.destination_ids.includes(cashId);
                    return (
                      <button
                        type="button"
                        key={wh.id}
                        onClick={() => handleToggleWhSelect(cashId)}
                        className={`text-xs gap-2 flex items-center p-2.5 border rounded-xl text-left transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold shadow-2xs ring-1 ring-emerald-500/20"
                            : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <CheckCircle
                          className={`w-4 h-4 shrink-0 ${
                            isSelected
                              ? "text-emerald-500"
                              : "text-slate-300 dark:text-slate-700"
                          }`}
                        />
                        <span className="truncate">{wh.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-2 py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400">
                      Cabang tidak ditemukan.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: PARAMETER TRANSAKSI */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Pengaturan Transaksi Masal
                </label>
              </div>

              {/* Amount per Branch Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Nominal Kas Per Cabang (Rp)</span>
                  <span className="text-[10px] text-rose-500 font-medium">
                    * Wajib
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-xs font-mono font-bold select-none">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={multipleForm.amount}
                    onChange={(e) =>
                      setMultipleForm({
                        ...multipleForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-2.5 pl-10 pr-3.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Quick Amount Chips for Multiple */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddQuickAmountMultiple(amt)}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                    >
                      +
                      {amt >= 1000000
                        ? `${amt / 1000000}Jt`
                        : `${amt / 1000}Rb`}
                    </button>
                  ))}
                  {multipleForm.amount ? (
                    <button
                      type="button"
                      onClick={() =>
                        setMultipleForm({ ...multipleForm, amount: "" })
                      }
                      className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-medium border border-rose-200/50 dark:border-rose-900/50 transition-colors"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Total Cumulative Summary Banner */}
              <div className="p-3.5 bg-linear-to-br from-indigo-50/80 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900/60 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Total Estimasi Kas Dirilis
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {multipleForm.destination_ids.length} Cabang ×{" "}
                      {formatRupiah(parseFloat(multipleForm.amount) || 0)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatRupiah(multipleTotalAmount)}
                  </span>
                </div>
              </div>

              {/* Tipe & Kurir Section */}
              <div className="p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tipe Pengiriman
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <button
                      type="button"
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        multipleForm.type === "delivery"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                      onClick={() =>
                        setMultipleForm({ ...multipleForm, type: "delivery" })
                      }
                    >
                      Di Kirim (Kurir)
                    </button>
                    <button
                      type="button"
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        multipleForm.type === "pick_up"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                      onClick={() =>
                        setMultipleForm({ ...multipleForm, type: "pick_up" })
                      }
                    >
                      Ambil Sendiri
                    </button>
                  </div>
                </div>

                {multipleForm.type === "delivery" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                        <UserCheck className="w-3.5 h-3.5" /> Pilih Kurir
                        Pengantar
                      </span>
                      <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900/40">
                        * Wajib
                      </span>
                    </label>
                    <Dropdown
                      options={employeeOptions}
                      selectedValue={multipleForm.courier_id}
                      onChange={(val) =>
                        setMultipleForm({ ...multipleForm, courier_id: val })
                      }
                    />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-start gap-2 text-amber-700 dark:text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Seluruh cabang penerima akan datang mengambil dana ke
                      Pusat (HQ).
                    </span>
                  </div>
                )}
              </div>

              {/* Memo Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deskripsi / Memo Masal
                </label>
                <input
                  type="text"
                  value={multipleForm.description}
                  onChange={(e) =>
                    setMultipleForm({
                      ...multipleForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Catatan kolektif pengiriman..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* ACTION SUBMIT BAR */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
            <div className="text-xs text-slate-400 font-medium hidden sm:block">
              {multipleForm.destination_ids.length > 0
                ? `${multipleForm.destination_ids.length} cabang diproses (${formatRupiah(multipleTotalAmount)})`
                : "Pilih cabang terlebih dahulu"}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => router.push("/delivery")}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  multipleForm.destination_ids.length === 0 ||
                  !multipleForm.amount
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {loading
                  ? "Membuat Transaksi..."
                  : `Rilis Ke ${multipleForm.destination_ids.length} Cabang (${formatRupiah(multipleTotalAmount)})`}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

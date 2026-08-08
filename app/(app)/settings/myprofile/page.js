"use client";

import { useAuth } from "@/app/utils/auth";
import MainContent from "../../main";
import {
  User,
  Mail,
  ShieldCheck,
  Building2,
  Wallet,
  MapPin,
  Clock,
  ExternalLink,
  Calendar as CalendarIcon,
  BadgeCheck,
  CheckCircle2,
  XCircle,
  Navigation,
  KeyRound,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Camera,
  Info,
  X,
} from "lucide-react";
import { formatDateTime, formatRupiah } from "@/app/utils/format";
import { useState } from "react";
import Image from "next/image";

export default function MyProfile() {
  const { user } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map Data Absensi Berdasarkan Tanggal (YYYY-MM-DD)
  const attendanceMap = user.attendances.reduce((acc, curr) => {
    acc[curr.date] = curr;
    return acc;
  }, {});

  const cash = user.warehouse?.primary_cash;
  const limitAmount = Number(cash?.limit?.limit_amount) || 0;
  const diffAmount = Number(cash?.limit?.diff_amount) || 0;
  const usedAmount = limitAmount - diffAmount;
  const usedPercentage =
    limitAmount > 0
      ? Math.min(Math.round((usedAmount / limitAmount) * 100), 100)
      : 0;
  return (
    <MainContent headerTitle="My Profile">
      <div className="max-w-6xl mx-auto space-y-6 pb-12 text-slate-800 dark:text-slate-100">
        {/* 1. HEADER PROFILE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-500 text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold capitalize tracking-tight text-slate-900 dark:text-white">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {user.role}
                  </span>
                  {user.is_active === 1 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                  {user.email_verified_at ? (
                    <BadgeCheck
                      className="w-4 h-4 text-sky-500 inline shrink-0"
                      title="Terverifikasi"
                    />
                  ) : (
                    <span className="text-[10px] text-amber-500 font-sans font-medium">
                      (Belum Verifikasi)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between sm:justify-start gap-4">
              <div className="text-left">
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Status Absensi Hari Ini
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 font-semibold text-xs">
                  {user.has_checked_in ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Sudah Check-in
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400">
                        Belum Check-in
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. KALENDER ABSENSI BULANAN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Kalender Absensi
                </h2>
                <p className="text-xs text-slate-400">
                  Klik pada tanggal yang memiliki indikator untuk melihat detail
                  kehadiran
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono min-w-32.5 text-center">
                {currentDate.toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>On-Time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Terlambat (Late)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Absen / Izin</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
              (day, idx) => (
                <div
                  key={idx}
                  className="text-center text-[11px] font-semibold text-slate-400 py-1"
                >
                  {day}
                </div>
              ),
            )}

            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="h-16 sm:h-20 rounded-xl bg-slate-50/40 dark:bg-slate-800/20"
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateFormatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const attendance = attendanceMap[dateFormatted];

              return (
                <div
                  key={dayNum}
                  onClick={() =>
                    attendance && setSelectedAttendance(attendance)
                  }
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border transition flex flex-col justify-between text-left relative ${
                    attendance
                      ? "cursor-pointer hover:border-indigo-500 hover:shadow-xs border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80"
                      : "border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {dayNum}
                  </span>

                  {attendance && (
                    <div className="space-y-1">
                      <div
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center justify-between ${
                          attendance.approval_status === "Late"
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                            : attendance.approval_status === "Approved"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                        }`}
                      >
                        <span className="truncate">
                          {attendance.approval_status}
                        </span>
                        <span className="hidden sm:inline font-mono text-[9px]">
                          {attendance.time_in.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. MODAL DETAIL ABSENSI */}
        {selectedAttendance && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setSelectedAttendance(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Camera className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Detail Kehadiran ({formatDateTime(selectedAttendance.date)})
                </h3>
              </div>

              {selectedAttendance.photo_url && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 relative">
                  <Image
                    src={selectedAttendance.photo_url}
                    alt="Bukti Absensi"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    width={48}
                    height={48}
                    unoptimized
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Jam Masuk</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedAttendance.time_in} WIB
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">
                    Status Approval
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {selectedAttendance.approval_status}
                  </span>
                </div>

                <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg space-y-1">
                  <span className="text-slate-400 block">
                    Koordinat GPS Absen:
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${selectedAttendance.latitude},${selectedAttendance.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline font-semibold"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {selectedAttendance.latitude},{" "}
                    {selectedAttendance.longitude}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. GRID INFO CABANG & KAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* CARD CABANG */}
            {user.warehouse && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Cabang Penugasan
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Informasi lokasi unit kerja aktif
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    KODE: {user.warehouse.code}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">
                      Nama Outlet / Konter
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {user.warehouse.name}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">
                      Jam Operasional & Status
                    </span>
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Buka Pukul {user.warehouse.opening_time} WIB</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400 dark:text-slate-500 block text-[11px] mb-1">
                      Alamat Lengkap
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      {user.warehouse.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CARD KAS UTAMA & LIMIT PROGRESS BAR */}
            {cash && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Kas Utama Cabang
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Rekening kas operasional toko
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    COA: {cash.code}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-1">
                      Saldo Awal (ST Balance)
                    </span>
                    <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {formatRupiah(cash.st_balance)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] block mb-1">
                      Sisa Limit Kas Available
                    </span>
                    <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(diffAmount)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar Limit Kas */}
                {limitAmount > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-slate-500">
                        Penggunaan Limit Kas
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {formatRupiah(usedAmount)} / {formatRupiah(limitAmount)}{" "}
                        ({usedPercentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                        style={{ width: `${usedPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DETAILS AKUN */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                Detail Informasi Akun
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    User ID
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    #{user.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <PiggyBank className="w-3.5 h-3.5 text-slate-400" />
                    Contact ID
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    #{user.contact_id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                    Terdaftar Sejak
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatDateTime(user.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}

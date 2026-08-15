"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Share2,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import Image from "next/image";
import { formatLongDate } from "../utils/format";

export default function CheckInSuccess({
  attendance,
  style = "",
  buttonWithText = true,
  onContinue,
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      router.push("/transaction");
    }
  };

  const att = attendance?.attendance || attendance;
  const isLate = att?.approval_status === "Late";
  const statusText = isLate ? "Telat" : "OK";

  const shortUrl = async (url) => {
    if (!url) return "";
    try {
      const res = await fetch(
        `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      );
      const text = await res.text();
      if (!res.ok) {
        throw new Error("Gagal membuat short URL");
      }
      return text;
    } catch (error) {
      console.error("Short URL failed:", error);
      return url;
    }
  };

  const handleShare = async () => {
    if (!att) return;

    const photoUrl = att.photo || att.photo_url || "";
    const short = photoUrl ? await shortUrl(photoUrl) : "";
    const photoLink = short || photoUrl;

    const message = `Absensi Berhasil!
Nama: ${att?.contact?.name ?? att?.name ?? "-"}
Tanggal: ${att?.date ? formatLongDate(att.date, true) : "-"}
Jam Masuk: ${att?.time_in ?? "-"}
Status: ${statusText}
Lokasi: ${att?.latitude ?? "-"}, ${att?.longitude ?? "-"}
${photoLink ? `\nFoto: ${photoLink}` : ""}`;

    try {
      if (photoUrl) {
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        const file = new File([blob], "attendance.jpg", { type: blob.type });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Absensi Berhasil",
            text: message,
            files: [file],
          });
          return;
        }
      }
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    } catch (error) {
      console.error("Share failed:", error);
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    }
  };

  const copyToClipboard = async () => {
    if (!att) return;

    const photoUrl = att.photo || att.photo_url || "";
    const short = photoUrl ? await shortUrl(photoUrl) : "";
    const photoLink = short || photoUrl;

    const message = `Absensi Berhasil!
Nama: ${att?.contact?.name ?? att?.name ?? "-"}
Tanggal: ${att?.date ? formatLongDate(att.date, true) : "-"}
Jam Masuk: ${att?.time_in ?? "-"}
Status: ${statusText}
Lokasi: ${att?.latitude ?? "-"}, ${att?.longitude ?? "-"}
${photoLink ? `\nFoto: ${photoLink}` : ""}`;

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy gagal:", err);
      const textarea = document.createElement("textarea");
      textarea.value = message;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased selection:bg-indigo-500 selection:text-white"
      role="alert"
    >
      {/* Background Ambient Blur */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 text-center"
      >
        {/* Header Icon */}
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">
          Absensi Berhasil!
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Data absensi masuk kamu telah tersimpan dalam sistem.
        </p>

        {/* Photo Preview if available */}
        {(att?.photo || att?.photo_url) && (
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-800 shadow-inner mb-6">
            <Image
              src={att.photo || att.photo_url}
              alt="Foto Absen"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Details Card */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 text-left space-y-3 mb-6 text-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <User size={14} className="text-indigo-400" /> Nama
            </span>
            <span className="font-semibold text-white">
              {att?.contact?.name || att?.name || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Calendar size={14} className="text-indigo-400" /> Tanggal
            </span>
            <span className="font-semibold text-slate-200">
              {att?.date ? formatLongDate(att.date, true) : "-"}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" /> Jam Masuk
            </span>
            <span className="font-mono font-semibold text-slate-200">
              {att?.time_in || "-"}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-indigo-400" /> Status
            </span>
            <span
              className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] ${
                isLate
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {statusText}
            </span>
          </div>

          {(att?.latitude || att?.longitude) && (
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-slate-400 flex items-center gap-2">
                <MapPin size={14} className="text-indigo-400" /> Lokasi
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                {att?.latitude}, {att?.longitude}
              </span>
            </div>
          )}
        </div>

        {/* Primary Navigation Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="w-full py-3.5 mb-3 bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-2xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 cursor-pointer transition-all"
        >
          <span>Lanjut ke Transaksi</span>
          <ArrowRight size={16} />
        </motion.button>

        {/* Share & Copy Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Share2 size={15} />
            {buttonWithText && "Share Absensi"}
          </button>

          <button
            onClick={copyToClipboard}
            className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Copy size={15} />
            {buttonWithText ? (copied ? "Tersalin!" : "Copy Pesan") : "Copy"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

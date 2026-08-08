import {
  UserX,
  LogOut,
  MessageCircle,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

const InactiveUserScreen = ({ logout }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none text-center">
        {/* Visual Icon Badge */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 ring-8 ring-rose-500/10 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/20">
          <UserX className="h-10 w-10 stroke-[1.75]" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 px-3 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/50">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Akses Dinonaktifkan</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Akun Anda Tidak Aktif
          </h1>

          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Status akun Anda saat ini ditangguhkan. Silakan hubungi
            Administrator untuk memverifikasi dan mengaktifkan kembali akses
            sistem Anda.
          </p>
        </div>

        {/* Info Support Box */}
        <div className="my-6 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800/80 text-left flex items-start gap-3">
          <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Jika ini kesalahan, hubungi Support/Admin melalui tombol bantuan di
            bawah ini.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Tombol Hubungi Admin (WhatsApp / Link Opsional) */}
          <a
            href="https://wa.me/085186080992" // Ganti dengan link WhatsApp/Support Admin Anda
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition-all duration-150 cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Hubungi Admin Via WhatsApp</span>
          </a>

          {/* Tombol Logout */}
          <button
            type="button"
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-all duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactiveUserScreen;

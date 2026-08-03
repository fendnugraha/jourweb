import Image from "next/image";
import LoginLinks from "./LoginLinks";

export default function Home() {
    return (
        <div
            className="relative min-h-screen flex flex-col justify-between bg-cover bg-center bg-no-repeat text-gray-800"
            style={{
                backgroundImage: "url('/bg-new-t.png')",
            }}
        >
            {/* Overlay untuk memberikan kontras lembut pada latar belakang */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-0" />

            {/* Konten Utama (z-10 agar berada di atas overlay) */}
            <div className="relative z-10 min-h-screen flex flex-col justify-between">
                {/* Header */}
                <header className="flex justify-between items-center px-6 sm:px-12 py-6">
                    <div className="flex items-center gap-4">
                        <Image src="/jour-logo.svg" alt="Jour Logo" width={36} height={18} priority />
                        <span className="text-gray-300 text-xl font-light">|</span>
                        <div>
                            <span className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wider block uppercase">Journal Apps for</span>
                            <h1 className="text-blue-900 text-lg sm:text-2xl font-black leading-tight tracking-wide">
                                AgenBRI<span className="text-orange-500">Link</span>
                            </h1>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="grow flex flex-col items-center justify-center text-center px-4 py-12 gap-8">
                    <div className="space-y-2">
                        <h1 className="text-slate-800/80 text-4xl sm:text-7xl md:text-8xl font-extrabold tracking-tight drop-shadow-sm">
                            THREE<span className="font-light text-slate-600">KOMUNIKA</span>
                        </h1>
                        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto font-medium">
                            Sistem Pencatatan Transaksi & Jurnal AgenBRILink yang Terintegrasi
                        </p>
                    </div>

                    <div className="pt-2">
                        <LoginLinks />
                    </div>
                </main>

                {/* Footer */}
                <footer className="p-6 text-xs sm:text-sm text-center sm:text-start text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/50">
                    <div className="flex items-center gap-2">
                        <span>Created by</span>
                        <Image src="/eightnite.png" alt="Eightnite Logo" width={75} height={14} priority className="inline-block object-contain" />
                    </div>
                    <p>© 2023 All Rights Reserved</p>
                </footer>
            </div>
        </div>
    );
}

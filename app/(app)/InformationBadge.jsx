"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Info, X } from "lucide-react";

const hqBankAccounts = [
    { bankName: "BCA", accountNumber: "3372738089", accountHolder: "Rudi Hermawan" },
    { bankName: "MANDIRI", accountNumber: "1300011681270", accountHolder: "Rudi Hermawan" },
    { bankName: "BRI", accountNumber: "377501027461532", accountHolder: "Rudi Hermawan" },
    { bankName: "BNI", accountNumber: "1798249870", accountHolder: "Novi Indriyani" },
    { bankName: "SEABANK", accountNumber: "901096073070", accountHolder: "Supirman" },
    { bankName: "SUPERBANK", accountNumber: "000042148486", accountHolder: "Supirman" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

export default function InformationBadge() {
    const [isOpenInformations, setIsOpenInformations] = useState(false);
    const informationRef = useRef(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => {
            setCopiedIndex(null);
        }, 2000);
    };

    // Close Popover Saat Klik di Luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (informationRef.current && !informationRef.current.contains(event.target)) {
                setIsOpenInformations(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={informationRef}>
            {/* Tombol Info Icon */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpenInformations(!isOpenInformations)}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition border border-slate-200/50 dark:border-slate-700/50 cursor-pointer"
                aria-label="Informasi"
            >
                <Info className="w-4 h-4" />
            </motion.button>

            {/* Popover UI */}
            <AnimatePresence>
                {isOpenInformations && (
                    <>
                        {/* Backdrop gelap di belakang popover */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 sm:hidden"
                            onClick={() => setIsOpenInformations(false)}
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            /* PERUBAHAN UTAMA DI SINI: 
                               - Di mobile (default): fixed, berada di tengah layar horizontal (left-4 right-4 atau w-[92vw])
                               - Di desktop (sm:): absolute right-0 w-96 
                            */
                            className="fixed left-4 right-4 top-20 mx-auto w-auto max-w-sm sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Popover Header */}
                            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Informasi</h3>

                                <button
                                    onClick={() => setIsOpenInformations(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                                    aria-label="Tutup"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* List Informasi dengan Stagger Animation */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60"
                            >
                                {hqBankAccounts.map((account, index) => (
                                    <motion.div key={index} variants={itemVariants} className="p-3.5 text-sm space-y-1.5">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">{account.bankName}</h4>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-slate-600 dark:text-slate-400">
                                            <span className="text-xs sm:text-sm break-all">
                                                No. Rek: <span className="font-bold text-slate-800 dark:text-slate-200">{account.accountNumber}</span>
                                            </span>

                                            <button
                                                // Mengganti handler copy di bawah agar sesuai fungsi
                                                onClick={() => handleCopy(account.accountNumber, index)}
                                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-slate-700 dark:text-slate-200 font-medium active:scale-95 w-full sm:w-auto"
                                                title="Salin Nomor Rekening"
                                            >
                                                {copiedIndex === index ? (
                                                    <>
                                                        <Check size={13} className="text-emerald-500" />
                                                        <span className="text-emerald-500">Tersalin</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={13} />
                                                        <span>Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <p className="z-10 text-xs text-slate-500 dark:text-slate-400">
                                            Atas Nama: <span className="font-medium">{account.accountHolder}</span>
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

import Calendar from "@/app/components/Calendar";
import { useState } from "react";

export default function EmployeeDayOff() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dummy data kalender
    const calendarData = {
        "2026-11-15": { type: "event", name: "Meeting Bulanan" },
        "2026-11-20": { type: "holiday", name: "Cuti Bersama" },
    };

    // Fungsi yang dipanggil saat kotak tanggal diklik
    const handleDateClick = (dateString, dataOnThisDate) => {
        setSelectedDate({ date: dateString, data: dataOnThisDate });
        setIsModalOpen(true); // Buka modal
    };

    return (
        <div className="p-6">
            <h1 className="text-lg font-bold mb-4">Kalender Perusahaan</h1>

            {/* Oper fungsi handleDateClick ke prop onDateClick */}
            <Calendar data={calendarData} maxWidth="max-w-5xl" onDateClick={handleDateClick} />

            {/* MODAL SEDERHANA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-sm w-full shadow-lg border border-slate-200 dark:border-slate-800">
                        <h3 className="text-base font-bold mb-2 text-slate-800 dark:text-slate-100">Detail Tanggal: {selectedDate?.date}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            {selectedDate?.data
                                ? `Informasi: ${selectedDate.data.name || selectedDate.data.status}`
                                : "Tidak ada catatan khusus pada tanggal ini."}
                        </p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

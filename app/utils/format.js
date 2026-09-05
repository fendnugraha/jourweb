import { differenceInDays, differenceInMinutes, formatDistanceToNow, getMonth, getYear, intervalToDuration, parse } from "date-fns";
import { enUS, id } from "date-fns/locale";

/**
 * Format angka dengan separator ribuan.
 * @param {number} value
 * @returns {string}
 */
export const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(value);
};

/**
 * Format angka menjadi format mata uang Rupiah.
 * @param {number} value
 * @returns {string}
 */
export const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Format tanggal ke format 'DD/MM/YYYY'.
 * @param {Date | string} date
 * @returns {string}
 */
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID");
};

/**
 * Format tanggal ke format 'DD MMMM YYYY'.
 * @param {Date | string} date
 * @param {boolean} withDayName - Format tanggal dengan nama hari.
 * @returns {string}
 */
export const formatLongDate = (date, withDayName = false) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: withDayName ? "long" : undefined,
    });
};

export const formatMonthYear = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    });
};

export const formatMonthYearTime = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
        timeZone: "Asia/Jakarta",
    });
};

/**
 * Format tanggal dan jam ke format 'DD/MM/YYYY, HH:mm:ss'.
 * @param {Date | string} date
 * @returns {string}
 */
export const formatDateTime = (dateString, withDayName = false) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        weekday: withDayName ? "long" : undefined,
        hour12: false, // Use 12-hour format; set to false for 24-hour format
        timeZone: "Asia/Jakarta",
    });
};

export const formatDateVertical = (dateString) => {
    const date = new Date(dateString);

    const day = date.toLocaleString("en-US", {
        day: "numeric",
        timeZone: "Asia/Jakarta",
    });

    const month = date.toLocaleString("en-US", {
        month: "short",
        timeZone: "Asia/Jakarta",
    });

    const year = date.toLocaleString("en-US", {
        year: "2-digit",
        timeZone: "Asia/Jakarta",
    });

    const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
    });

    return (
        <div>
            <div>{day}</div>

            <span className="block">
                {month} {year}
            </span>

            <span className="block text-sm">{time}</span>
        </div>
    );
};

export const getDayName = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", { weekday: "long" });
};

export const todayDate = () => {
    const now = new Date();

    // Fungsi untuk memastikan angka memiliki dua digit (misal: 5 menjadi 05)
    const pad = (n) => `0${n}`.slice(-2);

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1); // getMonth() dimulai dari 0
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    return `${year}-${month}-${day}`;
};

export const TimeAgo = ({ timestamp, suffix = true, locale = "en" }) => {
    const localeMap = {
        id: id,
        en: enUS,
    };
    return (
        <span>
            {formatDistanceToNow(new Date(timestamp), {
                addSuffix: suffix,
                locale: localeMap[locale],
            })}
        </span>
    );
};

export function formatNumberToK(num) {
    const absNum = Math.abs(num); // Ambil angka absolut (tanpa minus) untuk perhitungan
    let formatted;

    if (absNum >= 1_000_000_000) {
        formatted = (absNum / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    } else if (absNum >= 1_000_000) {
        formatted = (absNum / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (absNum >= 1_000) {
        formatted = (absNum / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
        formatted = absNum.toString(); // Di bawah 1000, tampilkan angka apa adanya
    }

    // Tambahkan minus jika angka awalnya negatif
    return num < 0 ? `-${formatted}` : formatted;
}

export function formatDuration(toDate = new Date(), fromDate) {
    const days = differenceInDays(toDate, new Date(fromDate));

    if (days < 7) {
        return `${days} Day${days > 1 ? "s" : ""}`;
    } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} Week${weeks > 1 ? "s" : ""}`;
    } else if (days < 365) {
        const months = Math.floor(days / 30);
        return `${months} Bln ${days % 30} Hr`;
    } else {
        const years = Math.floor(days / 365);
        return `${years} Year${years > 1 ? "s" : ""}`;
    }
}

export const DateTimeNow = () => {
    const timeZone = "Asia/Jakarta";

    const now = new Date(
        new Intl.DateTimeFormat("en-US", {
            timeZone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(new Date()),
    );

    const pad = (n) => n.toString().padStart(2, "0");

    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const thisMonth = now.getMonth() + 1;
    const lastMonth = `${now.getFullYear()}-${pad(now.getMonth())}-01T00:00`;
    const thisYear = now.getFullYear();
    const lastYear = `${now.getFullYear() - 1}-01-01T00:00`;

    const thisTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return {
        today,
        thisMonth,
        lastMonth,
        thisYear,
        lastYear,
        thisTime,
    };
};

export const formatDurationTime = (to, from) => {
    const diffMs = new Date(to) - new Date(from); // selisih dalam milidetik
    const totalSeconds = Math.floor(diffMs / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
};

export const calculateFee = (amount, chunkSize = 2500000, feePerChunk = 5000, minFee = 3000, minAmount = 100000) => {
    if (amount < 10000 || amount === "") {
        return "";
    }

    if (amount <= minAmount) {
        return minFee;
    }

    const chunkCount = Math.ceil(amount / chunkSize);
    return chunkCount * feePerChunk;
};

export const formatTime = (time) => {
    return new Date(time).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};

export const formatTimeWithSecond = (time) => {
    return new Date(time).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
};

export function diffTimeHuman(t1, t2) {
    if (!t1 || !t2) return "";

    const time1 = parse(t1, "HH:mm:ss", new Date());
    const time2 = parse(t2, "HH:mm:ss", new Date());

    const diff = differenceInMinutes(time2, time1);

    if (diff <= 0) {
        return "";
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours === 0) return `${minutes} menit`;
    if (minutes === 0) return `${hours} jam`;

    return `${hours} jam ${minutes} menit`;
}

export function getMonthYear(monthNumber, year) {
    const date = new Date(year, monthNumber - 1);
    // date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
}

export function getDay(date, weekday) {
    if (!weekday) {
        return new Date(date).getDate();
    }
}

export function dateToMonthYear(date) {
    const d = new Date(date);
    return d.toLocaleString("default", { month: "long", year: "numeric" });
}

export function formatDateTimeColumn(date) {
    const d = new Date(date);

    const day = d.getDate();
    const shortMonth = d.toLocaleString("default", { month: "short" });
    const month = d.toLocaleString("default", { month: "long" });
    const shortYear = d.getFullYear().toString().slice(-2);
    const hours = d.getHours();
    const minutes = d.getMinutes();

    return (
        <div className="flex flex-col items-center">
            <span className="font-bold text-xl">{day}</span>
            <span className="text-xs">
                {shortMonth} {shortYear}
            </span>
        </div>
    );
}

export function toOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function calculateWorkDuration(startDateString) {
    const startDate = new Date(startDateString);
    const today = new Date();

    let years = today.getFullYear() - startDate.getFullYear();
    let months = today.getMonth() - startDate.getMonth();
    let days = today.getDate() - startDate.getDate();

    // Kalau hari negatif, pinjam bulan
    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }

    // Kalau bulan negatif, pinjam tahun
    if (months < 0) {
        years--;
        months += 12;
    }

    const parts = [];

    if (years > 0) parts.push(`${years} thn`);
    if (months > 0) parts.push(`${months} bln`);
    if (days > 0) parts.push(`${days} hr`);

    // Kalau semuanya 0 (misalnya start hari ini)
    if (parts.length === 0) {
        return "0 hari";
    }

    return parts.join(" ");
}

export function calculateContractTillEnd(contractEnd) {
    if (!contractEnd) {
        return {
            text: "-",
            colorClass: "text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500",
        };
    }

    const today = new Date();
    const end = new Date(contractEnd);

    // Hitung total sisa hari
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 1. Jika sudah kedaluwarsa (Merah)
    if (end <= today || diffDays <= 0) {
        return {
            text: "Kontrak berakhir",
            colorClass: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50 font-bold",
        };
    }

    // Format durasi
    const duration = intervalToDuration({ start: today, end });
    const parts = [];
    if (duration.years) parts.push(`${duration.years} thn`);
    if (duration.months) parts.push(`${duration.months} bln`);
    if (duration.days) parts.push(`${duration.days} hr`);

    const text = parts.join(" ") || "Hari ini";

    // 2. Sangat dekat: <= 7 hari (Merah/Urgent)
    if (diffDays <= 7) {
        return {
            text,
            colorClass: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50 font-bold animate-pulse",
        };
    }

    // 3. Mendekati: <= 30 hari (Kuning/Warning)
    if (diffDays <= 30) {
        return {
            text,
            colorClass: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 font-semibold",
        };
    }

    // 4. Masih lama: > 30 hari (Biasa/Aman)
    return {
        text,
        colorClass: "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    };
}

/**
 * Menghitung estimasi waktu pengiriman berdasarkan koordinat Kurir dan Tujuan
 *
 * @param {number} lat1 Latitude Kurir
 * @param {number} lon1 Longitude Kurir
 * @param {number} lat2 Latitude Tujuan
 * @param {number} lon2 Longitude Tujuan
 * @param {number} speedKmH Kecepatan rata-rata kurir (default: 25 km/jam untuk motor di perkotaan)
 * @returns {{ distanceKm: string, durationMinutes: number, estimatedText: string }}
 */
export function calculateDeliveryETA(lat1, lon1, lat2, lon2, speedKmH = 25) {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        return { distanceKm: "0", durationMinutes: 0, estimatedText: "-" };
    }

    const R = 6371; // Jari-jari bumi dalam Kilometer
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistanceKm = R * c;

    // Koreksi rute jalan darat (~35% lebih jauh dari garis lurus)
    const estimatedRoadDistanceKm = straightDistanceKm * 1.35;

    // Waktu dalam jam = Jarak / Kecepatan
    const timeInHours = estimatedRoadDistanceKm / speedKmH;

    // Konversi ke menit (minimal 5 menit jika sangat dekat)
    let durationMinutes = Math.round(timeInHours * 60);
    if (durationMinutes < 5 && estimatedRoadDistanceKm > 0.1) {
        durationMinutes = 5;
    }

    // Format teks durasi
    let estimatedText = "";
    if (durationMinutes >= 60) {
        const hours = Math.floor(durationMinutes / 60);
        const mins = durationMinutes % 60;
        estimatedText = mins > 0 ? `~${hours} jam ${mins} mnt` : `~${hours} jam`;
    } else {
        estimatedText = `~${durationMinutes} mnt`;
    }

    return {
        distanceKm: estimatedRoadDistanceKm.toFixed(1), // contoh: "4.2"
        durationMinutes,
        estimatedText, // contoh: "~15 mnt"
    };
}

export const getLocationPromise = () =>
    new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject({ code: 0, message: "Browser tidak mendukung GPS" });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                resolve({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
            },
            (err) => reject(err),
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    });

export const getShortName = (fullName) => {
    if (!fullName) return "Pengguna";

    const trimmed = fullName.trim();
    // Jika 15 karakter atau kurang, tampilkan nama utuh
    if (trimmed.length <= 15) return trimmed;

    const words = trimmed.split(/\s+/);
    if (words.length <= 1) return trimmed;

    const firstName = words[0];
    const initials = words
        .slice(1)
        .map((word) => word[0]?.toUpperCase())
        .filter(Boolean)
        .join(".");

    return `${firstName} ${initials}.`;
};

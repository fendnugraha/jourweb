import { differenceInDays, differenceInMinutes, formatDistanceToNow, getMonth, getYear, min, parse } from "date-fns";
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
 * @returns {string}
 */
export const formatLongDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
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
    return <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: suffix, locale: localeMap[locale] })}</span>;
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
    // 1. Antisipasi jika input kosong atau di bawah batas minimum mutlak
    if (amount === "" || amount === null || amount === undefined || amount < 10000) {
        return "";
    }

    // 2. Jika di bawah atau sama dengan minAmount (100k), biayanya flat minFee (3k)
    if (amount <= minAmount) {
        return minFee;
    }

    // 3. KUNCI PERBAIKAN: Hitung berapa banyak chunk, lalu kalikan dengan biaya per chunk
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
    const time1 = parse(t1, "HH:mm:ss", new Date());
    const time2 = parse(t2, "HH:mm:ss", new Date());

    const diff = differenceInMinutes(time2, time1);
    if (diff < 0) {
        return "";
    }
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    if (hours === 0) {
        return `${minutes} menit`;
    } else if (minutes === 0) {
        return `${hours} jam`;
    } else if (hours === 0 && minutes === 0) {
        return "";
    } else {
        return `${hours} jam ${minutes} menit`;
    }
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

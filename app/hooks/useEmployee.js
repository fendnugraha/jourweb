"use client";

import useSWR from "swr";
import axios from "../utils/axios";

// Fetcher yang fleksibel menerima URL beserta params dari SWR Key
const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data?.data);

const useEmployee = (month, year) => {
    // 1. Tentukan bulan dan tahun aktif (default ke bulan/tahun saat ini jika tidak dioper)
    const currentMonth = month ?? new Date().getMonth() + 1;
    const currentYear = year ?? new Date().getFullYear();

    // 2. Sertakan params ke dalam Array SWR Key agar cache terisolasi per bulan/tahun
    const { data, error, isLoading, isValidating, mutate } = useSWR(["/api/employees", { month: currentMonth, year: currentYear }], fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    return {
        employees: data ?? [],
        loading: isLoading, // Hanya true saat pertama kali mengambil data (tanpa cache)
        isValidating, // True saat sync background (bisa untuk spinner kecil)
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate,
    };
};

export default useEmployee;

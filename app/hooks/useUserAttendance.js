import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export function useUserAttendance({ date }) {
    const { data, error, isLoading, isValidating, mutate } = useSWR(date ? `/api/get-warehouse-attendance/${date}` : null, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    return {
        userAttendance: data,
        loading: isLoading, // Loading awal saat fetch pertama kali
        isValidating, // Indikator jika sedang re-fetch di background (opsional jika butuh)
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate,
    };
}

export function useUserAttendanceMonthly({ date }) {
    const { data, error, isLoading, isValidating, mutate } = useSWR(date ? `/api/get-attendance-monthly/${date}` : null, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    return {
        warehouseMonthly: data,
        loading: isLoading,
        isValidating,
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate,
    };
}

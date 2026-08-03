"use client";
import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data);

export const useDailyDashboard = (warehouse, startDate, endDate) => {
    const shouldFetch = warehouse && startDate && endDate;

    const {
        data: dailyDashboard,
        error,
        isLoading,
        isValidating,
        mutate,
    } = useSWR(shouldFetch ? ["/api/daily-dashboard", { warehouse, startDate, endDate }] : null, fetcher, {
        fallbackData: [],
        revalidateOnFocus: true,
        dedupingInterval: 60000,
    });

    if (error) return { error: error.response?.data?.errors };
    if (!dailyDashboard && !isValidating) return { isLoading: true };

    return { dailyDashboard, isLoading, isValidating, error, mutate };
};

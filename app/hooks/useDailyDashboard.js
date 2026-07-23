"use client";
import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data);

export const useDailyDashboard = (warehouse, startDate, endDate) => {
    const shouldFetch = warehouse && startDate && endDate;

    const {
        data: dailyDashboard,
        error,
        isValidating,
        mutate,
    } = useSWR(shouldFetch ? ["/api/daily-dashboard", { warehouse, startDate, endDate }] : null, fetcher, {
        fallbackData: [],
        revalidateOnFocus: true,
        dedupingInterval: 60000,
    });

    if (error) return { error: error.response?.data?.errors };
    if (!dailyDashboard && !isValidating) return { loading: true };

    return { dailyDashboard, loading: isValidating, error, mutateDailyDashboard: mutate };
};

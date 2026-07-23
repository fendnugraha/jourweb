"use client";
import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useCashBankBalance = (selectedWarehouseId, endDate) => {
    const { data, error, isValidating, mutate } = useSWR(selectedWarehouseId ? `/api/get-cash-bank-balance/${selectedWarehouseId}/${endDate}` : null, fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
        refreshInterval: 900000,
    });

    // Handle loading, errors, and data
    if (error) return { error: error.response?.data?.errors || ["Something went wrong."] };
    if (!data && !isValidating) return { loading: true };

    return { data, loading: isValidating, error: error?.response?.data?.errors, mutate };
};

export default useCashBankBalance;
// src/libs/cashBankBalance.js

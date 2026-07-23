"use client";
import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

const useWarehouse = () => {
    const { data, error, isValidating, mutate } = useSWR(`/api/get-all-warehouses`, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    return {
        warehouses: data, // Sudah otomatis default [] karena fallbackData
        loading: isValidating,
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate, // Berhasil diexport dengan nama asli agar fleksibel di komponen
    };
};

export default useWarehouse;

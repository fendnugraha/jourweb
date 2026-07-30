"use client";
import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

const useWarehouseZone = () => {
    const { data, error, isValidating, mutate } = useSWR(`/api/zones`, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    return {
        zones: data, // Sudah otomatis default [] karena fallbackData
        loading: isValidating,
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate, // Berhasil diexport dengan nama asli agar fleksibel di komponen
    };
};

export default useWarehouseZone;

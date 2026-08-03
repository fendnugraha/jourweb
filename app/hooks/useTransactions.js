import useSWR from "swr";
import { DateTimeNow } from "../utils/format";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export function useTransactions({ selectedWarehouse, startDate, endDate }) {
    // Cari tanggal hari ini di dalam hook agar selalu dapet tanggal paling update di browser user
    const { today } = DateTimeNow();

    // Gunakan fallback jika parameter tidak dikirim oleh komponen
    const finalStartDate = startDate || today;
    const finalEndDate = endDate || today;

    // SWR hanya jalan jika warehouse terpilih
    const shouldFetch = selectedWarehouse && finalStartDate && finalEndDate;

    const { data, error, isLoading, isValidating, mutate } = useSWR(
        shouldFetch ? `/api/get-journal-by-warehouse/${selectedWarehouse}/${finalStartDate}/${finalEndDate}` : null,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 60000,
            fallbackData: [],
        },
    );

    return {
        journalByWarehouse: data, // Sudah otomatis default [] karena fallbackData
        isLoading,
        isValidating,
        error,
        mutate, // Berhasil diexport dengan nama asli agar fleksibel di komponen
    };
}

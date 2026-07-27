import useSWR from "swr";
import { DateTimeNow } from "../utils/format";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export function useLogActivities({ warehouse, startDate, endDate } = {}) {
    const { today } = DateTimeNow();

    const finalStartDate = startDate || today;
    const finalEndDate = endDate || today;
    const defaultWarehouse = warehouse || "all";

    // Cek apakah fetch harus dijalankan (Hanya jalan jika warehouse bukan "all" dan tanggal lengkap)
    const shouldFetch = defaultWarehouse && finalStartDate && finalEndDate;

    const { data, error, isLoading, isValidating, mutate } = useSWR(
        shouldFetch ? `/api/log-activity/${finalStartDate}/${finalEndDate}/${defaultWarehouse}` : null,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 60000,
            fallbackData: [],
        },
    );

    return {
        logActivities: data,
        loading: isLoading, // 👈 Lebih tepat pakai isLoading untuk fetching awal (agar UI tidak flicker saat revalidate)
        isValidating, // 👈 Tetap diexport jika butuh indikator "refreshing background"
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate,
    };
}

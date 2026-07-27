import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export function useFinances({ contact, financeType, start, end } = {}) {
    // 1. Amankan parameter tanggal agar tidak ter-render sebagai string "undefined"
    const safeStart = start || "null";
    const safeEnd = end || "null";

    // 2. Syarat fetch: contact dan financeType harus ada
    const shouldFetch = Boolean(contact && financeType);

    // 3. SWR Fetcher
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        shouldFetch ? `/api/finance-by-type/${contact}/${financeType}/${safeStart}/${safeEnd}` : null,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 60000,
            fallbackData: { finance: [], financeGroupByContactId: [] }, // 👈 Sesuaikan bentuk response dari API-mu
        },
    );

    return {
        finances: data?.finance || [], // Array daftar transaksi
        financeGroup: data?.financeGroupByContactId || [], // Array rekap per kontak
        rawFinanceData: data, // Object utuh dari API
        loading: isLoading, // Loading state awal
        isValidating, // Status revalidasi background
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate,
    };
}

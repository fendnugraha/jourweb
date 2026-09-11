import useSWR from "swr";
import axios from "../utils/axios";

// Ambil URL/Key utuh dari SWR (termasuk query params)
const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data?.data);

export function useFinances({ contact, financeType, start, end } = {}) {
    // Kunci SWR hanya valid jika contact dan financeType tersedia
    const shouldFetch = Boolean(contact && financeType);

    // Kirim tanggal secara opsional tanpa merusak path URL
    const queryParams = {
        ...(start && { start }),
        ...(end && { end }),
    };

    const { data, error, isLoading, isValidating, mutate } = useSWR(
        shouldFetch ? [`/api/finance-by-type/${contact}/${financeType}`, queryParams] : null,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 60000,
            fallbackData: { finance: [], financeGroupByContactId: [] },
        },
    );

    return {
        finances: data?.finance ?? [],
        financeGroup: data?.financeGroupByContactId ?? [],
        rawFinanceData: data,
        loading: isLoading,
        isValidating,
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate,
    };
}

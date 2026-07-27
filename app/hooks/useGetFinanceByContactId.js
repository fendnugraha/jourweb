import useSWR from "swr";
import axios from "../utils/axios";

// Fetcher menerima url dan params object dari SWR
const fetcher = ([url, params]) => axios.get(url, { params }).then((res) => res.data?.data);

export function useGetFinanceByContactId({ contactId, type } = {}) {
    const shouldFetch = Boolean(contactId && contactId !== "All");

    // SWR menerima Array [URL, params] sebagai Key
    const { data, error, isLoading, isValidating, mutate } = useSWR(shouldFetch ? [`/api/get-finance-by-contact-id/${contactId}`, { type }] : null, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    return {
        financeData: data || [],
        loading: isLoading,
        isValidating,
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate,
    };
}

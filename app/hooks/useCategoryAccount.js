import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export function useCategoryAccounts() {
    const { data, error, isValidating, mutate } = useSWR(`/api/get-category-accounts`, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    return {
        categoryAccounts: data, // Sudah otomatis default [] karena fallbackData
        loading: isValidating,
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate, // Berhasil diexport dengan nama asli agar fleksibel di komponen
    };
}

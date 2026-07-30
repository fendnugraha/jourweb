import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export function useCategoryProducts() {
    const { data, error, isValidating, mutate } = useSWR(`/api/product-categories`, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000,
        fallbackData: [],
    });

    return {
        categoryProducts: data, // Sudah otomatis default [] karena fallbackData
        loading: isValidating,
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate, // Berhasil diexport dengan nama asli agar fleksibel di komponen
    };
}

import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);
const useGetProfit = () => {
    const {
        data: profit,
        error,
        isLoading,
        isValidating,
        mutate,
    } = useSWR(`/api/get-rank-by-profit`, fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    if (error) return { error: error.response?.data?.errors || ["Something went wrong."] };
    if (!profit && !isValidating) return { loading: true };

    return { profit, isValidating, error: error?.response?.data?.errors, mutate };
};

export default useGetProfit;

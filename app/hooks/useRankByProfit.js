import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);
const useRankByProfit = () => {
    const { data, error, isLoading, isValidating } = useSWR(`/api/get-rank-by-profit`, fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    if (error) return { error: error.response?.data?.errors || ["Something went wrong."] };
    if (!data && !isValidating) return { loading: true };

    return { rankByProfit: data, isLoading, isValidating, error };
};

export default useRankByProfit;

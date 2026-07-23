import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export const useWarehouseBalance = (endDate) => {
    const { data, error, isValidating, mutate } = useSWR(endDate ? `/api/get-warehouse-balance/${endDate}` : null, fetcher, {
        revalidateOnFocus: true, // Refetch data when the window is focused
        dedupingInterval: 60000, // Avoid duplicate requests for the same data within 1 minute
        fallbackData: [], // Optional: you can specify default data here while it's loading
    });

    return { warehouseBalance: data, error, isValidating, mutate };
};

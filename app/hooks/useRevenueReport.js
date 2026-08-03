import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export const useRevenueReport = (startDate, endDate) => {
    const shouldFetch = startDate && endDate;

    const { data, error, isLoading, isValidating, mutate } = useSWR(shouldFetch ? `/api/get-revenue-report/${startDate}/${endDate}` : null, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000, // 1 menit
        fallbackData: [], // data awal kosong
    });

    return {
        revenue: data,
        error,
        isLoading,
        isValidating,
        mutate,
    };
};

export default useRevenueReport;

import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export default function useRevenueReportByWarehouse({ warehouseId, month, year }) {
    const shouldFetch = warehouseId && month && year;
    const { data, error, isLoading } = useSWR(shouldFetch ? `/api/get-revenue-report-by-warehouse/${warehouseId}/${month}/${year}` : null, fetcher, {
        revalidateOnFocus: true,
        dedupingInterval: 60000, // 1 menit
        fallbackData: [], // data awal kosong
    });

    return { revenueByWarehouse: data, error, isLoading };
}

import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data?.data);

export function useDeliveries() {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    `/api/deliveries`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000,
      fallbackData: [],
    },
  );

  return {
    deliveries: data,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}

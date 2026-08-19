"use client";
import useSWR from "swr";
import axios from "../utils/axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useNotifications = () => {
    const { data, error, isValidating, isLoading, mutate } = useSWR(`/api/notifications`, fetcher, {
        refreshInterval: 30000, // Polling setiap 30 detik
        revalidateOnFocus: true, // Re-fetch saat user balik buka tab
        refreshWhenHidden: false, // PAUSE polling kalau tab di-minimize / tidak aktif
        dedupingInterval: 10000,
    });

    // 1. Ekstrak data dari pagination Laravel
    const notifications = data?.data?.data || [];
    const unreadCount = data?.unread_count || 0;
    const pagination = data?.data ? { ...data.data, data: undefined } : null;

    // 2. Helper untuk Tandai 1 Notifikasi Dibaca (Optimistic Update)
    // Inside useNotifications.js

    // 1. Single Mark Read (Menggunakan /notifications/{id}/mark-read)
    const markAsRead = async (id) => {
        try {
            mutate((currentData) => {
                if (!currentData) return currentData;
                return {
                    ...currentData,
                    unread_count: Math.max(0, currentData.unread_count - 1),
                    data: {
                        ...currentData.data,
                        data: currentData.data.data.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item)),
                    },
                };
            }, false);

            // Endpoint disesuaikan dengan route Laravel kamu:
            await axios.post(`/api/notifications/${id}/mark-read`);
            mutate();
        } catch (err) {
            mutate();
        }
    };

    // 2. Mark All Read (Menggunakan /notifications/mark-all-read)
    const markAllAsRead = async () => {
        try {
            mutate((currentData) => {
                if (!currentData) return currentData;
                return {
                    ...currentData,
                    unread_count: 0,
                    data: {
                        ...currentData.data,
                        data: currentData.data.data.map((item) => ({
                            ...item,
                            read_at: item.read_at || new Date().toISOString(),
                        })),
                    },
                };
            }, false);

            // Endpoint disesuaikan dengan route Laravel kamu:
            await axios.post(`/api/notifications/mark-all-read`);
            mutate();
        } catch (err) {
            mutate();
        }
    };

    return {
        notifications,
        unreadCount,
        pagination,
        isValidating,
        isLoading,
        error: error?.response?.data?.errors || (error ? ["Something went wrong."] : null),
        mutate,
        markAsRead,
        markAllAsRead,
    };
};

export default useNotifications;

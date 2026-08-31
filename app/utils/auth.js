"use client";

import useSWR from "swr";
import axios from "./axios";
import { useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter();
    const pathname = usePathname();

    // 1. Fetching data user dari Laravel API
    const {
        data: user,
        error,
        isLoading,
        mutate,
    } = useSWR(
        typeof window !== "undefined" && localStorage.getItem("sanctum_token") ? "/api/user" : null,
        () => axios.get("/api/user").then((res) => res.data),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        },
    );

    // 2. Action Login Biasa (Email & Password)
    const login = async ({ setErrors, setStatus, setMessage, setLoading, ...props }) => {
        setLoading?.(true);
        setErrors?.([]);
        setStatus?.(null);

        try {
            // 🔥 PERBAIKAN: Gunakan '/login' atau '/api/login' dengan slash diawal
            const response = await axios.post("/api/login", props);

            // Simpan token Sanctum ke localStorage
            if (response.data?.token) {
                localStorage.setItem("sanctum_token", response.data.token);
            }

            setMessage?.("Login successful!");
            await mutate(); // Refresh cache SWR user
            router.push(redirectIfAuthenticated || "/transaction");
        } catch (err) {
            if (err?.response?.status === 422) {
                setStatus?.(err.response?.status);
                setErrors?.(err.response?.data?.errors);
            } else {
                console.error("Login error:", err);
            }
        } finally {
            setLoading?.(false);
        }
    };

    // 3. Action Logout (Menghapus token dari LocalStorage & Server)
    const logout = useCallback(async () => {
        try {
            // 🔥 PERBAIKAN: Panggil endpoint API logout dengan tepat
            await axios.post("/api/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            // Selalu hapus token dari localStorage agar UI ter-reset
            localStorage.removeItem("sanctum_token");
            await mutate(null, false);
            router.push("/");
        }
    }, [mutate, router]);

    // 4. Auth Guard & Middleware Logic
    useEffect(() => {
        const hasToken = typeof window !== "undefined" && !!localStorage.getItem("sanctum_token");

        // Halaman Guest: Jika user sudah login, lempar ke dashboard
        if (middleware === "guest" && user) {
            router.push(redirectIfAuthenticated || "/transaction");
            return;
        }

        // Halaman Terproteksi (auth)
        if (middleware === "auth") {
            if (!hasToken || error) {
                localStorage.removeItem("sanctum_token");
                router.push("/");
                return;
            }

            if (isLoading) return;

            // Logika Check-in & Routing berbasis Role
            const isSuperAdmin = user?.role === "Super Admin";
            const isAdminWarehouse1 = user?.role === "Administrator" && user?.warehouse_id === 1;
            const isExemptFromCheckin = isSuperAdmin || isAdminWarehouse1;
            const requiresCheckin = user && !user.has_checked_in && !isExemptFromCheckin;

            if (requiresCheckin && pathname !== "/portal-checkin") {
                router.push("/portal-checkin");
            }
        }
    }, [middleware, redirectIfAuthenticated, user, error, isLoading, pathname, router]);

    return {
        user,
        error,
        authLoading: isLoading,
        mutate,
        login,
        logout,
    };
};

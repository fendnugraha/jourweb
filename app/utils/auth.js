"use client";

import useSWR from "swr";
import axios from "./axios";
import { useCallback, useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();

    // 1. Fetching data user dengan SWR
    const {
        data: user,
        error,
        isLoading,
        mutate,
    } = useSWR("/api/user", () =>
        axios
            .get("/api/user")
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            }),
    );

    // 2. CSRF Cookie Fetcher
    const csrf = async () => {
        await axios.get("/sanctum/csrf-cookie");
    };

    // 3. Login Action
    const login = async ({ setErrors, setStatus, setMessage, setLoading, ...props }) => {
        setLoading(true);
        await csrf();

        if (setErrors) setErrors([]);
        if (setStatus) setStatus(null);

        axios
            .post("/login", props)
            .then(() => {
                mutate();
                if (setMessage) setMessage("Login successful!");
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                // Safe check dengan optional chaining (?.)
                if (err?.response?.status === 422) {
                    if (setStatus) setStatus(err.response?.status);
                    if (setErrors) setErrors(err.response?.data?.errors);
                } else {
                    throw err;
                }
            });
    };

    // 4. Logout Action (Stabil & Tanpa dependency yang mudah berubah)
    const logout = useCallback(async () => {
        try {
            await axios.post("/logout");
            await mutate(null, false); // Reset cache SWR tanpa re-fetch
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            window.location.href = "/";
        }
    }, [mutate]);

    // 5. Auth Middleware & Redirect Guard
    useEffect(() => {
        // Tunggu sampai SWR selesai loading awal
        if (isLoading) return;

        // 1. Cek role dasar
        const isSuperAdmin = user?.role === "Super Admin";
        const isAdminWarehouse1 = user?.role === "Administrator" && user?.warehouse_id === 1;

        // 2. Tentukan apakah user dikecualikan dari check-in
        const isExemptFromCheckin = isSuperAdmin || isAdminWarehouse1;

        // 3. Hasil akhir
        const requiresCheckin = user && !user.has_checked_in && !isExemptFromCheckin;

        // Helper penentu jalur redirect
        const getRedirectPath = () => {
            if (requiresCheckin) return "/portal-checkin";
            if (user?.role === "Courier") return "/delivery";
            return redirectIfAuthenticated || "/transaction";
        };

        // Case A: Halaman Guest (misal /login) tapi user sudah authenticated
        if (middleware === "guest" && redirectIfAuthenticated && user) {
            router.push(getRedirectPath());
        }

        // Case B: Halaman Utama "/" dan user sudah authenticated
        if (pathname === "/" && user) {
            router.push(getRedirectPath());
        }

        // Case C: Halaman Terproteksi (auth)
        if (middleware === "auth") {
            if (!user && error) {
                logout();
                return;
            }

            if (requiresCheckin && pathname !== "/portal-checkin") {
                router.push("/portal-checkin");
            }
        }
    }, [
        middleware,
        redirectIfAuthenticated,
        user,
        error,
        isLoading,
        pathname,
        router,
        logout, // ✅ Aman dimasukkan karena logout sudah ter-memoize dengan stabil
    ]);

    return {
        user,
        error,
        authLoading: isLoading,
        mutate,
        login,
        logout,
    };
};

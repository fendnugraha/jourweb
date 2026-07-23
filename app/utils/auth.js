"use client";
import useSWR from "swr";
import axios from "./axios";
import { useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter();
    const params = useParams();

    const {
        data: user,
        error,
        isLoading,
        mutate,
    } = useSWR("/api/user", () =>
        axios
            .get("/api/user")
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            }),
    );

    const csrf = async () => {
        await axios.get("/sanctum/csrf-cookie");
    };

    const login = async ({ setErrors, setStatus, setMessage, setLoading, ...props }) => {
        setLoading(true);
        await csrf();

        setErrors([]);
        setStatus(null);

        axios
            .post("/login", props)
            .then(() => {
                mutate();
                setMessage("Login successful!");
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                if (error.response.status !== 422) throw error;
                setStatus(error.response.status);
                setErrors(error.response.data.errors);
            });
    };

    const logout = useCallback(async () => {
        if (!error) {
            await axios.post("/logout").then(() => mutate());
        }

        window.location.href = "/";
    }, [error, mutate]);

    useEffect(() => {
        // 🔥 UPDATE: Cek role langsung menggunakan user.role
        const requiresCheckin = user && !user.has_checked_in && user.role !== "Super Admin";

        // 1. JIKA USER ADALAH GUEST (Belum Login) & BERHASIL LOGIN
        if (middleware === "guest" && redirectIfAuthenticated && user) {
            if (requiresCheckin) {
                router.push("/portal-checkin");
            } else if (user.role === "Courier") {
                // 🔥 Menggunakan user.role
                router.push("/delivery");
            } else {
                router.push(redirectIfAuthenticated || "/transaction");
            }
        }

        // 2. JIKA DI HALAMAN UTAMA "/" DAN USER SUDAH LOGIN
        if (window.location.pathname === "/" && user) {
            if (requiresCheckin) {
                router.push("/portal-checkin");
            } else if (user.role === "Courier") {
                // 🔥 Menggunakan user.role
                router.push("/delivery");
            } else {
                router.push(redirectIfAuthenticated || "/transaction");
            }
        }

        // 3. PROTEKSI UTAMA HALAMAN INTERNAL (MIDDLEWARE: AUTH)
        if (middleware === "auth") {
            if (!user && error) {
                router.push("/");
                logout();
                return;
            }

            if (requiresCheckin && window.location.pathname !== "/portal-checkin") {
                router.push("/portal-checkin");
            }
        }
    }, [middleware, redirectIfAuthenticated, user, error, router, logout]);

    return {
        user,
        error,
        authLoading: isLoading,
        mutate,
        login,
        logout,
    };
};

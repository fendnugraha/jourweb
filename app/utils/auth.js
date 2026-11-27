"use client";

import useSWR, { useSWRConfig } from "swr";
import axios, {
    clearSanctumToken,
    getSanctumToken,
    setSanctumToken,
    subscribeSanctumToken,
} from "./axios";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";

const USER_SWR_KEY = "/api/user";
const getServerTokenSnapshot = () => null;
const emptySubscribe = () => () => {};
const getClientHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

const resolvePostLoginRoute = (freshUser, fallbackRoute = "/transaction") => {
    if (!freshUser) return fallbackRoute;
    const isSuperAdmin = freshUser.role === "Super Admin";
    const isAdminWarehouse1 = freshUser.role === "Administrator" && freshUser.warehouse_id === 1;
    const isExemptFromCheckin = isSuperAdmin || isAdminWarehouse1;
    const justCheckedIn = typeof window !== "undefined" && sessionStorage.getItem("just_checked_in") === "true";

    if (!freshUser.has_checked_in && !isExemptFromCheckin && !justCheckedIn) {
        return "/portal-checkin";
    }
    return fallbackRoute;
};

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter();
    const pathname = usePathname();
    const { mutate: globalMutate } = useSWRConfig();

    // Deteksi apakah sudah melewati fase SSR/hydration agar snapshot server (null) tidak dianggap "belum login"
    const isHydrated = useSyncExternalStore(emptySubscribe, getClientHydratedSnapshot, getServerHydratedSnapshot);

    // Berlangganan secara reaktif terhadap perubahan sanctum_token di localStorage
    const token = useSyncExternalStore(subscribeSanctumToken, getSanctumToken, getServerTokenSnapshot);
    const hasToken = Boolean(token);

    // 1. Fetching data user dari Laravel API
    const {
        data: user,
        error,
        isLoading,
        mutate,
    } = useSWR(
        hasToken ? USER_SWR_KEY : null,
        () => axios.get(USER_SWR_KEY).then((res) => res.data),
        {
            revalidateOnFocus: false,
            shouldRetryOnError: (err) => {
                const status = err?.response?.status;
                return status !== 401 && status !== 419;
            },
            errorRetryCount: 2,
            errorRetryInterval: 3000,
        },
    );

    // Helper sinkronisasi sesi setelah mendapat token baru (Email/Password maupun Google Login)
    // Memastikan cache SWR "/api/user" langsung berisi data user terbaru & bebas dari stale error sebelum pindah halaman
    const syncSessionAfterToken = useCallback(
        async (newToken, targetRoute) => {
            const userResponse = await axios.get(USER_SWR_KEY, {
                headers: newToken ? { Authorization: `Bearer ${newToken}` } : undefined,
            });
            const freshUser = userResponse.data;

            // Isi cache "/api/user" & bersihkan error lama TERLEBIH DAHULU sebelum mengaktifkan key SWR
            await globalMutate(USER_SWR_KEY, freshUser, { revalidate: false });

            if (newToken) {
                setSanctumToken(newToken);
            }

            const destination = resolvePostLoginRoute(
                freshUser,
                targetRoute || redirectIfAuthenticated || "/transaction",
            );
            router.replace(destination);

            return freshUser;
        },
        [globalMutate, redirectIfAuthenticated, router],
    );

    // 2. Action Login Biasa (Email & Password)
    const login = async ({ setErrors, setStatus, setMessage, setLoading, ...props }) => {
        setLoading?.(true);
        setErrors?.([]);
        setStatus?.(null);

        try {
            const response = await axios.post("/api/login", props);
            const newToken = response.data?.token;

            if (!newToken) {
                throw new Error("Token autentikasi tidak ditemukan dari server.");
            }

            setMessage?.("Login successful!");
            await syncSessionAfterToken(newToken, redirectIfAuthenticated || "/transaction");
        } catch (err) {
            if (err?.response?.status === 422) {
                setStatus?.(err.response?.status);
                setErrors?.(err.response?.data?.errors);
            } else if (err?.code === "ERR_NETWORK" || !err?.response) {
                console.error("Login Network/CORS Error:", err);
                setErrors?.({
                    email: "Koneksi ke server gagal atau terputus (CORS/Network error). Silakan coba lagi beberapa saat.",
                });
            } else {
                console.error("Login error:", err);
                setErrors?.({
                    email: err?.response?.data?.message || "Terjadi kesalahan pada server saat login.",
                });
            }
        } finally {
            setLoading?.(false);
        }
    };

    // 3. Action Logout (Menghapus token dari LocalStorage & Server)
    const logout = useCallback(async () => {
        try {
            await axios.post("/api/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            clearSanctumToken();
            if (typeof window !== "undefined") {
                sessionStorage.removeItem("just_checked_in");
            }
            // Reset ke undefined (bukan null) & bersihkan error pada key "/api/user"
            await globalMutate(USER_SWR_KEY, undefined, { revalidate: false });
            router.replace("/");
        }
    }, [globalMutate, router]);

    // 4. Auth Guard & Middleware Logic
    useEffect(() => {
        // Jangan jalankan auth guard pada commit hydration awal (ketika server snapshot masih null)
        if (!isHydrated) return;

        const liveToken = getSanctumToken();

        // Halaman Guest: Jika user sudah login & token aktif, lempar ke dashboard/transaction
        if (middleware === "guest" && liveToken && user) {
            const destination = resolvePostLoginRoute(user, redirectIfAuthenticated || "/transaction");
            router.replace(destination);
            return;
        }

        // Halaman Terproteksi (auth)
        if (middleware === "auth") {
            const status = error?.response?.status;
            const isUnauthorized = status === 401 || status === 419;

            // Jika token ditolak server (401/419), hapus token dari storage & bersihkan cache user
            if (isUnauthorized) {
                clearSanctumToken();
                globalMutate(USER_SWR_KEY, undefined, { revalidate: false });
                router.replace("/");
                return;
            }

            // Jika memang tidak ada token di localStorage, arahkan ke halaman awal tanpa menyentuh storage
            if (!liveToken) {
                globalMutate(USER_SWR_KEY, undefined, { revalidate: false });
                router.replace("/");
                return;
            }

            if (isLoading || !user) return;

            // Logika Check-in & Routing berbasis Role
            const isSuperAdmin = user?.role === "Super Admin";
            const isAdminWarehouse1 = user?.role === "Administrator" && user?.warehouse_id === 1;
            const isExemptFromCheckin = isSuperAdmin || isAdminWarehouse1;

            // Cek apakah user baru saja berhasil absen (mencegah race condition SWR cache saat redirect ke /transaction)
            const justCheckedIn = typeof window !== "undefined" && sessionStorage.getItem("just_checked_in") === "true";

            // Jika user data dari server sudah confirmed has_checked_in: true, bersihkan flag sessionStorage
            if (user?.has_checked_in && justCheckedIn && typeof window !== "undefined") {
                sessionStorage.removeItem("just_checked_in");
            }

            const requiresCheckin = user && !user.has_checked_in && !isExemptFromCheckin && !justCheckedIn;

            if (requiresCheckin && pathname !== "/portal-checkin") {
                router.replace("/portal-checkin");
            }
        }
    }, [isHydrated, middleware, redirectIfAuthenticated, hasToken, user, error, isLoading, pathname, router, globalMutate]);

    // Selama belum ter-hydrate atau token ada tetapi objek user belum selesai dimuat (dan tidak error), anggap masih loading sesi
    const authLoading = !isHydrated || isLoading || (hasToken && !user && !error);

    return {
        user,
        error,
        authLoading,
        mutate,
        login,
        logout,
        syncSessionAfterToken,
    };
};

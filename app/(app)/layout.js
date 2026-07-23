"use client";
import { useEffect } from "react";
import { getUserGeoLocation } from "../utils/GetUserGeolocation";
import { useAuth } from "../utils/auth";
import Loading from "../components/Loading";
import Navigation from "./Navigation";

const AppLayout = ({ children }) => {
    useEffect(() => {
        getUserGeoLocation(); // kirim sekali

        const interval = setInterval(
            () => {
                getUserGeoLocation();
            },
            5 * 60 * 1000,
        );

        return () => clearInterval(interval);
    }, []);
    // Hook akan otomatis mengurus redirect ke / atau ke /portal-checkin lewat useEffect di dalamnya
    const { user, authLoading, logout } = useAuth({ middleware: "auth" });
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <p className="text-xs text-slate-500 font-medium animate-pulse">Memverifikasi sesi...</p>
            </div>
        );
    }

    // 🔥 UPDATE: bypass menggunakan user.role langsung
    const isAllowed = user && (user.has_checked_in || user.role === "Super Admin");
    if (!isAllowed) {
        return <h1>Anda tidak memiliki akses ke halaman ini</h1>;
    }
    return (
        <div className="flex h-screen overflow-hidden">
            <Navigation logout={logout} user={user} />
            <div className="flex-1">{children}</div>
        </div>
    );
};

export default AppLayout;

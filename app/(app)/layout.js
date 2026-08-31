"use client";

import { useEffect, useState } from "react";
import { getUserGeoLocation } from "../utils/GetUserGeolocation";
import { useAuth } from "../utils/auth";
import Navigation from "./Navigation";
import SessionVerifier from "./SessionVerifier";
import AccessDeniedScreen from "./AccessDeniedScreen";

const AppLayout = ({ children }) => {
    // 1. Guard mount untuk menyamakan render awal Server & Client
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        getUserGeoLocation();

        const interval = setInterval(
            () => {
                getUserGeoLocation();
            },
            5 * 60 * 1000,
        );

        return () => clearInterval(interval);
    }, []);

    const { user, authLoading, logout } = useAuth({ middleware: "auth" });

    // 2. Selama belum di-mount di client ATAU auth sedang loading, kembalikan SessionVerifier
    if (!mounted || authLoading) {
        return <SessionVerifier />;
    }

    // 3. Logika otorisasi (dieksekusi setelah mounted)
    const isAllowed = user && (user.has_checked_in || ["Administrator", "Super Admin"].includes(user.role));

    if (!isAllowed) {
        return <AccessDeniedScreen />;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <Navigation logout={logout} user={user} />
            <div className="flex-1">{children}</div>
        </div>
    );
};

export default AppLayout;

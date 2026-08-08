"use client";
import { useEffect } from "react";
import { getUserGeoLocation } from "../utils/GetUserGeolocation";
import { useAuth } from "../utils/auth";
import Loading from "../components/Loading";
import Navigation from "./Navigation";
import SessionVerifier from "./SessionVerifier";
import AccessDeniedScreen from "./AccessDeniedScreen";

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
    return <SessionVerifier />;
  }

  // 🔥 UPDATE: bypass menggunakan user.role langsung
  const isAllowed =
    user && (user.has_checked_in || user.role === "Super Admin");
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

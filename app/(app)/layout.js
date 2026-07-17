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
  const { user, authLoading, logout } = useAuth({ middleware: "auth" });
  if (authLoading || !user) {
    return <Loading />;
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Navigation logout={logout} user={user} />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default AppLayout;

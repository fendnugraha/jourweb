"use client";
import Link from "next/link";
import { useAuth } from "./utils/auth";

const LoginLinks = () => {
    const { user } = useAuth({ middleware: "guest" });

    return (
        <div className="flex items-center justify-center">
            {user ? (
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center bg-blue-800 hover:bg-blue-900 text-white font-medium px-8 py-3 rounded-full text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Masuk ke Dashboard
                </Link>
            ) : (
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center bg-blue-800 hover:bg-blue-900 text-white font-medium px-10 py-3 rounded-full text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    Login
                </Link>
            )}
        </div>
    );
};

export default LoginLinks;

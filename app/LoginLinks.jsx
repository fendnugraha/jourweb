"use client";
import Link from "next/link";
import { useAuth } from "./utils/auth";

const LoginLinks = () => {
  const { user } = useAuth({ middleware: "guest" });

  return (
    <div className="">
      {user ? (
        <Link
          href="/dashboard"
          className="bg-slate-600/70 hover:bg-slate-600 backdrop-blur-sm py-2 px-10 text-xl text-white"
        >
          Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/login"
            className="bg-slate-600/70 hover:bg-slate-600 backdrop-blur-sm py-2 px-10 text-xl text-white"
          >
            Login
          </Link>
        </>
      )}
    </div>
  );
};

export default LoginLinks;

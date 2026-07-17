"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SatelliteDishIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/app/utils/auth";
import Label from "@/app/components/Label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login, error: authError } = useAuth({
    middleware: "guest",
    redirectIfAuthenticated: "/transaction",
  });

  useEffect(() => {
    if (authError?.code === "ERR_NETWORK") {
      setStatus(
        "Error Network: Unable to reach the server. Trying to reconnect, please wait...",
      );
    }
  }, [authError]);

  useEffect(() => {
    if (router.reset?.length > 0 && errors.length === 0) {
      setStatus(atob(router.reset));
    } else {
      setStatus(null);
    }
  }, [router.reset, errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({
      email,
      password,
      setErrors,
      setStatus,
      setMessage,
      setLoading,
    });
  };

  return (
    <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-800/40 p-8 rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-col items-center mb-6">
        <div className="mb-3">
          <Image
            src="/jour-logo.svg"
            alt="Jour Logo"
            width={38}
            height={18}
            priority
            unoptimized // Add this to prevent path rewriting
            className="dark:brightness-200"
          />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800 dark:text-white">
          THREE
          <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-light">
            KOMUNIKA
          </span>
        </h1>

        {authError?.code === "ERR_NETWORK" ? (
          <div className="flex flex-col items-center mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
            <SatelliteDishIcon
              size={48}
              className="animate-pulse text-red-500 mb-2"
            />
            <p className="text-xs text-center font-medium text-red-500 leading-relaxed">
              {status}
            </p>
          </div>
        ) : (
          <p className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1">
            Sign in to manage your journal accounts
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        hidden={authError?.code === "ERR_NETWORK"}
        className="space-y-4"
      >
        {status && typeof status === "string" && !authError && (
          <div className="p-3 text-xs rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400">
            {status}
          </div>
        )}
        {message && (
          <div className="p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
            {message}
          </div>
        )}

        <div className="space-y-3.5">
          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Email address
            </Label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || message === "Login successful!"}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Password
            </Label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || message === "Login successful!"}
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || message === "Login successful!"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <button
          disabled={loading || message === "Login successful!"}
          className="w-full mt-6 py-3 px-4 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
          type="submit"
        >
          {loading || message === "Login successful!" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;

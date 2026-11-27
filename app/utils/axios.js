import Axios from "axios";

const TOKEN_STORAGE_KEY = "sanctum_token";
const TOKEN_CHANGE_EVENT = "sanctum-token-change";

export const getSanctumToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const setSanctumToken = (token) => {
    if (typeof window === "undefined" || !token) return;
    const prev = localStorage.getItem(TOKEN_STORAGE_KEY);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    if (prev !== token) {
        window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
    }
};

export const clearSanctumToken = () => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOKEN_STORAGE_KEY) !== null) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.dispatchEvent(new Event(TOKEN_CHANGE_EVENT));
    }
};

export const subscribeSanctumToken = (callback) => {
    if (typeof window === "undefined") return () => {};

    const handleStorage = (event) => {
        if (!event.key || event.key === TOKEN_STORAGE_KEY) {
            callback();
        }
    };

    window.addEventListener(TOKEN_CHANGE_EVENT, callback);
    window.addEventListener("storage", handleStorage);

    return () => {
        window.removeEventListener(TOKEN_CHANGE_EVENT, callback);
        window.removeEventListener("storage", handleStorage);
    };
};

const axios = Axios.create({
    // Pastikan env name sesuai dengan .env kamu (NEXT_PUBLIC_API_BASE_URL atau NEXT_PUBLIC_API_URL)
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// 🔥 Interceptor: Otomatis ambil Bearer Token dari localStorage untuk setiap request
axios.interceptors.request.use(
    (config) => {
        const token = getSanctumToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// 3. Response Interceptor: Tangani 401 Unauthorized & auto-redirect tanpa menimpa token baru
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== "undefined" && error.response) {
            const { status } = error.response;
            const requestUrl = String(error.config?.url || "");
            const isAuthEndpoint =
                requestUrl.includes("/login") ||
                requestUrl.includes("/logout") ||
                requestUrl.includes("/firebase-login");

            // Jika Token expired, invalid, atau user dihapus di server
            if (status === 401 && !isAuthEndpoint) {
                const currentToken = getSanctumToken();
                const sentAuthHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization;

                // Hanya hapus token jika request yang 401 memang memakai token aktif saat ini
                // (mencegah request lama yang terlambat membatalkan sesi login yang baru berhasil)
                if (!currentToken || !sentAuthHeader || sentAuthHeader === `Bearer ${currentToken}`) {
                    clearSanctumToken();

                    const currentPath = window.location.pathname;
                    if (currentPath !== "/" && !currentPath.startsWith("/login")) {
                        window.location.href = "/";
                    }
                }
            }
        }
        return Promise.reject(error);
    },
);

export default axios;

import Axios from "axios";

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
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("sanctum_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// 3. Response Interceptor: Tangani 401 Unauthorized & auto-redirect
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== "undefined" && error.response) {
            const { status } = error.response;

            // Jika Token expired, invalid, atau user dihapus di server
            if (status === 401) {
                localStorage.removeItem("sanctum_token");

                // Cegah loop redirect jika sudah berada di halaman login ("/")
                if (window.location.pathname !== "/") {
                    window.location.href = "/";
                }
            }
        }
        return Promise.reject(error);
    },
);

export default axios;

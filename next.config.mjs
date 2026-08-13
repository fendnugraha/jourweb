import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "8000",
                pathname: "/storage/**",
            },
            // ➔ Tambahkan ini!
            {
                protocol: "http",
                hostname: "127.0.0.1",
                port: "8000",
                pathname: "/storage/**",
            },
            {
                protocol: "https",
                hostname: "api.three-komunika.com",
                pathname: "/storage/**",
            },
        ],
    },
    productionBrowserSourceMaps: false,
    env: {
        APP_VERSION: pkg.version,
    },
};

export default nextConfig;

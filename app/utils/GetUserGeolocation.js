import axios from "./axios";

export const getUserGeoLocation = () => {
    if (typeof navigator === "undefined") return; // amanin biar gak error di server

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            axios.put("/api/update-user-location", {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
        },
        (err) => console.error("Gagal ambil lokasi:", err),
        { enableHighAccuracy: true }
    );
};

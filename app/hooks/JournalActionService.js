import axios from "../utils/axios";

export const deleteJournal = async (id) => {
    try {
        const response = await axios.delete(`/api/journals/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting journal:", error);
        throw error;
    }
};

export const changeLockStatus = async (id) => {
    try {
        const response = await axios.put(`/api/toggle-lock-status-by-id/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error changing lock status:", error);
        throw error;
    }
};

export function getWarehouseRating(dailyProfit, targetProfit = 269444) {
    if (targetProfit <= 0) return 0.0;

    const ratio = dailyProfit / targetProfit;
    let rating;

    if (ratio <= 0) {
        rating = 1;
    } else if (ratio < 1) {
        // Dari 1 → 4 secara proporsional
        rating = 1 + ratio * 3;
    } else if (ratio < 2) {
        // Dari 4 → 7
        rating = 4 + (ratio - 1) * 3;
    } else if (ratio < 3) {
        // Dari 7 → 9
        rating = 7 + (ratio - 2) * 2;
    } else {
        // Lebih dari 3x target, terus naik sampai maksimal 10
        rating = 9 + (ratio - 3) * 0.5;
    }

    // Batasi maksimal 10, dan tampilkan 1 angka di belakang koma
    return Math.min(rating, 10).toFixed(1);
}

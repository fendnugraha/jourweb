export function getStorePerformanceRating(dailyProfit, targetProfit = 269444) {
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

import axios from "axios";

/**
 * Fungsi global untuk mengirim notifikasi ke Telegram (Tanpa efek ke UI)
 * @param {string} title - Judul notifikasi (Contoh: "🚨 SALAH INPUT HARGA")
 * @param {string} source - Lokasi/Fitur yang memicu (Contoh: "Halaman Kasir")
 * @param {string} details - Isi pesan lengkap/kronologi
 */
export const SendTelegramAlert = async ({
  title,
  source,
  message,
  forwardChatId,
}) => {
  try {
    const payload = {
      type: title,
      warehouse: source,
      message: message,
      forwardChatId: forwardChatId,
    };

    // Menembak API internal send-report Next.js Anda
    const res = await axios.post("/api/send-report", payload);
    return { success: true, data: res.data };
  } catch (error) {
    // Hanya log di console terminal/browser jika terjadi gagal kirim
    console.error("Gagal mengirim alert ke Telegram:", error.message);
    return { success: false, error: error.message };
  }
};

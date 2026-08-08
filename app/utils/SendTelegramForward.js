import axios from "axios";

/**
 * Fungsi global untuk meneruskan pesan ke kontak/grup lain
 * @param {string|number} fromChatId - ID asal tempat pesan berada (Grup Utama)
 * @param {number} messageId - ID unik pesan yang ingin diteruskan
 * @param {string|number} targetChatId - ID kontak tujuan (misal: ID Manager)
 */
export const SendTelegramForward = async ({
  fromChatId,
  messageId,
  targetChatId,
}) => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const telegramUrl = `https://api.telegram.org/bot${token}/forwardMessage`;

    await axios.post(telegramUrl, {
      chat_id: targetChatId, // Tujuan (Kontak Manager)
      from_chat_id: fromChatId, // Asal (ID Grup Utama)
      message_id: messageId, // ID Pesan spesifik
    });

    return { success: true };
  } catch (error) {
    console.error("Gagal melakukan forward ke Telegram:", error.message);
    return { success: false };
  }
};

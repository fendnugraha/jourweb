import { NextResponse } from "next/server";
import axios from "axios"; // WAJIB gunakan axios murni bawaan package agar tidak 404

export async function POST(request) {
    try {
        const { type, message, warehouse, forwardChatId } = await request.json();

        // Susun teks pesan utama
        const text = `
${type}
📍 *Sumber:* ${warehouse}
📝 *Detail:* \n${message}
        `.trim();

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID; // ID Grup Utama

        // LAKUKAN AKSI 1: Kirim laporan ke Grup Utama
        const telegramRes = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: text,
            parse_mode: "Markdown",
        });

        // LAKUKAN AKSI 2: Jika sukses dikirim ke grup & ada forwardChatId, lakukan forward
        if (telegramRes.data.ok && forwardChatId) {
            const sentChatId = telegramRes.data.result.chat.id;
            const sentMessageId = telegramRes.data.result.message_id;

            // Proses forwardMessage dijalankan di server, dijamin aman dari "Network Error"
            await axios.post(`https://api.telegram.org/bot${token}/forwardMessage`, {
                chat_id: forwardChatId, // Target kontak personal (misal: 851552604)
                from_chat_id: sentChatId, // Asal pesan (ID Grup Utama)
                message_id: sentMessageId, // ID pesan unik yang didapat dari AKSI 1
            });
        }

        return NextResponse.json({ success: true, message: "Laporan dan Forward berhasil diproses!", data: telegramRes.data });
    } catch (error) {
        const errorMsg = error.response?.data?.description || error.message;
        console.error("Gagal memproses Telegram di Server:", errorMsg);
        return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
    }
}

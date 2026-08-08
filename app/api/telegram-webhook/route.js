import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const body = await request.json();

        // Memastikan ada pesan masuk
        if (body.message) {
            const message = body.message;
            const chatText = message.text; // Isi chat balasan Anda

            // Memeriksa apakah ini adalah pesan 'Reply' (balasan)
            if (message.reply_to_message) {
                const originalMessage = message.reply_to_message.text;

                console.log(`Anda membalas pesan: "${originalMessage}"`);
                console.log(`Dengan jawaban: "${chatText}"`);

                // DI SINI TEMPAT LOGIKA ANDA:
                // Anda bisa mengambil email user dari 'originalMessage' (menggunakan regex),
                // lalu mengirimkan email balasan ke user tersebut menggunakan Nodemailer/Resend.
            }
        }

        // Telegram butuh respon 200 OK agar tidak mengirim ulang pesan yang sama
        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

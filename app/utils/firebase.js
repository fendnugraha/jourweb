import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Mencegah re-initialization saat Hot Reload di Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Helper untuk mengirim Firebase ID Token ke Laravel Sanctum
export async function sendTokenToLaravel(idToken) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/auth/firebase-login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ id_token: idToken }),
    });

    // Ambil respon sebagai teks terlebih dahulu
    const responseText = await response.text();

    try {
        const data = JSON.parse(responseText);

        if (!response.ok) {
            throw new Error(data.message || "Gagal autentikasi server.");
        }

        if (data.token) {
            localStorage.setItem("sanctum_token", data.token);
        }

        return data;
    } catch (err) {
        // Jika gagal parsing JSON (artinya responnya HTML error dari Laravel)
        console.error("Respon Server Lain (HTML/Error):", responseText);
        throw new Error(`Server Error (${response.status}): Cek console log atau laravel.log`);
    }
}

export { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification };

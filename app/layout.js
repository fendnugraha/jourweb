import { Inter } from "next/font/google";
import "./globals.css";
import DarkModeContextProvider from "./context/DarkModeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Jour | BRILink",
  description: "Journal Apps for AgenBRI Link",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased bg-slate-100 text-slate-900 dark:bg-gray-800 dark:text-white`}
      >
        <DarkModeContextProvider>{children}</DarkModeContextProvider>
      </body>
    </html>
  );
}

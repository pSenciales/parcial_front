"use client";
import localFont from "next/font/local";
import MyNavbar from "@/components/ui/navbar";
import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NextUIProvider>
          <MyNavbar />
          <div style={{ marginTop: '4rem' }}> {/* Ajusta el margen superior según la altura del Navbar */}
          <SessionProvider>{children}</SessionProvider>
          </div>
        </NextUIProvider>
      </body>
    </html>
  );
}
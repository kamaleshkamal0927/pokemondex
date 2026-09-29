import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pokédex OS — Professional Edition",
  description: "High-contrast precision Pokédex with tactical HUD, team builder, and battle analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
      <body className="min-h-screen bg-[#08090C] text-white overflow-x-hidden selection:bg-red-600/30 selection:text-white">
        {/* Ambient subtle crimson & monochrome glow */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-red-600/[0.04] blur-[140px]" />
          <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-white/[0.015] blur-[160px]" />
          <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-red-700/[0.03] blur-[140px]" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

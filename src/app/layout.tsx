import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { SoundProvider } from "@/components/SoundProvider";
import { AppProvider } from "@/components/AppProvider";
import { ScanlineOverlay } from "@/components/ScanlineOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokédex OS v3.0",
  description: "Next-generation Pokédex — search, explore, build teams, and play.",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0B0F19] text-white overflow-x-hidden selection:bg-white/20">
        <SoundProvider>
          <AppProvider>
            {/* Ambient grid background */}
            <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />
            </div>
            {/* Ambient Blobs */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[20%] w-[35%] h-[35%] rounded-full bg-blue-600/10 blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[120px]" />
            </div>

            <ScanlineOverlay />
            <Sidebar />

            {/* Top HUD bar */}
            <div className="fixed top-0 right-0 z-40 hidden lg:flex items-center gap-4 px-6 py-4">
              <div className="flex items-center gap-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/10 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-white/50 tracking-wider">ONLINE</span>
                <div className="w-px h-3 bg-white/10" />
                <span className="text-xs font-medium text-white/30 tracking-wider">API CONNECTED</span>
              </div>
            </div>

            <div className="lg:pl-64 pt-20 pb-24 lg:pb-12 flex-1 flex flex-col">
              {children}
            </div>
          </AppProvider>
        </SoundProvider>
      </body>
    </html>
  );
}

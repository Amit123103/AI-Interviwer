import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Intervyxa AI | Next-Gen AI Career Coaching",
  description: "Master your technical and behavioral interviews with our advanced AI coaching platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative bg-slate-50 dark:bg-zinc-950 neural:bg-emerald-950 text-slate-900 dark:text-white neural:text-emerald-50 transition-colors duration-500`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={['light', 'dark', 'neural']}
          enableSystem={false}
        >
          <div className="fixed inset-0 -z-50 bg-slate-50 dark:bg-zinc-950 neural:bg-emerald-950 transition-colors duration-500">
            <div
              className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-100 neural:opacity-80"
              style={{
                background: `
                  radial-gradient(ellipse 60% 40% at 15% 20%, rgba(139,92,246,0.06), transparent),
                  radial-gradient(ellipse 50% 35% at 80% 70%, rgba(59,130,246,0.05), transparent),
                  radial-gradient(ellipse 40% 30% at 50% 50%, rgba(147,51,234,0.04), transparent)
                `,
              }}
            />
          </div>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

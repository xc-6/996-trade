import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { Modals } from "@/components/modals";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trade Insight",
  description: "Trade Insight",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            <Toaster />
            <Modals />
            {children}
            <div id="portal"></div>
          </Providers>
        </body>
      </html>
    </SessionProvider>
  );
}

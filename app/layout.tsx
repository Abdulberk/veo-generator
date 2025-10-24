import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ModelProvider } from "@/app/lib/context/ModelContext";
import { Header } from "@/app/components/layout/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veo AI Video Generator",
  description: "Generate AI videos using Google's Veo 3 and Veo 3.1 models",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ModelProvider defaultModelId="veo3">
          <Header />
          {children}
        </ModelProvider>
      </body>
    </html>
  );
}

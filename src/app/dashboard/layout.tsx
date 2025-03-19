import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Journal me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {/* Navigation Bar */}
            <header className="flex justify-between items-center p-6 bg-[#181c29] text-white">
          <h1 className="text-4xl font-semibold">
            Journal me <span className="text-green-500">●</span>
          </h1>
          <div className="flex items-center gap-4">
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg">Time travel</button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg">Insights</button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg">Alexander</button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg">Logout</button>
          </div>
        </header>
            {/* Main Content */}
        <main>{children}</main>
      </body>
    </html>
  );
}

"use client";  // Mark this as a Client Component because we're using React hooks

import { Geist, Geist_Mono } from "next/font/google";
import { useState, useRef } from "react";
import Modal from "../components/page";
import InsightsModal from "../components/insights";
import TravelModal from "../components/travel";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false); // State for Insights Modal
  const [isTimeTravelModalOpen, setIsTimeTravelModalOpen] = useState(false); // State for Time Travel Modal
  const buttonRef = useRef(null); // Reference for the Time Travel button

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenInsightsModal = () => {
    setIsInsightsModalOpen(true); // Open Insights Modal
  };

  const handleCloseInsightsModal = () => {
    setIsInsightsModalOpen(false); // Close Insights Modal
  };

  const handleOpenTimeTravelModal = () => {
    setIsTimeTravelModalOpen(true); // Open Time Travel Modal
  };

  const handleCloseTimeTravelModal = () => {
    setIsTimeTravelModalOpen(false); // Close Time Travel Modal
  };

  // Mock journal entries or pass an actual array of journal entry dates
  const journalEntries = ["2024-03-10", "2024-03-12", "2024-03-15"];

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Navigation Bar */}
        <header className="flex justify-between items-center p-6 bg-[#181c29] text-white">
          <h1 className="text-4xl font-semibold">
            Journal me <span className="text-green-500">●</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              onClick={handleOpenTimeTravelModal} // Open Time Travel Modal
              ref={buttonRef} // Reference for the button
            >
              Time travel
            </button>
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              onClick={handleOpenInsightsModal} // Open Insights Modal
            >
              Insights
            </button>
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              onClick={handleOpenModal}
            >
              Alexander
            </button>
            <button className="bg-gray-800 text-white px-4 py-2 rounded-lg">Logout</button>
          </div>
        </header>
        {/* Main Content */}
        <main>{children}</main>
        {/* Modal for Account Settings */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} />

        {/* Modal for Insights */}
        <InsightsModal isOpen={isInsightsModalOpen} onClose={handleCloseInsightsModal} />

        {/* Modal for Time Travel */}
          <TravelModal
            isOpen={isTimeTravelModalOpen}
            onClose={handleCloseTimeTravelModal}
            journalEntries={journalEntries} // Pass the journal entries to the modal
          />
      </body>
    </html>
  );
}

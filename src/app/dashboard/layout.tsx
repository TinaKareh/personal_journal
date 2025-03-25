"use client"; // Mark this as a Client Component because we're using React hooks

import { Geist, Geist_Mono } from "next/font/google";
import { useState, useRef, useEffect } from "react";
import Modal from "../components/page";
import InsightsModal from "../components/insights";
import TravelModal from "../components/travel";
import Dashboard from "../dashboard/page"; // Import the Dashboard
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { jwtDecode } from "jwt-decode"; 


export function useUsernameFromToken() {
  const [username, setUsername] = useState<string>("User");

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch("/api/auth/details");
      const data = await res.json();
      console.log("data",data);
      if (data.user?.name) {
        setUsername(data.user.name);
      }
    };
  
    getUser();
  }, []);
  
  return username;
}

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

  const [categories, setCategories] = useState([]); // Categories state lifted here
  const username = useUsernameFromToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false); // State for Insights Modal
  const [isTimeTravelModalOpen, setIsTimeTravelModalOpen] = useState(false); // State for Time Travel Modal
  const buttonRef = useRef(null); // Reference for the Time Travel button

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  

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

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Mock journal entries or pass an actual array of journal entry dates
  const journalEntries = [
    "2025-03-02",
    "2025-03-06",
    "2025-03-12",
    "2025-03-17",
    "2025-03-24"
  ];

  return (
    <div className="bg-[#0E0F1C] text-white min-h-screen">
      {/* Navigation Bar */}
      <header className="flex justify-between items-center p-6 bg-[#181c29] text-white">
        <h1 className="text-4xl font-semibold">
          Journal me <span className="text-green-500">●</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={handleOpenTimeTravelModal}
            ref={buttonRef}
          >
            <CalendarDaysIcon className="w-5 h-5 text-blue-400" />
            Time travel
          </button>
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={handleOpenInsightsModal}
          >
            <ChartBarIcon className="w-5 h-5 text-purple-400" />
            Insights
          </button>
          <div className="relative">
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              onClick={() => setShowUserDropdown((prev) => !prev)}
            >
              <UserIcon className="w-5 h-5 text-green-400" />
              {username}
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1e1e2f] shadow-md rounded-md z-50">
                <button
                  onClick={() => {
                    handleOpenModal();
                    setShowUserDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-[#2b2b40] text-l"
                >
                  Account settings
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-[#2b2b40] text-l"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main>{children}</main>

      {/* Modal for Account Settings */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}/>

      {/* Modal for Insights */}
      <InsightsModal
        isOpen={isInsightsModalOpen}
        onClose={handleCloseInsightsModal}
      />

      {/* Modal for Time Travel */}
      <TravelModal
        isOpen={isTimeTravelModalOpen}
        onClose={handleCloseTimeTravelModal}
        journalEntries={journalEntries} // Pass the journal entries to the modal
      />
    </div>
  );
}

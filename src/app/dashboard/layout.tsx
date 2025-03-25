"use client"; 

import { Geist, Geist_Mono } from "next/font/google";
import { useState, useRef, useEffect } from "react";
import Modal from "../components/page";
import InsightsModal from "../components/insights";
import TravelModal from "../components/travel";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";


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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const username = useUsernameFromToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false); 
  const [isTimeTravelModalOpen, setIsTimeTravelModalOpen] = useState(false); 
  const buttonRef = useRef(null); 
  const buttonnRef = useRef(null); 
  const [selectedDate, setSelectedDate] = useState<string>("");



  const [showUserDropdown, setShowUserDropdown] = useState(false);
  

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenInsightsModal = () => {
    setIsInsightsModalOpen(true); 
  };

  const handleCloseInsightsModal = () => {
    setIsInsightsModalOpen(false); 
  };

  const handleOpenTimeTravelModal = () => {
    setIsTimeTravelModalOpen(true); 
  };

  const handleCloseTimeTravelModal = () => {
    setIsTimeTravelModalOpen(false); 
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

  const [journalEntries, setJournalEntries] = useState<string[]>([]);

  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        const res = await fetch("/api/journal/date");
        const data = await res.json();
        setJournalEntries(data);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
      }
    };

    fetchJournalEntries();
  }, []); 

  const handleDateSelect = (date: string) => {
    setSelectedDate(date); 
  };

  return (
    <div className="bg-[#0E0F1C] text-white min-h-screen">
      <header className="flex justify-between items-center p-6 bg-[#181c29] text-white">
        <h1 className="text-4xl font-semibold">
          Journal me <span className="text-green-500">●</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={handleOpenTimeTravelModal}
            ref = {buttonnRef}
          >
            <CalendarDaysIcon className="w-5 h-5 text-blue-400" />
            Time travel
          </button>
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={handleOpenInsightsModal}
            ref={buttonRef}
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
      <main>{children}</main>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}/>

      <InsightsModal
        isOpen={isInsightsModalOpen}
        onClose={handleCloseInsightsModal}
      />

      <TravelModal
        isOpen={isTimeTravelModalOpen}
        onClose={handleCloseTimeTravelModal}
        journalEntries={journalEntries} 
        onDateSelect={handleDateSelect}
      />
    </div>
  );
}

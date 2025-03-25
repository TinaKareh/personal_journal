"use client"; // Mark this as a Client Component because we're using React hooks

import React, { useState } from "react";
import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css"; // Import CSS for styling the calendar
import { Value } from "react-calendar/src/shared/types.js";

const TravelModal = ({
  isOpen,
  onClose,
  journalEntries,
}: {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: string[];
}) => {
  const [date, setDate] = useState<Value>(new Date()); // Handle date change with correct type

  // Function to disable future dates
  const disableFutureDates = ({ date }: { date: Date }) => {
    const today = new Date();
    return date > today; // Disable future dates
  };

  // Function to highlight days with entries
  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
    return journalEntries.some((entry) => entry === formattedDate)
      ? "highlight"
      : ""; // Highlight if any entry exists
  };

  // Handle onChange with the correct type (single Date, range of Dates, or null)
  const handleDateChange = (value: Value) => {
    setDate(value);
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      {/* Modal Content */}
      <div className="bg-[#1a1c29] p-6 rounded-lg w-[400px] h-[400px] relative">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col items-start">
            <div className="flex items-center mb-2 w-full">
              <h3 className="text-xl text-white">Time Travel</h3>
              <button className="text-white text-l ml-auto" onClick={onClose}>
                X
              </button>
            </div>
            <h2 className="text-white">
              Select a date and relive the memories from that day
            </h2>
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileClassName={tileClassName} // Apply tile class for entries
            tileDisabled={disableFutureDates} // Disable future dates
            className="calendar-custom" // Custom class to apply custom styles
          />
        </div>
      </div>
    </div>
  );
};

export default TravelModal;

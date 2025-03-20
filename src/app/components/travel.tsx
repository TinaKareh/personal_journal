"use client"; // Mark this as a Client Component because we're using React hooks

import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import CSS for styling the calendar
import { Value } from "react-calendar/src/shared/types.js";


const TravelModal = ({
  isOpen,
  onClose,
  journalEntries, // Pass an array of journal entries with dates
}: {
  isOpen: boolean;
  onClose: () => void;
  journalEntries: string[]; // Array of dates with entries (example: ["2024-03-10", "2024-03-12"])
}) => {

// The current selected date, which can be a single date or a range (array of dates)
  const [date, setDate] = useState<Value>(new Date()); // Use Value type here for date

  // Function to disable future dates
  const disableFutureDates = ({ date }: { date: Date }) => {
    const today = new Date();
    return date > today; // Disable future dates
  };

  // Function to highlight days with entries
  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
    return journalEntries.includes(formattedDate) ? "highlight" : ""; // Highlight if date has an entry
  };

 // Handle onChange with correct type (single Date or Range of Dates)
 const handleDateChange = (value: Value) => {
    setDate(value); // Set date (either a single date or range)
  };

   // Format the selected date(s)
const formatSelectedDate = (date: Value) => {
    if (date === null) {
      return "No date selected"; // Handle the case where date is null
    }
  
    // if (Array.isArray(date)) {
    //   // If date is a range, display the start and end date
    //   return `${date[0].toLocaleDateString()} - ${date[1].toLocaleDateString()}`;
    // } else 
    if (date instanceof Date) {
      // If it's a single date, just display the date
      return date.toLocaleDateString();
    }
  
    return "No date selected";
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      {/* Modal Content */}
      <div className="bg-[#1a1c29] p-8 rounded-lg w-[600px] relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl text-white">Time Travel</h3>
          <button className="text-white" onClick={onClose}>×</button>
        </div>

        {/* Calendar */}
        <Calendar
          onChange={handleDateChange}
          value={date}
          tileClassName={tileClassName} // Apply tile class for entries
          tileDisabled={disableFutureDates} // Disable future dates
        />

        {/* Selected Date */}
        <div className="mt-4 text-white">
        <p>Selected Date: {formatSelectedDate(date)}</p>
        </div>
      </div>
    </div>
  );
};

export default TravelModal;

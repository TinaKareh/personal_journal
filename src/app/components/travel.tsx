"use client"; 

import React, { useState } from "react";
import Calendar from "react-calendar";
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
  const [date, setDate] = useState<Value>(new Date()); 

  const disableFutureDates = ({ date }: { date: Date }) => {
    const today = new Date();
    return date > today; 
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const formattedDate = date.toISOString().split("T")[0]; 
    return journalEntries.some((entry) => entry === formattedDate)
      ? "highlight"
      : ""; 
  };

  const handleDateChange = (value: Value) => {
    setDate(value);
  };

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
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

        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileClassName={tileClassName} 
            tileDisabled={disableFutureDates} 
            className="calendar-custom" 
          />
        </div>
      </div>
    </div>
  );
};

export default TravelModal;

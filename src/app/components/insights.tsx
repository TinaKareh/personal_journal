"use client"; // Mark this as a Client Component because we're using React hooks

import React, { useState } from "react";

const InsightsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed top-16 right-6 bg-opacity-50 flex justify-center items-start z-50">
      {/* Modal Content */}
      <div className="bg-[#1a1c29] p-8 rounded-lg w-[400px] relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col mb-2">
          <h3 className="text-xl text-white">Quick Insights</h3>
          <h2 className="text-l text-white">See your writing trends.</h2>
        </div>
        <button className="text-white" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Insights Content */}
        <div className="mb-4 border-b border-gray-700">
          <h4 className="text-lg text-white">Writing frequency</h4>
          <p className="text-gray-400">🔥 3 day writing streak</p>
        </div>

        <div className="mb-4 border-b border-gray-700">
          <h4 className="text-lg text-white">Ideal writing times</h4>
          <p className="text-gray-400">
            ⏰ 10:00 PM - 11:00 PM is when you <br />
            like to reflect the most
          </p>
        </div>

        <div className="mb-4 border-b border-gray-700">
          <h4 className="text-lg text-white">Most used label</h4>
          <p className="text-gray-400">
            📘 Relationships (100 journal entries)
          </p>
        </div>

        <div className="mb-4 border-b border-gray-700">
          <h4 className="text-lg text-white">Word count average</h4>
          <p className="text-gray-400">📝 250 words per entry. Go you!</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsModal;

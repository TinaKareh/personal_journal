"use client";

import React, { useState, useEffect } from "react";

const InsightsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [insights, setInsights] = useState<null | {
    writingStreak: number;
    idealWritingTime: string;
    mostUsedLabel: {
      label: string;
      count: number;
    };
    wordCountAverage: number;
  }>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/insights")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setInsights(data);
          }
        })
        .catch((err) => {
          setError("Failed to fetch insights.");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-6 bg-opacity-50 flex justify-center items-start z-50">
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

        {loading ? (
          <p className="text-gray-400">Loading insights...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : insights ? (
          <>
            <div className="mb-4 border-b border-gray-700">
              <h4 className="text-lg text-white">Writing frequency</h4>
              <p className="text-gray-400">
                🔥 {insights.writingStreak} day writing streak
              </p>
            </div>

            <div className="mb-4 border-b border-gray-700">
              <h4 className="text-lg text-white">Ideal writing times</h4>
              <p className="text-gray-400">
                ⏰ {insights.idealWritingTime} is when you <br />
                like to reflect the most
              </p>
            </div>

            <div className="mb-4 border-b border-gray-700">
              <h4 className="text-lg text-white">Most used label</h4>
              <p className="text-gray-400">
                📘 {insights?.mostUsedLabel.label} (
                {insights?.mostUsedLabel.count} journal entries)
              </p>
            </div>

            <div className="mb-4 border-b border-gray-700">
              <h4 className="text-lg text-white">Word count average</h4>
              <p className="text-gray-400">
                📝 {insights.wordCountAverage} words per entry. Go you!
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-400">No insights available yet.</p>
        )}
      </div>
    </div>
  );
};

export default InsightsModal;

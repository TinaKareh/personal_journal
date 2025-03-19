"use client";  // Mark this as a Client Component because we're using React hooks

import React, { useState, useEffect } from "react";
import Image from "next/image";

type Entry = {
  id: number;
  title: string;
  date: string;
  content: string;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setLoading(false);
      setEntries([
        {
          id: 1,
          title: "My first story",
          date: "March 10th, 2025",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        },
        {
          id: 2,
          title: "Another story",
          date: "March 12th, 2025",
          content: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        },
        {
          id: 3,
          title: "Third story",
          date: "March 15th, 2025",
          content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
        },
      ]);
    }, 2000); // Simulate loading
  }, []);

  const handleFilterChange = (label: string) => {
    setSelectedLabel(label === selectedLabel ? null : label);
  };

  const handleClearFilters = () => {
    setSelectedLabel(null); // Reset selected label
  };

  const filteredEntries = entries.filter((entry) =>
    selectedLabel ? entry.title.toLowerCase().includes(selectedLabel.toLowerCase()) : true
  );

  return (
    <div className="bg-[#0E0F1C] text-white min-h-screen p-30">

      {/* Start Writing Section */}
      <section className="text-center mb-8">
        <h2 className="text-6xl font-semibold">Start writing your stories</h2>
        <input
  type="text"
  placeholder="Start writing"
  className="mt-4 p-5 bg-[#22242b] text-white border-2 border-white rounded-lg w-full sm:w-[900px] mx-auto text-lg focus:border-white"
/>
      </section>

 {/* Filters */}
<section className="flex justify-center mb-8 gap-4">
  <button
    className={`px-4 py-2 rounded-md text-white font-semibold border-2 ${selectedLabel === "Work" ? "bg-blue-600 border-blue-600" : "bg-[#22242b] border-transparent hover:bg-blue-500 hover:border-blue-500"} `}
    onClick={() => handleFilterChange("Work")}
  >
    Work (30)
  </button>
  <button
    className={`px-4 py-2 rounded-md text-white font-semibold border-2 ${selectedLabel === "Relationships" ? "bg-green-600 border-green-600" : "bg-[#22242b] border-transparent hover:bg-green-500 hover:border-green-500"} `}
    onClick={() => handleFilterChange("Relationships")}
  >
    Relationships (10)
  </button>
  <button
    className={`px-4 py-2 rounded-md text-white font-semibold border-2 ${selectedLabel === "Addiction" ? "bg-purple-600 border-purple-600" : "bg-[#22242b] border-transparent hover:bg-purple-500 hover:border-purple-500"} `}
    onClick={() => handleFilterChange("Addiction")}
  >
    Addiction (4)
  </button>
  <button
    className={`px-4 py-2 rounded-md text-white font-semibold border-2 ${selectedLabel === "Reading" ? "bg-yellow-600 border-yellow-600" : "bg-[#22242b] border-transparent hover:bg-yellow-500 hover:border-yellow-500"} `}
    onClick={() => handleFilterChange("Reading")}
  >
    Reading (10)
  </button>
  
</section>

{/* Clear Filters Link */}
<section className="text-center mb-8">
        <button
          onClick={handleClearFilters}
          className="text-blue-400 hover:underline"
        >
          Clear filters
        </button>
      </section>


      {/* Entries List */}
      <section>
        {loading ? (
          <div className="flex justify-center items-center">
            <Image
              src="/loading.svg" // Replace with an actual loading spinner image or icon
              alt="Loading"
              width={50}
              height={50}
            />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center text-lg text-gray-400">
           <span className="text-3xl font-bold">Well that's embarrassing.</span>  
            <br />
            It seems like you created a label and didn't add a story yet.Try selecting another label.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#181c29] p-6 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-semibold">{entry.title}</h3>
                <p className="text-sm text-gray-400">{entry.date}</p>
                <p className="text-gray-300 mt-2">{entry.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

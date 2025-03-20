"use client"; // Mark this as a Client Component because we're using React hooks

import React, { useState } from "react";
import Image from "next/image";

const Modal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState("personalDetails");
  const [isEditing, setIsEditing] = useState(false); // State for editing personal details
  const [reminders, setReminders] = useState<string[]>([]); // State for the list of reminders
  const [newReminder, setNewReminder] = useState(""); // State for new reminder input
  const [isAddingReminder, setIsAddingReminder] = useState(false); // State to toggle the reminder form
  const [theme, setTheme] = useState("Dark"); // State for the current theme
  const [language, setLanguage] = useState("English"); // State for the current language
  const [isEditingPreferences, setIsEditingPreferences] = useState(false); // State to toggle preferences editing

  if (!isOpen) return null; // Don't render the modal if it's not open

  const handleAddReminder = () => {
    if (newReminder.trim() !== "") {
      setReminders([...reminders, newReminder]);
      setNewReminder(""); // Clear the input after adding
      setIsAddingReminder(false); // Close the form
    }
  };

  const handleSavePreferences = () => {
    setIsEditingPreferences(false); // Save and close edit mode
    // Here, you could implement saving to the backend or localStorage, etc.
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      {/* Modal Content */}
      <div className="bg-[#1a1c29] p-8 rounded-lg w-[800px] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl"
        >
          ×
        </button>

        <div className="flex flex-col mb-6">
          <h3 className="text-2xl text-white">Account Details</h3>
          <h2 className="text-l text-white">
            Manage your personal details, preferences, and set reminders to
            write
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 text-lg font-semibold ${
              activeTab === "personalDetails"
                ? "border-b-2 border-blue-600"
                : ""
            }`}
            onClick={() => setActiveTab("personalDetails")}
          >
            <span className="text-white">Personal details</span>
          </button>
          <button
            className={`px-4 py-2 text-lg font-semibold ${
              activeTab === "reminders" ? "border-b-2 border-blue-600" : ""
            }`}
            onClick={() => setActiveTab("reminders")}
          >
            <span className="text-white"> Reminders</span>
          </button>
          <button
            className={`px-4 py-2 text-lg font-semibold ${
              activeTab === "preferences" ? "border-b-2 border-blue-600" : ""
            }`}
            onClick={() => setActiveTab("preferences")}
          >
            <span className="text-white">Preferences</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "personalDetails" ? (
          <div>
            {/* Personal Details Content */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl text-white">Edit personal Details</h3>
                <h2 className="text-l text-white">
                  Manage your personal information
                </h2>
              </div>

              {/* Edit Button on the right */}
              <div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  onClick={() => setIsEditing((prev) => !prev)} // Toggle edit mode
                >
                  {isEditing ? "Cancel" : "Edit personal details"}
                </button>
              </div>
            </div>
            {/* Form with Fields */}
            <form>
              {/* Fields Wrapper with Flexbox for Two Columns */}
              <div className="flex mb-4">
                {/* Left Column (First Name and Gender) */}
                <div className="w-1/2 pr-2">
                  {/* First Name Field */}
                  <div className="mb-4">
                    <label className="text-white block mb-2">First name</label>
                    <input
                      type="text"
                      className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      placeholder="First name"
                      disabled={!isEditing} // Disable if not editing
                    />
                  </div>

                  {/* Gender Field */}
                  <div className="mb-4">
                    <label className="text-white block mb-2">Gender</label>
                    <select
                      className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      disabled={!isEditing}
                    >
                      <option>Select option</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {/* Right Column (Last Name and Date of Birth) */}
                <div className="w-1/2 pl-2">
                  {/* Last Name Field */}
                  <div className="mb-4">
                    <label className="text-white block mb-2">Last name</label>
                    <input
                      type="text"
                      className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      placeholder="Last name"
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Date of Birth Field */}
                  <div className="mb-4">
                    <label className="text-white block mb-2">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="mb-4">
                <button
                  type="submit"
                  className={`w-1/4 p-2 mt-4 ${
                    isEditing ? "bg-blue-600" : "bg-gray-600"
                  } text-white rounded-lg`}
                  disabled={!isEditing} // Disable if not editing
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === "reminders" ? (
          <div>
            {/* Reminders Content */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl text-white">Reminders</h3>
                <h2 className="text-l text-white">
                  Set a reminder to notify you when you need to write
                </h2>
              </div>

              {/* Edit Button on the right */}
              {!isAddingReminder && (
                <div className="flex items-center gap-4">
                  {" "}
                  {/* Added gap for spacing */}
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-[200px]"
                    onClick={() => setIsAddingReminder(true)} // Show form to add reminder
                  >
                    Add a reminder
                  </button>
                </div>
              )}

              {/* Cancel Button */}
              {isAddingReminder && (
                <div className="flex items-center gap-4">
                  {" "}
                  {/* Added gap for spacing */}
                  <button
                    onClick={() => setIsAddingReminder(false)} // Cancel adding reminder
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 w-[200px]" // Same width as the Add button
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* List of Reminders */}
            {!isAddingReminder && (
              <ul className="mb-4">
                {reminders.length > 0 ? (
                  reminders.map((reminder, index) => (
                    <li key={index} className="text-white mb-2">
                      - {reminder}
                    </li>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Image
                      src="/images/reminder.png" // Path to the image inside the public folder
                      alt="Reminder"
                      width={200}
                      height={200}
                    />
                    <h3 className="text-xl text-white">Must be nice</h3>
                    <h2 className="text-l text-white">
                      Must be nice to always remember when to do what <br />
                      you need to do. But just to be safe, we want to <br />
                      remind you to write.
                    </h2>
                  </div>
                )}
              </ul>
            )}

            {/* Form to add a reminder */}
            {isAddingReminder && (
              <form>
                <div className="flex mb-4">
                  <div className="w-1/2 pr-2">
                    <div className="mb-4">
                      <label className="text-white block mb-2">
                        Select time
                      </label>
                      <input
                        type="time"
                        className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="w-1/2 pl-2">
                    <div className="mb-4">
                      <label className="text-white block mb-2">
                        Select reminder type
                      </label>
                      <select className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg">
                        <option>Gentle</option>
                        <option>Passive Aggressive</option>
                        <option>Nonchalant</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Days Checkboxes */}
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="monday"
                      className="mr-2"
                      // Handle checkbox state with React state if needed
                    />
                    <label htmlFor="monday" className="text-white">
                      Monday
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tuesday"
                      className="mr-2"
                      // Handle checkbox state with React state if needed
                    />
                    <label htmlFor="tuesday" className="text-white">
                      Tuesday
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="wednesday"
                      className="mr-2"
                      // Handle checkbox state with React state if needed
                    />
                    <label htmlFor="wednesday" className="text-white">
                      Wednesday
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="thursday"
                      className="mr-2"
                      // Handle checkbox state with React state if needed
                    />
                    <label htmlFor="thursday" className="text-white">
                      Thursday
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="friday"
                      className="mr-2"
                      // Handle checkbox state with React state if needed
                    />
                    <label htmlFor="friday" className="text-white">
                      Friday
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saturday"
                      className="mr-2"
                      // Handle checkbox state with React state if needed
                    />
                    <label htmlFor="saturday" className="text-white">
                      Saturday
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sunday"
                      className="mr-2"
                      // Handle checkbox state with React state if needed
                    />
                    <label htmlFor="sunday" className="text-white">
                      Sunday
                    </label>
                  </div>
                </div>

                {/* Save Reminder Button */}
                <div className="mb-4">
                  <button
                    onClick={handleAddReminder}
                    className="w-1/4 p-2 mt-4 bg-blue-600 text-white rounded-lg"
                  >
                    Save reminder
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div>
            {/* Preferences Content */}
            <p className="text-gray-400 mb-2">Set your preferences</p>
            <button
              className="text-blue-600"
              onClick={() => setIsEditingPreferences(true)} // Toggle to edit mode
            >
              Edit preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

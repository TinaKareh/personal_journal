"use client"; // Mark this as a Client Component because we're using React hooks

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";

const Modal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState("personalDetails");
  const [isEditing, setIsEditing] = useState(false); // State for editing personal details
  const [newReminder, setNewReminder] = useState(""); // State for new reminder input
  const [isAddingReminder, setIsAddingReminder] = useState(false); // State to toggle the reminder form
  const [isEditingPreferences, setIsEditingPreferences] = useState(false); // State to toggle preferences editing
  const [reminderTime, setReminderTime] = useState<string>(""); // for time input
  const [reminderType, setReminderType] = useState<string>("GENTLE"); // for the type select dropdown
  const [selectedDays, setSelectedDays] = useState<string[]>([]); // for the days checkboxes
  const [selectedIds, setSelectedIds] = useState<number[]>([]); // for the days checkboxes
  const [editingReminder, setEditingReminder] = useState<number[] | null>(null); // To track which reminder is being edited
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newCategoryColor, setNewCategoryColor] = useState<string>("#000000");
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      // Fetch categories on modal open
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category", { credentials: "include" });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  type Reminder = {
    id: number;
    type: string;
    time: string;
    day: string;
  };

  type GroupedReminders = {
    [key: string]: Reminder[]; // key is 'time|type', value is an array of reminders
  };

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          setProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          });
        })
        .catch((err) => {
          console.error("Failed to load profile", err);
        });

      fetch("/api/user/reminder")
        .then((res) => res.json())
        .then((data) => {
          setReminders(data);
        })
        .catch((err) => console.error("Failed to fetch reminders", err));
    }
  }, [isOpen]);

  if (!isOpen) return null; // Don't render the modal if it's not open

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedDays((prev) =>
      checked ? [...prev, value] : prev.filter((day) => day !== value)
    );
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create payload with current form field values
    const payload = {
      time: reminderTime,
      type: reminderType,
      days: selectedDays, // pass selected days from the checkboxes
    };

    try {
      const res = await fetch("/api/user/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newReminders = await res.json(); // Getting array of reminders

        // Check the structure of the data
        console.log("New reminders received:", newReminders);

        // Check if the data is correct and matches the expected format
        // Add reminders one by one to ensure they are handled properly
        setReminders((prev) => [
          ...prev,
          ...newReminders.map((reminder: any) => ({
            ...reminder,
            time: new Date(reminder.time).toLocaleTimeString(), // Format time properly if needed
            type: reminder.type || "", // Default to empty string if undefined
          })),
        ]);

        setIsAddingReminder(false); // go back to list
      } else {
        console.error("Failed to add reminder");
      }
    } catch (err) {
      console.error("Error adding reminder", err);
    }
  };

  const handleAddOrUpdateReminder = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ids: selectedIds,
      time: reminderTime,
      type: reminderType,
      days: selectedDays,
    };

    try {
      if (editingReminder) {
        // If editing an existing reminder
        const res = await fetch(`/api/user/reminder`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          // Update the reminders list with the updated reminder
          const updatedReminder = await res.json();
          setReminders((prev) =>
            prev.map((reminder) =>
              reminder.id === updatedReminder.id ? updatedReminder : reminder
            )
          );
          setEditingReminder(null); // Clear the editing reminder state
          setIsAddingReminder(false); // Close the form
        }
      } else {
        // If adding a new reminder
        const res = await fetch("/api/user/reminder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const newReminder = await res.json();
          setReminders((prev) => [...prev, newReminder]);
          setIsAddingReminder(false); // Close the form
        }
      }
    } catch (err) {
      console.error("Error adding/updating reminder", err);
    }
  };

  const handleEditReminder = (
    ids: number[],
    type: string,
    time: string,
    days: string[]
  ) => {
    setEditingReminder(ids);
    setSelectedIds(ids);
    setReminderTime(time);
    setReminderType(type);
    setSelectedDays(days);
    setIsAddingReminder(true);
  };

  const handleDeleteReminders = async (ids: number[]) => {
    try {
      const res = await fetch(`/api/user/reminder`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }), // Send the list of ids in the request body
      });

      if (res.ok) {
        setReminders((prev) => prev.filter((r) => !ids.includes(r.id))); // Remove deleted reminders from the list
      } else {
        console.error("Failed to delete reminders");
      }
    } catch (err) {
      console.error("Error deleting reminders", err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;

    const payload = {
      name: newCategoryName,
      color: newCategoryColor,
    };

    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newCategory = await res.json();
        setCategories((prev) => [...prev, newCategory]);
        resetCategoryForm();
      } else {
        console.error("Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category", err);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryId || !newCategoryName) return;

    const payload = {
      id: editingCategoryId,
      name: newCategoryName,
      color: newCategoryColor,
    };

    try {
      const res = await fetch(`/api/category/${editingCategoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedCategory = await res.json();
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          )
        );
        resetCategoryForm();
      } else {
        console.error("Failed to update category");
      }
    } catch (err) {
      console.error("Error updating category", err);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`/api/category/${categoryToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.filter((category) => category.id !== categoryToDelete)
        );
        setShowDeleteConfirm(false);
        setCategoryToDelete(null);
      } else {
        console.error("Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category", err);
    }
  };

  const handleCancelEdit = () => {
    resetCategoryForm();
    setIsEditingCategory(false);
  };

  const handleEditClick = (category: any) => {
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setEditingCategoryId(category.id);
    setIsEditingCategory(true);
  };

  const handleDeleteClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setShowDeleteConfirm(true);
  };

  const resetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryColor("#000000");
    setIsEditingCategory(false);
    setEditingCategoryId(null);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setIsEditing(false); // Exit edit mode
      } else {
        console.error("Update failed");
      }
    } catch (err) {
      console.error("Update error", err);
    }
  };

  const groupReminders = (reminders: Reminder[]): GroupedReminders => {
    return reminders.reduce((acc: GroupedReminders, reminder: Reminder) => {
      const key = `${reminder.time}|${reminder.type}`; // Combine time and type as key
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reminder); // Add reminder to the group
      return acc;
    }, {});
  };

  // Group the reminders when data is fetched
  const groupedReminders = groupReminders(reminders);

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
            <form onSubmit={handleSaveChanges}>
              {/* Fields Wrapper with Flexbox for Two Columns */}
              <div className="flex mb-4">
                {/* Left Column (First Name and Gender) */}
                <div className="w-1/2 pr-2">
                  {/* First Name Field */}
                  <div className="mb-4">
                    <label className="text-white block mb-2">First name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                      className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      placeholder="First name"
                      disabled={!isEditing} // Disable if not editing
                    />
                  </div>

                  {/* Gender Field */}
                  <div className="mb-4">
                    <label className="text-white block mb-2">Gender</label>
                    <select
                      value={profile.gender}
                      onChange={(e) =>
                        setProfile({ ...profile, gender: e.target.value })
                      }
                      className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      disabled={!isEditing}
                    >
                      <option value="">Select option</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
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
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
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
                      value={profile.dateOfBirth}
                      onChange={(e) =>
                        setProfile({ ...profile, dateOfBirth: e.target.value })
                      }
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
                  Object.entries(groupedReminders).map(([key, grouped]) => {
                    // Get time and type from the grouped reminder key
                    const [time, type] = key.split("|");

                    // Combine days into a single string
                    const days = grouped.map((r) => r.day).join(", ");
                    const day = grouped.map((r) => r.day);
                    const ids = grouped.map((r) => r.id);

                    return (
                      <li
                        key={key}
                        className="text-white mb-2 flex justify-between"
                      >
                        <span>
                          {type} Reminder :🕒{time} on {days}
                        </span>
                        <div className="flex gap-2 items-center">
                          {" "}
                          {/* Added Flexbox container */}
                          <button
                            onClick={() =>
                              handleEditReminder(ids, type, time, day)
                            } // Add the appropriate handler for editing
                            className="text-white-500 flex items-center"
                          >
                            <PencilIcon className="h-5 w-5 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReminders(ids)} // Delete reminder
                            className="text-white-500 flex items-center"
                          >
                            <TrashIcon className="h-5 w-5 mr-2" />
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })
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
              <form onSubmit={handleAddOrUpdateReminder}>
                <div className="flex mb-4">
                  <div className="w-1/2 pr-2">
                    <div className="mb-4">
                      <label className="text-white block mb-2">
                        Select time
                      </label>
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="w-1/2 pl-2">
                    <div className="mb-4">
                      <label className="text-white block mb-2">
                        Select reminder type
                      </label>
                      <select
                        value={reminderType}
                        onChange={(e) => setReminderType(e.target.value)}
                        className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                      >
                        <option value="Gentle">Gentle</option>
                        <option value="Passive Aggressive">
                          Passive Aggressive
                        </option>
                        <option value="Nonchalant">Nonchalant</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Days checkboxes */}
                <div className="flex gap-4 mb-4">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <div className="flex items-center" key={day}>
                      <input
                        type="checkbox"
                        value={day} // Correct value for each checkbox
                        checked={selectedDays.includes(day)} // Check if the day is in the selectedDays array
                        onChange={handleDayChange} // Update selectedDays when checkbox is checked/unchecked
                        className="mr-2"
                      />
                      <label htmlFor={day} className="text-white">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Save Reminder Button */}
                <div className="mb-4">
                  <button
                    type="submit"
                    className="w-1/4 p-2 mt-4 bg-blue-600 text-white rounded-lg"
                  >
                    {editingReminder ? "Save Changes" : "Save reminder"}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xl text-white">Manage Categories</h3>
            <div className="my-4">
              {categories.map((category) => (
                <div key={category.id} className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TagIcon
                      className="w-6 h-6"
                      style={{ color: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="text-white-500 flex items-center"
                    >
                      <PencilIcon className="h-5 w-5 mr-2" />{" "}
                      {/* Add margin to the right of the icon */}
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category.id)}
                      className="text-white-500 flex items-center"
                    >
                      <TrashIcon className="h-5 w-5 mr-2" />{" "}
                      {/* Add margin to the right of the icon */}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsEditingCategory(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Category
            </button>

            {/* Category Form */}
            {isEditingCategory && (
              <form
                onSubmit={
                  isEditingCategory ? handleEditCategory : handleAddCategory
                }
              >
                <div className="mt-4">
                  <label className="text-white">Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                  />
                </div>
                <div className="mt-4">
                  <label className="text-white">Category Color</label>
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-full p-2 mt-2 bg-[#22242b] text-white border border-white rounded-lg"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    {isEditingCategory ? "Save Changes" : "Add Category"}
                  </button>
                  {isEditingCategory && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-[#1a1c29] p-8 rounded-lg w-[400px]">
                  <p className="text-white">
                    Are you sure you want to delete this category?
                  </p>
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={handleDeleteCategory}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

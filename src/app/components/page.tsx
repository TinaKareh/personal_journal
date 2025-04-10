"use client";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState<string>("");
  const [reminderType, setReminderType] = useState<string>("GENTLE");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingReminder, setEditingReminder] = useState<number[] | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [newCategoryColor, setNewCategoryColor] = useState<string>("#000000");
  const [isEditingCategory, setIsEditingCategory] = useState<boolean>(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [showReminderDeleteConfirm, setReminderShowDeleteConfirm] =
    useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedReminderIds, setSelectedReminderIds] = useState<number[]>([]);
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
    [key: string]: Reminder[];
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

  if (!isOpen) return null;

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedDays((prev) =>
      checked ? [...prev, value] : prev.filter((day) => day !== value)
    );
  };

  const resetReminderForm = () => {
    setReminderTime("");
    setReminderType("");
    setSelectedDays([]);
    setIsAddingReminder(false);
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
          setEditingReminder(null);
          setIsAddingReminder(false);
          resetReminderForm();
        }
      } else {
        // If adding a new reminder
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

          resetReminderForm();
        }
      }
    } catch (err) {
      console.error("Error adding/updating reminder", err);
    }
  };

  const convertTo24HourFormat = (time12hr: string): string => {
    const [time, modifier] = time12hr.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") {
      hours = (parseInt(hours) + 12).toString();
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }
    return `${hours}:${minutes}`;
  };

  const handleEditReminder = (
    ids: number[],
    type: string,
    time: string,
    days: string[]
  ) => {
    console.log("type", type);
    console.log("time", time);

    const time24hr = convertTo24HourFormat(time);
    console.log("time24hr", time24hr);

    setEditingReminder(ids);
    setSelectedIds(ids);
    setReminderTime(time24hr);
    setReminderType(type);
    setSelectedDays(days);
    setIsAddingReminder(true);
  };

  const handleDeleteReminderClick = (ids: number[]) => {
    setSelectedReminderIds(ids);
    setReminderShowDeleteConfirm(true);
  };

  const handleDeleteReminders = async () => {
    console.log("selectedReminderIds", selectedReminderIds);
    //if (selectedReminderIds.length === 0) return;

    try {
      const res = await fetch(`/api/user/reminder`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedReminderIds }),
      });

      if (res.ok) {
        setReminders((prev) =>
          prev.filter((r) => !selectedReminderIds.includes(r.id))
        );
        setReminderShowDeleteConfirm(false);
        setSelectedReminderIds([]);
      } else {
        console.error("Failed to delete reminders");
      }
    } catch (err) {
      console.error("Error deleting reminders", err);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;

    const payload = {
      id: editingCategoryId,
      name: newCategoryName,
      color: newCategoryColor,
    };

    try {
      if (isEditingCategory) {
        const res = await fetch(`/api/category`, {
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
        }
      } else {
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
      }
    } catch (err) {
      console.error("Error adding category", err);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategoryId(category.id);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setIsEditingCategory(true);
    setIsAddingCategory(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`/api/category?id=${categoryToDelete}`, {
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

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const handleReminderCancelDelete = () => {
    setReminderShowDeleteConfirm(false);
    setSelectedReminderIds([]);
  };

  const handleDeleteClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setShowDeleteConfirm(true);
  };

  const resetCategoryForm = () => {
    setNewCategoryName("");
    setNewCategoryColor("#000000");
    setIsAddingCategory(false);
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
        setIsEditing(false);
      } else {
        console.error("Update failed");
      }
    } catch (err) {
      console.error("Update error", err);
    }
  };

  const groupReminders = (reminders: Reminder[]): GroupedReminders => {
    return reminders.reduce((acc: GroupedReminders, reminder: Reminder) => {
      const key = `${reminder.time}|${reminder.type}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reminder);
      return acc;
    }, {});
  };

  const groupedReminders = groupReminders(reminders);

  const renderDeleteConfirm = () => (
    <div className="absolute right-0 top-100 mt-2 bg-[#1a1c29] p-4 rounded-lg w-[300px] z-14">
      <p className="text-white text-sm">
        Are you sure you want to delete this category?
      </p>
      <div className="flex justify-between mt-4">
        <button
          onClick={handleDeleteCategory}
          className="bg-red-600 text-white px-4 py-1 rounded-md text-sm"
        >
          Yes delete
        </button>
        <button
          onClick={handleCancelDelete}
          className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
        >
          Keep category
        </button>
      </div>
    </div>
  );

  const renderReminderDeleteConfirm = () => (
    <div className="absolute right-0 top-30 mt-2 bg-[#1a1c29] p-4 rounded-lg w-[300px] z-14">
      <p className="text-white text-sm">
        Are you sure you want to delete this reminder?
      </p>
      <div className="flex justify-between mt-4">
        <button
          onClick={handleDeleteReminders}
          className="bg-red-600 text-white px-4 py-1 rounded-md text-sm"
        >
          Yes delete
        </button>
        <button
          onClick={handleReminderCancelDelete}
          className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm"
        >
          Keep reminder
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#1a1c29] p-8 rounded-lg w-[800px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl"
        >
          X
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

              <div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  onClick={() => setIsEditing((prev) => !prev)}
                >
                  {isEditing ? "Cancel" : "Edit personal details"}
                </button>
              </div>
            </div>
            <form onSubmit={handleSaveChanges}>
              <div className="flex mb-4">
                <div className="w-1/2 pr-2">
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
                      disabled={!isEditing}
                    />
                  </div>

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

                <div className="w-1/2 pl-2">
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

              <div className="mb-4">
                <button
                  type="submit"
                  className={`w-1/4 p-2 mt-4 ${
                    isEditing ? "bg-blue-600" : "bg-gray-600"
                  } text-white rounded-lg`}
                  disabled={!isEditing}
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

              {!isAddingReminder && (
                <div className="flex items-center gap-4">
                  {" "}
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-[200px]"
                    onClick={() => setIsAddingReminder(true)}
                  >
                    Add a reminder
                  </button>
                </div>
              )}

              {isAddingReminder && (
                <div className="flex items-center gap-4">
                  {" "}
                  <button
                    onClick={() => setIsAddingReminder(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 w-[200px]" // Same width as the Add button
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {!isAddingReminder && (
              <ul className="mb-4">
                {reminders.length > 0 ? (
                  Object.entries(groupedReminders).map(([key, grouped]) => {
                    const [time, type] = key.split("|");

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
                          <button
                            onClick={() =>
                              handleEditReminder(ids, type, time, day)
                            }
                            className="text-white-500 flex items-center"
                          >
                            <PencilIcon className="h-5 w-5 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReminderClick(ids)}
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
                      src="/images/reminder.png"
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
                        <option value="Passive aggressive">
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
            {showReminderDeleteConfirm && renderReminderDeleteConfirm()}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-white">Manage Categories</h3>
              <button
                onClick={() => {
                  setIsAddingCategory((prev) => !prev);
                  setNewCategoryName("");
                  setNewCategoryColor("#000000");
                }}
                className={`${
                  isAddingCategory ? "bg-gray-600" : "bg-blue-600"
                } text-white px-4 py-2 rounded-lg hover:bg-opacity-80`}
              >
                {isAddingCategory ? "Cancel" : "Add Category"}
              </button>
            </div>

            {isAddingCategory && (
              <form onSubmit={handleSaveCategory}>
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

                <div className="mt-4 flex justify-between">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    {isEditingCategory ? "Update Category" : "Save Category"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      console.log("Selected color:", newCategoryColor);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Save Color
                  </button>
                </div>
              </form>
            )}

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

                  {category.userId && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-white-500 flex items-center"
                      >
                        <PencilIcon className="h-5 w-5 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category.id)}
                        className="text-white-500 flex items-center"
                      >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showDeleteConfirm && renderDeleteConfirm()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

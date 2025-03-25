"use client"; 

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PencilIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type Entry = {
  id: number;
  title: string;
  content: string;
  date: string;
  category: {
    id: number;
    name: string;
    color: string;
  };
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);

  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");

  type Category = {
    id: number;
    name: string;
    color: string;
    count: number;
    userId?: number | null;
    deletionStatus?: string;
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null);

  const router = useRouter();

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/category/count", {
        credentials: "include",
      });
      const data = await res.json();
      console.log("Fetched categories:", data);
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error("Expected an array but got:", data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories(); 
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        let url = `/api/journal?page=1&limit=50`;

        if (selectedCategoryId) {
          url += `&categoryId=${selectedCategoryId}`;
        }

        const res = await fetch(url, {
          credentials: "include",
        });

        const data = await res.json();
        const formatted = data.map((entry: any) => ({
          ...entry,
          date: new Date(entry.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }));
        setEntries(formatted);
      } catch (err) {
        console.error("Error fetching entries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [selectedCategoryId]);

  const [page, setPage] = useState(1);

  const loadMore = async () => {
    try {
      const res = await fetch(`/api/journal?page=${page + 1}&limit=50`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.length > 0) {
        setEntries((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error loading more entries:", err);
    }
  };

  const handleSaveEntry = async () => {
    if (!title || !content || !categoryId) return;

    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          content,
          categoryId: parseInt(categoryId),
        }),
      });

      if (res.ok) {
        const newEntry = await res.json();
        setEntries([newEntry, ...entries]);
        setTitle("");
        setContent("");
        setCategoryId("");
        setSuccessMsg("Entry saved!");
        setIsWriting(false);
        setTimeout(() => setSuccessMsg(""), 3000);

        fetchCategories();

        setSelectedCategoryId(null);
      } else {
        console.error("Failed to save");
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategoryId(null);
  };

  const handleDeleteClick = (id: number) => {
    setEntryToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    try {
      const res = await fetch(`/api/journal?id=${entryToDelete}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setEntries(entries.filter((e) => e.id !== entryToDelete));
        setShowConfirm(false);
        setEntryToDelete(null);

        // Re-fetch categories to update the count after saving a new entry
        fetchCategories();

        // Clear selected category filter after saving an entry
        setSelectedCategoryId(null);
      } else {
        console.error("Failed to delete entry.");
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  return (
    <div className="bg-[#0E0F1C] text-white min-h-screen p-30">
      <section className="text-center mb-8">
        <h2 className="text-6xl font-semibold">Start writing your stories</h2>
        {!isWriting ? (
          <input
            type="text"
            placeholder="Start writing"
            onFocus={() => setIsWriting(true)}
            className="mt-6 p-5 bg-[#22242b] text-white border-2 border-white rounded-lg w-full sm:w-[900px] mx-auto text-lg focus:border-white"
          />
        ) : (
          <div className="bg-[#181c29] p-6 rounded-lg shadow-md max-w-2xl mx-auto space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-3 bg-[#22242b] border border-[#333] text-white rounded-md"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story..."
              rows={6}
              className="w-full p-3 bg-[#22242b] border border-[#333] text-white rounded-md"
            />

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 bg-[#22242b] border border-[#333] text-white rounded-md"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="flex justify-between gap-4">
              <button
                onClick={handleSaveEntry}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
              >
                {saving ? "Saving..." : "Save Entry"}
              </button>
              <button
                onClick={() => setIsWriting(false)}
                className="w-full py-3 border border-gray-500 text-gray-300 rounded-md hover:bg-[#22242b]"
              >
                Cancel
              </button>
            </div>

            {successMsg && (
              <p className="text-green-400 text-center">{successMsg}</p>
            )}
          </div>
        )}
      </section>

      <section className="flex justify-center mb-8 gap-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="px-4 py-2 rounded-md text-white font-semibold border-2 transition-colors flex items-center gap-2"
            onClick={() =>
              setSelectedCategoryId(
                selectedCategoryId === cat.id ? null : cat.id
              )
            }
            style={{
              backgroundColor:
                selectedCategoryId === cat.id ? cat.color : "#22242b",
              borderColor:
                selectedCategoryId === cat.id ? cat.color : "transparent",
            }}
          >
            <TagIcon className="w-4 h-4 stroke-[5]" style={{ color: cat.color }} />
            <span>
              {cat.name} ({cat.count})
            </span>
          </button>
        ))}
      </section>

      <section className="text-center mb-8">
        <button
          onClick={handleClearFilters}
          className="text-blue-400 hover:underline"
        >
          Clear filters
        </button>
      </section>

      <section>
        {loading ? (
          <div className="flex justify-center items-center">
            <Image src="/loading.svg" alt="Loading" width={50} height={50} />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <Image
              src="/images/reminder.png"
              alt="Reminder"
              width={400}
              height={400}
            />
            <span className="text-3xl font-bold">Well that's embarrassing.</span>
            <br />
            It seems like you created a label and didn't add a story yet. Try
            selecting another label.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-[#181c29] p-6 rounded-lg shadow-md hover:shadow-lg transition-all relative"
              >
                <div className="absolute top-3 right-3 flex flex-col items-end space-y-2">
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/journal/${entry.id}`)
                      }
                      className="text-gray-400 hover:text-blue-400"
                      title="Edit Entry"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setConfirmingDeleteId(
                            confirmingDeleteId === entry.id ? null : entry.id
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                        title="Delete Entry"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>

                      {confirmingDeleteId === entry.id && (
                        <div className="absolute right-0 mt-2 z-50 bg-[#181c29] p-4 rounded-md shadow-lg text-sm w-60">
                          <p className="text-white mb-3">
                            Are you sure you want to delete this entry?
                          </p>
                          <div className="flex justify-between gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    `/api/journal?id=${entry.id}`,
                                    {
                                      method: "DELETE",
                                      credentials: "include",
                                    }
                                  );
                                  if (res.ok) {
                                    setEntries(
                                      entries.filter((e) => e.id !== entry.id)
                                    );
                                  }
                                } catch (err) {
                                  console.error("Error deleting entry:", err);
                                } finally {
                                  setConfirmingDeleteId(null);
                                }
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                            >
                              Yes delete
                            </button>
                            <button
                              onClick={() => setConfirmingDeleteId(null)}
                              className="text-blue-400 hover:underline text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {entry.category && (
                    <div className="flex items-center justify-end space-x-1">
                      <TagIcon
                        className="w-4 h-4 stroke-[5]" 
                        style={{ color: entry.category.color }}
                      />
                      <span
                        className="text-sm font-bold"
                        style={{ color: entry.category.color }}
                      >
                        {entry.category.name}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-400 mb-6">{entry.date}</p>

                <h3 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-3 overflow-hidden text-ellipsis whitespace-normal line-clamp-2">
                  {entry.title}
                </h3>

                <p className="text-gray-300 text-sm line-clamp-3 overflow-hidden text-ellipsis">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
        {entries.length >= 50 && (
          <div className="text-center mt-6">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Load More
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;

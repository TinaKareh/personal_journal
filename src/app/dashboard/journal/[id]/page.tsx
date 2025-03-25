"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

type Category = {
  id: number;
  name: string;
  color: string;
};

type Entry = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
};

export default function JournalDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);

  if (!id) {
    return <div className="text-white">Invalid entry ID.</div>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedCategoryId, setEditedCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch(`/api/journal?id=${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setEntry(data);
      } catch (err) {
        console.error("Failed to fetch journal entry:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category", {
          credentials: "include",
        });
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return <p className="text-white text-center">Loading...</p>;
  if (!entry) return <p className="text-white text-center">Entry not found.</p>;

  return (
    <div className="bg-[#0E0F1C] min-h-screen text-white px-6 py-10">
      <div className="flex justify-between items-center mb-6 px-2 sm:px-4 md:px-6 lg:px-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-white hover:underline text-l gap-1"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          back to my Journals
        </button>

        {isEditing ? (
          <div className="flex gap-2 relative">
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/journal", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                      id: entry.id,
                      title: editedTitle,
                      content: editedContent,
                      categoryId: editedCategoryId,
                    }),
                  });
                  const updated = await res.json();
                  setEntry(updated);
                  setIsEditing(false);
                } catch (err) {
                  console.error("Failed to save:", err);
                }
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
            >
              Save Journal
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDiscardConfirm(true)}
                className="text-blue-400 hover:underline text-sm"
              >
                Discard changes
              </button>

              {showDiscardConfirm && (
                <div className="absolute top-10 right-0 bg-[#181c29] p-4 rounded-md shadow-lg w-64 z-50">
                  <p className="text-white text-sm mb-3">
                    Are you sure you want to discard changes made in this entry?
                  </p>
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => {
                        setShowDiscardConfirm(false);
                        setIsEditing(false);
                        setEditedTitle(entry.title);
                        setEditedContent(entry.content);
                        setEditedCategoryId(entry.category?.id ?? null);
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
                    >
                      Yes discard
                    </button>
                    <button
                      onClick={() => setShowDiscardConfirm(false)}
                      className="text-blue-400 hover:underline text-sm font-semibold"
                    >
                      Keep writing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(true);
                setEditedTitle(entry.title);
                setEditedContent(entry.content);
              }}
              className="border border-gray-600 px-3 py-1.5 rounded-md hover:bg-[#22242b] text-sm flex items-center gap-1"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Journal
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="border border-gray-600 px-3 py-1.5 rounded-md hover:bg-[#22242b] text-sm flex items-center gap-1"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>

              {showDeleteConfirm && (
                <div className="absolute top-10 right-0 bg-[#181c29] p-4 rounded-md shadow-lg w-64 z-50">
                  <p className="text-white text-sm mb-3">
                    Are you sure you want to delete this journal entry?
                  </p>
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={async () => {
                        await fetch(`/api/journal?id=${id}`, {
                          method: "DELETE",
                          credentials: "include",
                        });
                        router.push("/dashboard");
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold"
                    >
                      Yes delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-blue-400 hover:underline text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <p className="text-l text-gray-400 mb-2">
          {new Date(entry.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="flex justify-between items-start mb-6">
          {isEditing ? (
            <input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full text-4xl font-bold bg-transparent border-b border-gray-600 focus:outline-none mb-4"
            />
          ) : (
            <h1 className="text-4xl font-bold">{entry.title}</h1>
          )}
        </div>
        {isEditing ? (
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select
              value={editedCategoryId ?? ""}
              onChange={(e) => setEditedCategoryId(Number(e.target.value))}
              className="bg-[#181c29] text-white border border-gray-600 rounded-md p-2 w-full"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        ) : entry.category ? (
          <div className="flex items-center gap-2 mb-4">
            <TagIcon
              className="w-6 h-6 stroke-[5]"
              style={{ color: entry.category.color }}
            />
            <span
              className="text-lg font-semibold"
              style={{ color: entry.category.color }}
            >
              {entry.category.name}
            </span>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No label</p>
        )}
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={10}
            className="w-full bg-transparent border border-gray-600 rounded-md p-4 text-gray-200 mb-4"
          />
        ) : (
          <article
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminNavbar from "@/Components/AdminNavbar";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function AdminCategoriesDashboard() {
  const { token, loading } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !token) return;

    async function fetchCategories() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/blog/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, [token, loading]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newCategoryName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/blog/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await res.json();

      if (res.ok) {
        setCategories((prev) => [...prev, data.category].sort((a, b) => a.name.localeCompare(b.name)));
        setNewCategoryName("");
      } else {
        setError(data.error || "Failed to create category");
      }
    } catch (err) {
      setError("An error occurred while communicating with the database.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    setError("");
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/blog/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        setError(data.error || "Failed to delete category");
      }
    } catch (err) {
      setError("An error occurred during category deletion.");
    }
  };

  if (loading || isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#e2e2e2] flex items-center justify-center text-black">
        <div className="text-center font-bold tracking-widest text-xs uppercase">
          Loading Admin Panel...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#e2e2e2] text-black">
      <AdminNavbar />

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            Categories
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Manage categories and topics for the blog articles
          </p>
        </div>

        {error && (
          <div className="mb-6 text-xs font-semibold text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 max-w-2xl animate-slideDown">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[35%_60%] gap-10 items-start">
          {/* Add Category Form Panel */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              Add New Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Real Estate Guides"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-gray-50 border-0 px-4 py-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#00CC61] hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-[10px] uppercase tracking-widest disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>

          {/* List Categories Panel */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-950">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="px-3 py-1.5 border border-red-100 hover:bg-red-50 hover:text-red-700 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-600 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

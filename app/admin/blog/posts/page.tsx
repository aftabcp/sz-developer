"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminNavbar from "@/Components/AdminNavbar";

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  published_at: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminPostsDashboard() {
  const { token, loading } = useAdminAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const router = useRouter();

  // Load data
  useEffect(() => {
    if (loading || !token) return;

    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch posts
        const postsRes = await fetch("/api/admin/blog/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postsData = await postsRes.json();
        if (postsData.posts) {
          setPosts(postsData.posts);
        }

        // Fetch categories
        const catRes = await fetch("/api/admin/blog/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const catData = await catRes.json();
        if (catData.categories) {
          setCategories(catData.categories);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [token, loading]);

  // Handle Publish/Unpublish
  const handleTogglePublish = async (id: string, currentStatus: string) => {
    setActionLoading(id);
    const action = currentStatus === "published" ? "unpublish" : "publish";
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        // Update local state
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id === id) {
              return {
                ...post,
                status: currentStatus === "published" ? "draft" : "published",
                published_at: currentStatus === "published" ? "" : new Date().toISOString(),
              };
            }
            return post;
          })
        );
      } else {
        alert(`Failed to ${action} post`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete Confirmation
  const handleDeletePost = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/blog/posts/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((post) => post.id !== deleteId));
        setDeleteConfirmOpen(false);
        setDeleteId(null);
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering Logic
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.slug && post.slug.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        
        {/* Top title and Create Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">
              Blog Posts
            </h1>
            <p className="text-xs text-gray-500 font-light">
              Manage your drafts, publish schedules, and articles
            </p>
          </div>
          <Link
            href="/admin/blog/posts/new"
            className="px-5 py-3 bg-[#00CC61] hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-xs uppercase tracking-widest cursor-pointer"
          >
            Create New Post
          </Link>
        </div>

        {/* Filters and Search toolbar */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative w-full md:w-[280px]">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-50 border-0 px-4 py-2.5 pl-10 text-xs rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all"
              />
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border-0 px-4 py-2.5 text-xs rounded-lg text-gray-700 focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-50 border-0 px-4 py-2.5 text-xs rounded-lg text-gray-700 focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <svg
                className="mx-auto h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4-6h.01M9 16h3m-3-3h3m0-3h3M9 10h1"
                />
              </svg>
              <p className="mt-4 text-xs text-gray-500 font-medium">No posts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Published Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-950">
                        {post.title}
                        <span className="block text-[10px] text-gray-400 font-light mt-0.5">
                          /blog/{post.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium capitalize">
                        {post.category || "General"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                            post.status === "published"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(post.published_at || post.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* Publish/Unpublish toggle */}
                        <button
                          onClick={() => handleTogglePublish(post.id, post.status)}
                          disabled={actionLoading === post.id}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                            post.status === "published"
                              ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                              : "border-[#00CC61] text-[#00CC61] hover:bg-green-50"
                          }`}
                        >
                          {actionLoading === post.id
                            ? "..."
                            : post.status === "published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>
 
                        {/* Edit */}
                        <Link
                          href={`/admin/blog/posts/${post.id}/edit`}
                          className="inline-block px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </Link>
 
                        {/* Delete */}
                        <button
                          onClick={() => {
                            setDeleteId(post.id);
                            setDeleteConfirmOpen(true);
                          }}
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
          )}
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white text-[10px] font-bold text-gray-700 rounded-lg border border-gray-200 hover:bg-[#00CC61] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 cursor-pointer"
            >
              PREV
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  currentPage === i + 1
                    ? "bg-[#00CC61] text-white"
                    : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white text-[10px] font-bold text-gray-700 rounded-lg border border-gray-200 hover:bg-[#00CC61] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 cursor-pointer"
            >
              NEXT
            </button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl max-w-[400px] w-full shadow-lg border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
              Confirm Delete
            </h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed mb-6">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

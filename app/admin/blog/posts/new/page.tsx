"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminNavbar from "@/Components/AdminNavbar";
import BlogPostEditor from "@/Components/BlogPostEditor";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewBlogPost() {
  const { token, loading } = useAdminAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading || !token) return;

    async function loadCategories() {
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
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, [token, loading]);

  const handleSubmit = async (postData: any) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        router.push("/admin/blog/posts");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create post");
      }
    } catch (err) {
      alert("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className="w-full min-h-screen bg-[#e2e2e2] flex items-center justify-center text-black">
        <div className="text-center font-bold tracking-widest text-xs uppercase">
          Loading Editor...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#e2e2e2] text-black">
      <AdminNavbar />

      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wider">
            Create Post
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Compose a new article for the blog
          </p>
        </div>

        <BlogPostEditor
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </main>
    </div>
  );
}

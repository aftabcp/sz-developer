"use client";

import * as React from "react";
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

interface BlogPostData {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  author: string;
  category: string;
  tags: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
  status: string;
  featured: number;
  reading_time: number;
  published_at?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPost({ params }: PageProps) {
  const { id } = React.use(params);
  const { token, loading } = useAdminAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading || !token || !id) return;

    async function loadData() {
      setDataLoading(true);
      try {
        // Fetch categories
        const catRes = await fetch("/api/admin/blog/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const catData = await catRes.json();
        if (catData.categories) {
          setCategories(catData.categories);
        }

        // Fetch posts and find the matching post
        const postsRes = await fetch("/api/admin/blog/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postsData = await postsRes.json();
        if (postsData.posts) {
          const found = postsData.posts.find((p: BlogPostData) => p.id === id);
          if (found) {
            setPost(found);
          } else {
            alert("Post not found");
            router.push("/admin/blog/posts");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, [token, loading, id, router]);

  const handleSubmit = async (postData: any) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "PUT",
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
        alert(err.error || "Failed to update post");
      }
    } catch (err) {
      alert("An error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="w-full min-h-screen bg-[#e2e2e2] flex items-center justify-center text-black">
        <div className="text-center font-bold tracking-widest text-xs uppercase">
          Loading Post Data...
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
            Edit Post
          </h1>
          <p className="text-xs text-gray-500 font-light">
            Update your post content and publish configuration
          </p>
        </div>

        {post && (
          <BlogPostEditor
            initialData={post}
            categories={categories}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </main>
    </div>
  );
}

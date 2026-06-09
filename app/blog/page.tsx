"use client";

import { useState, useEffect } from "react";
import Navbar from "@/Components/navbar";
import Footer from "@/Components/footer";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  category: string;
  reading_time: number;
  published_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BlogListing() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out",
    });
  }, []);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/blog/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch posts when dependencies change
  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const url = new URL("/api/blog/posts", window.location.origin);
        url.searchParams.set("page", currentPage.toString());
        url.searchParams.set("limit", "6");
        if (selectedCategory && selectedCategory !== "all") {
          url.searchParams.set("category", selectedCategory);
        }
        if (debouncedSearch) {
          url.searchParams.set("search", debouncedSearch);
        }

        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.posts) {
          setPosts(data.posts);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, [selectedCategory, debouncedSearch, currentPage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#e2e2e2] text-black">
      <Navbar />

      {/* Blog Hero Section */}
      <section className="relative w-full h-[40vh] md:h-[50vh] bg-black overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/footer-bg.jpg"
            alt="Blog Hero Background"
            fill
            priority
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 w-full px-6 md:px-12">
          <h1 
            className="tracking-wider text-[32px] md:text-[50px] font-bold uppercase"
            data-aos="fade-up"
          >
            <span className="text-[#00CC61]">OUR</span>
            <span className="text-white ml-3">STORIES</span>
          </h1>
          <p 
            className="text-[12px] md:text-[14px] text-gray-300 tracking-[0.2em] uppercase mt-2 max-w-md"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Insights, Updates, and news from SZ Developers
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
        
        {/* Filters and Search Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12" data-aos="fade-up">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            <button
              onClick={() => {
                setSelectedCategory("all");
                setCurrentPage(1);
              }}
              className={`px-5 py-2.5 text-xs font-medium uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#00CC61] text-white"
                  : "bg-white/80 hover:bg-white text-gray-700"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  setCurrentPage(1);
                }}
                className={`px-5 py-2.5 text-xs font-medium uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-[#00CC61] text-white"
                    : "bg-white/80 hover:bg-white text-gray-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-[320px] order-1 md:order-2">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white px-5 py-3 pr-10 text-sm rounded-lg border-0 focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-[240px] bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 pt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-white/50 rounded-xl" data-aos="fade-up">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No articles found</h3>
            <p className="mt-1 text-sm text-gray-500">
              We couldn't find any posts matching your selected search or category filters.
            </p>
          </div>
        ) : (
          /* Cards Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md flex flex-col hover:shadow-xl transition-all duration-300"
                  data-aos="fade-up"
                >
                  {/* Card Image */}
                  <div className="relative h-[240px] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={post.cover_image_url || "/footer-bg.jpg"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta & Category */}
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3 font-semibold uppercase tracking-wider">
                        <span className="text-[#00CC61]">{post.category || "General"}</span>
                        <span>•</span>
                        <span>{formatDate(post.published_at)}</span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-gray-900 line-clamp-2 leading-snug mb-3 hover:text-[#00CC61] transition-colors">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-6 font-light">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                      <span className="text-[11px] text-gray-400 font-medium tracking-wider">
                        {post.reading_time || 1} MIN READ
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-bold text-[#00CC61] flex items-center gap-1 group hover:text-green-700 transition-colors"
                      >
                        READ MORE
                        <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-16" data-aos="fade-up">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white text-xs font-medium text-gray-700 rounded-lg hover:bg-[#00CC61] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 cursor-pointer"
                >
                  PREVIOUS
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      currentPage === i + 1
                        ? "bg-[#00CC61] text-white"
                        : "bg-white hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white text-xs font-medium text-gray-700 rounded-lg hover:bg-[#00CC61] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 cursor-pointer"
                >
                  NEXT
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}

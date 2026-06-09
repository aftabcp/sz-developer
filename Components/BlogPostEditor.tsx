"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

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

interface BlogPostEditorProps {
  initialData?: BlogPostData;
  categories: Category[];
  onSubmit: (data: BlogPostData) => Promise<void>;
  submitting: boolean;
}

export default function BlogPostEditor({
  initialData,
  categories,
  onSubmit,
  submitting,
}: BlogPostEditorProps) {
  // State variables for all post properties
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || "");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [author, setAuthor] = useState(initialData?.author || "Admin");
  const [category, setCategory] = useState(initialData?.category || "");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.og_image_url || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [featured, setFeatured] = useState(initialData?.featured || 0);
  const [readingTime, setReadingTime] = useState(initialData?.reading_time || 1);
  const [publishedAt, setPublishedAt] = useState(
    initialData?.published_at ? initialData.published_at.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );

  const [seoOpen, setSeoOpen] = useState(false);
  const [hasAutosave, setHasAutosave] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#00CC61] underline cursor-pointer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-lg max-h-[400px] mx-auto block my-4",
        },
      }),
      Placeholder.configure({
        placeholder: "Write your beautiful article content here...",
      }),
    ],
    content: initialData?.content || "",
    onUpdate: ({ editor }) => {
      // Recalculate reading time on update (words count / 200)
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const calculatedTime = Math.max(1, Math.ceil(words / 200));
      setReadingTime(calculatedTime);
    },
  });

  // Handle Slug generation on title change
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialData) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  // Synchronize SEO Defaults
  useEffect(() => {
    if (!initialData) {
      setMetaTitle(title.slice(0, 60));
    }
  }, [title]);

  useEffect(() => {
    if (!initialData) {
      setMetaDescription(excerpt.slice(0, 160));
    }
  }, [excerpt]);

  // Check for autosave
  const storageKey = `autosave_blog_${initialData?.id || "new"}`;
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setHasAutosave(true);
    }
  }, [storageKey]);

  // Auto-Save Loop (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!editor) return;
      const dataToSave = {
        title,
        slug,
        excerpt,
        content: editor.getHTML(),
        cover_image_url: coverImageUrl,
        author,
        category,
        tags,
        meta_title: metaTitle,
        meta_description: metaDescription,
        og_image_url: ogImageUrl,
        status,
        featured,
        reading_time: readingTime,
        published_at: publishedAt,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }, 30000);

    return () => clearInterval(interval);
  }, [editor, title, slug, excerpt, coverImageUrl, author, category, tags, metaTitle, metaDescription, ogImageUrl, status, featured, readingTime, publishedAt]);

  // Restore Autosave
  const restoreAutosave = () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved || !editor) return;
    try {
      const parsed = JSON.parse(saved);
      setTitle(parsed.title || "");
      setSlug(parsed.slug || "");
      setExcerpt(parsed.excerpt || "");
      editor.commands.setContent(parsed.content || "");
      setCoverImageUrl(parsed.cover_image_url || "");
      setAuthor(parsed.author || "Admin");
      setCategory(parsed.category || "");
      setTags(parsed.tags || "");
      setMetaTitle(parsed.meta_title || "");
      setMetaDescription(parsed.meta_description || "");
      setOgImageUrl(parsed.og_image_url || "");
      setStatus(parsed.status || "draft");
      setFeatured(parsed.featured || 0);
      setReadingTime(parsed.reading_time || 1);
      setPublishedAt(parsed.published_at || new Date().toISOString().slice(0, 16));
      setHasAutosave(false);
    } catch (err) {
      console.error("Autosave restore failed", err);
    }
  };

  // Upload Cover Image
  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImageUrl(data.url);
        if (!ogImageUrl) setOgImageUrl(data.url);
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload Editor Image
  const handleUploadEditorImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editor) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch("/api/admin/blog/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      } else {
        alert(data.error || "Editor image upload failed");
      }
    } catch (err) {
      alert("Failed to upload editor image.");
    }
  };

  // Insert Link Tool
  const handleInsertLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter destination URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // Trigger Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("Title is required");
      return;
    }
    if (!category) {
      alert("Please select a category");
      return;
    }

    const payload: BlogPostData = {
      id: initialData?.id,
      title,
      slug,
      excerpt,
      content: editor ? editor.getHTML() : "",
      cover_image_url: coverImageUrl,
      author,
      category,
      tags,
      meta_title: metaTitle || title.slice(0, 60),
      meta_description: metaDescription || excerpt.slice(0, 160),
      og_image_url: ogImageUrl || coverImageUrl,
      status,
      featured,
      reading_time: readingTime,
      published_at: new Date(publishedAt).toISOString(),
    };

    onSubmit(payload).then(() => {
      // Clear autosave
      localStorage.removeItem(storageKey);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[72%_25%] gap-8 text-black">
      
      {/* LEFT COLUMN: TITLE & TIPTAP EDITOR */}
      <div className="space-y-6">
        
        {/* Autosave Banner */}
        {hasAutosave && (
          <div className="bg-green-50 p-4 rounded-xl border border-[#00CC61] flex items-center justify-between animate-fadeIn">
            <span className="text-xs text-green-800">
              We found a newer unsaved draft of this article in your browser.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={restoreAutosave}
                className="px-3 py-1.5 bg-[#00CC61] text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Restore
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(storageKey);
                  setHasAutosave(false);
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          {/* Post Title */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Article Title
            </label>
            <input
              type="text"
              placeholder="e.g. 5 Reasons to Invest in Wayanad Real Estate in 2026"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-gray-50 border-0 px-4 py-3 text-lg font-bold rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Short Description / Excerpt
            </label>
            <textarea
              rows={3}
              placeholder="A brief summary for cards and search results..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full bg-gray-50 border-0 px-4 py-3 text-sm rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all font-light"
            />
          </div>
        </div>

        {/* TipTap Rich Text Editor Container */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Toolbar Menu */}
          {editor && (
            <div className="bg-gray-50 border-b border-gray-100 p-3 flex flex-wrap gap-1">
              {/* Bold */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("bold") ? "bg-gray-200 text-black font-bold" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <b>B</b>
              </button>
              
              {/* Italic */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("italic") ? "bg-gray-200 text-black italic" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <i>I</i>
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("underline") ? "bg-gray-200 text-black underline" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <u>U</u>
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("strike") ? "bg-gray-200 text-black line-through" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                S
              </button>

              <span className="w-[1px] h-6 bg-gray-200 mx-1 align-middle self-center" />

              {/* H1 */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded text-xs font-bold cursor-pointer ${
                  editor.isActive("heading", { level: 1 }) ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                H1
              </button>

              {/* H2 */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded text-xs font-bold cursor-pointer ${
                  editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                H2
              </button>

              {/* H3 */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-2 rounded text-xs font-bold cursor-pointer ${
                  editor.isActive("heading", { level: 3 }) ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                H3
              </button>

              <span className="w-[1px] h-6 bg-gray-200 mx-1 align-middle self-center" />

              {/* Bullet List */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("bulletList") ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                • List
              </button>

              {/* Ordered List */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("orderedList") ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                1. List
              </button>

              {/* Blockquote */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("blockquote") ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                “ Quote
              </button>

              {/* Code Block */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("codeBlock") ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                &lt;/&gt; Code
              </button>

              <span className="w-[1px] h-6 bg-gray-200 mx-1 align-middle self-center" />

              {/* Link */}
              <button
                type="button"
                onClick={handleInsertLink}
                className={`p-2 rounded text-xs cursor-pointer ${
                  editor.isActive("link") ? "bg-gray-200 text-[#00CC61]" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Link
              </button>

              {/* Image Upload */}
              <button
                type="button"
                onClick={() => editorFileInputRef.current?.click()}
                className="p-2 rounded text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Image
              </button>
              <input
                type="file"
                ref={editorFileInputRef}
                onChange={handleUploadEditorImage}
                accept="image/*"
                className="hidden"
              />

              {/* Horizontal Rule */}
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="p-2 rounded text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                — Line
              </button>

              <span className="w-[1px] h-6 bg-gray-200 mx-1 align-middle self-center" />

              {/* Undo */}
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
              >
                Undo
              </button>

              {/* Redo */}
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
              >
                Redo
              </button>
            </div>
          )}

          {/* Editor Editable Area */}
          <div className="p-6 flex-1 focus:outline-none">
            <EditorContent 
              editor={editor}
              className="prose prose-sm max-w-none min-h-[400px] outline-none"
            />
          </div>

          {/* Character / Word count footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold flex justify-between uppercase tracking-wider">
            <span>
              {editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0} Words
            </span>
            <span>
              {readingTime} MIN READ TIME
            </span>
          </div>
        </div>

        {/* SEO OVERRIDES COLLAPSIBLE PANEL */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setSeoOpen(!seoOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider hover:bg-gray-50 border-0 outline-none cursor-pointer"
          >
            <span>SEO & Metadata Settings</span>
            <span>{seoOpen ? "▲" : "▼"}</span>
          </button>

          {seoOpen && (
            <div className="p-6 border-t border-gray-100 space-y-5 animate-slideDown">
              {/* Meta Title */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Meta Title
                  </label>
                  <span className={`text-[10px] font-bold ${metaTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>
                    {metaTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Leave empty to use main title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={65}
                  className="w-full bg-gray-50 border-0 px-4 py-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Meta Description
                  </label>
                  <span className={`text-[10px] font-bold ${metaDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>
                    {metaDescription.length}/160
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Short search results description..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={170}
                  className="w-full bg-gray-50 border-0 px-4 py-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all font-light"
                />
              </div>

              {/* Custom Slug */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="auto-generated-from-title"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)+/g, "")
                    )
                  }
                  className="w-full bg-gray-50 border-0 px-4 py-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all font-mono"
                />
              </div>

              {/* OG Image */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Open Graph Image (Social Preview)
                </label>
                <input
                  type="text"
                  placeholder="Same as cover image if empty"
                  value={ogImageUrl}
                  onChange={(e) => setOgImageUrl(e.target.value)}
                  className="w-full bg-gray-50 border-0 px-4 py-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all font-light"
                />
              </div>

              {/* Google Snippet Live Preview */}
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Google Search Result Preview
                </label>
                <div className="space-y-1">
                  <div className="text-[14px] text-[#1a0dab] hover:underline font-medium leading-tight line-clamp-1">
                    {metaTitle || title || "Please enter title"} | SZ Developers
                  </div>
                  <div className="text-[11px] text-[#006621] leading-none line-clamp-1">
                    https://www.szdevelopers.com/blog/{slug || "slug-here"}
                  </div>
                  <div className="text-[12px] text-[#545454] leading-snug line-clamp-2 font-light">
                    {metaDescription || excerpt || "Write an excerpt or metadata description to see how it renders in Google..."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: SIDEBAR SETTINGS (STICKY) */}
      <div className="space-y-6">
        
        {/* ACTION / SAVE PANEL */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          
          {/* Status Select */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Publish Status
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("draft")}
                className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                  status === "draft" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus("published")}
                className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                  status === "published" ? "bg-[#00CC61] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Publish
              </button>
            </div>
          </div>

          {/* Featured Post Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Featured Post
            </span>
            <input
              type="checkbox"
              checked={featured === 1}
              onChange={(e) => setFeatured(e.target.checked ? 1 : 0)}
              className="w-4 h-4 rounded text-[#00CC61] focus:ring-[#00CC61] accent-[#00CC61]"
            />
          </div>

          {/* Published At Date picker */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Publish Date-Time
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full bg-gray-50 border-0 px-3 py-2 text-xs rounded-lg text-gray-700 focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#00CC61] hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Saving Article..." : initialData ? "Update Post" : "Publish Post"}
          </button>
        </div>

        {/* METADATA CONFIG */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider pb-2 border-b border-gray-100 mb-2">
            Post settings
          </h3>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border-0 px-3 py-2.5 text-xs rounded-lg text-gray-700 focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all cursor-pointer"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              Tags
            </label>
            <input
              type="text"
              placeholder="e.g. luxury, wayanad, villas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-gray-50 border-0 px-3 py-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all font-light"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              Author
            </label>
            <input
              type="text"
              placeholder="Admin"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-gray-50 border-0 px-3 py-2.5 text-xs rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all font-light"
            />
          </div>
        </div>

        {/* COVER IMAGE CONTAINER */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider pb-2 border-b border-gray-100 mb-2">
            Cover Image
          </h3>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-[#00CC61] rounded-lg p-5 text-center cursor-pointer transition-colors bg-gray-50 flex flex-col justify-center items-center h-[140px]"
          >
            {coverImageUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={coverImageUrl}
                  alt="Cover Preview"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            ) : (
              <>
                <svg
                  className="w-8 h-8 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  {uploadingImage ? "Uploading..." : "Upload Cover Image"}
                </span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadCoverImage}
              accept="image/*"
              className="hidden"
            />
          </div>

          {coverImageUrl && (
            <div className="space-y-3 pt-2">
              {/* Cover Alt */}
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Alt Description
                </label>
                <input
                  type="text"
                  placeholder="Alt tag text for SEO..."
                  value={coverImageAlt}
                  onChange={(e) => setCoverImageAlt(e.target.value)}
                  className="w-full bg-gray-50 border-0 px-3 py-2 text-[10px] rounded focus:ring-1 focus:ring-[#00CC61] focus:outline-none transition-all font-light"
                />
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => {
                  setCoverImageUrl("");
                  setOgImageUrl("");
                }}
                className="w-full py-1.5 border border-red-100 hover:bg-red-50 hover:text-red-700 text-red-600 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Editor CSS styles block */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ProseMirror {
          min-height: 400px;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
          font-style: italic;
          font-weight: 300;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .prose li {
          margin-bottom: 0.25rem;
        }
        .prose blockquote {
          border-left: 3px solid #00CC61;
          padding-left: 1rem;
          color: #4b5563;
          font-style: italic;
          margin: 1rem 0;
        }
        .prose pre {
          background-color: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: monospace;
          margin: 1rem 0;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
      `}} />
    </form>
  );
}

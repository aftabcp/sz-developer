import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Navbar from "@/Components/navbar";
import Footer from "@/Components/footer";
import BlogPostClient from "@/Components/BlogPostClient";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface BlogPost {
  id: string;
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
  published_at: string;
  updated_at: string;
  created_at: string;
}

// Helper to fetch blog data
async function getPostData(slug: string) {
  const result = await db.execute({
    sql: `SELECT * FROM blogs WHERE slug = ? AND status = 'published'`,
    args: [slug],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const post = result.rows[0] as unknown as BlogPost;

  // Fetch related posts (same category, different ID, max 3)
  const relatedResult = await db.execute({
    sql: `SELECT id, title, slug, excerpt, cover_image_url, reading_time, published_at, category FROM blogs 
          WHERE category = ? AND id != ? AND status = 'published' 
          ORDER BY published_at DESC LIMIT 3`,
    args: [post.category || "", post.id],
  });

  return {
    post,
    related: relatedResult.rows as unknown as BlogPost[],
  };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostData(slug);

  if (!data) {
    return {
      title: "Article Not Found | SZ Developers",
    };
  }

  const { post } = data;
  const title = (post.meta_title || post.title) as string;
  const description = (post.meta_description || post.excerpt) as string;
  const imageUrl = (post.og_image_url || post.cover_image_url || "/linkPreviewSZ.png") as string;
  const url = `https://www.szdevelopers.com/blog/${slug}`;

  return {
    title: `${title} | SZ Developers`,
    description: description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title,
      description: description,
      url: url,
      type: "article",
      publishedTime: post.published_at as string,
      modifiedTime: post.updated_at as string,
      authors: [post.author as string],
      images: [
        {
          url: imageUrl.startsWith("http") ? imageUrl : `https://www.szdevelopers.com${imageUrl}`,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl.startsWith("http") ? imageUrl : `https://www.szdevelopers.com${imageUrl}`],
    },
  };
}

// Extract headings for Table of Contents
function extractHeadings(htmlContent: string) {
  const headingRegex = /<h([2-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    headings.push({ level, text, id });
  }
  return headings;
}

// Inject anchor IDs into heading tags
function injectHeadingIds(htmlContent: string) {
  return htmlContent.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, text) => {
    const plainText = text.replace(/<[^>]*>/g, "").trim();
    const id = plainText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    if (attrs.includes("id=")) return match;
    return `<h${level} id="${id}" ${attrs}>${text}</h${level}>`;
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPostData(slug);

  if (!data) {
    notFound();
  }

  const { post, related } = data;
  const postUrl = `https://www.szdevelopers.com/blog/${slug}`;
  const rawContent = (post.content || "") as string;
  const processedContent = injectHeadingIds(rawContent);
  const headings = extractHeadings(rawContent);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Structured Data Schema for Search Engines (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.cover_image_url || "https://www.szdevelopers.com/linkPreviewSZ.png",
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": post.author || "Admin",
    },
    "publisher": {
      "@type": "Organization",
      "name": "SZ Developers",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.szdevelopers.com/headerLogo.svg",
      },
    },
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden min-h-screen bg-[#e2e2e2] text-black">
      {/* Dynamic SEO JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      {/* Hero Header with Background Cover Image */}
      <section className="relative w-full min-h-[50vh] flex items-end py-16 bg-black text-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={(post.cover_image_url as string) || "/footer-bg.jpg"}
            alt={(post.title as string) || "Blog Cover"}
            fill
            priority
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1200px] w-full mx-auto px-6 md:px-12">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00CC61] mb-6 hover:text-green-400 transition-colors uppercase tracking-wider"
          >
            ← Back to Blog
          </Link>

          {/* Category Badge */}
          <span className="inline-block bg-[#00CC61] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            {post.category || "General"}
          </span>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight max-w-4xl mb-6">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-300 font-medium">
            <span className="flex items-center gap-1.5">
              By <span className="text-white font-bold">{post.author || "Admin"}</span>
            </span>
            <span className="hidden md:inline text-gray-500">•</span>
            <span>Published on {formatDate(post.published_at as string)}</span>
            <span className="hidden md:inline text-gray-500">•</span>
            <span className="uppercase">{post.reading_time || 1} Min Read</span>
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[28%_68%] gap-12 items-start">
          
          {/* Sticky Sidebar (TOC & Sharing) */}
          <aside className="lg:sticky lg:top-28">
            <BlogPostClient
              headings={headings}
              postUrl={postUrl}
              postTitle={post.title as string}
            />
          </aside>

          {/* Content Pane */}
          <article className="bg-white p-8 md:p-12 rounded-xl shadow-sm border border-gray-100 min-w-0">
            {/* Rich Text Output Styles */}
            <div 
              className="blog-content-body max-w-none text-gray-800 leading-relaxed text-sm md:text-base space-y-6"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
          </article>
        </div>

        {/* CSS rules for rich text content inline rendering style */}
        <style dangerouslySetInnerHTML={{ __html: `
          .blog-content-body h2 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin-top: 2rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 0.5rem;
          }
          .blog-content-body h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
            margin-top: 1.75rem;
            margin-bottom: 0.75rem;
          }
          .blog-content-body p {
            margin-bottom: 1.25rem;
            color: #374151;
            font-weight: 300;
          }
          .blog-content-body strong {
            font-weight: 600;
            color: #111827;
          }
          .blog-content-body ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1.25rem;
            space-y: 0.5rem;
          }
          .blog-content-body ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
            margin-bottom: 1.25rem;
            space-y: 0.5rem;
          }
          .blog-content-body li {
            margin-bottom: 0.5rem;
            color: #4b5563;
          }
          .blog-content-body blockquote {
            border-left: 4px solid #00CC61;
            padding-left: 1.25rem;
            font-style: italic;
            color: #4b5563;
            margin: 1.5rem 0;
            background-color: #f9fafb;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
          .blog-content-body img {
            border-radius: 0.5rem;
            margin: 2rem auto;
            max-width: 100%;
            height: auto;
          }
          .blog-content-body a {
            color: #00CC61;
            text-decoration: underline;
            font-weight: 500;
          }
          .blog-content-body a:hover {
            color: #008f43;
          }
          .blog-content-body pre {
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
            font-family: monospace;
          }
          .blog-content-body code {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            color: #ef4444;
          }
          .blog-content-body hr {
            margin: 2.5rem 0;
            border-color: #e5e7eb;
          }
        `}} />

        {/* Related Posts Row */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-gray-200">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-wider mb-10 uppercase">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((rel: any) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`} className="group block">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative h-[180px] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={rel.cover_image_url || "/footer-bg.jpg"}
                        alt={rel.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-[9px] font-bold tracking-widest text-[#00CC61] uppercase block mb-2">
                        {rel.category || "General"}
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-[#00CC61] transition-colors leading-snug">
                        {rel.title}
                      </h3>
                      <span className="text-[10px] text-gray-400 block mt-4 uppercase">
                        {rel.reading_time || 1} Min Read
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

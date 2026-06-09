"use client";

import { useState, useEffect } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface BlogPostClientProps {
  headings: Heading[];
  postUrl: string;
  postTitle: string;
}

export default function BlogPostClient({ headings, postUrl, postTitle }: BlogPostClientProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Setup ScrollSpy using IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible entries
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Highlight the first visible heading
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-100px 0px -40% 0px", // adjust trigger zone
        threshold: 0.1,
      }
    );

    headingElements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      headingElements.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [headings]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const encodedTitle = encodeURIComponent(postTitle);
  const encodedUrl = encodeURIComponent(postUrl);

  return (
    <div className="space-y-8 sticky top-28">
      {/* Table of Contents */}
      {headings.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hidden lg:block">
          <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-4 pb-2 border-b border-gray-100">
            Table of Contents
          </h3>
          <nav className="space-y-2.5">
            {headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`block text-xs leading-relaxed transition-colors duration-200 ${
                  h.level === 3 ? "pl-4" : ""
                } ${
                  activeId === h.id
                    ? "text-[#00CC61] font-bold"
                    : "text-gray-600 hover:text-[#00CC61]"
                }`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Share Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-4 pb-2 border-b border-gray-100">
          Share This Article
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {/* Twitter / X */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg hover:text-black transition-colors"
            title="Share on X"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg hover:text-blue-700 transition-colors"
            title="Share on LinkedIn"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg hover:text-green-600 transition-colors"
            title="Share on WhatsApp"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 1.977 14.07 .953 11.457.953c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.463 3.39 1.337 4.888L1.92 21.053l5.056-1.319zM17.187 14.4c-.294-.147-1.734-.855-2.002-.953-.268-.099-.463-.147-.659.147-.195.294-.756.953-.927 1.148-.171.195-.341.218-.634.072-1.259-.631-2.072-1.039-2.879-1.737-.662-.572-1.101-1.28-1.231-1.5-.13-.22-.013-.34.104-.457.106-.106.294-.341.441-.512.147-.171.195-.293.294-.488.098-.195.049-.366-.024-.512-.074-.147-.659-1.588-.902-2.174-.237-.571-.478-.493-.659-.502-.17-.008-.366-.01-.561-.01-.195 0-.512.073-.78.366-.268.293-1.024 1.002-1.024 2.443 0 1.44 1.049 2.833 1.195 3.028.147.195 2.062 3.149 4.997 4.417.698.301 1.244.482 1.668.617.702.223 1.341.192 1.847.116.564-.085 1.734-.707 1.979-1.391.244-.683.244-1.268.171-1.39-.072-.122-.268-.195-.561-.342z" />
            </svg>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className={`flex items-center justify-center p-2.5 rounded-lg transition-colors cursor-pointer ${
              copied
                ? "bg-[#00CC61] text-white"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-black"
            }`}
            title="Copy URL to clipboard"
          >
            {copied ? (
              <span className="text-[10px] font-bold">COPIED!</span>
            ) : (
              <svg
                className="w-4 h-4 fill-none stroke-current"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

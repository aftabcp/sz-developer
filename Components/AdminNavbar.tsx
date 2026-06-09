"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 text-black">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <Image
              src="/headerLogo.svg"
              alt="SZ Developers"
              width={80}
              height={34}
            />
          </Link>
          <span className="text-gray-300 font-light">|</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-900">
            Blog Admin
          </span>
          <nav className="hidden md:flex items-center gap-6 ml-4">
            <Link
              href="/admin/blog/posts"
              className="text-xs font-semibold uppercase tracking-wider text-gray-700 hover:text-[#00CC61] transition-colors"
            >
              Posts
            </Link>
            <Link
              href="/admin/blog/categories"
              className="text-xs font-semibold uppercase tracking-wider text-gray-700 hover:text-[#00CC61] transition-colors"
            >
              Categories
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/blog"
            target="_blank"
            className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#00CC61] transition-colors"
          >
            View Live Site ↗
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 font-bold rounded-lg transition-colors text-[10px] uppercase tracking-wider cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

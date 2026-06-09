"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin/blog/posts");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#e2e2e2] flex items-center justify-center px-6 text-black">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg border border-gray-100 w-full max-w-[400px] text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/headerLogo.svg"
            alt="SZ Developers"
            width={120}
            height={50}
          />
        </div>

        <h1 className="text-xl font-bold uppercase tracking-wider mb-2">
          Admin Portal
        </h1>
        <p className="text-xs text-gray-500 mb-6 font-light">
          Enter credentials to manage the blog system
        </p>

        {error && (
          <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border-0 px-4 py-3 text-sm rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all"
              required
            />
          </div>

          <div className="text-left">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-0 px-4 py-3 text-sm rounded-lg focus:ring-2 focus:ring-[#00CC61] focus:outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00CC61] hover:bg-green-600 text-white font-bold rounded-lg transition-colors text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

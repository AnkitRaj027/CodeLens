"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Code2, Sparkles, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      router.push("/analyzer");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || d.message).join(", "));
      } else if (err.message === "Network Error" || !err.response) {
        setError("Cannot connect to backend server. If Render was asleep, please wait 30 seconds and try again.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-md bg-[#18181B] border border-[#27272A] text-[#F4F4F5] mb-2">
            <Code2 className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F4F5] font-mono">Create CodeLens Account</h1>
          <p className="text-xs text-[#A1A1AA]">
            Master algorithm time and space complexity with deterministic AST insights
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111113] p-6 sm:p-8 rounded-lg border border-[#27272A] shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-md bg-[#18181B] border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block font-medium text-[#A1A1AA] mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full px-3.5 py-2 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-blue-500/50 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-[#A1A1AA] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ada@computing.edu"
                className="w-full px-3.5 py-2 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-blue-500/50 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-[#A1A1AA] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-3.5 py-2 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-blue-500/50 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#F4F4F5] text-[#09090B] hover:bg-white font-medium text-xs shadow-sm transition-all disabled:opacity-50 font-sans font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Free Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#27272A] text-center">
            <p className="text-xs text-[#71717A]">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1">
                Sign in <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

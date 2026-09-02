"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  LayoutDashboard, 
  Terminal, 
  Trophy, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  History, 
  Layers
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [historyCount, setHistoryCount] = useState<number>(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get<any[]>("/history/");
        setHistoryCount(res.data.length);
      } catch (e) {
        // Guest mode fallback
      }
    };
    loadStats();
  }, []);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#111113] rounded-lg border border-[#27272A] p-6 sm:p-8 space-y-2 shadow-sm">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#18181B] border border-[#27272A] text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Student Command Center</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F5] tracking-tight font-mono">
          Welcome back, {user?.full_name || user?.email || "Student Engineer"}
        </h1>
        <p className="text-xs text-[#A1A1AA] max-w-xl leading-relaxed">
          Track complexity analyses, challenge your algorithm intuition in the Practice Arena, and explore deterministic DSA proofs.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Saved Analyses</span>
            <History className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-[#F4F4F5]">{historyCount}</div>
          <p className="text-[10px] text-[#71717A]">Archived AST runs</p>
        </div>

        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Practice Points</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">100+</div>
          <p className="text-[10px] text-[#71717A]">Complexity arena score</p>
        </div>

        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Topics Mastered</span>
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">5 / 5</div>
          <p className="text-[10px] text-[#71717A]">Curriculum modules</p>
        </div>

        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#71717A]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Engine Accuracy</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">100%</div>
          <p className="text-[10px] text-[#71717A]">Deterministic compiler AST</p>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#71717A] font-mono">
          Workbenches & Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/analyzer"
            className="bg-[#111113] rounded-lg border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#3F3F46] transition-all group space-y-3 shadow-sm card-hover"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-blue-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F4F4F5] group-hover:text-blue-400 transition-colors font-mono">
                Complexity IDE Analyzer
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Paste Python or C++ code to deterministically analyze loops, recursion trees, and memory space with AST graphs.
              </p>
            </div>
            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-medium text-blue-400 font-mono">
              <span>Launch IDE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/practice"
            className="bg-[#111113] rounded-lg border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#3F3F46] transition-all group space-y-3 shadow-sm card-hover"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F4F4F5] group-hover:text-amber-400 transition-colors font-mono">
                Practice Arena
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Test your Big-O intuition against real problem sets with instant automated grading and mathematical proofs.
              </p>
            </div>
            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-medium text-amber-400 font-mono">
              <span>Start Challenge</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            href="/algorithms"
            className="bg-[#111113] rounded-lg border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#3F3F46] transition-all group space-y-3 shadow-sm card-hover"
          >
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#F4F4F5] group-hover:text-indigo-400 transition-colors font-mono">
                Algorithm Matrix
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Compare canonical search, sort, and DP algorithms side-by-side with theoretical operation scaling curves.
              </p>
            </div>
            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-medium text-indigo-400 font-mono">
              <span>Explore Matrix</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

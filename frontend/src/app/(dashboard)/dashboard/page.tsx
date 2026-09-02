"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  LayoutDashboard, 
  Terminal, 
  Trophy, 
  Flame, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  History, 
  Layers,
  BarChart3,
  Clock
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Student Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || user?.email || "Student Engineer"}!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Track your complexity analyses, challenge your algorithm intuition in the Practice Arena, and master DSA complexity proofs.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Saved Analyses</span>
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{historyCount}</div>
          <p className="text-[11px] text-slate-500">Archived algorithm AST runs</p>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Practice Points</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">100+</div>
          <p className="text-[11px] text-slate-500">Earned in Complexity Arena</p>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Topics Mastered</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">5 / 5</div>
          <p className="text-[11px] text-slate-500">Core DSA curriculum guides</p>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Engine Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 font-mono">100%</div>
          <p className="text-[11px] text-slate-500">Deterministic static compiler AST</p>
        </div>
      </div>

      {/* Quick Access Action Hub */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Core Workbenches & Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Analyzer IDE */}
          <Link
            href="/analyzer"
            className="glass-panel rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-950/20 transition-all group space-y-4"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                Complexity IDE Analyzer
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste Python or C++ code to deterministically analyze loops, recursion trees, and memory space with AST node graphs.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Launch IDE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Practice Arena */}
          <Link
            href="/practice"
            className="glass-panel rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-950/20 transition-all group space-y-4"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                Complexity Practice Arena
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test your Big-O intuition against real problem sets with instant automated grading and mathematical reasoning.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Start Challenge</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Algorithm Comparison */}
          <Link
            href="/algorithms"
            className="glass-panel rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-950/20 transition-all group space-y-4"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                Algorithm Matrix & Sandbox
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare canonical search, sort, and DP algorithms side-by-side with theoretical operation scaling curves.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-purple-400">
              <span>Explore Matrix</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  FileCode, 
  Calendar, 
  Clock, 
  Brain, 
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

interface SavedAnalysis {
  id: string;
  title: string;
  language: string;
  source_code: string;
  time_complexity: string;
  space_complexity: string;
  confidence: string;
  created_at: string;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState<string>("all");
  const [selectedComplexity, setSelectedComplexity] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<SavedAnalysis[]>("/history/");
      setAnalyses(res.data);
    } catch (e) {
      console.error("Failed to load history", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/history/${id}`);
      setAnalyses(analyses.filter((a) => a.id !== id));
      setDeleteId(null);
    } catch (e) {
      console.error("Failed to delete analysis", e);
    }
  };

  const filteredAnalyses = analyses.filter((item) => {
    const matchesSearch = !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.source_code.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLang === "all" || item.language.toLowerCase() === selectedLang;
    const matchesComp = selectedComplexity === "all" || item.time_complexity === selectedComplexity;
    return matchesSearch && matchesLang && matchesComp;
  });

  const getComplexityBadge = (c: string) => {
    if (c === "O(1)") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (c === "O(log n)") return "bg-teal-500/10 text-teal-400 border-teal-500/20";
    if (c === "O(n)") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (c === "O(n log n)") return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    if (c.includes("n²") || c.includes("n^2")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            Analysis Archive & Audit Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Saved Analysis History
          </h1>
        </div>

        <Link
          href="/analyzer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all w-fit"
        >
          <span>Open IDE Analyzer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or code contents..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Filter */}
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Languages</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>

          {/* Complexity Filter */}
          <select
            value={selectedComplexity}
            onChange={(e) => setSelectedComplexity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Complexities</option>
            <option value="O(1)">O(1)</option>
            <option value="O(log n)">O(log n)</option>
            <option value="O(n)">O(n)</option>
            <option value="O(n log n)">O(n log n)</option>
            <option value="O(n²)">O(n²)</option>
            <option value="O(2^n)">O(2^n)</option>
          </select>
        </div>
      </div>

      {/* History Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span>Loading analysis archive...</span>
        </div>
      ) : filteredAnalyses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnalyses.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all group shadow-xl space-y-4"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-750 text-slate-400">
                    {item.language}
                  </span>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getComplexityBadge(item.time_complexity)}`}>
                    Time: {item.time_complexity}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
              </div>

              {/* Code Snippet Preview */}
              <pre className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 font-mono text-[11px] text-slate-300 overflow-hidden line-clamp-3 leading-relaxed">
                {item.source_code}
              </pre>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete record"
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href="/analyzer"
                    title="Open in IDE"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800/80 p-12 text-center space-y-3 shadow-xl">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Saved Analyses Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Run an analysis in the IDE Analyzer and click "Save Analysis" to archive and review your algorithm benchmarks here.
          </p>
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all mt-2"
          >
            <span>Analyze Source Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

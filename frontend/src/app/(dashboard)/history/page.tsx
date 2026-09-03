"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  History, 
  Search, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  ArrowRight, 
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Analysis Archive & Audit Log</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F4F5] font-mono">
            Saved Analysis History
          </h1>
        </div>

        <Link
          href="/analyzer"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#F4F4F5] text-[#09090B] text-xs font-medium shadow-sm transition-all w-fit font-mono hover:bg-white"
        >
          <span>Open IDE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#111113] rounded-lg border border-[#27272A] p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or code statements..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-blue-500/50 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA] focus:outline-none cursor-pointer"
          >
            <option value="all">All Languages</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>

          <select
            value={selectedComplexity}
            onChange={(e) => setSelectedComplexity(e.target.value)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA] focus:outline-none cursor-pointer"
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
        <div className="py-20 flex flex-col items-center justify-center text-[#71717A] font-mono text-xs gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading analysis records...</span>
        </div>
      ) : filteredAnalyses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnalyses.map((item) => (
            <div
              key={item.id}
              className="bg-[#111113] rounded-lg border border-[#27272A] p-4 flex flex-col justify-between hover:border-[#3F3F46] transition-all group shadow-sm space-y-3 card-hover"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 font-mono">
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-[#18181B] border border-[#27272A] text-[#71717A]">
                    {item.language}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${getComplexityBadge(item.time_complexity)}`}>
                    {item.time_complexity}
                  </span>
                </div>

                <h3 className="text-xs font-semibold text-[#F4F4F5] truncate group-hover:text-blue-400 transition-colors font-mono">
                  {item.title}
                </h3>
              </div>

              <pre className="p-2.5 rounded-md bg-[#09090B] border border-[#27272A] font-mono text-[10px] text-[#A1A1AA] overflow-hidden line-clamp-3 leading-relaxed">
                {item.source_code}
              </pre>

              <div className="pt-2.5 border-t border-[#27272A] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete record"
                    className="p-1 rounded hover:bg-rose-500/10 hover:text-rose-400 text-[#71717A] transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <Link
                    href="/analyzer"
                    className="flex items-center gap-1 text-blue-400 hover:text-[#F4F4F5] font-medium transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-10 text-center space-y-3 shadow-sm">
          <History className="w-8 h-8 text-[#3F3F46] mx-auto" />
          <h3 className="text-xs font-semibold text-[#F4F4F5] font-mono">No Saved Analyses Found</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            Analyze code in the IDE and click "Save Report" to archive benchmark snapshots here.
          </p>
        </div>
      )}
    </div>
  );
}

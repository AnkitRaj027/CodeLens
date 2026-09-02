"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  Brain,
  Code2,
  Loader2
} from "lucide-react";

interface CurriculumTopicSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  estimated_minutes: number;
  summary: string;
  formula?: string;
  key_takeaways: string[];
}

export default function LearnPage() {
  const [topics, setTopics] = useState<CurriculumTopicSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<CurriculumTopicSummary[]>("/curriculum/topics");
      setTopics(res.data);
    } catch (e) {
      console.error("Failed to load curriculum", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const categories = ["all", ...Array.from(new Set(topics.map((t) => t.category)))];

  const filteredTopics = selectedCategory === "all"
    ? topics
    : topics.filter((t) => t.category === selectedCategory);

  const getDifficultyBadge = (d: string) => {
    switch (d.toLowerCase()) {
      case "beginner":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "intermediate":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "advanced":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Interactive DSA Curriculum</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Master Complexity Analysis
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            From Big-O fundamentals to Master Theorem recurrence relations and space-time optimization tradeoffs — explore rigorous curriculum guides designed for students and engineers.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all capitalize ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {cat === "all" ? "All Topics" : cat}
          </button>
        ))}
      </div>

      {/* Topic Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span>Loading curriculum modules...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((t) => (
            <Link
              key={t.id}
              href={`/learn/${t.slug}`}
              className="glass-panel rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-950/20 transition-all group space-y-5"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(t.difficulty)}`}>
                    {t.difficulty}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.estimated_minutes} min read</span>
                  </div>
                </div>

                {/* Title & Summary */}
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {t.summary}
                </p>
              </div>

              {/* Takeaways Pill Preview */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                <span>Start Lesson</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  GraduationCap, 
  Clock, 
  ArrowRight, 
  Loader2
} from "lucide-react";

import { DEFAULT_CURRICULUM_TOPICS } from "@/data/defaultData";

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
  const [topics, setTopics] = useState<CurriculumTopicSummary[]>(DEFAULT_CURRICULUM_TOPICS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const fetchTopics = async () => {
    try {
      const res = await api.get<CurriculumTopicSummary[]>("/curriculum/topics");
      if (res.data && res.data.length > 0) {
        setTopics(res.data);
      }
    } catch (e) {
      // Graceful offline/Vercel fallback
      setTopics(DEFAULT_CURRICULUM_TOPICS);
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
        return "text-[#71717A] bg-[#18181B] border-[#27272A]";
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111113] rounded-lg border border-[#27272A] p-6 sm:p-8 space-y-2 shadow-sm">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#18181B] border border-[#27272A] text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>DSA Complexity Curriculum</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F5] tracking-tight font-mono">
          Master Algorithm Analysis
        </h1>
        <p className="text-xs text-[#A1A1AA] max-w-2xl leading-relaxed">
          From Big-O asymptotic definitions to Master Theorem recurrence proofs and space-time optimization tradeoffs — explore rigorous curriculum guides.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#27272A] font-mono text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all capitalize ${
              selectedCategory === cat
                ? "bg-[#18181B] text-[#F4F4F5] border border-[#27272A]"
                : "text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#111113]"
            }`}
          >
            {cat === "all" ? "All Modules" : cat}
          </button>
        ))}
      </div>

      {/* Topic Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#71717A] font-mono text-xs gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span>Loading curriculum modules...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((t) => (
            <Link
              key={t.id}
              href={`/learn/${t.slug}`}
              className="bg-[#111113] rounded-lg border border-[#27272A] p-5 flex flex-col justify-between hover:border-[#3F3F46] transition-all group space-y-4 shadow-sm card-hover"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 font-mono">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.2 rounded border ${getDifficultyBadge(t.difficulty)}`}>
                    {t.difficulty}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-[#71717A]">
                    <Clock className="w-3 h-3" />
                    <span>{t.estimated_minutes} min read</span>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[#F4F4F5] group-hover:text-blue-400 transition-colors font-mono">
                  {t.title}
                </h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed line-clamp-2">
                  {t.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-medium text-blue-400 group-hover:text-[#F4F4F5] font-mono">
                <span>Start Lesson</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

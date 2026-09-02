"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  Clock, 
  GraduationCap, 
  CheckCircle2, 
  Play, 
  Code2, 
  Sparkles,
  BookOpen,
  Loader2,
  FileCode
} from "lucide-react";

interface CurriculumTopicDetail {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  estimated_minutes: number;
  summary: string;
  formula?: string;
  key_takeaways: string[];
  code_example: string;
  language: string;
  detailed_content: string;
}

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [topic, setTopic] = useState<CurriculumTopicDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<CurriculumTopicDetail>(`/curriculum/topics/${slug}`);
        setTopic(res.data);
      } catch (e) {
        console.error("Failed to load topic details", e);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchDetail();
  }, [slug]);

  const handleOpenInIDE = () => {
    if (!topic) return;
    // Route to analyzer
    router.push("/analyzer");
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading lesson details...</span>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Lesson Not Found</h2>
        <Link href="/learn" className="text-xs text-blue-400 hover:underline">
          Return to Curriculum Overview
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Curriculum</span>
      </Link>

      {/* Lesson Header */}
      <div className="space-y-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {topic.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{topic.estimated_minutes} min read</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {topic.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">
          {topic.summary}
        </p>
      </div>

      {/* Mathematical Formula Card (if present) */}
      {topic.formula && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 space-y-2 shadow-xl">
          <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider block">
            Mathematical Theorem / Recurrence Relation
          </span>
          <div className="font-mono text-sm sm:text-base font-bold text-white bg-slate-950/80 p-3 rounded-xl border border-slate-800 overflow-x-auto">
            {topic.formula}
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Core Principles & Takeaways
        </h3>
        <ul className="space-y-2.5">
          {topic.key_takeaways.map((point, idx) => (
            <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Interactive Code Demonstration */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl space-y-0">
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Algorithmic Demonstration ({topic.language})</span>
          </div>
          <button
            onClick={handleOpenInIDE}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Analyze in IDE</span>
          </button>
        </div>
        <pre className="p-5 font-mono text-xs text-slate-200 bg-[#0d1117] overflow-x-auto leading-relaxed">
          {topic.code_example}
        </pre>
      </div>

      {/* Detailed Content Markdown */}
      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
        <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white mb-2">In-Depth Mathematical Proof & Mechanism</h3>
          <div className="whitespace-pre-line leading-relaxed text-slate-300">
            {topic.detailed_content}
          </div>
        </div>
      </div>
    </div>
  );
}

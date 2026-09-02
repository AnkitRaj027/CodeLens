"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Play, 
  Loader2,
  FileCode
} from "lucide-react";
import { MarkdownRenderer, formatMathExpression } from "@/components/common/MarkdownRenderer";

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

import { DEFAULT_CURRICULUM_TOPICS } from "@/data/defaultData";

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [topic, setTopic] = useState<CurriculumTopicDetail | null>(() => {
    return DEFAULT_CURRICULUM_TOPICS.find((t) => t.slug === slug) || null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get<CurriculumTopicDetail>(`/curriculum/topics/${slug}`);
        if (res.data) setTopic(res.data);
      } catch (e) {
        // Fallback to local topic if offline/Vercel
        const fallback = DEFAULT_CURRICULUM_TOPICS.find((t) => t.slug === slug);
        if (fallback) setTopic(fallback as any);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchDetail();
  }, [slug]);

  const handleOpenInIDE = () => {
    if (!topic) return;
    router.push("/analyzer");
  };

  if (isLoading) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-[#71717A] font-mono text-xs gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
        <span>Loading lesson details...</span>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex-1 max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-base font-semibold text-[#F4F4F5] font-mono">Lesson Not Found</h2>
        <Link href="/learn" className="text-xs text-blue-400 hover:underline font-mono">
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
        className="inline-flex items-center gap-2 text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors font-mono"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Curriculum</span>
      </Link>

      {/* Lesson Header */}
      <div className="space-y-3 border-b border-[#27272A] pb-6 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded bg-[#18181B] text-blue-400 border border-[#27272A]">
            {topic.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
            <Clock className="w-3.5 h-3.5" />
            <span>{topic.estimated_minutes} min read</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F4F5] tracking-tight">
          {topic.title}
        </h1>

        <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed font-sans">
          {topic.summary}
        </p>
      </div>

      {/* Mathematical Formula Card (if present) */}
      {topic.formula && (
        <div className="p-5 rounded-lg bg-[#111113] border border-[#27272A] space-y-2.5 shadow-sm">
          <span className="text-[10px] uppercase font-mono font-semibold text-blue-400 tracking-wider block">
            Mathematical Theorem / Recurrence Relation
          </span>
          <div className="font-mono text-sm sm:text-base font-semibold text-blue-300 bg-[#09090B] p-4 rounded-md border border-[#27272A] overflow-x-auto text-center shadow-inner tracking-wide">
            {formatMathExpression(topic.formula)}
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      <div className="bg-[#111113] rounded-lg border border-[#27272A] p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Core Principles & Takeaways
        </h3>
        <ul className="space-y-2.5">
          {topic.key_takeaways.map((point, idx) => (
            <li key={idx} className="text-xs text-[#A1A1AA] leading-relaxed flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Interactive Code Demonstration */}
      <div className="bg-[#111113] rounded-lg border border-[#27272A] overflow-hidden shadow-sm space-y-0">
        <div className="px-5 py-3 bg-[#111113] border-b border-[#27272A] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 text-xs font-medium text-[#F4F4F5]">
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>Algorithmic Demonstration ({topic.language})</span>
          </div>
          <button
            onClick={handleOpenInIDE}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F4F4F5] text-[#09090B] hover:bg-white text-xs font-medium shadow-sm transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Analyze in IDE</span>
          </button>
        </div>
        <pre className="p-5 font-mono text-xs text-[#F4F4F5] bg-[#09090B] overflow-x-auto leading-relaxed">
          {topic.code_example}
        </pre>
      </div>

      {/* Detailed Content */}
      <div className="p-6 rounded-lg bg-[#111113] border border-[#27272A] space-y-4">
        <h3 className="text-sm font-semibold text-[#F4F4F5] font-mono mb-2">In-Depth Mathematical Analysis</h3>
        <MarkdownRenderer content={topic.detailed_content} />
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { StaticAnalysisResult, AIExplanationResult } from "@/types/analysis";
import { api } from "@/lib/api";
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Brain, 
  TrendingUp, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Lightbulb
} from "lucide-react";

interface AITutorPanelProps {
  code: string;
  language: string;
  result: StaticAnalysisResult;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({ code, language, result }) => {
  const [mode, setMode] = useState<string>("intermediate");
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<AIExplanationResult | null>(null);

  const fetchExplanation = async (targetMode = mode, questionText?: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<AIExplanationResult>("/ai/explain", {
        code,
        language,
        time_complexity: result.time_complexity,
        space_complexity: result.space_complexity,
        confidence: result.confidence,
        deterministic_findings: result.deterministic_summary,
        mode: targetMode,
        question: questionText || null,
      });
      setExplanation(res.data);
    } catch (e) {
      console.error("Failed to load AI explanation", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation(mode);
  }, [code, result.time_complexity, mode]);

  const handleAskQuestion = (q: string) => {
    setCustomQuestion(q);
    fetchExplanation(mode, q);
  };

  const sampleQuestions = [
    `Why is this ${result.time_complexity}?`,
    "What happens if N doubles from 1,000 to 2,000?",
    "Can this be optimized to O(n) or O(1)?",
    "Explain like I'm in a technical interview"
  ];

  return (
    <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 sm:p-6 space-y-6 shadow-sm">
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-blue-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] flex items-center gap-2">
              <span>Grounded AI Tutor</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AST Grounded
              </span>
            </h3>
            <p className="text-[10px] text-[#71717A]">
              Deterministic bounds injected as immutable ground truth
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-[#18181B] p-1 rounded-md border border-[#27272A] text-xs">
          {[
            { id: "beginner", label: "Beginner", icon: BookOpen },
            { id: "intermediate", label: "University", icon: GraduationCap },
            { id: "advanced", label: "Senior", icon: Brain },
            { id: "dsa_student", label: "DSA Interview", icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#27272A] text-[#F4F4F5] shadow-sm"
                    : "text-[#71717A] hover:text-[#A1A1AA]"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-[#71717A] font-mono text-xs gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span>Synthesizing pedagogical breakdown...</span>
        </div>
      ) : explanation ? (
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA] leading-relaxed space-y-1">
            <span className="text-[10px] uppercase font-mono font-semibold text-blue-400 tracking-wider block">
              Pedagogical Overview ({mode.toUpperCase()})
            </span>
            <p className="text-[#F4F4F5] text-xs leading-relaxed">{explanation.summary}</p>
          </div>

          {/* Step-by-Step Reasoning */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Step-by-Step Complexity Proof
            </h4>
            <div className="space-y-2">
              {explanation.step_by_step_reasoning.map((step, idx) => (
                <div key={idx} className="p-3 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA] leading-relaxed font-mono">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* N Doubling Scaling Card */}
          <div className="p-4 rounded-md bg-[#18181B] border border-[#27272A] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Input Scaling Analysis (What if N doubles?)</span>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              {explanation.what_happens_if_n_doubles}
            </p>
          </div>

          {/* Learning Takeaway */}
          <div className="p-4 rounded-md bg-[#18181B] border border-[#27272A] flex items-start gap-3 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#F4F4F5] block mb-0.5 font-mono">Core Principle:</span>
              <span className="text-[#A1A1AA]">{explanation.learning_takeaway}</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Interactive Natural Language Ask Box */}
      <div className="pt-4 border-t border-[#27272A] space-y-3 font-mono">
        <label className="block text-xs font-medium text-[#71717A]">
          Ask a Question About This Complexity Bound:
        </label>
        
        {/* Sample Question Chips */}
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              className="text-[10px] px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-[#202024] border border-[#27272A] text-[#71717A] hover:text-[#F4F4F5] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && customQuestion.trim() && handleAskQuestion(customQuestion)}
            placeholder="e.g. Can this loop be parallelized or solved with two pointers?"
            className="flex-1 px-3.5 py-2 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-blue-500/50 transition-all font-mono"
          />
          <button
            onClick={() => customQuestion.trim() && handleAskQuestion(customQuestion)}
            disabled={isLoading || !customQuestion.trim()}
            className="px-4 py-2 rounded-md bg-[#F4F4F5] text-[#09090B] hover:bg-white font-medium text-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};

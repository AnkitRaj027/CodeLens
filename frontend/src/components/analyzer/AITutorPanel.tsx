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
  HelpCircle, 
  Send, 
  Loader2, 
  ShieldCheck,
  Lightbulb,
  CheckCircle2
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
    "Explain like I'm learning DSA for interviews"
  ];

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 sm:p-6 space-y-6 shadow-2xl">
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Grounded AI DSA Tutor</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Grounded in AST Truth
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic static bounds injected as strict immutable constraints
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span>Synthesizing pedagogical breakdown...</span>
        </div>
      ) : explanation ? (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300 leading-relaxed space-y-1">
            <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider block">
              Pedagogical Overview ({mode.toUpperCase()})
            </span>
            <p className="text-slate-200 text-sm">{explanation.summary}</p>
          </div>

          {/* Step-by-Step Reasoning */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Step-by-Step Complexity Proof
            </h4>
            <div className="space-y-2">
              {explanation.step_by_step_reasoning.map((step, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* N Doubling Scaling Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Input Scaling Analysis (What if N doubles?)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {explanation.what_happens_if_n_doubles}
            </p>
          </div>

          {/* Learning Takeaway */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/20 flex items-start gap-3 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">Key Takeaway:</span>
              <span className="text-slate-300">{explanation.learning_takeaway}</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Interactive Natural Language Ask Box */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <label className="block text-xs font-medium text-slate-300">
          Ask a Question About This Code's Complexity:
        </label>
        
        {/* Sample Question Chips */}
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-400 hover:text-blue-300 transition-colors"
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
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button
            onClick={() => customQuestion.trim() && handleAskQuestion(customQuestion)}
            disabled={isLoading || !customQuestion.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};

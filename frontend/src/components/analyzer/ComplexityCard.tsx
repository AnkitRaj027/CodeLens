"use client";

import React from "react";
import { 
  Clock, 
  HardDrive, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  Repeat, 
  Info,
  Sparkles
} from "lucide-react";
import { StaticAnalysisResult } from "@/types/analysis";

interface ComplexityCardProps {
  result: StaticAnalysisResult;
}

export const ComplexityCard: React.FC<ComplexityCardProps> = ({ result }) => {
  // Color styling based on complexity class
  const getTimeColor = (c: string) => {
    if (c.includes("1") || c.includes("log n") || c.includes("log")) {
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
    if (c.includes("n log") || c === "O(n)") {
      return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    }
    if (c.includes("n²") || c.includes("n^2")) {
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    }
    if (c.includes("n³") || c.includes("2^n") || c.includes("n!")) {
      return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
    return "text-slate-300 bg-slate-800/40 border-slate-750";
  };

  const getConfidenceBadge = (conf: string) => {
    if (conf === "HIGH") {
      return {
        label: "Deterministic (High)",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        icon: ShieldCheck,
      };
    }
    if (conf === "MEDIUM") {
      return {
        label: "Estimated (Medium)",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        icon: AlertTriangle,
      };
    }
    return {
      label: "Uncertain (Low)",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      icon: AlertTriangle,
    };
  };

  const confBadge = getConfidenceBadge(result.confidence);
  const ConfIcon = confBadge.icon;

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-6 shadow-xl">
      {/* Top Header: Complexities & Confidence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Time Complexity Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[10px]">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Time Complexity
            </span>
          </div>
          <div className={`text-2xl sm:text-3xl font-bold code-font px-3 py-1.5 rounded-lg border w-fit ${getTimeColor(result.time_complexity)}`}>
            {result.time_complexity}
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Asymptotic Upper Bound</span>
        </div>

        {/* Space Complexity Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[10px]">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              Auxiliary Space
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold code-font px-3 py-1.5 rounded-lg border w-fit text-cyan-400 bg-cyan-500/10 border-cyan-500/20">
            {result.auxiliary_space || result.space_complexity}
          </div>
          <span className="text-[11px] text-slate-500 mt-2">Additional Memory Allocated</span>
        </div>

        {/* Confidence & Verification Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 font-medium uppercase tracking-wider text-[10px]">
              <ConfIcon className="w-3.5 h-3.5" />
              Engine Confidence
            </span>
          </div>
          <div className={`text-sm font-semibold px-3 py-1 rounded-lg border w-fit flex items-center gap-1.5 ${confBadge.color}`}>
            <ConfIcon className="w-4 h-4" />
            <span>{confBadge.label}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2" title={result.confidence_reason}>
            {result.confidence_reason}
          </p>
        </div>
      </div>

      {/* Structural Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
          <Repeat className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Loops Detected</span>
            <span className="text-xs font-bold text-white code-font">{result.deterministic_summary.total_loops}</span>
          </div>
        </div>

        <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Max Nesting Depth</span>
            <span className="text-xs font-bold text-white code-font">{result.deterministic_summary.max_loop_nesting_depth}</span>
          </div>
        </div>

        <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Allocated Memory</span>
            <span className="text-xs font-bold text-white code-font">{result.deterministic_summary.allocated_structures.length}</span>
          </div>
        </div>

        <div className="px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Recursion Stack</span>
            <span className="text-xs font-bold text-white code-font">{result.recursion_stack || "O(1)"}</span>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-200 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white mr-1">Deterministic AST Analysis:</span>
          {result.summary_explanation}
        </div>
      </div>
    </div>
  );
};

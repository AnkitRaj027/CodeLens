"use client";

import React from "react";
import { StaticAnalysisResult } from "@/types/analysis";
import { 
  Clock, 
  HardDrive, 
  ShieldCheck, 
  Activity, 
  GitFork
} from "lucide-react";

interface ComplexityCardProps {
  result: StaticAnalysisResult;
}

export const ComplexityCard: React.FC<ComplexityCardProps> = ({ result }) => {
  const getComplexityBadge = (c: string) => {
    if (c === "O(1)") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (c === "O(log n)") return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    if (c === "O(n)") return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (c === "O(n log n)") return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    if (c.includes("n²") || c.includes("n^2")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const getConfidenceBadge = (conf: string) => {
    switch (conf.toUpperCase()) {
      case "HIGH":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "MEDIUM":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Complexity Card */}
        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#71717A] mb-2 font-mono">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Time Complexity</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="space-y-1.5">
            <div className="text-3xl font-extrabold font-mono tracking-tight text-[#F4F4F5]">
              {result.time_complexity}
            </div>
            <span className={`inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${getComplexityBadge(result.time_complexity)}`}>
              Asymptotic Upper Bound
            </span>
          </div>
        </div>

        {/* Space Complexity Card */}
        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#71717A] mb-2 font-mono">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Space Complexity</span>
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="space-y-1.5">
            <div className="text-3xl font-extrabold font-mono tracking-tight text-[#F4F4F5]">
              {result.space_complexity}
            </div>
            <div className="text-[10px] text-[#71717A] font-mono">
              Auxiliary: <strong className="text-[#A1A1AA]">{result.auxiliary_space || "O(1)"}</strong> | Stack: <strong className="text-[#A1A1AA]">{result.recursion_stack || "O(1)"}</strong>
            </div>
          </div>
        </div>

        {/* Confidence Card */}
        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#71717A] mb-2 font-mono">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Static Confidence</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold font-mono px-2 py-0.5 rounded border ${getConfidenceBadge(result.confidence)}`}>
                {result.confidence}
              </span>
            </div>
            <div className="text-[10px] text-[#71717A] line-clamp-1 font-mono">
              {result.confidence_reason}
            </div>
          </div>
        </div>

        {/* AST Telemetry Card */}
        <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-[#71717A] mb-2 font-mono">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Structural Footprint</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-[#F4F4F5] font-mono flex items-center gap-3">
              <span>Loops: <strong className="text-blue-400">{result.deterministic_summary.total_loops}</strong></span>
              <span>Nesting: <strong className="text-amber-400">{result.deterministic_summary.max_loop_nesting_depth}</strong></span>
            </div>
            <div className="text-[10px] text-[#71717A] font-mono">
              Recursion: <strong className={result.deterministic_summary.has_recursion ? "text-rose-400" : "text-emerald-400"}>
                {result.deterministic_summary.has_recursion ? "Detected" : "None"}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Recursion Details Banner if present */}
      {result.deterministic_summary.has_recursion && (
        <div className="p-3.5 rounded-lg bg-[#111113] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <GitFork className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-medium text-[#F4F4F5] font-mono">
                Recursive Branching:
              </span>{" "}
              <span className="text-[#A1A1AA]">
                Function <code className="text-rose-400 font-mono">[{result.deterministic_summary.recursive_functions.join(", ")}]</code> requires <code className="text-blue-400 font-mono">{result.recursion_stack}</code> maximum activation frame depth.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

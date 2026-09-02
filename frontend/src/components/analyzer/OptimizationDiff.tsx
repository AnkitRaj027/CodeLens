"use client";

import React from "react";
import { StaticAnalysisResult, AIExplanationResult } from "@/types/analysis";
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  FileCode,
  Sparkles
} from "lucide-react";

interface OptimizationDiffProps {
  originalCode: string;
  language: string;
  result: StaticAnalysisResult;
  explanation?: AIExplanationResult | null;
}

export const OptimizationDiff: React.FC<OptimizationDiffProps> = ({
  originalCode,
  language,
  result,
  explanation,
}) => {
  const opt = explanation?.optimization;

  if (!opt || !opt.has_optimization || !opt.optimized_code) {
    return (
      <div className="bg-[#111113] rounded-lg border border-[#27272A] p-8 text-center space-y-3 shadow-sm">
        <div className="w-10 h-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-[#F4F4F5] font-mono">Algorithm is Asymptotically Optimal</h3>
        <p className="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
          The code operates at <span className="font-mono text-emerald-400 font-bold">{result.time_complexity}</span> time complexity. No obvious asymptotic algorithmic reduction is required.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111113] rounded-lg border border-[#27272A] p-5 sm:p-6 space-y-6 shadow-sm">
      {/* Header & Delta Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-4 font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] flex items-center gap-2">
              <span>Optimization Opportunity</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {opt.technique || "Optimized Alternative"}
              </span>
            </h3>
            <p className="text-[10px] text-[#71717A]">
              Transforming asymptotic polynomial order of growth
            </p>
          </div>
        </div>

        {/* Complexity Delta Badge */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-[#18181B] border border-[#27272A] text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#71717A]">Original:</span>
            <span className="font-bold text-rose-400">{result.time_complexity}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
          <div className="flex items-center gap-1.5">
            <span className="text-[#71717A]">Improved:</span>
            <span className="font-bold text-emerald-400">{opt.optimized_time_complexity || "O(n)"}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Code Diff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Code */}
        <div className="flex flex-col rounded-md border border-[#27272A] overflow-hidden bg-[#09090B]">
          <div className="px-4 py-2 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between text-xs font-mono">
            <span className="text-[#A1A1AA] flex items-center gap-1.5 text-xs">
              <FileCode className="w-3.5 h-3.5 text-rose-400" />
              Original Implementation
            </span>
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.2 rounded border border-rose-500/20 text-[10px] font-bold">
              Time: {result.time_complexity}
            </span>
          </div>
          <pre className="p-4 font-mono text-xs text-[#A1A1AA] overflow-x-auto leading-relaxed max-h-[300px]">
            {originalCode}
          </pre>
        </div>

        {/* Optimized Code */}
        <div className="flex flex-col rounded-md border border-[#27272A] overflow-hidden bg-[#09090B]">
          <div className="px-4 py-2 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between text-xs font-mono">
            <span className="text-[#F4F4F5] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Optimized Solution ({opt.technique})
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20 text-[10px] font-bold">
              Time: {opt.optimized_time_complexity || "O(n)"}
            </span>
          </div>
          <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-[300px]">
            {opt.optimized_code}
          </pre>
        </div>
      </div>

      {/* Trade-Off Matrix Card */}
      <div className="p-4 rounded-md bg-[#18181B] border border-[#27272A] space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] flex items-center gap-2 font-mono">
          <Scale className="w-3.5 h-3.5 text-blue-400" />
          Time vs. Space Trade-off Analysis
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-md bg-[#111113] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-mono uppercase font-semibold text-emerald-400 block">
              Temporal Gain (Speed)
            </span>
            <p className="text-[#A1A1AA] leading-relaxed">
              Runtime drops from quadratic <span className="font-mono text-[#F4F4F5]">{result.time_complexity}</span> to linear <span className="font-mono text-[#F4F4F5]">{opt.optimized_time_complexity}</span>, optimizing CPU cycle efficiency.
            </p>
          </div>

          <div className="p-3 rounded-md bg-[#111113] border border-[#27272A] space-y-1">
            <span className="text-[10px] font-mono uppercase font-semibold text-amber-400 block">
              Spatial Cost (RAM)
            </span>
            <p className="text-[#A1A1AA] leading-relaxed">
              Requires <span className="font-mono text-[#F4F4F5]">{opt.optimized_space_complexity || "O(n)"}</span> auxiliary heap memory to index items in a hash table.
            </p>
          </div>
        </div>

        {opt.tradeoff_explanation && (
          <p className="text-xs text-[#71717A] italic pt-1 border-t border-[#27272A] font-mono">
            "{opt.tradeoff_explanation}"
          </p>
        )}
      </div>
    </div>
  );
};

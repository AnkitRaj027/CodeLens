"use client";

import React from "react";
import { StaticAnalysisResult, AIExplanationResult } from "@/types/analysis";
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  Layers, 
  FileCode,
  Sparkles,
  AlertCircle
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
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-8 text-center space-y-3 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Algorithm is Already Near-Optimal</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          The current code operates at <span className="font-mono text-emerald-400 font-bold">{result.time_complexity}</span> time complexity. No obvious asymptotic algorithmic optimization (like eliminating nested loops) is required for this pattern.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 p-5 sm:p-6 space-y-6 shadow-2xl">
      {/* Header & Delta Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Algorithmic Optimization Recommendation</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {opt.technique || "Optimized Pattern"}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Transforming asymptotic polynomial order of growth
            </p>
          </div>
        </div>

        {/* Complexity Delta Badge */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Original:</span>
            <span className="font-mono font-bold text-rose-400">{result.time_complexity}</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Improved:</span>
            <span className="font-mono font-bold text-emerald-400">{opt.optimized_time_complexity || "O(n)"}</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Code Diff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Code */}
        <div className="flex flex-col rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60">
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-400 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-rose-400" />
              Original Code
            </span>
            <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[11px]">
              Time: {result.time_complexity}
            </span>
          </div>
          <pre className="p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[320px]">
            {originalCode}
          </pre>
        </div>

        {/* Optimized Code */}
        <div className="flex flex-col rounded-xl border border-emerald-500/30 overflow-hidden bg-slate-950/80 shadow-lg shadow-emerald-950/20">
          <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between text-xs">
            <span className="font-medium text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Optimized Alternative ({opt.technique})
            </span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 text-[11px]">
              Time: {opt.optimized_time_complexity || "O(n)"}
            </span>
          </div>
          <pre className="p-4 font-mono text-xs text-emerald-100 overflow-x-auto leading-relaxed max-h-[320px]">
            {opt.optimized_code}
          </pre>
        </div>
      </div>

      {/* Trade-Off Matrix Card */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-400" />
          Time vs. Space Trade-off Analysis
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 block">
              Temporal Gain (Speed)
            </span>
            <p className="text-slate-300 leading-relaxed">
              Runtime drops from quadratic <span className="font-mono text-white">{result.time_complexity}</span> to linear <span className="font-mono text-white">{opt.optimized_time_complexity}</span>, saving millions of CPU iterations for large inputs.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-amber-400 block">
              Spatial Cost (Memory)
            </span>
            <p className="text-slate-300 leading-relaxed">
              Requires <span className="font-mono text-white">{opt.optimized_space_complexity || "O(n)"}</span> auxiliary RAM to store visited elements in an indexed hash map.
            </p>
          </div>
        </div>

        {opt.tradeoff_explanation && (
          <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800">
            "{opt.tradeoff_explanation}"
          </p>
        )}
      </div>
    </div>
  );
};

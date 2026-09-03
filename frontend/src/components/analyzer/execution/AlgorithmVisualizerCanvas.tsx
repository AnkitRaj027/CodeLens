"use client";

import React from "react";
import { ExecutionStep } from "@/types/execution";
import { 
  Sparkles, 
  ArrowDown, 
  GitFork, 
  Check, 
  ArrowRightLeft, 
  Layers, 
  Split, 
  CheckCircle2,
  Minimize2
} from "lucide-react";

interface AlgorithmVisualizerCanvasProps {
  step: ExecutionStep | null;
}

export const AlgorithmVisualizerCanvas: React.FC<AlgorithmVisualizerCanvasProps> = ({ step }) => {
  if (!step || !step.algorithmState) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[380px] text-[#71717A] font-mono text-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#18181B] border border-[#27272A] flex items-center justify-center text-blue-400">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <p className="text-[#F4F4F5] font-semibold text-sm">Algorithm Studio Ready</p>
          <p className="text-[11px] text-[#A1A1AA] max-w-sm mt-1">
            Click <strong>Play</strong> or <strong>Next Step</strong> to start synchronized visual execution.
          </p>
        </div>
      </div>
    );
  }

  const { algorithmState } = step;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full py-4 px-2 font-mono select-none">
      {/* 1. MERGE SORT RECURSIVE VISUALIZATION */}
      {algorithmState.type === "merge_sort" && (
        <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-6">
          {/* Header indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <Split className="w-3.5 h-3.5" />
            <span>Divide & Conquer Partition Tree</span>
          </div>

          {/* Subarrays Centered Cluster */}
          {algorithmState.subArrays && (
            <div className="w-full flex flex-col items-center gap-4 overflow-x-auto pb-2">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-full">
                {algorithmState.subArrays.map((sub, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 sm:p-3.5 rounded-xl border transition-all duration-300 flex flex-col items-center ${
                      sub.active
                        ? "bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/40 shadow-xl shadow-blue-500/10 scale-105"
                        : "bg-[#141416] border-[#27272A] opacity-40 scale-95"
                    }`}
                  >
                    <div className="text-[11px] font-bold text-[#A1A1AA] mb-2 flex items-center gap-1.5">
                      <GitFork className="w-3 h-3 text-blue-400" />
                      <span>{sub.label}</span>
                    </div>

                    {/* Array Cells */}
                    <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full">
                      {sub.array.map((val, vIdx) => (
                        <div
                          key={vIdx}
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border flex items-center justify-center font-bold text-xs sm:text-sm shadow-inner transition-all shrink-0 ${
                            sub.active
                              ? "bg-[#18181B] border-blue-400/80 text-blue-300 shadow-blue-500/20"
                              : "bg-[#111113] border-[#27272A] text-[#71717A]"
                          }`}
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Comparison Card */}
          {algorithmState.comparison && (
            <div className="w-full max-w-lg p-3.5 sm:p-4 rounded-xl bg-[#141416] border border-amber-500/40 shadow-lg shadow-amber-500/5 space-y-2 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold uppercase">
                <span className="flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Element Comparison
                </span>
                <span className="text-[10px] text-[#A1A1AA]">O(1) Step</span>
              </div>

              <div className="flex items-center justify-center gap-3 sm:gap-4 text-sm sm:text-base font-bold text-[#F4F4F5] py-1">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-[#71717A] mb-0.5">Left</span>
                  <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    {algorithmState.comparison.left}
                  </span>
                </div>

                <span className="text-lg sm:text-xl text-amber-400 font-black">{algorithmState.comparison.op}</span>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-[#71717A] mb-0.5">Right</span>
                  <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {algorithmState.comparison.right}
                  </span>
                </div>
              </div>

              <div className="text-center text-xs font-bold text-emerald-400 pt-1">
                ✓ Decision: {algorithmState.comparison.result ? `Take Left (${algorithmState.comparison.left})` : `Take Right (${algorithmState.comparison.right})`}
              </div>
            </div>
          )}

          {/* Merged Sorted Output */}
          {algorithmState.merged && (
            <div className="w-full flex flex-col items-center space-y-2 pt-2 animate-in fade-in">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Merged Sorted Output</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                {algorithmState.merged.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/60 text-emerald-300 font-extrabold text-sm sm:text-base flex items-center justify-center shadow-lg shadow-emerald-500/10 scale-105"
                  >
                    {val}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. BINARY SEARCH VISUALIZATION */}
      {algorithmState.type === "binary_search" && algorithmState.array && (
        <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span>Logarithmic Search Window</span>
          </div>

          <div className="w-full overflow-x-auto pb-4 pt-4 sm:pt-6 flex justify-start sm:justify-center px-4">
            <div className="flex items-end gap-2 sm:gap-2.5 min-w-max mx-auto sm:mx-0">
              {algorithmState.array.map((val, idx) => {
                const pointer = algorithmState.indices?.find((p) => p.index === idx);
                const isHighlighted =
                  algorithmState.highlightRange &&
                  idx >= algorithmState.highlightRange[0] &&
                  idx <= algorithmState.highlightRange[1];

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 sm:gap-2">
                    {/* Pointer Pin above Box */}
                    <div className="h-7 flex items-center justify-center">
                      {pointer ? (
                        <div
                          style={{ borderColor: pointer.color || "#3B82F6", color: pointer.color || "#3B82F6" }}
                          className="text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border bg-[#18181B] shadow-md flex items-center gap-1 animate-bounce"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                          <span>{pointer.name}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Array Cell */}
                    <div
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-sm sm:text-base font-extrabold transition-all duration-300 shadow-sm ${
                        pointer?.name === "TARGET FOUND"
                          ? "bg-amber-500 text-black border-amber-300 ring-4 ring-amber-400/50 scale-110 shadow-2xl shadow-amber-500/40 z-10"
                          : pointer?.name === "mid"
                          ? "bg-blue-600/30 border-blue-400 text-blue-200 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 scale-105"
                          : isHighlighted
                          ? "bg-[#18181B] border-blue-500/40 text-[#F4F4F5]"
                          : "bg-[#111113] border-[#27272A] text-[#52525B] opacity-30 scale-95"
                      }`}
                    >
                      <span>{val}</span>
                    </div>

                    {/* Index Label */}
                    <span className="text-[10px] sm:text-[11px] text-[#71717A] font-bold">[{idx}]</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. GENERAL ARRAY / NESTED LOOPS */}
      {(algorithmState.type === "array" || algorithmState.type === "two_pointers" || algorithmState.type === "general") && algorithmState.array && (
        <div className="w-full max-w-xl flex flex-col items-center justify-center space-y-6">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <span>Iterative Traversal & Memory State</span>
          </div>

          <div className="flex items-center justify-center gap-3.5 flex-wrap">
            {algorithmState.array.map((val, idx) => {
              const pointer = algorithmState.indices?.find((p) => p.index === idx);
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border font-mono min-w-[84px] text-center transition-all duration-300 ${
                    pointer
                      ? "bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/50 shadow-xl shadow-blue-500/20 scale-110"
                      : "bg-[#18181B] border-[#27272A]"
                  }`}
                >
                  <div className="text-[10px] text-[#71717A] font-bold">Index [{idx}]</div>
                  <div className="text-lg font-black text-[#F4F4F5] my-1">{val}</div>
                  <div className="h-4 flex items-center justify-center">
                    {pointer ? (
                      <span
                        style={{ color: pointer.color || "#3B82F6" }}
                        className="text-[10px] font-extrabold uppercase tracking-wider"
                      >
                        ▲ {pointer.name}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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
  Minimize2,
  LayoutGrid
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

      {/* 4. MATHEMATICAL / SCALAR STATE LEDGER (No bogus arrays) */}
      {algorithmState.type === "math_state" && (
        <div className="w-full max-w-xl flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95">
          {/* Header indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mathematical State & Variable Register Ledger</span>
          </div>

          {/* Active Formula & Condition Evaluation Card */}
          {algorithmState.activeFormula && (
            <div className="w-full p-4 rounded-xl bg-[#141416] border border-emerald-500/30 shadow-lg shadow-emerald-500/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase">
                <span>Active Expression & Loop Condition</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  algorithmState.formulaResult !== false 
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}>
                  {algorithmState.formulaResult !== false ? "Condition Satisfied (True)" : "Halt Boundary Reached (False)"}
                </span>
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-[#F4F4F5] bg-[#09090B] px-3 py-2 rounded-lg border border-[#27272A] text-center">
                {algorithmState.activeFormula}
              </div>
            </div>
          )}

          {/* Live Variable Registers */}
          {algorithmState.mathRegisters && (
            <div className="w-full space-y-2">
              <div className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider text-center">
                Active Scalar Registers
              </div>
              <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                {Object.entries(algorithmState.mathRegisters).map(([varName, val], idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 ring-1 ring-emerald-500/20 shadow-lg font-mono min-w-[100px] text-center transition-all duration-300 scale-105"
                  >
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                      {varName}
                    </div>
                    <div className="text-xl font-black text-[#F4F4F5] my-1">
                      {String(val)}
                    </div>
                    <div className="text-[9px] text-[#71717A]">
                      O(1) Scalar Register
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. STRING CHARACTER TAPE & WINDOW TRAVERSAL */}
      {algorithmState.type === "string_state" && algorithmState.stringData && (
        <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95">
          {/* Header indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Character Stream & Two-Pointer Tape</span>
          </div>

          {/* Character Tiles */}
          <div className="w-full overflow-x-auto pb-4 pt-4 flex justify-start sm:justify-center px-4">
            <div className="flex items-end gap-2 sm:gap-2.5 min-w-max mx-auto sm:mx-0">
              {algorithmState.stringData.text.split("").map((char, idx) => {
                const pointer = algorithmState.stringData?.pointers?.find((p) => p.index === idx);
                const isInsideWindow =
                  algorithmState.stringData?.window &&
                  idx >= algorithmState.stringData.window[0] &&
                  idx <= algorithmState.stringData.window[1];

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 sm:gap-2">
                    {/* Pointer Label Pin */}
                    <div className="h-7 flex items-center justify-center">
                      {pointer ? (
                        <div
                          style={{ borderColor: pointer.color || "#06B6D4", color: pointer.color || "#06B6D4" }}
                          className="text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border bg-[#18181B] shadow-md flex items-center gap-1 animate-bounce"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                          <span>{pointer.name}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Character Tile */}
                    <div
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center text-sm sm:text-base font-extrabold transition-all duration-300 shadow-sm ${
                        pointer
                          ? "bg-cyan-950/40 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20 scale-105"
                          : isInsideWindow
                          ? "bg-[#18181B] border-cyan-500/40 text-[#F4F4F5]"
                          : "bg-[#111113] border-[#27272A] text-[#52525B] opacity-40 scale-95"
                      }`}
                    >
                      <span>'{char}'</span>
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

      {/* 6. 2D MATRIX / SPATIAL GRID VISUALIZATION */}
      {algorithmState.type === "matrix" && algorithmState.matrix && (
        <div className="w-full max-w-2xl flex flex-col items-center justify-center space-y-5 animate-in fade-in zoom-in-95">
          {/* Header indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-3.5 py-1.5 rounded-full border border-purple-500/30 shadow-sm">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2D Matrix Spatial Grid & Cell Traversal</span>
          </div>

          {/* Matrix Dimension & Active Coordinate Badges */}
          <div className="flex items-center justify-center gap-3 text-xs font-mono flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA]">
              Dimensions: <strong className="text-purple-300">{algorithmState.matrix.length} Rows × {algorithmState.matrix[0]?.length || 0} Cols</strong>
            </span>
            {algorithmState.activeCell && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                Active Cell: [{algorithmState.activeCell[0]}, {algorithmState.activeCell[1]}] = {
                  algorithmState.matrix[algorithmState.activeCell[0]]?.[algorithmState.activeCell[1]]
                }
              </span>
            )}
          </div>

          {/* 2D Table / Grid Display */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#141416] border border-[#27272A] shadow-xl overflow-x-auto max-w-full">
            <div className="flex flex-col gap-2 min-w-max mx-auto">
              {/* Column Index Headers */}
              <div className="flex items-center gap-2 pl-8">
                {algorithmState.matrix[0]?.map((_, colIdx) => (
                  <div key={colIdx} className="w-12 sm:w-14 text-center text-[11px] font-bold text-[#71717A]">
                    c[{colIdx}]
                  </div>
                ))}
              </div>

              {/* Rows */}
              {algorithmState.matrix.map((row, rIdx) => (
                <div key={rIdx} className="flex items-center gap-2">
                  {/* Row Index Header */}
                  <div className="w-6 text-right text-[11px] font-bold text-[#71717A]">
                    r[{rIdx}]
                  </div>

                  {/* Row Cells */}
                  <div className="flex items-center gap-2">
                    {row.map((cellVal, cIdx) => {
                      const isActive =
                        algorithmState.activeCell &&
                        algorithmState.activeCell[0] === rIdx &&
                        algorithmState.activeCell[1] === cIdx;

                      const isVisited =
                        algorithmState.activeCell &&
                        (rIdx < algorithmState.activeCell[0] ||
                          (rIdx === algorithmState.activeCell[0] && cIdx < algorithmState.activeCell[1]));

                      return (
                        <div
                          key={cIdx}
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 shadow-sm ${
                            isActive
                              ? "bg-purple-600/30 border-purple-400 text-purple-200 ring-2 ring-purple-500 shadow-lg shadow-purple-500/25 scale-110 z-10"
                              : isVisited
                              ? "bg-[#18181B] border-purple-500/30 text-[#D4D4D8]"
                              : "bg-[#111113] border-[#27272A] text-[#52525B] opacity-60"
                          }`}
                        >
                          <span>{cellVal}</span>
                          <span className="text-[9px] text-[#71717A] font-normal">
                            ({rIdx},{cIdx})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Cell Inspector */}
          {algorithmState.activeCell && (
            <div className="w-full max-w-lg p-3.5 rounded-xl bg-[#18181B] border border-purple-500/30 shadow-md flex items-center justify-around text-xs font-mono">
              <div className="text-center">
                <div className="text-[10px] text-[#71717A] uppercase">Row & Col</div>
                <div className="text-sm font-bold text-purple-400">({algorithmState.activeCell[0]}, {algorithmState.activeCell[1]})</div>
              </div>
              <div className="h-6 w-px bg-[#27272A]" />
              <div className="text-center">
                <div className="text-[10px] text-[#71717A] uppercase">Value</div>
                <div className="text-sm font-bold text-[#F4F4F5]">
                  {algorithmState.matrix[algorithmState.activeCell[0]]?.[algorithmState.activeCell[1]]}
                </div>
              </div>
              <div className="h-6 w-px bg-[#27272A]" />
              <div className="text-center">
                <div className="text-[10px] text-[#71717A] uppercase">Row-Major Offset</div>
                <div className="text-sm font-bold text-indigo-400">
                  {algorithmState.activeCell[0] * (algorithmState.matrix[0]?.length || 0) + algorithmState.activeCell[1]}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

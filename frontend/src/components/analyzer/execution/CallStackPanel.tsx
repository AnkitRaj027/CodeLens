"use client";

import React from "react";
import { StackFrame } from "@/types/execution";
import { Layers, ArrowUpCircle, CornerDownRight } from "lucide-react";

interface CallStackPanelProps {
  frames: StackFrame[];
}

export const CallStackPanel: React.FC<CallStackPanelProps> = ({ frames }) => {
  return (
    <div className="bg-[#111113] rounded-xl border border-[#27272A] p-3.5 font-mono text-xs flex flex-col shadow-sm">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-2 mb-2.5">
        <div className="flex items-center gap-2 text-blue-400 font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span className="text-[#F4F4F5] uppercase tracking-wider text-[11px]">
            Call Stack
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
          Depth: {frames.length}
        </span>
      </div>

      <div className="overflow-y-auto max-h-[140px] space-y-1.5 pr-1">
        {frames.length === 0 ? (
          <div className="py-4 text-center text-[#71717A] italic text-[11px]">
            Call Stack is empty
          </div>
        ) : (
          [...frames].reverse().map((frame, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={frame.id || idx}
                className={`p-2 rounded-lg border transition-all ${
                  isTop
                    ? "bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10"
                    : "bg-[#18181B] border-[#27272A] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {isTop ? (
                      <ArrowUpCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <CornerDownRight className="w-3 h-3 text-[#52525B] shrink-0" />
                    )}
                    <span className={isTop ? "text-blue-300 font-bold" : "text-[#F4F4F5]"}>
                      {frame.functionName}
                    </span>
                  </div>

                  {isTop && (
                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-blue-500 text-black uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Local Variables preview */}
                {Object.keys(frame.variables || {}).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-[#27272A]/40 text-[10px]">
                    {Object.entries(frame.variables).slice(0, 3).map(([k, v]) => (
                      <span key={k} className="px-1 py-0.2 rounded bg-[#09090B] text-[#A1A1AA] border border-[#27272A]">
                        {k}: <strong className="text-[#F4F4F5]">{typeof v === "object" ? JSON.stringify(v) : String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

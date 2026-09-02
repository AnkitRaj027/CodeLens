"use client";

import React, { useState } from "react";
import { VariableChange } from "@/types/execution";
import { Variable, ArrowRight } from "lucide-react";

interface LiveVariablesPanelProps {
  variables: Record<string, any>;
  changedVariables?: VariableChange[];
}

export const LiveVariablesPanel: React.FC<LiveVariablesPanelProps> = ({ 
  variables, 
  changedVariables = [] 
}) => {
  const [viewLevel, setViewLevel] = useState<"beginner" | "developer">("beginner");

  const changedMap = new Map<string, VariableChange>();
  changedVariables.forEach((c) => changedMap.set(c.name, c));

  const filteredEntries = Object.entries(variables).filter(([key]) => {
    if (viewLevel === "beginner") {
      return !key.startsWith("__") && key !== "status";
    }
    return true;
  });

  return (
    <div className="bg-[#111113] rounded-xl border border-[#27272A] p-3.5 font-mono text-xs flex flex-col shadow-sm">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-2 mb-2.5">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Variable className="w-3.5 h-3.5" />
          <span className="text-[#F4F4F5] uppercase tracking-wider text-[11px]">
            Live Memory & Scope
          </span>
        </div>

        {/* View Level Toggle */}
        <div className="flex items-center bg-[#18181B] p-0.5 rounded border border-[#27272A] text-[10px]">
          <button
            onClick={() => setViewLevel("beginner")}
            className={`px-1.5 py-0.2 rounded ${
              viewLevel === "beginner"
                ? "bg-[#27272A] text-emerald-400 font-bold"
                : "text-[#71717A] hover:text-[#A1A1AA]"
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setViewLevel("developer")}
            className={`px-1.5 py-0.2 rounded ${
              viewLevel === "developer"
                ? "bg-[#27272A] text-emerald-400 font-bold"
                : "text-[#71717A] hover:text-[#A1A1AA]"
            }`}
          >
            Dev
          </button>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[140px] space-y-1.5 pr-1">
        {filteredEntries.length === 0 ? (
          <div className="py-4 text-center text-[#71717A] italic text-[11px]">
            No variables in current scope
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1.5">
            {filteredEntries.map(([name, value]) => {
              const change = changedMap.get(name);
              return (
                <div
                  key={name}
                  className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                    change
                      ? "bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50 shadow-sm"
                      : "bg-[#18181B] border-[#27272A]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[11px] font-bold text-[#A1A1AA]">{name}</span>
                    {change && (
                      <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-500/20 px-1 rounded uppercase">
                        UPDATED
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-[#F4F4F5] flex items-center gap-1.5 shrink-0">
                    {change && change.oldValue !== undefined ? (
                      <>
                        <span className="text-[#71717A] line-through text-[10px]">
                          {typeof change.oldValue === "object" ? JSON.stringify(change.oldValue) : String(change.oldValue)}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </span>
                      </>
                    ) : (
                      <span className="text-blue-300 font-bold">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { ExecutionStep } from "@/types/execution";
import { Lightbulb, Calculator, Zap } from "lucide-react";

interface StepExplainerPanelProps {
  step: ExecutionStep | null;
}

export const StepExplainerPanel: React.FC<StepExplainerPanelProps> = ({ step }) => {
  if (!step) {
    return (
      <div className="bg-[#111113] rounded-xl border border-[#27272A] p-3.5 font-mono text-xs text-[#71717A] italic text-center py-6">
        Step logic will appear here as you play
      </div>
    );
  }

  const { explanation } = step;

  return (
    <div className="bg-[#111113] rounded-xl border border-[#27272A] p-3.5 font-mono text-xs space-y-2.5 shadow-sm flex flex-col justify-between">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="text-[#F4F4F5] uppercase tracking-wider text-[11px]">
              Step Logic
            </span>
          </div>
          <span className="text-[10px] text-blue-400 font-bold">
            L{step.lineNumber} • {step.stepIndex + 1}/{step.totalSteps}
          </span>
        </div>

        {/* Action Title & Reason */}
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-blue-300">
            {explanation.title}
          </h4>
          <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
            {explanation.description}
          </p>
        </div>

        {/* Computation Formula */}
        {explanation.computation && (
          <div className="p-2 rounded-lg bg-[#18181B] border border-[#27272A] flex items-start gap-1.5 text-[11px]">
            <Calculator className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
            <code className="text-[#F4F4F5] font-bold font-mono">
              {explanation.computation}
            </code>
          </div>
        )}
      </div>

      {/* Algorithmic Impact */}
      <div className="pt-2 border-t border-[#27272A] flex items-start gap-1.5 text-[10px] text-[#A1A1AA]">
        <Zap className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
        <span className="truncate">
          <strong className="text-[#F4F4F5]">Impact: </strong>{explanation.impact}
        </span>
      </div>
    </div>
  );
};

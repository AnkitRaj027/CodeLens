"use client";

import React, { useState } from "react";
import { UserInputConfig } from "@/types/execution";
import { Sliders, RefreshCw, Shuffle, ArrowRight, Sparkles } from "lucide-react";

interface InputConfigBarProps {
  algorithmType?: string;
  onApplyInput: (config: UserInputConfig) => void;
}

export const InputConfigBar: React.FC<InputConfigBarProps> = ({ 
  algorithmType = "array",
  onApplyInput 
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [arrayStr, setArrayStr] = useState<string>("38, 27, 43, 3, 9, 82, 10");
  const [targetVal, setTargetVal] = useState<string>("23");
  const [nVal, setNVal] = useState<string>("4");

  const parseAndApply = () => {
    try {
      const parsedArr = arrayStr
        .replace(/\[|\]/g, "")
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));

      const parsedTarget = Number(targetVal.trim());
      const parsedN = Number(nVal.trim());

      onApplyInput({
        array: parsedArr.length > 0 ? parsedArr : undefined,
        target: !isNaN(parsedTarget) ? parsedTarget : undefined,
        n: !isNaN(parsedN) ? parsedN : undefined
      });
    } catch (e) {
      console.error("Failed to parse custom input", e);
    }
  };

  const handlePreset = (type: "random" | "sorted" | "reverse" | "small") => {
    let arr: number[] = [];
    if (type === "random") {
      arr = Array.from({ length: 5 }, () => Math.floor(Math.random() * 90) + 10);
    } else if (type === "sorted") {
      arr = [4, 12, 25, 33, 47, 59];
    } else if (type === "reverse") {
      arr = [50, 42, 31, 22, 11];
    } else {
      arr = [8, 3, 5, 1];
    }
    const str = arr.join(", ");
    setArrayStr(str);
    onApplyInput({
      array: arr,
      target: arr[Math.floor(arr.length / 2)],
      n: arr.length
    });
  };

  return (
    <div className="bg-[#141416] border border-[#27272A] rounded-xl p-3 font-mono text-xs space-y-2.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & Toggle */}
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-[#F4F4F5] uppercase tracking-wider text-[11px]">
            Custom Simulation Input
          </span>
          <span className="text-[10px] text-[#71717A]">
            (Edit the array or target values below)
          </span>
        </div>

        {/* Preset Quick Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[#71717A]">Presets:</span>
          <button
            onClick={() => handlePreset("random")}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] transition-colors"
          >
            <Shuffle className="w-2.5 h-2.5" />
            <span>Random</span>
          </button>
          <button
            onClick={() => handlePreset("sorted")}
            className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] transition-colors"
          >
            Sorted
          </button>
          <button
            onClick={() => handlePreset("reverse")}
            className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] transition-colors"
          >
            Reverse
          </button>
          <button
            onClick={() => handlePreset("small")}
            className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] transition-colors"
          >
            Small (N=4)
          </button>
        </div>
      </div>

      {/* Input Fields Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
        {/* Array Input */}
        <div className="flex-1 flex items-center gap-2 bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 focus-within:border-blue-500/50">
          <span className="text-[11px] text-[#71717A] font-bold shrink-0">Array:</span>
          <input
            type="text"
            value={arrayStr}
            onChange={(e) => setArrayStr(e.target.value)}
            placeholder="e.g. 5, 1, 4, 2, 8"
            className="w-full bg-transparent text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none font-mono"
          />
        </div>

        {/* Target Input & Apply Button Group */}
        <div className="flex items-center gap-2">
          {/* Target Input */}
          <div className="w-28 sm:w-28 flex items-center gap-1.5 bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 focus-within:border-blue-500/50">
            <span className="text-[11px] text-[#71717A] font-bold shrink-0">Target:</span>
            <input
              type="text"
              value={targetVal}
              onChange={(e) => setTargetVal(e.target.value)}
              placeholder="23"
              className="w-full bg-transparent text-xs text-[#F4F4F5] focus:outline-none font-mono"
            />
          </div>

          {/* Apply & Re-run Button */}
          <button
            onClick={parseAndApply}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <RefreshCw className="w-3 h-3 shrink-0" />
            <span>Apply & Simulate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

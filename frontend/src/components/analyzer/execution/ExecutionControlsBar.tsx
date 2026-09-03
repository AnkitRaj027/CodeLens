"use client";

import React from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Sliders, 
  Cpu, 
  Gauge 
} from "lucide-react";

interface ExecutionControlsBarProps {
  isPlaying: boolean;
  currentStepIndex: number;
  totalSteps: number;
  opCount: number;
  speed: number;
  granularity: "statement" | "expression" | "algorithm";
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeGranularity: (g: "statement" | "expression" | "algorithm") => void;
}

export const ExecutionControlsBar: React.FC<ExecutionControlsBarProps> = ({
  isPlaying,
  currentStepIndex,
  totalSteps,
  opCount,
  speed,
  granularity,
  onTogglePlay,
  onStepForward,
  onStepBack,
  onReset,
  onChangeSpeed,
  onChangeGranularity,
}) => {
  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-lg p-2.5 sm:p-4 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
      {/* Primary Stepper Controls & Speed */}
      <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md font-bold text-xs shadow-md transition-all ${
              isPlaying
                ? "bg-amber-500 text-black hover:bg-amber-400"
                : "bg-[#F4F4F5] text-black hover:bg-white"
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            onClick={onStepBack}
            disabled={currentStepIndex === 0}
            title="Previous Step (Left Arrow)"
            className="p-1.5 sm:p-2 rounded-md bg-[#18181B] hover:bg-[#27272A] active:bg-[#323238] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] disabled:opacity-30 transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onStepForward}
            disabled={totalSteps === 0 || currentStepIndex >= totalSteps - 1}
            title="Next Step (Right Arrow)"
            className="p-1.5 sm:p-2 rounded-md bg-[#18181B] hover:bg-[#27272A] active:bg-[#323238] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] disabled:opacity-30 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onReset}
            title="Restart Execution"
            className="p-1.5 sm:p-2 rounded-md bg-[#18181B] hover:bg-[#27272A] active:bg-[#323238] text-[#71717A] hover:text-rose-400 border border-[#27272A] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed - inline on mobile */}
        <div className="flex items-center gap-1 text-[11px] text-[#71717A] bg-[#18181B] px-2 py-1 rounded border border-[#27272A]">
          <Gauge className="w-3 h-3" />
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                speed === s
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-[#71717A] hover:text-[#F4F4F5]"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Granularity & Telemetry Counter */}
      <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap border-t sm:border-t-0 pt-2 sm:pt-0 border-[#27272A]">
        {/* Granularity Mode */}
        <div className="flex items-center gap-1 bg-[#18181B] p-0.5 rounded border border-[#27272A] text-[10px]">
          {(["statement", "expression", "algorithm"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeGranularity(mode)}
              className={`px-2 py-1 rounded capitalize font-medium ${
                granularity === mode
                  ? "bg-[#27272A] text-blue-400 font-bold"
                  : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Telemetry Counter */}
        <div className="flex items-center gap-2 sm:pl-3 sm:border-l sm:border-[#27272A]">
          <span className="text-[10px] text-[#71717A]">Step:</span>
          <span className="text-blue-400 font-bold text-xs">
            {totalSteps === 0 ? 0 : currentStepIndex + 1}/{totalSteps}
          </span>
          <span className="text-[10px] text-[#71717A] ml-1 sm:ml-2">Ops:</span>
          <span className="text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
            {opCount}
          </span>
        </div>
      </div>
    </div>
  );
};

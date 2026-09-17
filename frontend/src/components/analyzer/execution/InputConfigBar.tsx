"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserInputConfig } from "@/types/execution";
import { detectInputModeFromCode } from "@/lib/executionEngine";
import { Sliders, RefreshCw, Shuffle, Type, Hash, Layers, LayoutGrid, Sparkles } from "lucide-react";

interface InputConfigBarProps {
  algorithmType?: string;
  code?: string;
  onApplyInput: (config: UserInputConfig) => void;
}

export { detectInputModeFromCode };

export const InputConfigBar: React.FC<InputConfigBarProps> = ({ 
  algorithmType = "array",
  code = "",
  onApplyInput 
}) => {
  const [inputMode, setInputMode] = useState<"array" | "number" | "string" | "matrix">("array");
  const [autoDetectedBadge, setAutoDetectedBadge] = useState<string>("");
  const [arrayStr, setArrayStr] = useState<string>("38, 27, 43, 3, 9, 82, 10");
  const [targetVal, setTargetVal] = useState<string>("23");
  const [nVal, setNVal] = useState<string>("16");
  const [textVal, setTextVal] = useState<string>("racecar");
  const [matrixStr, setMatrixStr] = useState<string>("1, 2, 3; 4, 5, 6; 7, 8, 9");

  const lastCodeRef = useRef<string>("");

  // Automatically detect input type whenever code changes, and auto-apply it!
  useEffect(() => {
    if (code && code !== lastCodeRef.current) {
      lastCodeRef.current = code;
      const detected = detectInputModeFromCode(code);
      setInputMode(detected);

      const labels: Record<string, string> = {
        matrix: "Matrix (2D Grid)",
        string: "String",
        number: "Scalar Math (N)",
        array: "Array"
      };
      setAutoDetectedBadge(labels[detected] || "Array");

      // Automatically apply default inputs for the detected structure
      if (detected === "matrix") {
        const defaultMatrix = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ];
        onApplyInput({
          mode: "matrix",
          matrix: defaultMatrix
        });
      } else if (detected === "string") {
        onApplyInput({
          mode: "string",
          text: textVal || "racecar"
        });
      } else if (detected === "number") {
        const parsedN = Number(nVal) || 16;
        onApplyInput({
          mode: "number",
          n: parsedN
        });
      } else {
        const parsedArr = arrayStr
          .replace(/\[|\]/g, "")
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n));
        onApplyInput({
          mode: "array",
          array: parsedArr.length > 0 ? parsedArr : [38, 27, 43, 3, 9, 82, 10],
          target: Number(targetVal) || 23
        });
      }
    }
  }, [code]);

  const handleManualModeSelect = (mode: "array" | "number" | "string" | "matrix") => {
    setInputMode(mode);
    if (mode === "matrix") {
      const rows = matrixStr
        .replace(/\[\[|\]\]/g, "")
        .split(/;|\n|\]\s*,\s*\[/)
        .map((r) =>
          r
            .replace(/\[|\]/g, "")
            .split(",")
            .map((c) => Number(c.trim()))
            .filter((n) => !isNaN(n))
        )
        .filter((r) => r.length > 0);
      onApplyInput({
        mode: "matrix",
        matrix: rows.length > 0 ? rows : [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ]
      });
    } else if (mode === "string") {
      onApplyInput({
        mode: "string",
        text: textVal || "racecar"
      });
    } else if (mode === "number") {
      onApplyInput({
        mode: "number",
        n: Number(nVal) || 16
      });
    } else {
      const parsedArr = arrayStr
        .replace(/\[|\]/g, "")
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => !isNaN(n));
      onApplyInput({
        mode: "array",
        array: parsedArr.length > 0 ? parsedArr : [38, 27, 43, 3, 9, 82, 10],
        target: Number(targetVal) || 23
      });
    }
  };

  const parseAndApply = () => {
    try {
      if (inputMode === "number") {
        const parsedN = Number(nVal.trim());
        onApplyInput({
          mode: "number",
          n: !isNaN(parsedN) ? parsedN : 16
        });
      } else if (inputMode === "string") {
        onApplyInput({
          mode: "string",
          text: textVal.trim() || "racecar"
        });
      } else if (inputMode === "matrix") {
        const rows = matrixStr
          .replace(/\[\[|\]\]/g, "")
          .split(/;|\n|\]\s*,\s*\[/)
          .map((r) =>
            r
              .replace(/\[|\]/g, "")
              .split(",")
              .map((c) => Number(c.trim()))
              .filter((n) => !isNaN(n))
          )
          .filter((r) => r.length > 0);

        const defaultMatrix = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ];

        onApplyInput({
          mode: "matrix",
          matrix: rows.length > 0 ? rows : defaultMatrix
        });
      } else {
        const parsedArr = arrayStr
          .replace(/\[|\]/g, "")
          .split(",")
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n));

        const parsedTarget = Number(targetVal.trim());
        onApplyInput({
          mode: "array",
          array: parsedArr.length > 0 ? parsedArr : undefined,
          target: !isNaN(parsedTarget) ? parsedTarget : undefined
        });
      }
    } catch (e) {
      console.error("Failed to parse custom input", e);
    }
  };

  const handleArrayPreset = (type: "random" | "sorted" | "reverse" | "small") => {
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
      mode: "array",
      array: arr,
      target: arr[Math.floor(arr.length / 2)],
      n: arr.length
    });
  };

  const handleScalarPreset = (val: number) => {
    setNVal(String(val));
    onApplyInput({
      mode: "number",
      n: val
    });
  };

  const handleStringPreset = (str: string) => {
    setTextVal(str);
    onApplyInput({
      mode: "string",
      text: str
    });
  };

  const handleMatrixPreset = (type: "3x3" | "identity" | "2x2") => {
    let mat: number[][] = [];
    if (type === "identity") {
      mat = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
    } else if (type === "2x2") {
      mat = [
        [2, 4],
        [6, 8]
      ];
    } else {
      mat = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
    }
    const str = mat.map((row) => row.join(", ")).join("; ");
    setMatrixStr(str);
    onApplyInput({
      mode: "matrix",
      matrix: mat
    });
  };

  return (
    <div className="bg-[#141416] border border-[#27272A] rounded-xl p-3 font-mono text-xs space-y-2.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-[#F4F4F5] uppercase tracking-wider text-[11px]">
            Simulation Parameters:
          </span>

          {autoDetectedBadge && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Auto: {autoDetectedBadge}</span>
            </span>
          )}
          
          {/* Manual Mode Selector */}
          <div className="flex items-center bg-[#18181B] p-0.5 rounded-lg border border-[#27272A] text-[10px] overflow-x-auto">
            <button
              onClick={() => handleManualModeSelect("array")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors ${
                inputMode === "array" ? "bg-[#27272A] text-blue-400 font-bold" : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              <Layers className="w-2.5 h-2.5" />
              <span>Array</span>
            </button>
            <button
              onClick={() => handleManualModeSelect("matrix")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors ${
                inputMode === "matrix" ? "bg-[#27272A] text-purple-400 font-bold" : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              <LayoutGrid className="w-2.5 h-2.5" />
              <span>Matrix (2D)</span>
            </button>
            <button
              onClick={() => handleManualModeSelect("number")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors ${
                inputMode === "number" ? "bg-[#27272A] text-emerald-400 font-bold" : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              <Hash className="w-2.5 h-2.5" />
              <span>Scalar (N)</span>
            </button>
            <button
              onClick={() => handleManualModeSelect("string")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-medium transition-colors ${
                inputMode === "string" ? "bg-[#27272A] text-cyan-400 font-bold" : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              <Type className="w-2.5 h-2.5" />
              <span>String</span>
            </button>
          </div>
        </div>

        {/* Presets by Mode */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[#71717A]">Presets:</span>
          {inputMode === "array" && (
            <>
              <button
                onClick={() => handleArrayPreset("random")}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] transition-colors"
              >
                <Shuffle className="w-2.5 h-2.5" />
                <span>Random</span>
              </button>
              <button
                onClick={() => handleArrayPreset("sorted")}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] transition-colors"
              >
                Sorted
              </button>
              <button
                onClick={() => handleArrayPreset("small")}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-[#A1A1AA] hover:text-[#F4F4F5] border border-[#27272A] transition-colors"
              >
                Small (N=4)
              </button>
            </>
          )}

          {inputMode === "matrix" && (
            <>
              <button
                onClick={() => handleMatrixPreset("3x3")}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-purple-400 border border-[#27272A] transition-colors"
              >
                3x3 Grid
              </button>
              <button
                onClick={() => handleMatrixPreset("identity")}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-purple-400 border border-[#27272A] transition-colors"
              >
                Identity
              </button>
              <button
                onClick={() => handleMatrixPreset("2x2")}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-purple-400 border border-[#27272A] transition-colors"
              >
                2x2 Small
              </button>
            </>
          )}

          {inputMode === "number" && (
            <>
              <button
                onClick={() => handleScalarPreset(16)}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-emerald-400 border border-[#27272A] transition-colors"
              >
                N = 16 (2⁴)
              </button>
              <button
                onClick={() => handleScalarPreset(25)}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-emerald-400 border border-[#27272A] transition-colors"
              >
                N = 25 (5²)
              </button>
              <button
                onClick={() => handleScalarPreset(17)}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-emerald-400 border border-[#27272A] transition-colors"
              >
                Prime = 17
              </button>
            </>
          )}

          {inputMode === "string" && (
            <>
              <button
                onClick={() => handleStringPreset("racecar")}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-cyan-400 border border-[#27272A] transition-colors"
              >
                "racecar"
              </button>
              <button
                onClick={() => handleStringPreset("level")}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-cyan-400 border border-[#27272A] transition-colors"
              >
                "level"
              </button>
              <button
                onClick={() => handleStringPreset("algorithm")}
                className="px-2 py-0.5 rounded bg-[#18181B] hover:bg-[#27272A] text-[10px] text-cyan-400 border border-[#27272A] transition-colors"
              >
                "algorithm"
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input Fields Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
        {inputMode === "array" && (
          <>
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
          </>
        )}

        {inputMode === "matrix" && (
          <div className="flex-1 flex items-center gap-2 bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 focus-within:border-purple-500/50">
            <span className="text-[11px] text-purple-400 font-bold shrink-0">Rows (semicolon separated):</span>
            <input
              type="text"
              value={matrixStr}
              onChange={(e) => setMatrixStr(e.target.value)}
              placeholder="e.g. 1, 2, 3; 4, 5, 6; 7, 8, 9"
              className="w-full bg-transparent text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none font-mono"
            />
          </div>
        )}

        {inputMode === "number" && (
          <div className="flex-1 flex items-center gap-2 bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 focus-within:border-emerald-500/50">
            <span className="text-[11px] text-emerald-400 font-bold shrink-0">Scalar N:</span>
            <input
              type="text"
              value={nVal}
              onChange={(e) => setNVal(e.target.value)}
              placeholder="e.g. 16, 25, 100"
              className="w-full bg-transparent text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none font-mono"
            />
          </div>
        )}

        {inputMode === "string" && (
          <div className="flex-1 flex items-center gap-2 bg-[#18181B] border border-[#27272A] rounded-lg px-2.5 py-1.5 focus-within:border-cyan-500/50">
            <span className="text-[11px] text-cyan-400 font-bold shrink-0">Text:</span>
            <input
              type="text"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              placeholder='e.g. "racecar"'
              className="w-full bg-transparent text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none font-mono"
            />
          </div>
        )}

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
  );
};

"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Play, 
  Trash2, 
  Upload, 
  Code2, 
  Sparkles, 
  ChevronDown, 
  FileCode,
  Loader2
} from "lucide-react";

// Dynamically import Monaco Editor without SSR
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex flex-col items-center justify-center bg-slate-950/80 text-slate-400 font-mono text-xs gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <span>Loading CodeLens Monaco Editor...</span>
    </div>
  ),
});

export interface ExamplePreset {
  id: string;
  name: string;
  category: string;
  code: string;
  language: string;
}

export const EXAMPLE_PRESETS: ExamplePreset[] = [
  {
    id: "linear_loop",
    name: "Linear Loop — O(n)",
    category: "Basics",
    language: "python",
    code: `def print_elements(n):
    # Single loop running n times
    for i in range(n):
        print("Processing element:", i)
    return True`
  },
  {
    id: "nested_loops",
    name: "Nested Loops — O(n²)",
    category: "Quadratic",
    language: "python",
    code: `def print_pairs(n):
    # Outer loop executes n times
    for i in range(n):
        # Inner loop executes n times per outer step
        for j in range(n):
            print(i, j)`
  },
  {
    id: "dependent_loops",
    name: "Dependent Loops — O(n²)",
    category: "Quadratic",
    language: "python",
    code: `def triangular_sum(n):
    # Total operations: 1 + 2 + 3 + ... + n = n*(n+1)/2 = O(n²)
    for i in range(n):
        for j in range(i):
            print(f"({i}, {j})")`
  },
  {
    id: "binary_division",
    name: "Binary Halving — O(log n)",
    category: "Logarithmic",
    language: "python",
    code: `def divide_conquer_step(n):
    # Repeated integer division by 2 runs in O(log n)
    steps = 0
    while n > 1:
        n = n // 2
        steps += 1
    return steps`
  },
  {
    id: "log_linear",
    name: "Nested Log-Linear — O(n log n)",
    category: "Log-Linear",
    language: "python",
    code: `def merge_style_loops(n):
    # Outer loop O(n), inner while loop O(log n) -> O(n log n)
    for i in range(n):
        k = n
        while k > 1:
            k = k // 2`
  },
  {
    id: "fibonacci_rec",
    name: "Branching Recursion — O(2ⁿ)",
    category: "Recursion",
    language: "python",
    code: `def fibonacci(n):
    # T(n) = 2T(n-1) + O(1) -> O(2^n) time, O(n) call stack
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`
  },
  {
    id: "binary_search_rec",
    name: "Binary Search — O(log n)",
    category: "Recursion",
    language: "python",
    code: `def binary_search(arr, low, high, target):
    # T(n) = T(n/2) + O(1) -> O(log n) time, O(log n) call stack
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] > target:
        return binary_search(arr, low, mid - 1, target)
    else:
        return binary_search(arr, mid + 1, high, target)`
  },
  {
    id: "cpp_nested",
    name: "C++ Nested Grid — O(n²)",
    category: "C++ Algorithms",
    language: "cpp",
    code: `#include <iostream>

void printGrid(int n) {
    // Outer loop O(n), Inner loop O(n) -> O(n²)
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            std::cout << i << " " << j << "\\n";
        }
    }
}`
  },
  {
    id: "cpp_fibonacci",
    name: "C++ Branching Tree — O(2ⁿ)",
    category: "C++ Recursion",
    language: "cpp",
    code: `#include <iostream>

int fibonacci(int n) {
    // T(n) = 2T(n-1) + O(1) -> O(2^n) time, O(n) stack
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`
  },
  {
    id: "cpp_vector_alloc",
    name: "C++ 2D Matrix — Space O(n²)",
    category: "C++ Memory",
    language: "cpp",
    code: `#include <vector>

void createGrid(int n, int m) {
    // Allocates quadratic auxiliary heap memory O(n*m)
    std::vector<std::vector<int>> matrix(n, std::vector<int>(m, 0));
}`
  }
];

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  onAnalyze,
  isAnalyzing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCode(content);
        if (file.name.endsWith(".cpp") || file.name.endsWith(".cc") || file.name.endsWith(".h")) {
          setLanguage("cpp");
        } else if (file.name.endsWith(".py")) {
          setLanguage("python");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setCode("");
  };

  const handlePresetSelect = (preset: ExamplePreset) => {
    setCode(preset.code);
    setLanguage(preset.language);
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col shadow-2xl">
      {/* Editor Toolbar */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Language & Presets */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-750 text-xs font-medium text-slate-300">
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="python" className="bg-slate-900 text-white">Python 3</option>
              <option value="cpp" className="bg-slate-900 text-white">C++ 20</option>
            </select>
          </div>

          {/* Example Presets Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-750 text-xs font-medium text-slate-300 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Examples</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-750 shadow-2xl p-1.5 hidden group-hover:block z-50">
              <div className="px-2.5 py-1 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Select Example Code
              </div>
              {EXAMPLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/30 transition-all flex flex-col"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-[10px] text-slate-500">{p.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py,.cpp,.cc,.c,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload source file"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-750 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            title="Clear editor"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-xs font-medium border border-slate-750 hover:border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Primary Analyze Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 hover:scale-[1.02]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing AST...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Analyze Complexity
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Canvas */}
      <div className="h-[420px] w-full bg-[#0d1117]">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : "python"}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: "on",
            glyphMargin: false,
            renderLineHighlight: "all",
            padding: { top: 12, bottom: 12 },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
};

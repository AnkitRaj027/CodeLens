"use client";

import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  Upload, 
  Trash2, 
  Sparkles, 
  FileCode, 
  ChevronDown, 
  Loader2
} from "lucide-react";

export interface ExamplePreset {
  id: string;
  name: string;
  category: string;
  complexity: string;
  code_python: string;
  code_cpp: string;
}

export const EXAMPLE_PRESETS: ExamplePreset[] = [
  {
    id: "constant",
    name: "Constant Elementary — O(1)",
    category: "Foundations",
    complexity: "O(1)",
    code_python: `def get_first_element(arr):
    # Direct index access runs in constant time O(1)
    if len(arr) > 0:
        return arr[0]
    return None`,
    code_cpp: `#include <vector>

int getFirstElement(const std::vector<int>& arr) {
    // Direct index access runs in constant time O(1)
    if (!arr.empty()) {
        return arr[0];
    }
    return -1;
}`
  },
  {
    id: "nested_loops",
    name: "Nested Loop Matrix — O(n²)",
    category: "Polynomial Loops",
    complexity: "O(n²)",
    code_python: `def print_all_pairs(items):
    # Outer loop executes n times
    for i in items:
        # Inner loop executes n times per outer iteration
        for j in items:
            print(i, j)`,
    code_cpp: `#include <iostream>
#include <vector>

void printAllPairs(const std::vector<int>& items) {
    // Outer loop executes n times
    for (int i : items) {
        // Inner loop executes n times per outer iteration
        for (int j : items) {
            std::cout << i << " " << j << "\\n";
        }
    }
}`
  },
  {
    id: "dependent_loops",
    name: "Triangular Dependent Loop — O(n²)",
    category: "Summations",
    complexity: "O(n²)",
    code_python: `def print_triangle(n):
    # Sum_{i=1}^n i = n(n+1)/2 = O(n²)
    for i in range(n):
        for j in range(i):
            print(j, end=" ")
        print()`,
    code_cpp: `#include <iostream>

void printTriangle(int n) {
    // Sum_{i=1}^n i = n(n+1)/2 = O(n²)
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            std::cout << j << " ";
        }
        std::cout << "\\n";
    }
}`
  },
  {
    id: "binary_search",
    name: "Logarithmic Search — O(log n)",
    category: "Divide & Conquer",
    complexity: "O(log n)",
    code_python: `def binary_search(arr, low, high, target):
    # T(n) = T(n/2) + O(1) -> O(log n) time, O(log n) call stack
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] > target:
        return binary_search(arr, low, mid - 1, target)
    else:
        return binary_search(arr, mid + 1, high, target)`,
    code_cpp: `#include <vector>

int binarySearch(const std::vector<int>& arr, int low, int high, int target) {
    // T(n) = T(n/2) + O(1) -> O(log n) time, O(log n) call stack
    if (low > high) return -1;
    int mid = low + (high - low) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] > target) return binarySearch(arr, low, mid - 1, target);
    return binarySearch(arr, mid + 1, high, target);
}`
  },
  {
    id: "merge_sort",
    name: "Merge Sort Divide & Conquer — O(n log n)",
    category: "Recurrence",
    complexity: "O(n log n)",
    code_python: `def merge_sort(arr):
    # T(n) = 2T(n/2) + O(n) -> O(n log n)
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return left + right`,
    code_cpp: `#include <vector>

void mergeSort(std::vector<int>& arr, int l, int r) {
    // T(n) = 2T(n/2) + O(n) -> O(n log n)
    if (l >= r) return;
    int mid = l + (r - l) / 2;
    mergeSort(arr, l, mid);
    mergeSort(arr, mid + 1, r);
}`
  },
  {
    id: "fibonacci_rec",
    name: "Branching Recursion Tree — O(2ⁿ)",
    category: "Recursion Trees",
    complexity: "O(2ⁿ)",
    code_python: `def fibonacci(n):
    # T(n) = 2T(n-1) + O(1) -> O(2^n) time, O(n) call stack
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)`,
    code_cpp: `int fibonacci(int n) {
    // T(n) = 2T(n-1) + O(1) -> O(2^n) time, O(n) call stack
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`
  },
  {
    id: "vector_alloc",
    name: "2D Matrix Grid — Space O(n²)",
    category: "Memory Allocation",
    complexity: "Space O(n²)",
    code_python: `def create_grid(n, m):
    # Allocates quadratic auxiliary heap memory O(n*m)
    matrix = [[0] * m for _ in range(n)]
    return matrix`,
    code_cpp: `#include <vector>

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
  activeLine?: number | null;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  onAnalyze,
  isAnalyzing,
  activeLine,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const [isPresetOpen, setIsPresetOpen] = React.useState<boolean>(false);
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  // Close presets dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(e.target as Node)) {
        setIsPresetOpen(false);
      }
    };
    if (isPresetOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isPresetOpen]);

  // Update line decorations whenever activeLine changes
  useEffect(() => {
    if (!editorRef.current) return;
    const monaco = (window as any).monaco;
    if (!monaco) return;

    if (activeLine && activeLine > 0) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
        {
          range: new monaco.Range(activeLine, 1, activeLine, 1),
          options: {
            isWholeLine: true,
            className: "bg-blue-500/20 border-l-4 border-blue-500 shadow-sm",
            glyphMarginClassName: "text-blue-400 font-bold",
          }
        }
      ]);
      editorRef.current.revealLineInCenterIfOutsideViewport(activeLine);
    } else {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [activeLine]);

  // Keyboard shortcut: Ctrl + Enter to run analysis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isAnalyzing && code.trim()) {
          onAnalyze();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, isAnalyzing, onAnalyze]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // If the editor currently contains one of the presets in the old language, convert it to the new language
    const currentPreset = EXAMPLE_PRESETS.find(
      (p) => p.code_python.trim() === code.trim() || p.code_cpp.trim() === code.trim()
    );
    if (currentPreset) {
      setCode(newLang === "cpp" ? currentPreset.code_cpp : currentPreset.code_python);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCode(content);
        if (file.name.endsWith(".cpp") || file.name.endsWith(".cc") || file.name.endsWith(".h") || file.name.endsWith(".hpp")) {
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
    // Respect the currently selected language
    const presetCode = language === "cpp" ? preset.code_cpp : preset.code_python;
    setCode(presetCode);
    setIsPresetOpen(false);
  };

  return (
    <div className="bg-[#111113] rounded-lg border border-[#27272A] overflow-hidden flex flex-col shadow-sm">
      {/* Editor Toolbar */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#111113] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Language & Presets */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs font-mono text-[#A1A1AA]">
            <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-[#F4F4F5] focus:outline-none cursor-pointer text-xs font-mono"
            >
              <option value="python" className="bg-[#18181B] text-[#F4F4F5]">Python 3</option>
              <option value="cpp" className="bg-[#18181B] text-[#F4F4F5]">C++ 20</option>
            </select>
          </div>

          {/* Presets Dropdown */}
          <div className="relative" ref={presetDropdownRef}>
            <button 
              onClick={() => setIsPresetOpen(!isPresetOpen)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-[#202024] active:bg-[#27272A] border border-[#27272A] text-xs font-mono text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Presets ({language === "cpp" ? "C++" : "Python"})</span>
              <span className="sm:hidden">Presets</span>
              <ChevronDown className={`w-3 h-3 text-[#71717A] transition-transform ${isPresetOpen ? "rotate-180" : ""}`} />
            </button>

            {isPresetOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-72 max-w-[85vw] rounded-lg bg-[#18181B] border border-[#27272A] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] uppercase font-mono font-semibold text-[#71717A] tracking-wider flex items-center justify-between border-b border-[#27272A]/50 pb-1 mb-1">
                  <span>Algorithm Presets</span>
                  <span className="text-blue-400 uppercase">{language}</span>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-0.5">
                  {EXAMPLE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePresetSelect(p)}
                      className="w-full text-left px-2.5 py-1.5 rounded-md text-xs text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A] active:bg-[#323238] transition-all flex flex-col font-mono group/btn"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px] group-hover/btn:text-blue-400">{p.name}</span>
                        <span className="text-[10px] text-blue-400/80">{p.complexity}</span>
                      </div>
                      <span className="text-[10px] text-[#71717A]">{p.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & Run Shortcut */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* File Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py,.cpp,.cc,.c,.h,.hpp,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload source file"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-[#202024] text-[#A1A1AA] hover:text-[#F4F4F5] text-xs font-mono border border-[#27272A] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            title="Clear editor"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181B] hover:bg-rose-500/10 hover:text-rose-400 text-[#71717A] text-xs font-mono border border-[#27272A] hover:border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Primary Analyze Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-md bg-[#F4F4F5] text-[#09090B] hover:bg-white font-medium text-xs shadow-sm transition-all disabled:opacity-50 font-mono"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Parsing AST...</span>
                <span className="sm:hidden">Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Analyze</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-mono text-[#71717A] bg-[#E4E4E7] rounded">
                  Ctrl ↵
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Canvas */}
      <div className="h-[320px] sm:h-[400px] lg:h-[440px] w-full bg-[#09090B]">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : "python"}
          value={code}
          onChange={(val) => setCode(val || "")}
          onMount={(editor) => { editorRef.current = editor; }}
          theme="vs-dark"
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, monospace",
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

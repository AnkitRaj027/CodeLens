"use client";

import React, { useState, useEffect } from "react";
import { CodeEditor, EXAMPLE_PRESETS } from "@/components/analyzer/CodeEditor";
import { ComplexityCard } from "@/components/analyzer/ComplexityCard";
import { LineFindingsTable } from "@/components/analyzer/LineFindingsTable";
import { ASTVisualizerTree } from "@/components/analyzer/ASTVisualizerTree";
import { AITutorPanel } from "@/components/analyzer/AITutorPanel";
import { OptimizationDiff } from "@/components/analyzer/OptimizationDiff";
import { StaticAnalysisResult, AIExplanationResult } from "@/types/analysis";
import { api } from "@/lib/api";
import { 
  Terminal, 
  Layers, 
  FolderTree, 
  BookmarkPlus, 
  Check, 
  AlertCircle,
  Brain,
  Zap,
  Activity
} from "lucide-react";

export default function AnalyzerPage() {
  const [code, setCode] = useState<string>(EXAMPLE_PRESETS[1].code_python);
  const [language, setLanguage] = useState<string>("python");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<StaticAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"findings" | "ai" | "diff" | "ast">("findings");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<AIExplanationResult | null>(null);
  const [lastParseDuration, setLastParseDuration] = useState<number>(0);
  const [activeExecutionLine, setActiveExecutionLine] = useState<number | null>(null);

  const runAnalysis = async (codeToAnalyze = code, langToAnalyze = language) => {
    if (!codeToAnalyze.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setSavedSuccess(false);

    const startTime = performance.now();
    try {
      const res = await api.post<StaticAnalysisResult>("/analyze/static", {
        code: codeToAnalyze,
        language: langToAnalyze,
      });
      const duration = Math.round(performance.now() - startTime);
      setLastParseDuration(duration);
      setResult(res.data);
      
      // Auto-fetch explanation
      try {
        const aiRes = await api.post<AIExplanationResult>("/ai/explain", {
          code: codeToAnalyze,
          language: langToAnalyze,
          time_complexity: res.data.time_complexity,
          space_complexity: res.data.space_complexity,
          confidence: res.data.confidence,
          deterministic_findings: res.data.deterministic_summary,
          mode: "intermediate",
        });
        setExplanation(aiRes.data);
      } catch (aiErr) {
        console.warn("AI explanation auto-fetch error", aiErr);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to analyze code. Please check for syntax errors.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const transferredCode = typeof window !== "undefined" ? localStorage.getItem("codelens_transferred_code") : null;
    const transferredLang = typeof window !== "undefined" ? localStorage.getItem("codelens_transferred_lang") : null;
    if (transferredCode) {
      localStorage.removeItem("codelens_transferred_code");
      localStorage.removeItem("codelens_transferred_lang");
      setCode(transferredCode);
      const lang = transferredLang || "python";
      setLanguage(lang);
      runAnalysis(transferredCode, lang);
    } else {
      runAnalysis(EXAMPLE_PRESETS[1].code_python, "python");
    }
  }, []);

  const handleSave = async () => {
    if (!result) return;
    try {
      await api.post("/analyze/save", {
        title: `Analysis (${result.time_complexity})`,
        language,
        source_code: code,
        time_complexity: result.time_complexity,
        space_complexity: result.space_complexity,
        auxiliary_space: result.auxiliary_space,
        recursion_stack: result.recursion_stack,
        confidence: result.confidence,
        confidence_reason: result.confidence_reason,
        deterministic_findings: result.deterministic_summary,
        line_by_line_analysis: result.line_findings,
        ast_tree_data: result.ast_tree,
        ai_explanation: explanation,
        optimized_version: explanation?.optimization,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Telemetry Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111113] border border-[#27272A] p-3 rounded-lg text-xs font-mono text-[#A1A1AA]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#F4F4F5] font-medium">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>AST Workspace</span>
          </div>
          <span className="text-[#27272A]">|</span>
          <div className="flex items-center gap-1.5 text-[#71717A]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Deterministic Engine</span>
          </div>
          {lastParseDuration > 0 && (
            <>
              <span className="text-[#27272A]">|</span>
              <div className="text-[#71717A]">
                Latency: <span className="text-[#F4F4F5]">{lastParseDuration}ms</span>
              </div>
            </>
          )}
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-all ${
                savedSuccess
                  ? "bg-[#18181B] text-emerald-400 border-emerald-500/30"
                  : "bg-[#18181B] hover:bg-[#202024] text-[#F4F4F5] border-[#27272A]"
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Archived</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Save Report</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Code Editor */}
      <CodeEditor
        code={code}
        setCode={setCode}
        language={language}
        setLanguage={(l) => setLanguage(l)}
        onAnalyze={() => runAnalysis(code, language)}
        isAnalyzing={isAnalyzing}
        activeLine={activeExecutionLine}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-lg bg-[#18181B] border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Complexity Cards */}
          <ComplexityCard result={result} />

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#27272A] pb-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab("findings")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === "findings"
                  ? "bg-[#18181B] text-[#F4F4F5] border border-[#27272A]"
                  : "text-[#71717A] hover:text-[#F4F4F5]"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Line Attribution ({result.line_findings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("ast")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === "ast"
                  ? "bg-[#18181B] text-[#F4F4F5] border border-[#27272A]"
                  : "text-[#71717A] hover:text-[#F4F4F5]"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Execution Studio & AST</span>
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === "ai"
                  ? "bg-[#18181B] text-[#F4F4F5] border border-[#27272A]"
                  : "text-[#71717A] hover:text-[#F4F4F5]"
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Tutor</span>
            </button>

            <button
              onClick={() => setActiveTab("diff")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === "diff"
                  ? "bg-[#18181B] text-[#F4F4F5] border border-[#27272A]"
                  : "text-[#71717A] hover:text-[#F4F4F5]"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Optimization Diff</span>
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === "findings" && (
            <LineFindingsTable findings={result.line_findings} />
          )}

          {activeTab === "ast" && (
            <ASTVisualizerTree 
              tree={result.ast_tree} 
              code={code} 
              language={language}
              onActiveLineChange={setActiveExecutionLine}
            />
          )}

          {activeTab === "ai" && (
            <AITutorPanel code={code} language={language} result={result} />
          )}

          {activeTab === "diff" && (
            <OptimizationDiff
              originalCode={code}
              language={language}
              result={result}
              explanation={explanation}
            />
          )}
        </div>
      )}
    </div>
  );
}

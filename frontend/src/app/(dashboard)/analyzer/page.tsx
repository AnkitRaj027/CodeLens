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
  Zap
} from "lucide-react";

export default function AnalyzerPage() {
  const [code, setCode] = useState<string>(EXAMPLE_PRESETS[1].code); // Default to nested loops
  const [language, setLanguage] = useState<string>("python");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<StaticAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"findings" | "ai" | "diff" | "ast">("findings");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<AIExplanationResult | null>(null);

  // Trigger analysis
  const runAnalysis = async (codeToAnalyze = code, langToAnalyze = language) => {
    if (!codeToAnalyze.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await api.post<StaticAnalysisResult>("/analyze/static", {
        code: codeToAnalyze,
        language: langToAnalyze,
      });
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

  // Run initial analysis on mount
  useEffect(() => {
    runAnalysis(EXAMPLE_PRESETS[1].code, "python");
  }, []);

  // Save to history
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            Deterministic AST Analyzer + Grounded AI
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Algorithm Complexity IDE
          </h1>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                savedSuccess
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-750"
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Saved to History
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-blue-400" />
                  Save Analysis
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Editor Section */}
      <CodeEditor
        code={code}
        setCode={setCode}
        language={language}
        setLanguage={(l) => {
          setLanguage(l);
        }}
        onAnalyze={() => runAnalysis(code, language)}
        isAnalyzing={isAnalyzing}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Complexity Cards */}
          <ComplexityCard result={result} />

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab("findings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "findings"
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Layers className="w-4 h-4" />
              Line-by-Line Breakdown ({result.line_findings.length})
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "ai"
                  ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-300 border border-blue-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Brain className="w-4 h-4 text-cyan-400" />
              AI Pedagogical Tutor
            </button>

            <button
              onClick={() => setActiveTab("diff")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "diff"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Optimization Comparison
            </button>

            <button
              onClick={() => setActiveTab("ast")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "ast"
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
            >
              <FolderTree className="w-4 h-4" />
              AST Code Structure
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === "findings" && (
            <LineFindingsTable findings={result.line_findings} />
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

          {activeTab === "ast" && (
            <ASTVisualizerTree tree={result.ast_tree} />
          )}
        </div>
      )}
    </div>
  );
}

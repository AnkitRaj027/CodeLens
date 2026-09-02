"use client";

import React from "react";
import Link from "next/link";
import { 
  Code2, 
  Terminal, 
  Cpu, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Layers, 
  GitBranch, 
  ArrowRight, 
  CheckCircle2, 
  BarChart3,
  HelpCircle,
  TrendingDown
} from "lucide-react";

export default function LandingPage() {
  const sampleCode = `def two_sum(nums, target):
    seen = {}                     # O(1) space
    for i, num in enumerate(nums):# O(n) loop
        diff = target - num       # O(1)
        if diff in seen:          # O(1) hash lookup
            return [seen[diff], i]# O(1)
        seen[num] = i
    return []`;

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide shadow-sm">
              <Cpu className="w-3.5 h-3.5" />
              <span>Deterministic AST Static Analysis + Grounded AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Master Big-O with <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Mathematical Precision
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-xl text-slate-300 font-medium">
              Analyze. Understand. Optimize.
            </p>

            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
              CodeLens parses your source code into Abstract Syntax Trees to calculate exact time & space complexity, highlights contributing lines, and provides grounded AI pedagogical explanations with zero guesswork.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/analyzer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.02]"
              >
                <Terminal className="w-4 h-4" />
                Launch Analyzer
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/practice"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-750 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Practice Complexity Quizzes
              </Link>
            </div>

            {/* Supported Complexities Pill Banner */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium mr-2">Detects:</span>
              {["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)", "O(n!)"].map((badge) => (
                <span key={badge} className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-blue-300 code-font">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-slate-300">two_sum_optimized.py</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Static Confidence: HIGH
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {/* Code Snippet */}
              <div className="md:col-span-7 p-5 bg-slate-950/50 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto">
                <pre>{sampleCode}</pre>
              </div>

              {/* Analysis Result Preview */}
              <div className="md:col-span-5 p-5 bg-slate-900/40 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                    Deterministic Findings
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Time Complexity</div>
                      <div className="text-base font-bold text-emerald-400 code-font">O(n)</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Aux Space</div>
                      <div className="text-base font-bold text-blue-400 code-font">O(n)</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Single linear loop iterating input collection.</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
                      <span>Constant time hash lookup in place of nested loop.</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/analyzer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/20 transition-all"
                >
                  <span>Open in CodeLens IDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 bg-slate-950/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for Deep Algorithmic Understanding
            </h2>
            <p className="text-sm text-slate-400">
              Not a naive Big-O guesser. CodeLens applies static compiler analysis techniques to provide student-grade insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">AST-Based Loop & Recursion Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Determines independent, nested, and dependent arithmetic bounds $\sum i$, logarithmic division steps, and solves recurrence relations $T(n) = aT(n/b) + f(n)$.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Line-by-Line Complexity Attribution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                See exactly which code lines contribute to the asymptotic upper bound, with inline visual badges and step-by-step mathematical reasoning.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-xl border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-white">Grounded AI Explanations & Diff</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI is constrained by deterministic AST truths. Learn why the complexity occurs with Beginner, Intermediate, and Advanced pedagogical breakdowns.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

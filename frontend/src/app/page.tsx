"use client";

import React from "react";
import Link from "next/link";
import { 
  Terminal, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  TrendingDown
} from "lucide-react";

export default function LandingPage() {
  const sampleCode = `def two_sum(nums, target):
    seen = {}                     # O(1) space allocation
    for i, num in enumerate(nums):# O(n) linear loop
        diff = target - num       # O(1) arithmetic
        if diff in seen:          # O(1) hash lookup
            return [seen[diff], i]# O(1) return
        seen[num] = i
    return []`;

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Subtle technical gradient */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-blue-600/5 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Top Engine Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#111113] border border-[#27272A] text-[#A1A1AA] text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>Deterministic AST Static Analysis + Grounded AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F4F4F5] leading-[1.1]">
              Analyze. Understand. <br />
              <span className="text-[#F4F4F5] underline decoration-blue-500/50 decoration-2 underline-offset-8">
                Optimize.
              </span>
            </h1>

            {/* Tagline & Description */}
            <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto pt-2">
              CodeLens parses source code into Abstract Syntax Trees to calculate exact Big-O time & space complexity, attributes contributing lines, and provides grounded AI pedagogical explanations with mathematical rigor.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href="/analyzer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#F4F4F5] text-[#09090B] hover:bg-white font-medium text-xs shadow-sm transition-all"
              >
                <Terminal className="w-4 h-4" />
                <span>Launch IDE Analyzer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/practice"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#18181B] hover:bg-[#202024] text-[#F4F4F5] font-medium text-xs border border-[#27272A] transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Practice Complexity Quizzes</span>
              </Link>
            </div>

            {/* Supported Complexities Pill Banner */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-1.5 text-xs font-mono">
              <span className="text-[#71717A] text-xs mr-1">Detects:</span>
              {["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)", "O(n!)"].map((badge) => (
                <span key={badge} className="px-2 py-0.5 rounded bg-[#111113] border border-[#27272A] text-[#A1A1AA] text-[11px]">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Preview Card (IDE Style) */}
          <div className="mt-12 max-w-4xl mx-auto bg-[#111113] rounded-lg border border-[#27272A] overflow-hidden shadow-xl">
            {/* Window Header */}
            <div className="px-4 py-2.5 bg-[#09090B] border-b border-[#27272A] flex items-center justify-between text-xs text-[#71717A] font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#27272A]" />
                <span className="ml-2 text-[#A1A1AA]">two_sum_optimized.py</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#18181B] text-emerald-400 border border-[#27272A] text-[10px] font-medium">
                  Confidence: HIGH
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#27272A]">
              {/* Code Snippet */}
              <div className="md:col-span-7 p-5 bg-[#09090B] font-mono text-xs leading-relaxed text-[#F4F4F5] overflow-x-auto">
                <pre className="text-[12px] leading-6">{sampleCode}</pre>
              </div>

              {/* Analysis Result Preview */}
              <div className="md:col-span-5 p-5 bg-[#111113] flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#71717A] font-mono font-semibold mb-3">
                    Deterministic Findings
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2.5 rounded-md bg-[#18181B] border border-[#27272A]">
                      <div className="text-[10px] text-[#71717A] uppercase font-mono font-medium">Time Complexity</div>
                      <div className="text-lg font-bold text-[#F4F4F5] font-mono mt-0.5">O(n)</div>
                    </div>
                    <div className="p-2.5 rounded-md bg-[#18181B] border border-[#27272A]">
                      <div className="text-[10px] text-[#71717A] uppercase font-mono font-medium">Aux Space</div>
                      <div className="text-lg font-bold text-blue-400 font-mono mt-0.5">O(n)</div>
                    </div>
                  </div>
                  <div className="text-xs text-[#A1A1AA] space-y-2">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] leading-relaxed">Single linear loop iterating input collection.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingDown className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] leading-relaxed">Constant time hash lookup in place of nested loop.</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/analyzer"
                  className="flex items-center justify-between p-2.5 rounded-md bg-[#18181B] border border-[#27272A] text-[#F4F4F5] text-xs font-medium hover:border-[#3F3F46] transition-all"
                >
                  <span>Open in CodeLens IDE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#71717A]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 bg-[#09090B] border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F4F4F5] tracking-tight font-mono">
              Engineered for Deep Algorithmic Understanding
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              CodeLens applies static compiler analysis techniques to provide student-grade insights with zero guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="bg-[#111113] p-5 rounded-lg border border-[#27272A] space-y-2.5 card-hover">
              <div className="w-8 h-8 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-blue-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#F4F4F5] font-mono">AST Loop & Recursion Engine</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Determines independent, nested, and dependent arithmetic bounds, logarithmic division steps, and solves recurrence relations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#111113] p-5 rounded-lg border border-[#27272A] space-y-2.5 card-hover">
              <div className="w-8 h-8 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-blue-400">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#F4F4F5] font-mono">Line-by-Line Complexity Attribution</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Inspect which code statements contribute to the asymptotic upper bound, with inline badges and mathematical reasoning.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#111113] p-5 rounded-lg border border-[#27272A] space-y-2.5 card-hover">
              <div className="w-8 h-8 rounded-md bg-[#18181B] border border-[#27272A] flex items-center justify-center text-blue-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#F4F4F5] font-mono">Grounded AI Explanations & Diff</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Constrained by deterministic AST truths. Learn why the complexity occurs with Beginner, Intermediate, and Advanced breakdowns.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Code2, Cpu, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">
                Code<span className="text-blue-400">Lens</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Deterministic AST complexity analysis and grounded AI pedagogical tutoring for computer science students and engineers.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> AST-Driven Static Engine
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Deterministic Verification
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/analyzer" className="hover:text-white transition-colors">Complexity Analyzer</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Mastery Dashboard</Link></li>
              <li><Link href="/practice" className="hover:text-white transition-colors">Complexity Quizzes</Link></li>
              <li><Link href="/algorithms" className="hover:text-white transition-colors">Algorithm Matrix</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Curriculum</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/learn" className="hover:text-white transition-colors">Time Complexity</Link></li>
              <li><Link href="/learn" className="hover:text-white transition-colors">Space & Call Stacks</Link></li>
              <li><Link href="/learn" className="hover:text-white transition-colors">Recurrence Trees</Link></li>
              <li><Link href="/learn" className="hover:text-white transition-colors">Optimization Patterns</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CodeLens. Built for developers & computer science students.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Analyze. Understand. Optimize.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from "react";
import Link from "next/link";
import { Code2, Cpu, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#27272A] bg-[#09090B] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#18181B] border border-[#27272A] text-[#F4F4F5] flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-base text-[#F4F4F5] code-font">
                CodeLens
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] max-w-sm leading-relaxed">
              Deterministic AST complexity analysis and grounded AI pedagogical tutoring for developers and computer science engineers.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-[#71717A] code-font">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> AST Static Engine
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Deterministic Bound
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] mb-3 code-font">Platform</h4>
            <ul className="space-y-2 text-xs text-[#A1A1AA]">
              <li><Link href="/analyzer" className="hover:text-[#F4F4F5] transition-colors">Complexity IDE</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#F4F4F5] transition-colors">Dashboard</Link></li>
              <li><Link href="/practice" className="hover:text-[#F4F4F5] transition-colors">Practice Arena</Link></li>
              <li><Link href="/algorithms" className="hover:text-[#F4F4F5] transition-colors">Algorithm Matrix</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5] mb-3 code-font">Curriculum</h4>
            <ul className="space-y-2 text-xs text-[#A1A1AA]">
              <li><Link href="/learn" className="hover:text-[#F4F4F5] transition-colors">Big-O Fundamentals</Link></li>
              <li><Link href="/learn" className="hover:text-[#F4F4F5] transition-colors">Call Stacks & Heap Space</Link></li>
              <li><Link href="/learn" className="hover:text-[#F4F4F5] transition-colors">Recurrence Trees</Link></li>
              <li><Link href="/learn" className="hover:text-[#F4F4F5] transition-colors">Optimization Patterns</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between text-xs text-[#71717A] gap-4">
          <p>© {new Date().getFullYear()} CodeLens. Built for engineers & computer science students.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#A1A1AA] font-mono text-[11px]">Analyze. Understand. Optimize.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

"use client";

import React from "react";
import { LineFinding } from "@/types/analysis";
import { Code, Tag, HelpCircle, ArrowRight } from "lucide-react";

interface LineFindingsTableProps {
  findings: LineFinding[];
}

export const LineFindingsTable: React.FC<LineFindingsTableProps> = ({ findings }) => {
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "OUTER_LOOP":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "INNER_LOOP":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "DEPENDENT_INNER_LOOP":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "LOGARITHMIC_LOOP":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "ALLOCATION":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "CONSTANT_OPERATION":
        return "bg-slate-800/60 text-slate-400 border-slate-700/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-400" />
          Line-by-Line Complexity Attribution
        </h3>
        <span className="text-[11px] text-slate-500">
          {findings.length} analyzed line{findings.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/50 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800/60">
            <tr>
              <th className="py-2.5 px-4 w-16">Line</th>
              <th className="py-2.5 px-4">Code Statement</th>
              <th className="py-2.5 px-4 w-28">Complexity</th>
              <th className="py-2.5 px-4 w-44">Structural Role</th>
              <th className="py-2.5 px-4">Reasoning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {findings.map((f, idx) => (
              <tr 
                key={`${f.line_number}-${idx}`} 
                className="hover:bg-slate-900/40 transition-colors"
              >
                {/* Line Number */}
                <td className="py-3 px-4 font-mono font-bold text-slate-500">
                  #{f.line_number}
                </td>

                {/* Code Snippet */}
                <td className="py-3 px-4 font-mono text-slate-200">
                  <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 inline-block max-w-xs sm:max-w-md truncate">
                    {f.code.trim() || "<empty>"}
                  </span>
                </td>

                {/* Line Complexity */}
                <td className="py-3 px-4 font-mono font-semibold">
                  <span className={`px-2 py-0.5 rounded text-[11px] ${
                    f.complexity === "O(1)" 
                      ? "text-slate-400 bg-slate-800/50" 
                      : f.complexity.includes("log")
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-blue-400 bg-blue-500/10"
                  }`}>
                    {f.complexity}
                  </span>
                </td>

                {/* Role Badge */}
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${getRoleBadgeStyle(f.role)}`}>
                    {f.role.replace(/_/g, " ")}
                  </span>
                </td>

                {/* Explanation */}
                <td className="py-3 px-4 text-slate-400 leading-relaxed max-w-sm">
                  {f.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

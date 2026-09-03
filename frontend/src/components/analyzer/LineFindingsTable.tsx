"use client";

import React, { useState } from "react";
import { LineFinding } from "@/types/analysis";
import { Layers, Search } from "lucide-react";

interface LineFindingsTableProps {
  findings: LineFinding[];
}

export const LineFindingsTable: React.FC<LineFindingsTableProps> = ({ findings }) => {
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const roles = ["ALL", ...Array.from(new Set(findings.map((f) => f.role)))];

  const filteredFindings = findings.filter((f) => {
    const matchesRole = filterRole === "ALL" || f.role === filterRole;
    const matchesSearch = !search || 
      f.code.toLowerCase().includes(search.toLowerCase()) || 
      f.explanation.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OUTER_LOOP":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "INNER_LOOP":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "DEPENDENT_INNER_LOOP":
        return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "LOGARITHMIC_LOOP":
        return "text-teal-400 bg-teal-500/10 border-teal-500/20";
      case "RECURSION_CALL":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "ALLOCATION":
      case "MATRIX_ALLOCATION":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-[#71717A] bg-[#18181B] border-[#27272A]";
    }
  };

  return (
    <div className="bg-[#111113] rounded-lg border border-[#27272A] overflow-hidden shadow-sm space-y-0">
      {/* Table Toolbar */}
      <div className="px-5 py-3 bg-[#111113] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F4F4F5]">
            Line-by-Line Complexity Attribution
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter code..."
              className="pl-8 pr-3 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-blue-500/50 w-36 sm:w-48 font-mono"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs text-[#A1A1AA] focus:outline-none cursor-pointer font-mono"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-[#18181B] text-[#F4F4F5]">
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Card List View (< sm) */}
      <div className="sm:hidden divide-y divide-[#27272A] font-mono">
        {filteredFindings.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#71717A]">
            No line findings matching filter.
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <div key={finding.line_number} className="p-3.5 space-y-2 bg-[#111113]">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-blue-400">
                    Line {finding.line_number}
                  </span>
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getRoleBadge(finding.role)}`}>
                    {finding.role}
                  </span>
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {finding.complexity}
                </span>
              </div>

              <div className="bg-[#09090B] p-2 rounded border border-[#27272A] overflow-x-auto">
                <code className="text-xs text-[#F4F4F5]">
                  {finding.code}
                </code>
              </div>

              <p className="text-xs text-[#A1A1AA] font-sans leading-relaxed pt-0.5">
                {finding.explanation}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Desktop & Tablet Table Content (>= sm) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[620px]">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#18181B] text-[#71717A] uppercase text-[10px] font-semibold tracking-wider font-mono">
              <th className="py-2.5 px-4 w-16">Line</th>
              <th className="py-2.5 px-4">Code Statement</th>
              <th className="py-2.5 px-4 w-28">Complexity</th>
              <th className="py-2.5 px-4 w-44">Structural Role</th>
              <th className="py-2.5 px-4">Compiler Explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A] font-mono">
            {filteredFindings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[#71717A]">
                  No line findings matching filter.
                </td>
              </tr>
            ) : (
              filteredFindings.map((finding) => (
                <tr key={finding.line_number} className="hover:bg-[#18181B]/60 transition-colors">
                  <td className="py-2.5 px-4 text-[#71717A] font-semibold">
                    {finding.line_number}
                  </td>
                  <td className="py-2.5 px-4 text-[#F4F4F5]">
                    <code className="bg-[#18181B] px-1.5 py-0.5 rounded border border-[#27272A] text-xs">
                      {finding.code}
                    </code>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-blue-400">
                    {finding.complexity}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${getRoleBadge(finding.role)}`}>
                      {finding.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[#A1A1AA] font-sans text-xs">
                    {finding.explanation}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

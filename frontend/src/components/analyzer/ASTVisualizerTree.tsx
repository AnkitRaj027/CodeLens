"use client";

import React, { useState } from "react";
import { ASTNodeVisual } from "@/types/analysis";
import { 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  ChevronsUpDown,
  CornerDownRight,
  Code2
} from "lucide-react";

interface ASTVisualizerTreeProps {
  tree: ASTNodeVisual;
}

const ASTTreeNode: React.FC<{ node: ASTNodeVisual; depth?: number; searchQuery?: string }> = ({ 
  node, 
  depth = 0,
  searchQuery = ""
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const matchesSearch = !searchQuery || 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    node.type.toLowerCase().includes(searchQuery.toLowerCase());

  const getNodeBadgeColor = (type: string) => {
    switch (type) {
      case "ForLoop":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "WhileLoop":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "FunctionDef":
        return "text-indigo-400 bg-indigo-500/10 border-indigo-500/30";
      case "IfStatement":
      case "ElseBlock":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "Call":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      default:
        return "text-slate-400 bg-slate-800/60 border-slate-700/60";
    }
  };

  if (!matchesSearch && (!hasChildren || !node.children.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())))) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-1">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-slate-900/80 transition-colors group cursor-pointer border ${
          searchQuery && matchesSearch ? "border-blue-500/40 bg-blue-950/20" : "border-transparent hover:border-slate-800"
        }`}
        style={{ paddingLeft: `${Math.max(depth * 18, 8)}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {/* Expand / Collapse Icon */}
        {hasChildren ? (
          <button className="text-slate-500 group-hover:text-slate-300 transition-colors">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <CornerDownRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
        )}

        {/* Node Type Pill */}
        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${getNodeBadgeColor(node.type)}`}>
          {node.type}
        </span>

        {/* Node Name / Code Expression */}
        <span className="text-xs font-mono text-slate-200 truncate font-medium max-w-sm sm:max-w-xl">
          {node.name}
        </span>

        {/* Node Complexity if tagged */}
        {node.complexity && (
          <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-blue-300">
            {node.complexity}
          </span>
        )}

        {/* Line range if present */}
        {node.line_start && (
          <span className="text-[10px] text-slate-500 font-mono">
            L{node.line_start}{node.line_end && node.line_end !== node.line_start ? `-${node.line_end}` : ""}
          </span>
        )}
      </div>

      {/* Children Recursion */}
      {hasChildren && isOpen && (
        <div className="flex flex-col space-y-1 border-l border-slate-800/60 ml-3 pl-1">
          {node.children.map((child) => (
            <ASTTreeNode key={child.id} node={child} depth={depth + 1} searchQuery={searchQuery} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ASTVisualizerTree: React.FC<ASTVisualizerTreeProps> = ({ tree }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-indigo-400" />
          Hierarchical Abstract Syntax Tree (AST)
        </h3>

        {/* Search Filter Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AST nodes..."
              className="pl-8 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 overflow-x-auto max-h-[500px]">
        {tree ? (
          <ASTTreeNode node={tree} searchQuery={searchQuery} />
        ) : (
          <div className="text-xs text-slate-500 italic text-center py-8">
            No AST structure available for current code.
          </div>
        )}
      </div>
    </div>
  );
};

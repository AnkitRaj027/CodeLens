"use client";

import React, { useMemo } from "react";
import { CFGGraph, ExecutionStep } from "@/types/execution";
import { GitGraph, ArrowDown, HelpCircle, Check, X, RotateCcw } from "lucide-react";

interface ControlFlowGraphViewProps {
  cfg: CFGGraph;
  step: ExecutionStep | null;
}

export const ControlFlowGraphView: React.FC<ControlFlowGraphViewProps> = ({ cfg, step }) => {
  const activeLine = step?.lineNumber;
  const isCondition = step?.eventType === "condition";

  // Position nodes vertically in a clean flowchart
  const positionedNodes = useMemo(() => {
    let y = 30;
    return cfg.nodes.map((node, idx) => {
      const isDecision = node.type === "decision";
      const isLoop = node.type === "loop_header";
      const height = isDecision || isLoop ? 64 : 54;
      const pos = {
        ...node,
        x: 180,
        y,
        width: 320,
        height
      };
      y += height + 45;
      return pos;
    });
  }, [cfg.nodes]);

  const canvasHeight = Math.max((positionedNodes.length + 1) * 110, 480);

  return (
    <div className="bg-[#09090B] rounded-lg border border-[#27272A] p-5 overflow-auto max-h-[580px] font-mono relative">
      <div className="flex items-center justify-between mb-4 border-b border-[#27272A] pb-3 text-xs">
        <div className="flex items-center gap-2">
          <GitGraph className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-[#F4F4F5] uppercase tracking-wider">
            Control Flow Graph (CFG) Execution
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#71717A]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Branch YES
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> Branch NO
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> Current Step
          </span>
        </div>
      </div>

      <div style={{ height: `${canvasHeight}px`, minWidth: "650px" }} className="relative">
        {/* SVG Connectors */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height={canvasHeight}>
          <defs>
            <marker
              id="cfg-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" opacity="0.8" />
            </marker>
          </defs>

          {cfg.edges.map((edge) => {
            const fromNode = positionedNodes.find((n) => n.id === edge.from);
            const toNode = positionedNodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const startX = fromNode.x + fromNode.width / 2;
            const startY = fromNode.y + fromNode.height;
            const endX = toNode.x + toNode.width / 2;
            const endY = toNode.y;

            const isYes = edge.label === "YES" || edge.type === "branch_true";
            const isNo = edge.label === "NO" || edge.type === "branch_false";
            const isLoopBack = edge.type === "loop_back";

            const strokeColor = isYes ? "#10B981" : isNo ? "#F43F5E" : "#3B82F6";

            if (isLoopBack) {
              // Loop back curve around left
              const curveX = fromNode.x - 40;
              return (
                <path
                  key={edge.id}
                  d={`M ${fromNode.x} ${startY - 15} C ${curveX} ${startY}, ${curveX} ${toNode.y}, ${toNode.x} ${toNode.y + 15}`}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  markerEnd="url(#cfg-arrow)"
                />
              );
            }

            return (
              <g key={edge.id}>
                <path
                  d={`M ${startX} ${startY} L ${endX} ${endY}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                  markerEnd="url(#cfg-arrow)"
                />
                {edge.label && (
                  <text
                    x={(startX + endX) / 2 + 10}
                    y={(startY + endY) / 2}
                    fill={isYes ? "#10B981" : isNo ? "#F43F5E" : "#A1A1AA"}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* CFG Node Blocks */}
        {positionedNodes.map((node) => {
          const isCurrent =
            activeLine && node.lineStart && activeLine >= node.lineStart && activeLine <= (node.lineEnd || node.lineStart);
          const isDecision = node.type === "decision";
          const isLoop = node.type === "loop_header";

          return (
            <div
              key={node.id}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`
              }}
              className={`absolute p-3 rounded-lg border text-xs transition-all shadow-md flex flex-col justify-between ${
                isCurrent
                  ? "border-blue-500 bg-blue-950/40 ring-2 ring-blue-500 shadow-xl shadow-blue-500/20 scale-105 z-20"
                  : isDecision
                  ? "border-amber-500/40 bg-amber-950/20"
                  : isLoop
                  ? "border-indigo-500/40 bg-indigo-950/20"
                  : "border-[#27272A] bg-[#111113]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                    isDecision
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : isLoop
                      ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
                      : "text-[#A1A1AA] bg-[#18181B] border-[#27272A]"
                  }`}
                >
                  {node.type.toUpperCase()}
                </span>
                {node.lineStart && (
                  <span className="text-[10px] text-[#71717A]">Line {node.lineStart}</span>
                )}
              </div>

              <div className="text-xs font-semibold text-[#F4F4F5] truncate mt-1">
                {node.label}
              </div>

              {/* Real-time condition evaluation tag */}
              {isCurrent && isDecision && step?.evaluatedResult && (
                <div className="mt-1.5 p-1.5 rounded bg-[#18181B] border border-amber-500/30 text-[10px] text-amber-300 flex items-center justify-between">
                  <span>Evaluated:</span>
                  <strong>{step.evaluatedResult}</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

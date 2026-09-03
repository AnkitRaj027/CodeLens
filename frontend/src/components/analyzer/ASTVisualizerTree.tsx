"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { ASTNodeVisual } from "@/types/analysis";
import { ExecutionStep, CFGGraph, UserInputConfig } from "@/types/execution";
import { buildControlFlowGraph, generateExecutionSteps } from "@/lib/executionEngine";
import { AlgorithmVisualizerCanvas } from "./execution/AlgorithmVisualizerCanvas";
import { ControlFlowGraphView } from "./execution/ControlFlowGraphView";
import { CallStackPanel } from "./execution/CallStackPanel";
import { LiveVariablesPanel } from "./execution/LiveVariablesPanel";
import { StepExplainerPanel } from "./execution/StepExplainerPanel";
import { ExecutionControlsBar } from "./execution/ExecutionControlsBar";
import { InputConfigBar } from "./execution/InputConfigBar";
import { 
  FolderTree, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  CornerDownRight,
  GitGraph,
  Sparkles,
  Layers,
  Activity,
  Code2,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";

interface ASTVisualizerTreeProps {
  tree: ASTNodeVisual;
  code: string;
  language: string;
  onActiveLineChange?: (line: number | null) => void;
}

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
      return "text-[#A1A1AA] bg-[#18181B] border-[#27272A]";
  }
};

// Rich AST Tree Item with Execution State & Evaluated Result
const ASTTreeNode: React.FC<{ 
  node: ASTNodeVisual; 
  depth?: number; 
  searchQuery?: string; 
  activeLine?: number;
  step?: ExecutionStep | null;
  executedLines?: Set<number>;
}> = ({ 
  node, 
  depth = 0,
  searchQuery = "",
  activeLine,
  step,
  executedLines = new Set()
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);
  const hasChildren = node.children && node.children.length > 0;

  const isCurrent = activeLine && node.line_start && (
    activeLine >= node.line_start && activeLine <= (node.line_end || node.line_start)
  );

  const isExecuted = node.line_start ? executedLines.has(node.line_start) : false;

  useEffect(() => {
    if (isCurrent && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isCurrent]);

  const matchesSearch = !searchQuery || 
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    node.type.toLowerCase().includes(searchQuery.toLowerCase());

  if (!matchesSearch && (!hasChildren || !node.children.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())))) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-1 font-mono text-xs">
      <div 
        ref={nodeRef}
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 rounded-lg border transition-all cursor-pointer select-none ${
          isCurrent
            ? "bg-blue-950/40 border-blue-500 ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 text-white scale-[1.01] z-10"
            : isExecuted
            ? "bg-emerald-950/10 border-emerald-500/30 hover:bg-emerald-950/20"
            : "bg-[#111113] border-[#27272A] hover:bg-[#18181B]"
        }`}
        style={{ marginLeft: `${Math.min(Math.max(depth * 10, 0), 36)}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Expand / Collapse Icon */}
          {hasChildren ? (
            <button className="text-[#71717A] hover:text-[#F4F4F5] shrink-0">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <CornerDownRight className="w-3.5 h-3.5 text-[#3F3F46] shrink-0" />
          )}

          {/* Node Type Pill */}
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border shrink-0 ${getNodeBadgeColor(node.type)}`}>
            {node.type}
          </span>

          {/* Node Expression */}
          <span className="text-xs font-mono font-medium text-[#F4F4F5] truncate max-w-[180px] sm:max-w-sm">
            {node.name}
          </span>
        </div>

        {/* Runtime State & Evaluated Result Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {isCurrent ? (
            <div className="flex items-center gap-1.5">
              {step?.evaluatedResult && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 animate-in fade-in">
                  {step.evaluatedResult}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500 text-black font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                Current
              </span>
            </div>
          ) : isExecuted ? (
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Executed
            </span>
          ) : (
            <span className="text-[10px] text-[#52525B] bg-[#18181B] px-1.5 py-0.2 rounded border border-[#27272A] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending
            </span>
          )}

          {/* Line range */}
          {node.line_start && (
            <span className="text-[10px] text-[#71717A] font-mono min-w-[36px] text-right">
              L{node.line_start}{node.line_end && node.line_end !== node.line_start ? `-${node.line_end}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* Children Recursion */}
      {hasChildren && isOpen && (
        <div className="flex flex-col space-y-1 border-l border-[#27272A] ml-2 pl-1">
          {node.children.map((child) => (
            <ASTTreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              searchQuery={searchQuery} 
              activeLine={activeLine}
              step={step}
              executedLines={executedLines}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ASTVisualizerTree: React.FC<ASTVisualizerTreeProps> = ({ 
  tree, 
  code, 
  language,
  onActiveLineChange
}) => {
  const [activeTab, setActiveTab] = useState<"algorithm" | "cfg" | "tree">("algorithm");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Execution Studio State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [granularity, setGranularity] = useState<"statement" | "expression" | "algorithm">("statement");
  const [executedLines, setExecutedLines] = useState<Set<number>>(new Set());
  const [customInput, setCustomInput] = useState<UserInputConfig | undefined>(undefined);

  // Generate CFG
  const cfg: CFGGraph = useMemo(() => {
    return buildControlFlowGraph(tree, code.split("\n"));
  }, [tree, code]);

  // Generate Synchronized Execution Steps with Custom Input & Granularity
  const executionSteps: ExecutionStep[] = useMemo(() => {
    return generateExecutionSteps(code, language, tree, customInput, granularity);
  }, [code, language, tree, customInput, granularity]);

  const activeStep: ExecutionStep | null = executionSteps[currentStepIndex] || null;

  // Sync active line with parent CodeEditor
  useEffect(() => {
    if (activeStep?.lineNumber && onActiveLineChange) {
      onActiveLineChange(activeStep.lineNumber);
    }
  }, [activeStep, onActiveLineChange]);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && executionSteps.length > 0) {
      const delay = Math.max(250, Math.round(1100 / speedMultiplier));
      timer = setTimeout(() => {
        if (currentStepIndex < executionSteps.length - 1) {
          const nextIdx = currentStepIndex + 1;
          setCurrentStepIndex(nextIdx);
          const nextStep = executionSteps[nextIdx];
          if (nextStep?.lineNumber) {
            setExecutedLines((prev) => new Set(prev).add(nextStep.lineNumber));
          }
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, currentStepIndex, executionSteps, speedMultiplier]);

  const handleTogglePlay = () => {
    if (currentStepIndex >= executionSteps.length - 1) {
      setCurrentStepIndex(0);
      setExecutedLines(new Set());
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    if (currentStepIndex < executionSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = executionSteps[nextIdx];
      if (nextStep?.lineNumber) {
        setExecutedLines((prev) => new Set(prev).add(nextStep.lineNumber));
      }
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setExecutedLines(new Set());
    if (onActiveLineChange) onActiveLineChange(null);
  };

  return (
    <div className="space-y-4">
      {/* 0. CUSTOM INPUT CONFIGURATION BAR */}
      <InputConfigBar 
        onApplyInput={(cfg) => {
          setCustomInput(cfg);
          handleReset();
        }}
      />

      {/* 1. TOP EXECUTION PLAYBACK CONTROLS BAR */}
      <ExecutionControlsBar
        isPlaying={isPlaying}
        currentStepIndex={currentStepIndex}
        totalSteps={executionSteps.length}
        opCount={activeStep?.opCount || 0}
        speed={speedMultiplier}
        granularity={granularity}
        onTogglePlay={handleTogglePlay}
        onStepForward={handleStepForward}
        onStepBack={handleStepBack}
        onReset={handleReset}
        onChangeSpeed={setSpeedMultiplier}
        onChangeGranularity={setGranularity}
      />

      {/* 2. DUAL-PANE SYNCHRONIZED STUDIO WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PANE: MAIN VISUALIZATION CANVAS (7 Cols) */}
        <div className="lg:col-span-7 bg-[#111113] rounded-xl border border-[#27272A] overflow-hidden shadow-sm flex flex-col min-h-[380px] sm:min-h-[480px]">
          {/* Sub-View Switcher Tabs */}
          <div className="px-3 sm:px-4 py-2 bg-[#141416] border-b border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono">
            <div className="flex items-center bg-[#18181B] p-0.5 rounded-lg border border-[#27272A] text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("algorithm")}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all flex-1 sm:flex-none ${
                  activeTab === "algorithm"
                    ? "bg-[#27272A] text-blue-400 shadow-sm"
                    : "text-[#71717A] hover:text-[#A1A1AA]"
                }`}
              >
                <Activity className="w-3.5 h-3.5 shrink-0" />
                <span>Studio</span>
              </button>

              <button
                onClick={() => setActiveTab("cfg")}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all flex-1 sm:flex-none ${
                  activeTab === "cfg"
                    ? "bg-[#27272A] text-blue-400 shadow-sm"
                    : "text-[#71717A] hover:text-[#A1A1AA]"
                }`}
              >
                <GitGraph className="w-3.5 h-3.5 shrink-0" />
                <span>CFG</span>
              </button>

              <button
                onClick={() => setActiveTab("tree")}
                className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md font-medium whitespace-nowrap transition-all flex-1 sm:flex-none ${
                  activeTab === "tree"
                    ? "bg-[#27272A] text-blue-400 shadow-sm"
                    : "text-[#71717A] hover:text-[#A1A1AA]"
                }`}
              >
                <FolderTree className="w-3.5 h-3.5 shrink-0" />
                <span>AST</span>
              </button>
            </div>

            {/* AST Tree Search Filter */}
            {activeTab === "tree" && (
              <div className="relative w-full sm:w-auto">
                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter nodes..."
                  className="w-full sm:w-36 pl-8 pr-2.5 py-1 rounded bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-blue-500/50 font-mono"
                />
              </div>
            )}
          </div>

          {/* Canvas Content */}
          <div className="flex-1 p-3 sm:p-6 bg-[#09090B] bg-[radial-gradient(#1f1f23_1px,transparent_1px)] [background-size:16px_16px] flex flex-col justify-center overflow-hidden">
            {activeTab === "algorithm" && (
              <AlgorithmVisualizerCanvas step={activeStep} />
            )}

            {activeTab === "cfg" && (
              <ControlFlowGraphView cfg={cfg} step={activeStep} />
            )}

            {activeTab === "tree" && (
              <div className="space-y-2 overflow-y-auto max-h-[440px] pr-1 w-full">
                {tree ? (
                  <ASTTreeNode 
                    node={tree} 
                    searchQuery={searchQuery} 
                    activeLine={activeStep?.lineNumber}
                    step={activeStep}
                    executedLines={executedLines}
                  />
                ) : (
                  <div className="text-xs text-[#71717A] italic text-center py-12 font-mono">
                    No AST structure available for current code.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: SYNCHRONIZED TELEMETRY SIDEBAR (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          {/* 1. Call Stack Frame Viewer */}
          <CallStackPanel frames={activeStep?.callStack || []} />

          {/* 2. Live Variables & Scope Tracker */}
          <LiveVariablesPanel 
            variables={activeStep?.variables || {}} 
            changedVariables={activeStep?.changedVariables || []}
          />

          {/* 3. Step Logic & Impact Explainer */}
          <StepExplainerPanel step={activeStep} />
        </div>
      </div>
    </div>
  );
};

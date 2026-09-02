export interface StackFrame {
  id: string;
  functionName: string;
  callLine?: number;
  args: Record<string, any>;
  variables: Record<string, any>;
  returnValue?: any;
  isCurrent?: boolean;
}

export interface VariableChange {
  name: string;
  oldValue: any;
  newValue: any;
}

export interface CFGNode {
  id: string;
  label: string;
  codeSnippet: string;
  type: "entry" | "statement" | "decision" | "loop_header" | "call" | "return" | "exit";
  lineStart?: number;
  lineEnd?: number;
  trueTargetId?: string;
  falseTargetId?: string;
  nextTargetId?: string;
  x?: number;
  y?: number;
}

export interface CFGEdge {
  id: string;
  from: string;
  to: string;
  label?: "YES" | "NO" | "NEXT" | "LOOP";
  type: "sequential" | "branch_true" | "branch_false" | "loop_back" | "return";
}

export interface CFGGraph {
  nodes: CFGNode[];
  edges: CFGEdge[];
}

export interface AlgorithmState {
  type: "array" | "merge_sort" | "binary_search" | "two_pointers" | "general";
  array?: (number | string)[];
  indices?: { name: string; index: number; color?: string }[];
  subArrays?: { label: string; array: (number | string)[]; active?: boolean }[];
  comparison?: { left: any; right: any; op: string; result: boolean };
  merged?: (number | string)[];
  highlightRange?: [number, number];
}

export interface ExecutionExplanation {
  title: string;
  description: string;
  computation?: string;
  impact: string;
}

export interface UserInputConfig {
  array?: number[];
  target?: number;
  n?: number;
}

export interface ExecutionStep {
  stepIndex: number;
  totalSteps: number;
  lineNumber: number;
  sourceCode: string;
  astNodeId?: string;
  cfgNodeId?: string;
  eventType: "assign" | "condition" | "loop_iter" | "call" | "return" | "stmt" | "error";
  callStack: StackFrame[];
  currentFrame: StackFrame;
  variables: Record<string, any>;
  changedVariables: VariableChange[];
  condition?: string;
  conditionResult?: boolean;
  evaluatedResult?: string;
  returnValue?: any;
  algorithmState?: AlgorithmState;
  explanation: ExecutionExplanation;
  opCount: number;
}

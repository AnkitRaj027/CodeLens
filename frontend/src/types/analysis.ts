export interface LineFinding {
  line_number: number;
  code: string;
  complexity: string;
  role: string;
  explanation: string;
}

export interface ASTNodeVisual {
  id: string;
  name: string;
  type: string;
  complexity?: string;
  line_start?: number;
  line_end?: number;
  children: ASTNodeVisual[];
}

export interface DeterministicSummary {
  total_loops: number;
  max_loop_nesting_depth: number;
  has_recursion: boolean;
  recursive_functions: string[];
  recursion_depth_estimate?: string;
  allocated_structures: any[];
  function_calls: string[];
}

export interface StaticAnalysisResult {
  time_complexity: string;
  space_complexity: string;
  auxiliary_space: string;
  recursion_stack: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidence_reason: string;
  deterministic_summary: DeterministicSummary;
  line_findings: LineFinding[];
  ast_tree: ASTNodeVisual;
  summary_explanation: string;
}

export interface AIExplanationResult {
  explanation_mode: string;
  summary: string;
  step_by_step_reasoning: string[];
  why_this_complexity: string;
  what_happens_if_n_doubles: string;
  optimization?: {
    has_optimization: boolean;
    optimized_code?: string;
    optimized_time_complexity?: string;
    optimized_space_complexity?: string;
    technique?: string;
    tradeoff_explanation?: string;
  };
  learning_takeaway: string;
}

import ast
from typing import List, Dict, Any, Tuple, Optional, Set
from app.engine.base import BaseAnalyzer
from app.engine.common.complexity_math import (
    max_complexity,
    sum_complexities,
    multiply_complexities,
    normalize_complexity
)
from app.engine.python.loop_analyzer import LoopAnalyzer
from app.engine.python.recursion_analyzer import RecursionAnalyzer, RecursionInfo
from app.engine.python.space_analyzer import SpaceAnalyzer
from app.engine.python.ast_builder import ASTVisualizerBuilder
from app.schemas.analysis import (
    StaticAnalysisResponse,
    LineFinding,
    DeterministicSummary,
    ASTNodeVisual
)


class PythonASTAnalyzer(BaseAnalyzer):
    def __init__(self):
        self.loop_analyzer = LoopAnalyzer()
        self.recursion_analyzer = RecursionAnalyzer()
        self.space_analyzer = SpaceAnalyzer()
        self.ast_builder = ASTVisualizerBuilder()

    def analyze(self, source_code: str) -> StaticAnalysisResponse:
        lines = source_code.splitlines()
        try:
            tree = ast.parse(source_code)
        except SyntaxError as e:
            return StaticAnalysisResponse(
                time_complexity="Unknown",
                space_complexity="Unknown",
                auxiliary_space="Unknown",
                recursion_stack="Unknown",
                confidence="LOW",
                confidence_reason=f"Syntax Error on line {e.lineno}: {e.msg}",
                deterministic_summary=DeterministicSummary(),
                line_findings=[],
                ast_tree=ASTNodeVisual(id="root", name="Invalid Syntax", type="Error"),
                summary_explanation=f"Code contains a syntax error: {e.msg}"
            )

        line_findings_dict: Dict[int, LineFinding] = {}
        total_loops = 0
        max_nesting_depth = 0
        is_uncertain = False
        uncertainty_reason = ""

        # Step 1: Detect recursion across all defined functions
        has_recursion = False
        recursive_funcs: List[str] = []
        recursion_time_candidates: List[str] = []
        max_recursion_stack = "O(1)"
        recursion_equations: List[str] = []
        recursion_details_list: List[Dict[str, Any]] = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                rec_info = self.recursion_analyzer.analyze_function(node, lines)
                if rec_info:
                    has_recursion = True
                    recursive_funcs.append(rec_info.func_name)
                    recursion_time_candidates.append(rec_info.time_complexity)
                    max_recursion_stack = max_complexity(max_recursion_stack, rec_info.stack_space)
                    recursion_equations.append(rec_info.recurrence_equation)
                    recursion_details_list.append({
                        "function_name": rec_info.func_name,
                        "branch_count": rec_info.branch_count,
                        "reduction_pattern": rec_info.reduction_type,
                        "recurrence_equation": rec_info.recurrence_equation,
                        "time_complexity": rec_info.time_complexity,
                        "stack_space": rec_info.stack_space,
                        "reasoning": rec_info.reasoning
                    })

                    # Attribute line findings for Base Cases & Recursive Calls
                    for b_line in rec_info.base_cases:
                        line_findings_dict[b_line] = LineFinding(
                            line_number=b_line,
                            code=lines[b_line - 1] if b_line <= len(lines) else "",
                            complexity="O(1)",
                            role="BASE_CASE",
                            explanation=f"Base case terminating recursion for '{rec_info.func_name}'."
                        )

                    for c_line, arg_pat in rec_info.recursive_calls:
                        line_findings_dict[c_line] = LineFinding(
                            line_number=c_line,
                            code=lines[c_line - 1] if c_line <= len(lines) else "",
                            complexity=rec_info.time_complexity,
                            role="RECURSION_CALL",
                            explanation=f"Recursive call to '{rec_info.func_name}' ({rec_info.recurrence_equation})."
                        )

        # Step 2: Analyze loop structures
        def analyze_block(statements: List[ast.AST], current_enclosing_vars: Set[str], current_depth: int) -> Tuple[str, int]:
            nonlocal total_loops, max_nesting_depth
            block_complexities: List[str] = []
            max_depth_in_block = current_depth

            for stmt in statements:
                line_no = getattr(stmt, "lineno", 1)
                code_snippet = lines[line_no - 1] if line_no <= len(lines) else ""

                if isinstance(stmt, ast.For):
                    total_loops += 1
                    depth = current_depth + 1
                    max_nesting_depth = max(max_nesting_depth, depth)
                    max_depth_in_block = max(max_depth_in_block, depth)

                    loop_comp, role, reason, var_name = self.loop_analyzer.analyze_for_loop(stmt, current_enclosing_vars)
                    
                    line_findings_dict[line_no] = LineFinding(
                        line_number=line_no,
                        code=code_snippet,
                        complexity=loop_comp,
                        role=role,
                        explanation=reason
                    )

                    new_enclosing = current_enclosing_vars.copy()
                    if var_name:
                        new_enclosing.add(var_name)

                    inner_comp, inner_depth = analyze_block(stmt.body, new_enclosing, depth)
                    max_depth_in_block = max(max_depth_in_block, inner_depth)

                    total_loop_comp = multiply_complexities(loop_comp, inner_comp)
                    block_complexities.append(total_loop_comp)

                elif isinstance(stmt, ast.While):
                    total_loops += 1
                    depth = current_depth + 1
                    max_nesting_depth = max(max_nesting_depth, depth)
                    max_depth_in_block = max(max_depth_in_block, depth)

                    loop_comp, role, reason = self.loop_analyzer.analyze_while_loop(stmt)
                    
                    line_findings_dict[line_no] = LineFinding(
                        line_number=line_no,
                        code=code_snippet,
                        complexity=loop_comp,
                        role=role,
                        explanation=reason
                    )

                    inner_comp, inner_depth = analyze_block(stmt.body, current_enclosing_vars, depth)
                    max_depth_in_block = max(max_depth_in_block, inner_depth)

                    total_loop_comp = multiply_complexities(loop_comp, inner_comp)
                    block_complexities.append(total_loop_comp)

                elif isinstance(stmt, ast.If):
                    then_comp, d1 = analyze_block(stmt.body, current_enclosing_vars, current_depth)
                    else_comp, d2 = analyze_block(stmt.orelse, current_enclosing_vars, current_depth)
                    block_complexities.append(max_complexity(then_comp, else_comp))
                    max_depth_in_block = max(max_depth_in_block, d1, d2)

                elif isinstance(stmt, ast.FunctionDef):
                    fn_comp, fn_depth = analyze_block(stmt.body, current_enclosing_vars, 0)
                    block_complexities.append(fn_comp)
                    max_depth_in_block = max(max_depth_in_block, fn_depth)

                else:
                    block_complexities.append("O(1)")
                    if line_no not in line_findings_dict and code_snippet.strip():
                        line_findings_dict[line_no] = LineFinding(
                            line_number=line_no,
                            code=code_snippet,
                            complexity="O(1)",
                            role="CONSTANT_OPERATION",
                            explanation="Constant time elementary instruction."
                        )

            return (sum_complexities(block_complexities), max_depth_in_block)

        loop_time_comp, _ = analyze_block(tree.body, set(), 0)

        # Step 3: Combine loop complexity with recursion complexity
        overall_time = loop_time_comp
        if has_recursion:
            for rec_time in recursion_time_candidates:
                overall_time = max_complexity(overall_time, rec_time)

        # Step 4: Perform Deep Space Analysis
        space_report = self.space_analyzer.analyze_space(tree, lines, max_recursion_stack)
        for alloc_finding in space_report.line_findings:
            line_findings_dict[alloc_finding.line_number] = alloc_finding

        # Step 5: Evaluate confidence
        confidence = "HIGH"
        confidence_reason = "Deterministic AST analysis identified loop iteration bounds, recursion recurrence, and memory allocations."
        if has_recursion:
            confidence = "HIGH"
            eq_str = ", ".join(recursion_equations)
            confidence_reason = f"Solved recurrence relation ({eq_str}) determining {overall_time} time and {max_recursion_stack} call stack depth."
        elif total_loops == 0 and overall_time == "O(1)":
            confidence = "HIGH"
            confidence_reason = "No unbounded loops or recursion detected. All operations execute in constant time O(1)."
        elif max_nesting_depth >= 2:
            confidence = "HIGH"
            confidence_reason = f"Identified {max_nesting_depth} levels of loop nesting with deterministic iteration bounds."

        # Step 6: Build AST Visualizer tree
        ast_visual = self.ast_builder.build_tree(tree)

        # Step 7: Summary narrative
        if has_recursion:
            rec_detail = recursion_details_list[0] if recursion_details_list else {}
            summary = f"Recursive algorithm governed by {rec_detail.get('recurrence_equation', 'T(n)')}. Runs in {overall_time} time with {max_recursion_stack} recursion call stack space."
        elif overall_time == "O(1)":
            summary = "The code consists of sequential constant-time statements and executes in O(1) time with O(1) auxiliary space."
        elif overall_time == "O(log n)":
            summary = "The code contains a logarithmic loop where the search space or index is repeatedly halved/scaled, running in O(log n) time."
        elif overall_time == "O(n)":
            summary = "The code contains a single linear loop iterating through the input size n times, performing constant work per iteration."
        elif overall_time == "O(n log n)":
            summary = "The code performs linear iterations combined with logarithmic sub-operations, resulting in O(n log n) time complexity."
        elif overall_time == "O(n²)":
            summary = "The code contains nested loops (or dependent loops) executing n outer iterations multiplied by n inner iterations, resulting in quadratic O(n²) time complexity."
        elif overall_time == "O(n³)":
            summary = "The code contains 3 levels of nested loops, executing n * n * n = n³ total iterations in cubic O(n³) time complexity."
        else:
            summary = f"The estimated asymptotic complexity is {overall_time} time and {space_report.total_space} space based on static AST structure."

        sorted_findings = [line_findings_dict[k] for k in sorted(line_findings_dict.keys())]

        return StaticAnalysisResponse(
            time_complexity=overall_time,
            space_complexity=space_report.total_space,
            auxiliary_space=space_report.auxiliary_space,
            recursion_stack=max_recursion_stack,
            confidence=confidence,
            confidence_reason=confidence_reason,
            deterministic_summary=DeterministicSummary(
                total_loops=total_loops,
                max_loop_nesting_depth=max_nesting_depth,
                has_recursion=has_recursion,
                recursive_functions=recursive_funcs,
                recursion_depth_estimate=max_recursion_stack if has_recursion else "None",
                allocated_structures=space_report.allocations,
                function_calls=recursive_funcs
            ),
            line_findings=sorted_findings,
            ast_tree=ast_visual,
            summary_explanation=summary
        )

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

        # Analysis state
        line_findings_dict: Dict[int, LineFinding] = {}
        total_loops = 0
        max_nesting_depth = 0
        allocated_structures: List[Dict[str, Any]] = []
        function_calls: List[str] = []
        is_uncertain = False
        uncertainty_reason = ""

        # Step 1: Detect memory allocations
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                # Check for list multiplication e.g. [0] * n or [[0]*m for _ in range(n)]
                val = node.value
                line_no = getattr(node, "lineno", 1)
                code_snippet = lines[line_no - 1] if line_no <= len(lines) else ""

                if isinstance(val, ast.BinOp) and isinstance(val.op, ast.Mult):
                    if isinstance(val.left, ast.List) or isinstance(val.right, ast.List):
                        allocated_structures.append({"type": "Array", "line": line_no, "complexity": "O(n)"})
                        line_findings_dict[line_no] = LineFinding(
                            line_number=line_no,
                            code=code_snippet,
                            complexity="O(n)",
                            role="ALLOCATION",
                            explanation="Linear array allocation proportional to input parameter."
                        )
                elif isinstance(val, ast.ListComp):
                    allocated_structures.append({"type": "ListComp", "line": line_no, "complexity": "O(n)"})
                    line_findings_dict[line_no] = LineFinding(
                        line_number=line_no,
                        code=code_snippet,
                        complexity="O(n)",
                        role="ALLOCATION",
                        explanation="List comprehension creates an auxiliary list in linear memory O(n)."
                    )
                elif isinstance(val, ast.Dict):
                    allocated_structures.append({"type": "Dict", "line": line_no, "complexity": "O(n)"})
                    line_findings_dict[line_no] = LineFinding(
                        line_number=line_no,
                        code=code_snippet,
                        complexity="O(1)",
                        role="ALLOCATION",
                        explanation="Initializes hash map/dictionary for auxiliary lookup."
                    )

        # Step 2: Recursive block analyzer for time complexity & nested loop hierarchies
        def analyze_block(statements: List[ast.AST], current_enclosing_vars: Set[str], current_depth: int) -> Tuple[str, int]:
            nonlocal total_loops, max_nesting_depth, is_uncertain, uncertainty_reason
            
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

                    # Analyze inner body
                    inner_comp, inner_depth = analyze_block(stmt.body, new_enclosing, depth)
                    max_depth_in_block = max(max_depth_in_block, inner_depth)

                    # Multiply loop bound with inner body complexity
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

                    # Analyze inner body
                    inner_comp, inner_depth = analyze_block(stmt.body, current_enclosing_vars, depth)
                    max_depth_in_block = max(max_depth_in_block, inner_depth)

                    total_loop_comp = multiply_complexities(loop_comp, inner_comp)
                    block_complexities.append(total_loop_comp)

                elif isinstance(stmt, ast.If):
                    then_comp, d1 = analyze_block(stmt.body, current_enclosing_vars, current_depth)
                    else_comp, d2 = analyze_block(stmt.orelse, current_enclosing_vars, current_depth)
                    branch_comp = max_complexity(then_comp, else_comp)
                    block_complexities.append(branch_comp)
                    max_depth_in_block = max(max_depth_in_block, d1, d2)

                elif isinstance(stmt, ast.FunctionDef):
                    fn_comp, fn_depth = analyze_block(stmt.body, current_enclosing_vars, 0)
                    block_complexities.append(fn_comp)
                    max_depth_in_block = max(max_depth_in_block, fn_depth)

                else:
                    # Constant time statement
                    block_complexities.append("O(1)")
                    if line_no not in line_findings_dict and code_snippet.strip():
                        # Attribute constant line finding
                        line_findings_dict[line_no] = LineFinding(
                            line_number=line_no,
                            code=code_snippet,
                            complexity="O(1)",
                            role="CONSTANT_OPERATION",
                            explanation="Constant time elementary instruction."
                        )

            return (sum_complexities(block_complexities), max_depth_in_block)

        # Execute block analysis from root
        overall_time, _ = analyze_block(tree.body, set(), 0)

        # Calculate space complexity based on allocations
        aux_space = "O(1)"
        if allocated_structures:
            highest_alloc = "O(1)"
            for alloc in allocated_structures:
                highest_alloc = max_complexity(highest_alloc, alloc.get("complexity", "O(1)"))
            aux_space = highest_alloc

        # Determine confidence
        confidence = "HIGH"
        confidence_reason = "Deterministic AST analysis identified loop iteration bounds and step factors."
        if is_uncertain:
            confidence = "MEDIUM"
            confidence_reason = uncertainty_reason
        elif total_loops == 0 and overall_time == "O(1)":
            confidence = "HIGH"
            confidence_reason = "No unbounded loops or recursion detected. All operations execute in constant time O(1)."
        elif max_nesting_depth >= 2:
            confidence = "HIGH"
            confidence_reason = f"Identified {max_nesting_depth} levels of loop nesting with deterministic bounds."

        # Build AST Visualizer tree
        ast_visual = self.ast_builder.build_tree(tree)

        # Format line findings sorted by line number
        sorted_findings = [line_findings_dict[k] for k in sorted(line_findings_dict.keys())]

        # Generate summary explanation
        if overall_time == "O(1)":
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
            summary = f"The estimated asymptotic complexity is {overall_time} time and {aux_space} auxiliary space based on static AST structure."

        return StaticAnalysisResponse(
            time_complexity=overall_time,
            space_complexity=aux_space,
            auxiliary_space=aux_space,
            recursion_stack="O(1)",
            confidence=confidence,
            confidence_reason=confidence_reason,
            deterministic_summary=DeterministicSummary(
                total_loops=total_loops,
                max_loop_nesting_depth=max_nesting_depth,
                has_recursion=False,
                allocated_structures=allocated_structures,
                function_calls=function_calls
            ),
            line_findings=sorted_findings,
            ast_tree=ast_visual,
            summary_explanation=summary
        )

import re
from typing import List, Dict, Any, Tuple, Optional, Set
from app.engine.base import BaseAnalyzer
from app.engine.common.complexity_math import (
    max_complexity,
    sum_complexities,
    multiply_complexities,
    normalize_complexity
)
from app.schemas.analysis import (
    StaticAnalysisResponse,
    LineFinding,
    DeterministicSummary,
    ASTNodeVisual
)


class CppASTAnalyzer(BaseAnalyzer):
    def analyze(self, source_code: str) -> StaticAnalysisResponse:
        lines = source_code.splitlines()
        line_findings_dict: Dict[int, LineFinding] = {}
        
        total_loops = 0
        max_nesting_depth = 0
        has_recursion = False
        recursive_funcs: List[str] = []
        allocated_structures: List[Dict[str, Any]] = []
        
        # Robust regex patterns for C++ constructs
        for_loop_pattern = re.compile(r'for\s*\(\s*(?:[\w:<>]+\s+)?(\w+)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)')
        while_loop_pattern = re.compile(r'while\s*\(\s*([^)]+)\)')
        func_def_pattern = re.compile(r'^\s*(?:(?:inline|static|virtual|constexpr)\s+)*(?:(?:const\s+)?[\w:<>]+(?:\s*[*&])?\s+)+(\w+)\s*\(([^)]*)\)\s*(?:const)?\s*\{?')
        vector_alloc_2d = re.compile(r'(?:std::)?vector\s*<\s*(?:std::)?vector\s*<\s*[\w:<>]+\s*>\s*>\s+(\w+)')
        vector_alloc_1d = re.compile(r'(?:std::)?vector\s*<\s*[\w:<>]+\s*>\s+(\w+)\s*\(\s*(\w+)\s*\)')

        # Detect function definitions (excluding return statements and keywords)
        func_names = set()
        for idx, line in enumerate(lines, start=1):
            s_line = line.strip()
            if s_line.startswith("return") or s_line.startswith("if") or s_line.startswith("for") or s_line.startswith("while"):
                continue
            f_match = func_def_pattern.search(line)
            if f_match:
                fname = f_match.group(1)
                if fname not in ["main", "if", "for", "while", "switch", "return", "sizeof"]:
                    func_names.add((fname, idx))

        # Check recursion in each function
        rec_time = "O(1)"
        rec_stack = "O(1)"
        rec_equation = ""
        
        for fname, fline in func_names:
            total_branch_calls = 0
            has_division = False
            for l_idx, line in enumerate(lines, start=1):
                if l_idx != fline:
                    matches = re.findall(rf'\b{fname}\s*\(', line)
                    if matches:
                        total_branch_calls += len(matches)
                        if "/ 2" in line or "/= 2" in line or "mid" in line or ">> 1" in line:
                            has_division = True
                        line_findings_dict[l_idx] = LineFinding(
                            line_number=l_idx,
                            code=line.strip(),
                            complexity="O(2^n)" if len(matches) >= 2 else ("O(log n)" if has_division else "O(n)"),
                            role="RECURSION_CALL",
                            explanation=f"Recursive self-invocation of '{fname}' ({len(matches)} call{'s' if len(matches) > 1 else ''})."
                        )

            if total_branch_calls > 0:
                has_recursion = True
                recursive_funcs.append(fname)
                if has_division:
                    if total_branch_calls == 1:
                        rec_time = max_complexity(rec_time, "O(log n)")
                        rec_stack = max_complexity(rec_stack, "O(log n)")
                        rec_equation = f"T(n) = T(n / 2) + O(1)"
                    else:
                        rec_time = max_complexity(rec_time, "O(n log n)")
                        rec_stack = max_complexity(rec_stack, "O(log n)")
                        rec_equation = f"T(n) = 2T(n / 2) + O(n)"
                else:
                    if total_branch_calls == 1:
                        rec_time = max_complexity(rec_time, "O(n)")
                        rec_stack = max_complexity(rec_stack, "O(n)")
                        rec_equation = f"T(n) = T(n - 1) + O(1)"
                    elif total_branch_calls >= 2:
                        target_comp = f"O({total_branch_calls}^n)" if total_branch_calls == 2 or total_branch_calls == 3 else "O(2^n)"
                        rec_time = max_complexity(rec_time, target_comp)
                        rec_stack = max_complexity(rec_stack, "O(n)")
                        rec_equation = f"T(n) = {total_branch_calls}T(n - 1) + O(1)"

        # Detect Memory Allocations in C++
        highest_aux = "O(1)"
        for idx, line in enumerate(lines, start=1):
            if vector_alloc_2d.search(line):
                highest_aux = max_complexity(highest_aux, "O(n²)")
                allocated_structures.append({"type": "2D_Vector", "line": idx, "complexity": "O(n²)"})
                line_findings_dict[idx] = LineFinding(
                    line_number=idx,
                    code=line.strip(),
                    complexity="O(n²)",
                    role="MATRIX_ALLOCATION",
                    explanation="Allocates a 2D std::vector grid requiring quadratic auxiliary space O(n²)."
                )
            elif vector_alloc_1d.search(line) or "new int[" in line:
                highest_aux = max_complexity(highest_aux, "O(n)")
                allocated_structures.append({"type": "1D_Vector", "line": idx, "complexity": "O(n)"})
                line_findings_dict[idx] = LineFinding(
                    line_number=idx,
                    code=line.strip(),
                    complexity="O(n)",
                    role="ALLOCATION",
                    explanation="Dynamically allocates contiguous vector memory requiring linear auxiliary space O(n)."
                )

        # Loop and Nesting Analyzer
        loop_stack: List[Dict[str, Any]] = []
        current_depth = 0

        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            
            # Check for-loop
            for_match = for_loop_pattern.search(stripped)
            if for_match:
                total_loops += 1
                current_depth += 1
                max_nesting_depth = max(max_nesting_depth, current_depth)
                
                var_name = for_match.group(1)
                init_val = for_match.group(2)
                cond = for_match.group(3)
                step = for_match.group(4)
                
                # Check for logarithmic step e.g. i *= 2 or i <<= 1
                is_log = ("*=" in step) or ("/=" in step) or ("<<" in step) or (">> " in step) or ("* 2" in step)
                
                # Check for dependent loop e.g. j < i
                enclosing_vars = {l["var"] for l in loop_stack if "var" in l}
                is_dependent = any(f"<{ev}" in cond.replace(" ", "") or f"<={ev}" in cond.replace(" ", "") for ev in enclosing_vars)
                
                if is_log:
                    l_comp = "O(log n)"
                    l_role = "LOGARITHMIC_LOOP"
                    l_exp = "Loop index is multiplied or divided exponentially per iteration, running in O(log n)."
                elif is_dependent:
                    l_comp = "O(n)"
                    l_role = "DEPENDENT_INNER_LOOP"
                    l_exp = "Inner loop bound depends on outer loop counter, forming an arithmetic series sum_{i=1}^n i = O(n²)."
                else:
                    l_comp = "O(n)"
                    l_role = "OUTER_LOOP" if current_depth == 1 else "INNER_LOOP"
                    l_exp = f"Iterates linearly {cond}."

                loop_stack.append({"var": var_name, "complexity": l_comp, "depth": current_depth})
                line_findings_dict[idx] = LineFinding(
                    line_number=idx,
                    code=stripped,
                    complexity=l_comp,
                    role=l_role,
                    explanation=l_exp
                )
                continue

            # Check while-loop
            while_match = while_loop_pattern.search(stripped)
            if while_match and not stripped.startswith("do"):
                total_loops += 1
                current_depth += 1
                max_nesting_depth = max(max_nesting_depth, current_depth)
                
                is_log = any("/= 2" in lines[i] or "/ 2" in lines[i] or ">>= 1" in lines[i] for i in range(idx - 1, min(len(lines), idx + 8)))
                l_comp = "O(log n)" if is_log else "O(n)"
                l_role = "LOGARITHMIC_LOOP" if is_log else "WHILE_LOOP"
                l_exp = "While loop with logarithmic reduction step O(log n)." if is_log else "While loop executing until conditional termination."
                
                loop_stack.append({"complexity": l_comp, "depth": current_depth})
                line_findings_dict[idx] = LineFinding(
                    line_number=idx,
                    code=stripped,
                    complexity=l_comp,
                    role=l_role,
                    explanation=l_exp
                )
                continue

            # Check closing braces
            if "}" in stripped:
                if loop_stack:
                    popped = loop_stack.pop()
                    current_depth = max(0, current_depth - 1)

            # Attribute constant lines
            if idx not in line_findings_dict and stripped and not stripped.startswith("//") and not stripped.startswith("#"):
                line_findings_dict[idx] = LineFinding(
                    line_number=idx,
                    code=stripped,
                    complexity="O(1)",
                    role="CONSTANT_OPERATION",
                    explanation="Constant time elementary operation."
                )

        # Calculate overall time complexity
        if max_nesting_depth == 0:
            loop_time = "O(1)"
        elif max_nesting_depth == 1:
            loop_time = "O(n)"
            for f in line_findings_dict.values():
                if f.role == "LOGARITHMIC_LOOP":
                    loop_time = "O(log n)"
        elif max_nesting_depth == 2:
            loop_time = "O(n²)"
            has_log = any(f.role == "LOGARITHMIC_LOOP" for f in line_findings_dict.values())
            if has_log:
                loop_time = "O(n log n)"
        elif max_nesting_depth == 3:
            loop_time = "O(n³)"
        else:
            loop_time = f"O(n^{max_nesting_depth})"

        # Combine with recursion
        overall_time = max_complexity(loop_time, rec_time) if has_recursion else loop_time
        total_space = max_complexity(highest_aux, rec_stack)

        # Build AST Visual tree
        ast_visual = ASTNodeVisual(
            id="cpp-root",
            name="C++ Translation Unit",
            type="Module",
            complexity=overall_time,
            children=[]
        )
        
        for idx, line in enumerate(lines, start=1):
            s = line.strip()
            if s.startswith("for") or s.startswith("while"):
                ast_visual.children.append(ASTNodeVisual(
                    id=f"cpp-node-{idx}",
                    name=s,
                    type="ForLoop" if s.startswith("for") else "WhileLoop",
                    complexity=line_findings_dict.get(idx, LineFinding(line_number=idx, code=s, complexity="O(n)", role="LOOP", explanation="")).complexity,
                    line_start=idx,
                    line_end=idx
                ))
            elif s.startswith("if"):
                ast_visual.children.append(ASTNodeVisual(
                    id=f"cpp-node-{idx}",
                    name=s,
                    type="IfStatement",
                    line_start=idx,
                    line_end=idx
                ))

        confidence = "HIGH"
        if has_recursion:
            confidence_reason = f"Solved C++ recurrence relation ({rec_equation}) yielding {overall_time} time and {rec_stack} call stack."
        elif total_loops == 0:
            confidence_reason = "No unbounded C++ loops detected. All statements execute in constant time O(1)."
        elif max_nesting_depth >= 2:
            confidence_reason = f"Identified {max_nesting_depth} levels of deterministic C++ loop nesting."
        else:
            confidence_reason = f"Identified linear iteration bounds running in {overall_time}."

        sorted_findings = [line_findings_dict[k] for k in sorted(line_findings_dict.keys())]

        return StaticAnalysisResponse(
            time_complexity=overall_time,
            space_complexity=total_space,
            auxiliary_space=highest_aux,
            recursion_stack=rec_stack,
            confidence=confidence,
            confidence_reason=confidence_reason,
            deterministic_summary=DeterministicSummary(
                total_loops=total_loops,
                max_loop_nesting_depth=max_nesting_depth,
                has_recursion=has_recursion,
                recursive_functions=recursive_funcs,
                recursion_depth_estimate=rec_stack if has_recursion else "None",
                allocated_structures=allocated_structures,
                function_calls=recursive_funcs
            ),
            line_findings=sorted_findings,
            ast_tree=ast_visual,
            summary_explanation=f"C++ source code analyzed deterministically: {overall_time} time complexity and {total_space} space complexity."
        )

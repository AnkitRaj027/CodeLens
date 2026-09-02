import ast
from typing import List, Dict, Any, Tuple, Optional
from app.engine.common.complexity_math import max_complexity
from app.schemas.analysis import LineFinding


class SpaceReport:
    def __init__(self):
        self.auxiliary_space = "O(1)"
        self.recursion_stack = "O(1)"
        self.total_space = "O(1)"
        self.allocations: List[Dict[str, Any]] = []
        self.line_findings: List[LineFinding] = []


class SpaceAnalyzer:
    def analyze_space(self, tree: ast.AST, source_lines: List[str], recursion_stack: str = "O(1)") -> SpaceReport:
        report = SpaceReport()
        report.recursion_stack = recursion_stack
        
        highest_aux = "O(1)"

        for node in ast.walk(tree):
            line_no = getattr(node, "lineno", 1)
            code_snippet = source_lines[line_no - 1] if line_no <= len(source_lines) else ""

            # Check 2D Matrix allocation e.g. [[0]*m for _ in range(n)]
            if isinstance(node, ast.ListComp):
                # Check if element is itself a list multiplication e.g. [0]*n
                if isinstance(node.elt, ast.BinOp) and isinstance(node.elt.op, ast.Mult):
                    highest_aux = max_complexity(highest_aux, "O(n²)")
                    report.allocations.append({"type": "2D_Matrix", "line": line_no, "complexity": "O(n²)"})
                    report.line_findings.append(LineFinding(
                        line_number=line_no,
                        code=code_snippet,
                        complexity="O(n²)",
                        role="MATRIX_ALLOCATION",
                        explanation="Allocates a 2D matrix / grid in memory requiring quadratic auxiliary space O(n²)."
                    ))
                else:
                    highest_aux = max_complexity(highest_aux, "O(n)")
                    report.allocations.append({"type": "1D_ListComp", "line": line_no, "complexity": "O(n)"})
                    report.line_findings.append(LineFinding(
                        line_number=line_no,
                        code=code_snippet,
                        complexity="O(n)",
                        role="ALLOCATION",
                        explanation="List comprehension dynamically creates an array of size n in auxiliary memory."
                    ))

            elif isinstance(node, ast.Assign):
                val = node.value
                # Check for list multiplication e.g. [0] * n
                if isinstance(val, ast.BinOp) and isinstance(val.op, ast.Mult):
                    if isinstance(val.left, ast.List) or isinstance(val.right, ast.List):
                        highest_aux = max_complexity(highest_aux, "O(n)")
                        report.allocations.append({"type": "Array", "line": line_no, "complexity": "O(n)"})
                        report.line_findings.append(LineFinding(
                            line_number=line_no,
                            code=code_snippet,
                            complexity="O(n)",
                            role="ALLOCATION",
                            explanation="Allocates contiguous memory array of size n requiring linear auxiliary space O(n)."
                        ))

                # Check for set() or dict() initialization
                elif isinstance(val, (ast.Dict, ast.Set)):
                    report.allocations.append({"type": "HashTable", "line": line_no, "complexity": "O(1)"})
                    report.line_findings.append(LineFinding(
                        line_number=line_no,
                        code=code_snippet,
                        complexity="O(1)",
                        role="ALLOCATION",
                        explanation="Initializes hash table / set container for constant time lookups."
                    ))

            # Check for list.append inside loop
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute):
                if node.func.attr == "append":
                    report.allocations.append({"type": "DynamicGrowth", "line": line_no, "complexity": "O(n)"})

        report.auxiliary_space = highest_aux
        report.total_space = max_complexity(report.auxiliary_space, report.recursion_stack)
        return report

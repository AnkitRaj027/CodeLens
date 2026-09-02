import ast
from typing import Dict, List, Tuple, Optional, Any, Set
from app.schemas.analysis import LineFinding


class RecursionInfo:
    def __init__(self, func_name: str, lineno: int):
        self.func_name = func_name
        self.lineno = lineno
        self.base_cases: List[int] = []
        self.recursive_calls: List[Tuple[int, str]] = []  # (line_no, arg_pattern)
        self.branch_count = 0
        self.reduction_type = "UNKNOWN"  # "SUBTRACTION" (n-1), "DIVISION" (n/2), "UNKNOWN"
        self.time_complexity = "O(1)"
        self.stack_space = "O(1)"
        self.recurrence_equation = ""
        self.reasoning = ""


class RecursionAnalyzer:
    def analyze_function(self, func_node: ast.FunctionDef, source_lines: List[str]) -> Optional[RecursionInfo]:
        func_name = func_node.name
        info = RecursionInfo(func_name, getattr(func_node, "lineno", 1))
        
        # Track variables assigned via division (e.g. mid = (low + high) // 2)
        division_assigned_vars: Set[str] = set()
        for stmt in ast.walk(func_node):
            if isinstance(stmt, ast.Assign):
                if isinstance(stmt.value, ast.BinOp) and isinstance(stmt.value.op, (ast.FloorDiv, ast.Div, ast.RShift)):
                    for target in stmt.targets:
                        if isinstance(target, ast.Name):
                            division_assigned_vars.add(target.id)

        # Step 1: Detect base cases (early returns in If statements)
        for node in func_node.body:
            if isinstance(node, ast.If):
                for sub in ast.walk(node):
                    if isinstance(sub, ast.Return):
                        ret_line = getattr(node, "lineno", 1)
                        info.base_cases.append(ret_line)
                        break

        # Step 2: Detect recursive call sites
        for node in ast.walk(func_node):
            if isinstance(node, ast.Call):
                is_recursive = False
                if isinstance(node.func, ast.Name) and node.func.id == func_name:
                    is_recursive = True
                elif isinstance(node.func, ast.Attribute) and node.func.attr == func_name:
                    is_recursive = True
                
                if is_recursive:
                    call_line = getattr(node, "lineno", 1)
                    arg_pattern = "UNKNOWN"
                    for arg in node.args:
                        # Check direct division: n // 2
                        if isinstance(arg, ast.BinOp):
                            if isinstance(arg.op, (ast.FloorDiv, ast.Div, ast.RShift)):
                                arg_pattern = "DIVISION"
                            elif isinstance(arg.op, (ast.Sub, ast.Add)):
                                # Check if subtracting/adding from a division-computed variable like mid - 1
                                if isinstance(arg.left, ast.Name) and arg.left.id in division_assigned_vars:
                                    arg_pattern = "DIVISION"
                                elif isinstance(arg.right, ast.Name) and arg.right.id in division_assigned_vars:
                                    arg_pattern = "DIVISION"
                                elif arg_pattern == "UNKNOWN":
                                    arg_pattern = "SUBTRACTION"
                        elif isinstance(arg, ast.Name) and arg.id in division_assigned_vars:
                            arg_pattern = "DIVISION"

                    info.recursive_calls.append((call_line, arg_pattern))

        info.branch_count = len(info.recursive_calls)
        if info.branch_count == 0:
            return None  # Not a recursive function

        # Step 3: Determine reduction pattern
        has_division = any(pat == "DIVISION" or len(division_assigned_vars) > 0 for _, pat in info.recursive_calls)
        
        if has_division:
            info.reduction_type = "DIVISION"
        else:
            info.reduction_type = "SUBTRACTION"

        # Step 4: Solve Recurrence Relation
        if info.reduction_type == "SUBTRACTION":
            if info.branch_count == 1:
                # T(n) = T(n-1) + O(1) -> O(n) Time, O(n) Stack
                info.recurrence_equation = "T(n) = T(n - 1) + O(1)"
                info.time_complexity = "O(n)"
                info.stack_space = "O(n)"
                info.reasoning = f"Single recursive branch with parameter reduction (n-1). Executes n frames with O(n) call stack."
            elif info.branch_count == 2:
                # T(n) = 2T(n-1) + O(1) -> O(2^n) Time, O(n) Stack (e.g. naive Fibonacci)
                info.recurrence_equation = "T(n) = 2T(n - 1) + O(1)"
                info.time_complexity = "O(2^n)"
                info.stack_space = "O(n)"
                info.reasoning = "Binary recursive tree with 2 branches per call. Tree depth is n with 2^n total leaves."
            elif info.branch_count >= 3:
                info.recurrence_equation = f"T(n) = {info.branch_count}T(n - 1) + O(1)"
                info.time_complexity = f"O({info.branch_count}^n)"
                info.stack_space = "O(n)"
                info.reasoning = f"Multi-branch recursion with {info.branch_count} recursive calls per step generating exponential tree."

        elif info.reduction_type == "DIVISION":
            if info.branch_count == 1:
                # T(n) = T(n/2) + O(1) -> Binary Search
                info.recurrence_equation = "T(n) = T(n / 2) + O(1)"
                info.time_complexity = "O(log n)"
                info.stack_space = "O(log n)"
                info.reasoning = "Single recursive call on halved problem size (Divide & Conquer). Runs in O(log n) time with O(log n) call stack."
            elif info.branch_count == 2:
                has_linear_work = any(isinstance(n, (ast.For, ast.While)) for n in func_node.body)
                if has_linear_work:
                    info.recurrence_equation = "T(n) = 2T(n / 2) + O(n)"
                    info.time_complexity = "O(n log n)"
                    info.stack_space = "O(log n)"
                    info.reasoning = "Master Theorem Case 2: 2 subproblems of size n/2 combined with O(n) linear work yields O(n log n)."
                else:
                    info.recurrence_equation = "T(n) = 2T(n / 2) + O(1)"
                    info.time_complexity = "O(n)"
                    info.stack_space = "O(log n)"
                    info.reasoning = "Master Theorem Case 1: 2 subproblems of size n/2 with O(1) combination work yields O(n)."

        return info

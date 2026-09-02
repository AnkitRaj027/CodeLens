import ast
from typing import List, Dict, Any, Tuple, Optional, Set
from app.engine.common.complexity_math import multiply_complexities, max_complexity
from app.schemas.analysis import LineFinding


class LoopAnalyzer:
    def __init__(self):
        self.enclosing_loop_vars: List[str] = []

    def analyze_for_loop(self, node: ast.For, enclosing_vars: Set[str]) -> Tuple[str, str, str, str]:
        """
        Analyzes an ast.For loop node.
        Returns: (complexity, role, explanation, loop_var_name)
        """
        target_name = None
        if isinstance(node.target, ast.Name):
            target_name = node.target.id
        elif isinstance(node.target, ast.Tuple) and len(node.target.elts) > 0:
            if isinstance(node.target.elts[0], ast.Name):
                target_name = node.target.elts[0].id

        iter_node = node.iter
        
        # Check if iterating over range()
        if isinstance(iter_node, ast.Call) and isinstance(iter_node.func, ast.Name) and iter_node.func.id == "range":
            args = iter_node.args
            
            # Case: range(n) or range(0, n)
            bound_arg = args[0] if len(args) == 1 else (args[1] if len(args) >= 2 else None)
            
            if bound_arg:
                # Check for dependent loop: bound depends on an outer loop variable
                if isinstance(bound_arg, ast.Name) and bound_arg.id in enclosing_vars:
                    return (
                        "O(n)",
                        "DEPENDENT_INNER_LOOP",
                        f"Inner loop bound depends on outer loop variable '{bound_arg.id}', forming an arithmetic progression (1 + 2 + ... + n = n(n+1)/2).",
                        target_name or "var"
                    )
                elif isinstance(bound_arg, ast.Name):
                    return (
                        "O(n)",
                        "OUTER_LOOP" if not enclosing_vars else "INNER_LOOP",
                        f"Iterates linearly {bound_arg.id} times over input parameter.",
                        target_name or "var"
                    )
                elif isinstance(bound_arg, ast.Constant) and isinstance(bound_arg.value, (int, float)):
                    return (
                        "O(1)",
                        "CONSTANT_LOOP",
                        f"Iterates a constant {bound_arg.value} times.",
                        target_name or "var"
                    )
                elif isinstance(bound_arg, ast.Call) and isinstance(bound_arg.func, ast.Name) and bound_arg.func.id == "len":
                    return (
                        "O(n)",
                        "OUTER_LOOP" if not enclosing_vars else "INNER_LOOP",
                        "Iterates linearly over collection length.",
                        target_name or "var"
                    )

            # Check for step multiplier in range(start, stop, step)
            if len(args) == 3:
                step_arg = args[2]
                if isinstance(step_arg, ast.Constant) and isinstance(step_arg.value, int):
                    return (
                        "O(n)",
                        "LINEAR_STEP_LOOP",
                        f"Iterates linearly with constant step size {step_arg.value}.",
                        target_name or "var"
                    )

        # Iterating over collection: for x in arr / for i, x in enumerate(arr)
        elif isinstance(iter_node, ast.Name):
            return (
                "O(n)",
                "OUTER_LOOP" if not enclosing_vars else "INNER_LOOP",
                f"Iterates over each element of '{iter_node.id}'.",
                target_name or "var"
            )
        elif isinstance(iter_node, ast.Call) and isinstance(iter_node.func, ast.Name) and iter_node.func.id == "enumerate":
            return (
                "O(n)",
                "OUTER_LOOP" if not enclosing_vars else "INNER_LOOP",
                "Iterates linearly over enumerated collection.",
                target_name or "var"
            )

        # Default fallback
        return (
            "O(n)",
            "LOOP",
            "Linear iteration over collection or range.",
            target_name or "var"
        )

    def analyze_while_loop(self, node: ast.While) -> Tuple[str, str, str]:
        """
        Analyzes an ast.While loop node by inspecting condition and body mutations.
        Returns: (complexity, role, explanation)
        """
        # Look for division or multiplication in the body of while loop
        has_division = False
        has_multiplication = False
        has_bitshift = False
        has_linear_step = False

        for stmt in ast.walk(node):
            # Check for n = n // 2 or n = n / 2
            if isinstance(stmt, ast.Assign):
                if isinstance(stmt.value, ast.BinOp):
                    if isinstance(stmt.value.op, (ast.FloorDiv, ast.Div)):
                        has_division = True
                    elif isinstance(stmt.value.op, ast.Mult):
                        has_multiplication = True
                    elif isinstance(stmt.value.op, (ast.RShift, ast.LShift)):
                        has_bitshift = True
                    elif isinstance(stmt.value.op, (ast.Add, ast.Sub)):
                        has_linear_step = True
            elif isinstance(stmt, ast.AugAssign):
                if isinstance(stmt.op, (ast.FloorDiv, ast.Div)):
                    has_division = True
                elif isinstance(stmt.op, ast.Mult):
                    has_multiplication = True
                elif isinstance(stmt.op, (ast.RShift, ast.LShift)):
                    has_bitshift = True
                elif isinstance(stmt.op, (ast.Add, ast.Sub)):
                    has_linear_step = True

        if has_division or has_bitshift:
            return (
                "O(log n)",
                "LOGARITHMIC_LOOP",
                "Loop variable is repeatedly halved (divided / bit-shifted) per iteration, running in logarithmic time O(log n)."
            )
        elif has_multiplication:
            return (
                "O(log n)",
                "LOGARITHMIC_LOOP",
                "Loop index grows exponentially (multiplied by factor) towards bound, running in logarithmic time O(log n)."
            )
        elif has_linear_step:
            return (
                "O(n)",
                "LINEAR_WHILE_LOOP",
                "Loop variable increments or decrements linearly by constant step towards condition."
            )

        return (
            "O(n)",
            "WHILE_LOOP",
            "While loop executing until conditional termination."
        )

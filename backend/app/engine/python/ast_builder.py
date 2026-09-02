import ast
from typing import Optional
from app.schemas.analysis import ASTNodeVisual


class ASTVisualizerBuilder:
    def __init__(self):
        self._node_counter = 0

    def _get_next_id(self) -> str:
        self._node_counter += 1
        return f"node-{self._node_counter}"

    def build_tree(self, tree: ast.AST) -> ASTNodeVisual:
        self._node_counter = 0
        root = ASTNodeVisual(
            id="root",
            name="Program Module",
            type="Module",
            complexity="O(1)",
            line_start=getattr(tree, "lineno", 1),
            line_end=getattr(tree, "end_lineno", 1),
            children=[]
        )
        
        for node in getattr(tree, "body", []):
            child_node = self._visit_node(node)
            if child_node:
                root.children.append(child_node)
        
        return root

    def _visit_node(self, node: ast.AST) -> Optional[ASTNodeVisual]:
        node_id = self._get_next_id()
        line_start = getattr(node, "lineno", None)
        line_end = getattr(node, "end_lineno", line_start)

        if isinstance(node, ast.FunctionDef):
            visual = ASTNodeVisual(
                id=node_id,
                name=f"def {node.name}({', '.join(arg.arg for arg in node.args.args)})",
                type="FunctionDef",
                line_start=line_start,
                line_end=line_end,
                children=[]
            )
            for child in node.body:
                c = self._visit_node(child)
                if c:
                    visual.children.append(c)
            return visual

        elif isinstance(node, ast.For):
            # Extract target and iterator description
            target_str = ast.unparse(node.target) if hasattr(ast, "unparse") else "i"
            iter_str = ast.unparse(node.iter) if hasattr(ast, "unparse") else "range"
            visual = ASTNodeVisual(
                id=node_id,
                name=f"for {target_str} in {iter_str}",
                type="ForLoop",
                line_start=line_start,
                line_end=line_end,
                children=[]
            )
            for child in node.body:
                c = self._visit_node(child)
                if c:
                    visual.children.append(c)
            return visual

        elif isinstance(node, ast.While):
            test_str = ast.unparse(node.test) if hasattr(ast, "unparse") else "condition"
            visual = ASTNodeVisual(
                id=node_id,
                name=f"while {test_str}",
                type="WhileLoop",
                line_start=line_start,
                line_end=line_end,
                children=[]
            )
            for child in node.body:
                c = self._visit_node(child)
                if c:
                    visual.children.append(c)
            return visual

        elif isinstance(node, ast.If):
            test_str = ast.unparse(node.test) if hasattr(ast, "unparse") else "condition"
            visual = ASTNodeVisual(
                id=node_id,
                name=f"if {test_str}",
                type="IfStatement",
                line_start=line_start,
                line_end=line_end,
                children=[]
            )
            for child in node.body:
                c = self._visit_node(child)
                if c:
                    visual.children.append(c)
            if node.orelse:
                else_node = ASTNodeVisual(
                    id=self._get_next_id(),
                    name="else",
                    type="ElseBlock",
                    children=[]
                )
                for child in node.orelse:
                    c = self._visit_node(child)
                    if c:
                        else_node.children.append(c)
                visual.children.append(else_node)
            return visual

        elif isinstance(node, ast.Return):
            val_str = ast.unparse(node.value) if (node.value and hasattr(ast, "unparse")) else ""
            return ASTNodeVisual(
                id=node_id,
                name=f"return {val_str}".strip(),
                type="Return",
                complexity="O(1)",
                line_start=line_start,
                line_end=line_end
            )

        elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):
            call_str = ast.unparse(node.value) if hasattr(ast, "unparse") else "call()"
            return ASTNodeVisual(
                id=node_id,
                name=call_str,
                type="Call",
                complexity="O(1)",
                line_start=line_start,
                line_end=line_end
            )

        elif isinstance(node, ast.Assign):
            targets_str = ", ".join(ast.unparse(t) for t in node.targets) if hasattr(ast, "unparse") else "x"
            val_str = ast.unparse(node.value) if hasattr(ast, "unparse") else "val"
            return ASTNodeVisual(
                id=node_id,
                name=f"{targets_str} = {val_str}",
                type="Assign",
                complexity="O(1)",
                line_start=line_start,
                line_end=line_end
            )

        elif isinstance(node, ast.AugAssign):
            target_str = ast.unparse(node.target) if hasattr(ast, "unparse") else "x"
            val_str = ast.unparse(node.value) if hasattr(ast, "unparse") else "1"
            op_str = "+=" if isinstance(node.op, ast.Add) else "-=" if isinstance(node.op, ast.Sub) else "*=" if isinstance(node.op, ast.Mult) else "//=" if isinstance(node.op, ast.FloorDiv) else "="
            return ASTNodeVisual(
                id=node_id,
                name=f"{target_str} {op_str} {val_str}",
                type="AugAssign",
                complexity="O(1)",
                line_start=line_start,
                line_end=line_end
            )

        return None

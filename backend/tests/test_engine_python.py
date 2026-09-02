import pytest
from app.engine.python.parser import PythonASTAnalyzer

analyzer = PythonASTAnalyzer()


def test_constant_time():
    code = """
a = 10
b = 20
c = a + b
print(c)
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(1)"
    assert result.space_complexity == "O(1)"
    assert result.confidence == "HIGH"
    assert result.deterministic_summary.total_loops == 0


def test_single_linear_loop():
    code = """
for i in range(n):
    print(i)
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n)"
    assert result.space_complexity == "O(1)"
    assert result.confidence == "HIGH"
    assert result.deterministic_summary.total_loops == 1
    assert result.deterministic_summary.max_loop_nesting_depth == 1


def test_nested_loops_quadratic():
    code = """
for i in range(n):
    for j in range(n):
        print(i, j)
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n²)"
    assert result.space_complexity == "O(1)"
    assert result.deterministic_summary.total_loops == 2
    assert result.deterministic_summary.max_loop_nesting_depth == 2


def test_dependent_loops_quadratic():
    code = """
for i in range(n):
    for j in range(i):
        print(i, j)
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n²)"
    assert result.space_complexity == "O(1)"
    assert result.confidence == "HIGH"
    dependent_finding = [f for f in result.line_findings if f.role == "DEPENDENT_INNER_LOOP"]
    assert len(dependent_finding) > 0


def test_triple_nested_loops_cubic():
    code = """
for i in range(n):
    for j in range(n):
        for k in range(n):
            x = i + j + k
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n³)"
    assert result.deterministic_summary.max_loop_nesting_depth == 3


def test_logarithmic_while_loop_division():
    code = """
while n > 1:
    n = n // 2
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(log n)"
    assert result.confidence == "HIGH"


def test_logarithmic_while_loop_multiplication():
    code = """
i = 1
while i < n:
    i = i * 2
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(log n)"
    assert result.confidence == "HIGH"


def test_nested_linear_and_logarithmic():
    code = """
for i in range(n):
    k = n
    while k > 1:
        k = k // 2
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n log n)"
    assert result.confidence == "HIGH"


def test_linear_space_allocation():
    code = """
def create_lookup(n):
    arr = [0] * n
    return arr
"""
    result = analyzer.analyze(code)
    assert result.auxiliary_space == "O(n)"
    assert result.space_complexity == "O(n)"
    alloc_finding = [f for f in result.line_findings if f.role == "ALLOCATION"]
    assert len(alloc_finding) > 0


def test_2d_matrix_space_allocation():
    code = """
def create_grid(n, m):
    matrix = [[0] * m for _ in range(n)]
    return matrix
"""
    result = analyzer.analyze(code)
    assert result.auxiliary_space == "O(n²)"
    assert result.space_complexity == "O(n²)"
    matrix_finding = [f for f in result.line_findings if f.role == "MATRIX_ALLOCATION"]
    assert len(matrix_finding) > 0


def test_linear_recursion_factorial():
    code = """
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n)"
    assert result.recursion_stack == "O(n)"
    assert result.space_complexity == "O(n)"
    assert result.deterministic_summary.has_recursion is True
    assert "factorial" in result.deterministic_summary.recursive_functions


def test_binary_branching_recursion_fibonacci():
    code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(2^n)"
    assert result.recursion_stack == "O(n)"
    assert result.space_complexity == "O(n)"
    assert result.deterministic_summary.has_recursion is True


def test_binary_search_recursion():
    code = """
def binary_search(arr, low, high, target):
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    return binary_search(arr, low, mid - 1, target)
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(log n)"
    assert result.recursion_stack == "O(log n)"
    assert result.deterministic_summary.has_recursion is True

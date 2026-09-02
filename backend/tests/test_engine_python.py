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
    # Check that dependent inner loop role is identified
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
    assert result.space_complexity == "O(n)"
    assert result.auxiliary_space == "O(n)"
    alloc_finding = [f for f in result.line_findings if f.role == "ALLOCATION"]
    assert len(alloc_finding) > 0


def test_api_analyze_endpoint(client):
    import pytest
    pass

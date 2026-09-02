import pytest
from app.engine.cpp.parser import CppASTAnalyzer

analyzer = CppASTAnalyzer()


def test_cpp_constant_time():
    code = """
#include <iostream>
int main() {
    int a = 5;
    int b = 10;
    std::cout << a + b << std::endl;
    return 0;
}
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(1)"
    assert result.space_complexity == "O(1)"
    assert result.confidence == "HIGH"


def test_cpp_single_for_loop():
    code = """
void printElements(int n) {
    for (int i = 0; i < n; i++) {
        std::cout << i << std::endl;
    }
}
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n)"
    assert result.deterministic_summary.total_loops == 1
    assert result.deterministic_summary.max_loop_nesting_depth == 1


def test_cpp_nested_loops_quadratic():
    code = """
void printGrid(int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            std::cout << i << " " << j << std::endl;
        }
    }
}
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n²)"
    assert result.deterministic_summary.total_loops == 2
    assert result.deterministic_summary.max_loop_nesting_depth == 2


def test_cpp_dependent_loops_quadratic():
    code = """
void printTriangle(int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++) {
            std::cout << j;
        }
    }
}
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(n²)"
    dependent_findings = [f for f in result.line_findings if f.role == "DEPENDENT_INNER_LOOP"]
    assert len(dependent_findings) > 0


def test_cpp_logarithmic_step():
    code = """
void binaryStep(int n) {
    for (int i = 1; i < n; i *= 2) {
        std::cout << i << std::endl;
    }
}
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(log n)"


def test_cpp_recursion_fibonacci():
    code = """
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
"""
    result = analyzer.analyze(code)
    assert result.time_complexity == "O(2^n)"
    assert result.recursion_stack == "O(n)"
    assert result.deterministic_summary.has_recursion is True


def test_cpp_vector_allocations():
    code = """
#include <vector>
void createMatrix(int n, int m) {
    std::vector<std::vector<int>> matrix(n, std::vector<int>(m));
}
"""
    result = analyzer.analyze(code)
    assert result.auxiliary_space == "O(n²)"
    assert result.space_complexity == "O(n²)"

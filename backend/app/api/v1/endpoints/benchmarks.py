import math
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class AlgorithmProfile(BaseModel):
    id: str
    name: str
    category: str  # Searching, Sorting, DP, Graph
    best_time: str
    average_time: str
    worst_time: str
    space_complexity: str
    stability: Optional[str] = None
    in_place: Optional[bool] = None
    description: str
    pros: List[str]
    cons: List[str]
    sample_code: str
    language: str


class SimulateRequest(BaseModel):
    complexities: List[str]  # e.g. ["O(n)", "O(n²)", "O(log n)"]
    input_sizes: Optional[List[int]] = [10, 50, 100, 500, 1000, 5000, 10000]


class ScalingPoint(BaseModel):
    n: int
    operations: Dict[str, float]


class SimulateResponse(BaseModel):
    points: List[ScalingPoint]


ALGORITHM_MATRIX: List[AlgorithmProfile] = [
    AlgorithmProfile(
        id="binary_search",
        name="Binary Search",
        category="Searching",
        best_time="O(1)",
        average_time="O(log n)",
        worst_time="O(log n)",
        space_complexity="O(1)",
        in_place=True,
        description="Searches a sorted array by repeatedly dividing the search interval in half.",
        pros=["Extremely fast on large sorted inputs", "Minimal constant extra space O(1)"],
        cons=["Requires data to be sorted beforehand", "Inefficient for linked lists without random access"],
        sample_code="""def binary_search(arr, target):
    l, r = 0, len(arr) - 1
    while l <= r:
        m = (l + r) // 2
        if arr[m] == target: return m
        elif arr[m] < target: l = m + 1
        else: r = m - 1
    return -1""",
        language="python"
    ),
    AlgorithmProfile(
        id="quick_sort",
        name="Quick Sort",
        category="Sorting",
        best_time="O(n log n)",
        average_time="O(n log n)",
        worst_time="O(n²)",
        space_complexity="O(log n)",
        stability="No",
        in_place=True,
        description="Divide-and-conquer sorting algorithm that partitions elements around a pivot.",
        pros=["Fastest general comparison sort in practice", "Cache friendly with low constant factors"],
        cons=["Worst case O(n²) on already sorted inputs with naive pivot", "Not stable"],
        sample_code="""def quicksort(arr):
    if len(arr) <= 1: return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)""",
        language="python"
    ),
    AlgorithmProfile(
        id="merge_sort",
        name="Merge Sort",
        category="Sorting",
        best_time="O(n log n)",
        average_time="O(n log n)",
        worst_time="O(n log n)",
        space_complexity="O(n)",
        stability="Yes",
        in_place=False,
        description="Stable divide-and-conquer sort with guaranteed O(n log n) upper bound.",
        pros=["Guaranteed O(n log n) worst-case", "Stable sort preserving equal elements order"],
        cons=["Requires O(n) auxiliary heap memory", "Higher constant factor than Quick Sort"],
        sample_code="""def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left, right = merge_sort(arr[:mid]), merge_sort(arr[mid:])
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]: res.append(left[i]); i += 1
        else: res.append(right[j]); j += 1
    res.extend(left[i:]); res.extend(right[j:])
    return res""",
        language="python"
    ),
    AlgorithmProfile(
        id="fibonacci_dp",
        name="Fibonacci Dynamic Programming",
        category="Dynamic Programming",
        best_time="O(n)",
        average_time="O(n)",
        worst_time="O(n)",
        space_complexity="O(1)",
        in_place=True,
        description="Computes nth Fibonacci number iteratively in linear time with two state variables.",
        pros=["Reduces exponential O(2^n) to linear O(n)", "Only uses O(1) space"],
        cons=["Linear time can still be slow for n > 10^9 compared to matrix exponentiation O(log n)"],
        sample_code="""def fibonacci_iterative(n):
    if n <= 1: return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr""",
        language="python"
    ),
    AlgorithmProfile(
        id="two_sum_hashmap",
        name="Two-Sum Hash Map Lookup",
        category="Optimization",
        best_time="O(1)",
        average_time="O(n)",
        worst_time="O(n)",
        space_complexity="O(n)",
        in_place=False,
        description="Finds two numbers that sum to target by storing complements in a hash map.",
        pros=["Eliminates quadratic nested loop O(n²)", "Single linear pass O(n)"],
        cons=["Requires O(n) auxiliary RAM for hash table"],
        sample_code="""def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen: return [seen[diff], i]
        seen[num] = i
    return []""",
        language="python"
    )
]


def calculate_ops(complexity: str, n: int) -> float:
    c = complexity.strip()
    if c == "O(1)":
        return 1.0
    if c == "O(log n)":
        return max(1.0, math.log2(n))
    if c == "O(n)":
        return float(n)
    if c == "O(n log n)":
        return float(n) * max(1.0, math.log2(n))
    if c in ["O(n²)", "O(n^2)"]:
        return float(n ** 2)
    if c in ["O(n³)", "O(n^3)"]:
        return float(n ** 3)
    if "2^n" in c:
        return float(2 ** min(n, 30))  # Cap for float overflow
    return float(n)


@router.get("/matrix", response_model=List[AlgorithmProfile])
async def list_algorithms(category: Optional[str] = None):
    if category and category != "all":
        return [a for a in ALGORITHM_MATRIX if a.category.lower() == category.lower()]
    return ALGORITHM_MATRIX


@router.post("/simulate", response_model=SimulateResponse)
async def simulate_scaling(payload: SimulateRequest):
    points = []
    for n in (payload.input_sizes or [10, 100, 1000, 5000, 10000]):
        ops_dict = {}
        for comp in payload.complexities:
            ops_dict[comp] = round(calculate_ops(comp, n), 2)
        points.append(ScalingPoint(n=n, operations=ops_dict))
    return SimulateResponse(points=points)

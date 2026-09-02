from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

router = APIRouter()


class CurriculumTopic(BaseModel):
    id: str
    slug: str
    title: str
    category: str
    difficulty: str  # Beginner, Intermediate, Advanced
    estimated_minutes: int
    summary: str
    formula: Optional[str] = None
    key_takeaways: List[str]
    code_example: str
    language: str
    detailed_content: str


CURRICULUM_TOPICS: List[CurriculumTopic] = [
    CurriculumTopic(
        id="topic-1",
        slug="big-o-fundamentals",
        title="Big-O Asymptotic Notation Fundamentals",
        category="Foundations",
        difficulty="Beginner",
        estimated_minutes=8,
        summary="Master the fundamentals of asymptotic complexity: upper bounds O(g), tight bounds Θ(g), and lower bounds Ω(g).",
        formula="f(n) = O(g(n)) \\iff \\exists c > 0, n_0 \\text{ s.t. } \\forall n \\ge n_0, f(n) \\le c \\cdot g(n)",
        key_takeaways=[
            "Big-O characterizes the upper bound growth rate as input n approaches infinity.",
            "Constants (e.g. 5n -> O(n)) and lower-order terms (e.g. n² + 100n -> O(n²)) are asymptotically ignored.",
            "Worst-case analysis guarantees the algorithm will never perform worse than the bound."
        ],
        code_example="""def find_max(arr):
    # O(n) Time | O(1) Space
    current_max = arr[0]
    for num in arr:
        if num > current_max:
            current_max = num
    return current_max""",
        language="python",
        detailed_content="""### Understanding Asymptotic Growth
In computer science, we analyze algorithms not by raw execution time (which varies by CPU and operating system), but by how the number of operations scales with the size of the input $n$.

#### Standard Complexity Hierarchy
1. **$O(1)$ — Constant**: Direct indexing, arithmetic operations.
2. **$O(\\log n)$ — Logarithmic**: Binary search, balanced BST operations.
3. **$O(n)$ — Linear**: Single pass through an array or linked list.
4. **$O(n \\log n)$ — Linearithmic**: Merge Sort, Quick Sort (average), Heap Sort.
5. **$O(n^2)$ — Quadratic**: Nested loops, Bubble Sort, pairwise comparisons.
6. **$O(2^n)$ — Exponential**: Recursive branching without memoization, powerset.
7. **$O(n!)$ — Factorial**: Permutations, brute-force Traveling Salesperson."""
    ),
    CurriculumTopic(
        id="topic-2",
        slug="nested-loops-summations",
        title="Nested Loops & Dependent Summations",
        category="Loops & Control Flow",
        difficulty="Intermediate",
        estimated_minutes=12,
        summary="Understand how nested loops multiply and how dependent loop bounds form arithmetic progression summations.",
        formula="\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2} = \\frac{n^2 + n}{2} = O(n^2)",
        key_takeaways=[
            "Independent nested loops multiply their iteration counts: O(n) * O(n) = O(n²).",
            "Dependent inner loops (j from 0 to i) execute the arithmetic series 1 + 2 + ... + n.",
            "Even though the inner loop does not always run n times, the summation is still quadratic O(n²)."
        ],
        code_example="""def print_pairs(n):
    # Outer loop runs n times
    for i in range(n):
        # Inner loop runs i times
        for j in range(i):
            print(i, j)""",
        language="python",
        detailed_content="""### Arithmetic Series in Code
When an inner loop bound depends on the outer loop counter (e.g. `for (int j = 0; j < i; j++)`), the total number of inner loop executions is:

$$\\sum_{i=1}^{n-1} i = 0 + 1 + 2 + \\dots + (n-1) = \\frac{(n-1)n}{2} = \\frac{n^2 - n}{2} = O(n^2)$$

Because the highest degree term is $n^2$ and the constant coefficient $1/2$ is dropped in asymptotic notation, dependent loops remain quadratic $O(n^2)$."""
    ),
    CurriculumTopic(
        id="topic-3",
        slug="logarithmic-halving-binary-search",
        title="Logarithmic Halving & Binary Search",
        category="Divide & Conquer",
        difficulty="Beginner",
        estimated_minutes=10,
        summary="Why dividing a problem by half at each step produces ultra-fast O(log n) performance.",
        formula="k = \\log_2(n) \\implies 2^k = n",
        key_takeaways=[
            "Halving the remaining elements at each comparison eliminates half the remaining possibilities.",
            "For n = 1,000,000,000 (1 billion items), binary search finishes in at most 30 steps.",
            "Loops that multiply (i *= 2) or divide (n /= 2) their indices run in logarithmic O(log n) time."
        ],
        code_example="""def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1""",
        language="python",
        detailed_content="""### The Power of Logarithmic Scaling
Whenever an algorithm reduces its problem size by a constant ratio (like $n/2$) in each step, the total number of steps $k$ until reaching the base case of $n=1$ satisfies:

$$\\frac{n}{2^k} = 1 \\implies 2^k = n \\implies k = \\log_2(n)$$

This explains why Binary Search, Segment Trees, and Binary Heap operations are so efficient."""
    ),
    CurriculumTopic(
        id="topic-4",
        slug="recurrence-relations-master-theorem",
        title="Recurrence Relations & Master Theorem",
        category="Recursion & Divide and Conquer",
        difficulty="Advanced",
        estimated_minutes=15,
        summary="Master the recurrence relation formula T(n) = aT(n/b) + f(n) and calculate exact asymptotic bounds for divide-and-conquer.",
        formula="T(n) = aT(n/b) + O(n^d) \\implies \\text{Compare } d \\text{ with } \\log_b(a)",
        key_takeaways=[
            "Case 1: If d < log_b(a) -> T(n) = O(n^(log_b(a))) (leaves dominate).",
            "Case 2: If d = log_b(a) -> T(n) = O(n^d log n) (all levels equal, e.g. Merge Sort).",
            "Case 3: If d > log_b(a) -> T(n) = O(n^d) (root dominates)."
        ],
        code_example="""def merge_sort(arr):
    # T(n) = 2T(n/2) + O(n) -> O(n log n)
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)""",
        language="python",
        detailed_content="""### The Master Theorem Framework
For divide-and-conquer algorithms of the form:
$$T(n) = aT(n/b) + O(n^d)$$
where $a \\ge 1$ is the number of subproblems, $b > 1$ is the division factor, and $O(n^d)$ is the work to split/merge:

- **Case 1**: $d < \\log_b a \\implies T(n) = O(n^{\\log_b a})$
- **Case 2**: $d = \\log_b a \\implies T(n) = O(n^d \\log n)$
- **Case 3**: $d > \\log_b a \\implies T(n) = O(n^d)$"""
    ),
    CurriculumTopic(
        id="topic-5",
        slug="space-time-tradeoffs-hashmaps",
        title="Space-Time Tradeoffs & Hash Map Optimizations",
        category="Optimization",
        difficulty="Intermediate",
        estimated_minutes=10,
        summary="Learn the core engineering trade-off: spending auxiliary heap memory to eliminate quadratic nested loops.",
        formula="O(n^2) \\text{ Time} + O(1) \\text{ Space} \\xrightarrow{\\text{Hash Map}} O(n) \\text{ Time} + O(n) \\text{ Space}",
        key_takeaways=[
            "Nested loops often check if an element exists in quadratic time O(n²).",
            "A Hash Table provides average O(1) lookup time by consuming O(n) memory.",
            "Trading space for time is the most common algorithmic optimization in real-world software."
        ],
        code_example="""def two_sum_optimized(nums, target):
    # O(n) Time | O(n) Auxiliary Space
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []""",
        language="python",
        detailed_content="""### Transforming Algorithms with Auxiliary Memory
In the naive Two-Sum algorithm, two nested loops compare all $n(n-1)/2$ pairs in $O(n^2)$ time with $O(1)$ memory.

By introducing a Hash Table (`seen`), we remember previous elements in $O(n)$ heap memory. For each number, checking if `target - num` exists takes $O(1)$ time, reducing total runtime to $O(n)$."""
    )
]


@router.get("/topics", response_model=List[CurriculumTopic])
async def list_curriculum_topics():
    return CURRICULUM_TOPICS


@router.get("/topics/{slug}", response_model=CurriculumTopic)
async def get_curriculum_topic(slug: str):
    for topic in CURRICULUM_TOPICS:
        if topic.slug == slug or topic.id == slug:
            return topic
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Topic '{slug}' not found."
    )

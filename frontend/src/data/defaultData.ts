import { ASTNodeVisual, StaticAnalysisResult, AIExplanationResult } from "@/types/analysis";

// ==============================================================================
// 1. CURRICULUM TOPICS
// ==============================================================================
export const DEFAULT_CURRICULUM_TOPICS = [
  {
    id: "topic-1",
    slug: "big-o-fundamentals",
    title: "Big-O Asymptotic Notation Fundamentals",
    category: "Foundations",
    difficulty: "Beginner",
    estimated_minutes: 8,
    summary: "Master the mathematical fundamentals of asymptotic complexity: upper bounds O(g), tight bounds Θ(g), and lower bounds Ω(g).",
    formula: "f(n) = O(g(n)) \\iff \\exists c > 0, n_0 \\text{ s.t. } \\forall n \\ge n_0, f(n) \\le c \\cdot g(n)",
    key_takeaways: [
      "Big-O characterizes the upper bound growth rate as input n approaches infinity.",
      "Constants (e.g. 5n -> O(n)) and lower-order terms (e.g. n² + 100n -> O(n²)) are asymptotically ignored.",
      "Worst-case analysis guarantees the algorithm will never perform worse than the theoretical bound."
    ],
    code_example: `def find_max(arr):
    # O(n) Time | O(1) Space
    current_max = arr[0]
    for num in arr:
        if num > current_max:
            current_max = num
    return current_max`,
    language: "python",
    detailed_content: `### Understanding Asymptotic Growth
In computer science, we analyze algorithms not by raw execution time (which varies by CPU, cache, and operating system), but by how the number of required operations scales with the size of the input $n$.

#### Standard Complexity Hierarchy
1. **$O(1)$ — Constant**: Direct array index access, simple arithmetic.
2. **$O(\\log n)$ — Logarithmic**: Binary search, balanced binary search tree lookups.
3. **$O(n)$ — Linear**: Single pass through an array or linked list.
4. **$O(n \\log n)$ — Linearithmic**: Merge Sort, Quick Sort (average case), Heap Sort.
5. **$O(n^2)$ — Quadratic**: Nested loops, Bubble Sort, pairwise matrix comparison.
6. **$O(2^n)$ — Exponential**: Recursive branching without memoization, powerset enumeration.
7. **$O(n!)$ — Factorial**: Permutation generation, brute-force Traveling Salesperson.`
  },
  {
    id: "topic-2",
    slug: "nested-loops-summations",
    title: "Nested Loops & Dependent Summations",
    category: "Loops & Control Flow",
    difficulty: "Intermediate",
    estimated_minutes: 12,
    summary: "Understand how nested loops multiply and how dependent loop bounds form arithmetic progression summations.",
    formula: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2} = \\frac{n^2 + n}{2} = O(n^2)",
    key_takeaways: [
      "Independent nested loops multiply their iteration counts: O(n) * O(n) = O(n²).",
      "Dependent inner loops (j from 0 to i) execute the arithmetic series 1 + 2 + ... + n.",
      "Even though the inner loop does not always run n times, the summation remains quadratic O(n²)."
    ],
    code_example: `def print_pairs(n):
    # Outer loop runs n times
    for i in range(n):
        # Inner loop runs i times
        for j in range(i):
            print(i, j)`,
    language: "python",
    detailed_content: `### Arithmetic Series in Code
When an inner loop bound depends on the outer loop counter (e.g. \`for (int j = 0; j < i; j++)\`), the total number of inner loop executions is:

$$\\sum_{i=1}^{n-1} i = 0 + 1 + 2 + \\dots + (n-1) = \\frac{(n-1)n}{2} = \\frac{n^2 - n}{2} = O(n^2)$$

Because the highest degree term is $n^2$ and the constant coefficient $1/2$ is dropped in asymptotic notation, dependent loops remain quadratic $O(n^2)$.`
  },
  {
    id: "topic-3",
    slug: "logarithmic-halving-binary-search",
    title: "Logarithmic Halving & Binary Search",
    category: "Divide & Conquer",
    difficulty: "Beginner",
    estimated_minutes: 10,
    summary: "Why dividing a problem by half at each step produces ultra-fast O(log n) performance.",
    formula: "k = \\log_2(n) \\implies 2^k = n",
    key_takeaways: [
      "Halving the search space at each comparison eliminates half the remaining possibilities.",
      "For n = 1,000,000,000 (1 billion items), binary search finishes in at most 30 steps.",
      "Loops that multiply (i *= 2) or divide (n //= 2) their indices run in logarithmic O(log n) time."
    ],
    code_example: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    language: "python",
    detailed_content: `### Logarithmic Shrinking
When an algorithm cuts its remaining candidate space in half at each step:
- Step 0: $n$ items
- Step 1: $n/2$ items
- Step 2: $n/4$ items
- Step $k$: $n/2^k = 1 \\implies 2^k = n \\implies k = \\log_2(n)$

Therefore, the maximum number of iterations is $\\lceil \\log_2(n) \\rceil$.`
  },
  {
    id: "topic-4",
    slug: "divide-and-conquer-master-theorem",
    title: "Divide & Conquer & Master Theorem",
    category: "Recurrences",
    difficulty: "Advanced",
    estimated_minutes: 15,
    summary: "Formal recurrence relation analysis using the Master Theorem for T(n) = aT(n/b) + f(n).",
    formula: "T(n) = a T(n/b) + f(n) \\implies c_{\\text{crit}} = \\log_b(a)",
    key_takeaways: [
      "Merge Sort splits into 2 subproblems of size n/2 with linear merge work: T(n) = 2T(n/2) + O(n) -> O(n log n).",
      "Case 1: Work at leaves dominates if f(n) < n^(log_b a).",
      "Case 2: Work is distributed equally across all levels if f(n) = n^(log_b a)."
    ],
    code_example: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
    language: "python",
    detailed_content: `### The Master Theorem Framework
For divide-and-conquer recurrences of the form:
$$T(n) = a T(n/b) + O(n^d)$$
Where:
- $a$: Number of recursive subproblems generated per level.
- $b$: Factor by which subproblem size is reduced.
- $d$: Exponent of the work required to divide and recombine solutions.

Comparing $d$ to $\\log_b(a)$:
- If $d < \\log_b(a) \\implies T(n) = O(n^{\\log_b a})$ (Leaf heavy)
- If $d = \\log_b(a) \\implies T(n) = O(n^d \\log n)$ (Balanced)
- If $d > \\log_b(a) \\implies T(n) = O(n^d)$ (Root heavy)`
  },
  {
    id: "topic-5",
    slug: "auxiliary-vs-call-stack-space",
    title: "Auxiliary Heap vs Call Stack Space",
    category: "Memory",
    difficulty: "Intermediate",
    estimated_minutes: 10,
    summary: "Distinguish between auxiliary heap data structures, input references, and runtime call stack frames.",
    formula: "S(n) = S_{\\text{auxiliary}}(n) + S_{\\text{stack}}(n)",
    key_takeaways: [
      "Input data passed by reference or pointer does not count towards Auxiliary Space O(S).",
      "Recursive call stacks consume stack memory proportional to maximum recursion depth.",
      "Tail call optimization can reduce stack space in supported compilers from O(n) to O(1)."
    ],
    code_example: `def recursive_sum(arr, index=0):
    # Consumes O(n) Stack Frames, but O(1) Auxiliary Heap
    if index >= len(arr):
        return 0
    return arr[index] + recursive_sum(arr, index + 1)`,
    language: "python",
    detailed_content: `### Memory Categorization in DSA
When assessing space complexity:
1. **Total Space**: Includes input buffer + output buffer + auxiliary memory.
2. **Auxiliary Space**: Memory allocated strictly to execute the algorithm beyond the input itself.
3. **Call Stack Depth**: Memory consumed by activation records (return addresses, local parameters) across recursive call frames.`
  }
];

// ==============================================================================
// 2. CANONICAL BENCHMARK ALGORITHMS
// ==============================================================================
export const DEFAULT_ALGORITHMS = [
  {
    id: "algo_1",
    name: "Binary Search",
    category: "Searching",
    best_time: "O(1)",
    average_time: "O(log n)",
    worst_time: "O(log n)",
    space_complexity: "O(1)",
    stability: "N/A",
    in_place: true,
    description: "Divides sorted search space in half at each iteration, achieving logarithmic lookup time.",
    pros: ["Ultra-fast O(log n) scaling", "O(1) constant auxiliary space"],
    cons: ["Requires pre-sorted input array", "Not suitable for linked lists without random access"],
    sample_code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    language: "python"
  },
  {
    id: "algo_2",
    name: "Merge Sort",
    category: "Sorting",
    best_time: "O(n log n)",
    average_time: "O(n log n)",
    worst_time: "O(n log n)",
    space_complexity: "O(n)",
    stability: "Stable",
    in_place: false,
    description: "Divide-and-conquer sorting algorithm that splits into two halves, recursively sorts, and merges in linear time.",
    pros: ["Guaranteed O(n log n) worst-case performance", "Stable sort preserves order of duplicate elements"],
    cons: ["Requires O(n) additional auxiliary buffer during merge"],
    sample_code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
    language: "python"
  },
  {
    id: "algo_3",
    name: "Quick Sort",
    category: "Sorting",
    best_time: "O(n log n)",
    average_time: "O(n log n)",
    worst_time: "O(n²)",
    space_complexity: "O(log n)",
    stability: "Unstable",
    in_place: true,
    description: "In-place partitioning algorithm selecting a pivot and arranging elements into smaller and larger partitions.",
    pros: ["Cache-friendly with high constant factor performance", "In-place partition with O(log n) recursion stack"],
    cons: ["Degrades to O(n²) worst-case on already sorted inputs with bad pivot"],
    sample_code: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)`,
    language: "python"
  },
  {
    id: "algo_4",
    name: "Two Sum (Hash Table)",
    category: "Hash Table",
    best_time: "O(n)",
    average_time: "O(n)",
    worst_time: "O(n)",
    space_complexity: "O(n)",
    stability: "N/A",
    in_place: false,
    description: "Uses a hash map to achieve O(1) complement lookups, solving two-element sum in a single O(n) pass.",
    pros: ["Linear O(n) time beats brute-force O(n²)", "Single pass traversal"],
    cons: ["Requires O(n) auxiliary hash table memory"],
    sample_code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
    language: "python"
  },
  {
    id: "algo_5",
    name: "Fibonacci (DP Tabulation)",
    category: "Dynamic Programming",
    best_time: "O(n)",
    average_time: "O(n)",
    worst_time: "O(n)",
    space_complexity: "O(1)",
    stability: "N/A",
    in_place: true,
    description: "Iterative bottom-up state machine caching the previous two results, reducing exponential tree to O(n) time.",
    pros: ["Eliminates redundant O(2^n) subproblem calls", "O(1) constant space using two variables"],
    cons: ["Requires pre-defining recurrence subproblems"],
    sample_code: `def fib_tabulated(n):
    if n <= 1: return n
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    return curr`,
    language: "python"
  }
];

// ==============================================================================
// 3. PRACTICE ARENA QUESTION BANK
// ==============================================================================
export const DEFAULT_QUIZ_QUESTIONS = [
  {
    id: "quiz-1",
    title: "Triangular Nested Loop",
    category: "Loops & Summations",
    difficulty: "Medium",
    code_snippet: `def triangular_sum(n):
    total = 0
    for i in range(n):
        for j in range(i):
            total += j
    return total`,
    language: "python",
    time_options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
    space_options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
    correct_time: "O(n²)",
    correct_space: "O(1)",
    explanation: "The inner loop runs 0 + 1 + 2 + ... + (n-1) times, summing to n(n-1)/2 iterations, which is O(n²). Only scalar variables (total, i, j) are allocated, so auxiliary space is O(1)."
  },
  {
    id: "quiz-2",
    title: "Merge Sort Divide & Conquer",
    category: "Divide & Conquer",
    difficulty: "Medium",
    code_snippet: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
    language: "python",
    time_options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    space_options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct_time: "O(n log n)",
    correct_space: "O(n)",
    explanation: "At each recursion level, the array is split into halves across log(n) levels with O(n) total merge work per level, yielding O(n log n) time. Merging allocates auxiliary subarrays of size n."
  },
  {
    id: "quiz-3",
    title: "Logarithmic While Loop",
    category: "Logarithmic",
    difficulty: "Easy",
    code_snippet: `def count_halves(n):
    count = 0
    while n > 1:
        n = n // 2
        count += 1
    return count`,
    language: "python",
    time_options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    space_options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct_time: "O(log n)",
    correct_space: "O(1)",
    explanation: "Dividing n by 2 at each step reduces n to 1 in exactly ⌈log₂(n)⌉ iterations. Auxiliary space is constant O(1)."
  },
  {
    id: "quiz-4",
    title: "Matrix Pairwise Comparison",
    category: "Matrices",
    difficulty: "Hard",
    code_snippet: `for(int i = 0; i < n; i++) {
    for(int j = 0; j < n; j++) {
        matrix[i][j] = i * j;
    }
}`,
    language: "cpp",
    time_options: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
    space_options: ["O(1)", "O(n)", "O(n²)", "O(log n)"],
    correct_time: "O(n²)",
    correct_space: "O(1)",
    explanation: "Two independent loops from 0 to n-1 result in n * n = n² iterations. Loop indices consume O(1) auxiliary space."
  }
];

// ==============================================================================
// 4. DEFAULT STATIC ANALYSIS (FOR ANALYZER IDE FALLBACK)
// ==============================================================================
export const DEFAULT_STATIC_RESULT: StaticAnalysisResult = {
  time_complexity: "O(n log n)",
  space_complexity: "O(n)",
  auxiliary_space: "O(n)",
  recursion_stack: "O(log n)",
  confidence: "HIGH",
  confidence_reason: "Deterministic recurrence tree: 2 subproblems of size n/2 combined with linear merge pass.",
  deterministic_summary: {
    total_loops: 1,
    max_loop_nesting_depth: 1,
    has_recursion: true,
    recursive_functions: ["merge_sort"],
    recursion_depth_estimate: "O(log n)",
    allocated_structures: ["left", "right", "merged"],
    function_calls: ["merge_sort", "merge"]
  },
  line_findings: [
    {
      line_number: 1,
      code: "def merge_sort(arr):",
      complexity: "O(1)",
      role: "Function Header",
      explanation: "Function entry point for divide & conquer recurrence."
    },
    {
      line_number: 2,
      code: "if len(arr) <= 1: return arr",
      complexity: "O(1)",
      role: "Base Case",
      explanation: "Constant time termination check for single element or empty list."
    },
    {
      line_number: 3,
      code: "mid = len(arr) // 2",
      complexity: "O(1)",
      role: "Partitioning",
      explanation: "Calculates midpoint to divide the problem in half."
    },
    {
      line_number: 4,
      code: "left = merge_sort(arr[:mid])",
      complexity: "T(n/2)",
      role: "Recursive Branch (Left)",
      explanation: "Recursively solves the left half subproblem."
    },
    {
      line_number: 5,
      code: "right = merge_sort(arr[mid:])",
      complexity: "T(n/2)",
      role: "Recursive Branch (Right)",
      explanation: "Recursively solves the right half subproblem."
    },
    {
      line_number: 6,
      code: "return merge(left, right)",
      complexity: "O(n)",
      role: "Combine Step",
      explanation: "Two-pointer linear combination of sorted sub-arrays."
    }
  ],
  ast_tree: {
    id: "ast_root",
    name: "Function: merge_sort(arr)",
    type: "FunctionDef",
    complexity: "O(n log n)",
    line_start: 1,
    line_end: 6,
    children: [
      {
        id: "ast_base",
        name: "if len(arr) <= 1: return arr",
        type: "IfStatement",
        complexity: "O(1)",
        line_start: 2,
        line_end: 2,
        children: []
      },
      {
        id: "ast_mid",
        name: "mid = len(arr) // 2",
        type: "Assign",
        complexity: "O(1)",
        line_start: 3,
        line_end: 3,
        children: []
      },
      {
        id: "ast_call_left",
        name: "merge_sort(arr[:mid])",
        type: "Call",
        complexity: "T(n/2)",
        line_start: 4,
        line_end: 4,
        children: []
      },
      {
        id: "ast_call_right",
        name: "merge_sort(arr[mid:])",
        type: "Call",
        complexity: "T(n/2)",
        line_start: 5,
        line_end: 5,
        children: []
      },
      {
        id: "ast_merge",
        name: "return merge(left, right)",
        type: "Return",
        complexity: "O(n)",
        line_start: 6,
        line_end: 6,
        children: []
      }
    ]
  },
  summary_explanation: "Merge sort recursively partitions an array of size n into two halves until single-element base cases are reached (log n recursion depth). Each level performs O(n) total comparisons to combine the sorted halves, yielding T(n) = 2T(n/2) + O(n) = O(n log n)."
};

export const DEFAULT_AI_EXPLANATION: AIExplanationResult = {
  explanation_mode: "intermediate",
  summary: "This algorithm implements Merge Sort, operating in guaranteed O(n log n) time across all best, average, and worst-case inputs with O(n) auxiliary space.",
  step_by_step_reasoning: [
    "Dividing: Array is divided into 2 equal halves at each recursion level.",
    "Tree Height: Halving continues until subarrays of size 1 remain, producing a tree of height ⌈log₂ n⌉.",
    "Conquering: At each level of the tree, merging the partitions takes linear O(n) comparison steps.",
    "Total Work: Height log(n) * O(n) work per level = O(n log n)."
  ],
  why_this_complexity: "Even if the array is already sorted or reverse-sorted, the divide-and-conquer partition tree always executes log₂(n) levels of halving and full linear merging.",
  what_happens_if_n_doubles: "If input n doubles from 1,000 to 2,000, operations scale by roughly 2.1x (from ~10,000 to ~22,000 operations), scaling gracefully unlike quadratic algorithms.",
  learning_takeaway: "Divide and conquer balances problem size to prevent degenerate quadratic worst cases, at the cost of O(n) auxiliary memory for buffer merging."
};

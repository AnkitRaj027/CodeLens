import json
import logging
import random
import uuid
from typing import List, Optional, Dict, Any
import httpx
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


class QuizQuestionItem(BaseModel):
    id: str
    title: str
    category: str
    difficulty: str  # Beginner, Intermediate, Advanced
    code_snippet: str
    language: str
    time_options: List[str]
    space_options: List[str]
    correct_time: str
    correct_space: str
    explanation: str
    source: Optional[str] = "core"  # "ai", "procedural", "core"


class QuizGenerateRequest(BaseModel):
    category: Optional[str] = None
    difficulty: Optional[str] = None
    language: Optional[str] = "python"
    exclude_ids: Optional[List[str]] = None


class QuizSubmitRequest(BaseModel):
    question_id: str
    selected_time: str
    selected_space: str


class QuizSubmitResponse(BaseModel):
    is_time_correct: bool
    is_space_correct: bool
    is_fully_correct: bool
    correct_time: str
    correct_space: str
    explanation: str
    score_delta: int


# Dynamic cache to store generated questions for validation
DYNAMIC_QUESTIONS_CACHE: Dict[str, QuizQuestionItem] = {}

# Built-in base pool with comprehensive DSA questions
QUIZ_BANK: List[QuizQuestionItem] = [
    QuizQuestionItem(
        id="q1",
        title="Dependent Triangular Loop",
        category="Loops & Summations",
        difficulty="Intermediate",
        code_snippet="""def process_pairs(n):
    total = 0
    for i in range(n):
        for j in range(i):
            total += i * j
    return total""",
        language="python",
        time_options=["O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(1)"],
        space_options=["O(1)", "O(n)", "O(n²)"],
        correct_time="O(n²)",
        correct_space="O(1)",
        explanation="The inner loop runs 0 + 1 + 2 + ... + (n-1) times, which evaluates to n(n-1)/2 = O(n²) total iterations. Only scalar integer variables are allocated, giving O(1) auxiliary space.",
        source="core"
    ),
    QuizQuestionItem(
        id="q2",
        title="Exponential Tree Recursion",
        category="Recursion",
        difficulty="Intermediate",
        code_snippet="""def count_paths(n):
    if n <= 1:
        return 1
    return count_paths(n - 1) + count_paths(n - 2)""",
        language="python",
        time_options=["O(n)", "O(n log n)", "O(2^n)", "O(n²)", "O(log n)"],
        space_options=["O(1)", "O(n)", "O(2^n)"],
        correct_time="O(2^n)",
        correct_space="O(n)",
        explanation="Each function invocation spawns 2 recursive branches of depth n without memoization, generating ~2^n total function calls. The maximum recursion call stack depth is n, yielding O(n) space complexity.",
        source="core"
    ),
    QuizQuestionItem(
        id="q3",
        title="Logarithmic Halving Loop",
        category="Divide & Conquer",
        difficulty="Beginner",
        code_snippet="""void divideUntilOne(int n) {
    while (n > 1) {
        std::cout << n << "\\n";
        n /= 2;
    }
}""",
        language="cpp",
        time_options=["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        space_options=["O(1)", "O(n)", "O(log n)"],
        correct_time="O(log n)",
        correct_space="O(1)",
        explanation="The variable n is halved on every iteration: n, n/2, n/4, ..., 1. The total number of steps is log₂(n) = O(log n). No dynamic heap memory or recursion stack is used (O(1) space).",
        source="core"
    ),
    QuizQuestionItem(
        id="q4",
        title="Quadratic 2D Grid Matrix Allocation",
        category="Memory Allocation",
        difficulty="Intermediate",
        code_snippet="""def create_chessboard_grid(n):
    matrix = []
    for i in range(n):
        row = [0] * n
        matrix.append(row)
    return matrix""",
        language="python",
        time_options=["O(n)", "O(n²)", "O(n³)", "O(1)"],
        space_options=["O(1)", "O(n)", "O(n²)"],
        correct_time="O(n²)",
        correct_space="O(n²)",
        explanation="The code allocates an n x n 2D grid containing n² total elements, requiring O(n²) auxiliary heap memory and O(n²) time to construct.",
        source="core"
    ),
    QuizQuestionItem(
        id="q5",
        title="Merge Sort Recurrence Relation",
        category="Recurrence & Master Theorem",
        difficulty="Advanced",
        code_snippet="""// T(n) = 2T(n/2) + O(n)
int mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return 0;
    int mid = l + (r - l) / 2;
    mergeSort(arr, l, mid);
    mergeSort(arr, mid + 1, r);
    merge(arr, l, mid, r); // O(n) linear merge
    return 0;
}""",
        language="cpp",
        time_options=["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
        space_options=["O(1)", "O(log n)", "O(n)"],
        correct_time="O(n log n)",
        correct_space="O(n)",
        explanation="By Case 2 of Master Theorem, T(n) = 2T(n/2) + O(n) where a=2, b=2, d=1. Since log₂(2) = 1 = d, the time complexity is O(n log n). The merge step allocates O(n) auxiliary memory for subarray merging.",
        source="core"
    ),
    QuizQuestionItem(
        id="q6",
        title="Amortized Monotonic Stack Traversal",
        category="Amortized Analysis",
        difficulty="Advanced",
        code_snippet="""def next_greater_elements(nums):
    n = len(nums)
    result = [-1] * n
    stack = []
    for i in range(n):
        while stack and nums[stack[-1]] < nums[i]:
            prev_idx = stack.pop()
            result[prev_idx] = nums[i]
        stack.append(i)
    return result""",
        language="python",
        time_options=["O(n)", "O(n²)", "O(n log n)", "O(2^n)"],
        space_options=["O(1)", "O(n)", "O(n²)"],
        correct_time="O(n)",
        correct_space="O(n)",
        explanation="Despite the nested while loop, each index is pushed onto the stack exactly once and popped at most once across the entire algorithm execution. Total stack operations across all iterations are at most 2n, yielding amortized O(n) time and O(n) space for the stack and output.",
        source="core"
    ),
    QuizQuestionItem(
        id="q7",
        title="Harmonic Sieve Loop (Step by i)",
        category="Harmonic Series & Math",
        difficulty="Advanced",
        code_snippet="""void sieveDivisors(int n) {
    int total_ops = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = i; j <= n; j += i) {
            total_ops++;
        }
    }
}""",
        language="cpp",
        time_options=["O(n)", "O(n log n)", "O(n²)", "O(n√n)"],
        space_options=["O(1)", "O(n)", "O(log n)"],
        correct_time="O(n log n)",
        correct_space="O(1)",
        explanation="For each i, the inner loop executes n/i times. The total operations equal n * (1/1 + 1/2 + 1/3 + ... + 1/n) = n * H_n = n * (ln n + O(1)) = O(n log n). Space is O(1).",
        source="core"
    ),
    QuizQuestionItem(
        id="q8",
        title="Square Root Bounded Prime Check",
        category="Mathematical Bounds",
        difficulty="Beginner",
        code_snippet="""def is_prime_check(n):
    if n <= 1:
        return False
    i = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i += 1
    return True""",
        language="python",
        time_options=["O(1)", "O(log n)", "O(√n)", "O(n)"],
        space_options=["O(1)", "O(log n)", "O(n)"],
        correct_time="O(√n)",
        correct_space="O(1)",
        explanation="The loop condition i * i <= n terminates when i reaches ⌈√n⌉. Therefore the loop executes at most √n times in the worst case (when n is prime), requiring O(√n) time and O(1) space.",
        source="core"
    )
]

for q in QUIZ_BANK:
    DYNAMIC_QUESTIONS_CACHE[q.id] = q


# ==============================================================================
# MULTI-PROVIDER AI QUESTION GENERATOR (Gemini, OpenAI, Mistral, NVIDIA)
# ==============================================================================
RANDOM_DSA_SEEDS = [
    "Sliding Window with Dynamic Shrink",
    "Two Pointers Convergence",
    "Prefix Sum Differences",
    "Master Theorem Logarithmic Recurrence",
    "Divide and Conquer Subproblem Splitting",
    "Monotonic Deque Window Maximum",
    "Binary Search on Answer Space",
    "Harmonic Series Sieve Multiples",
    "Square Root Decomposition Block Step",
    "Bitwise Brian Kernighan Count",
    "Cycle Detection via Fast and Slow Pointers",
    "Memoized Top-Down Fibonacci vs Tabulation",
    "Dependent Geometric Loops",
    "Matrix Transpose In-Place vs Out-of-Place",
    "Recursive Tree Branching Factor of 3",
    "String Slicing Heap Allocation Inside Loop"
]


async def generate_with_ai(
    category: Optional[str], 
    difficulty: Optional[str], 
    language: str,
    exclude_ids: Optional[List[str]] = None
) -> Optional[QuizQuestionItem]:
    """Generates a novel algorithmic challenge via Gemini, OpenAI, Mistral, or NVIDIA."""
    cat = category or random.choice(RANDOM_DSA_SEEDS)
    diff = difficulty or random.choice(["Beginner", "Intermediate", "Advanced"])
    lang = language if language in ["python", "cpp"] else "python"
    seed_topic = random.choice(RANDOM_DSA_SEEDS)

    system_prompt = """You are an expert DSA Interviewer and Algorithm Complexity Professor.
Generate a novel, creative, and unique code snippet challenge for Time & Space Complexity analysis.
You MUST output ONLY valid JSON matching this exact schema:
{
  "title": "Descriptive problem title (e.g. Sliding Window Substring Counter)",
  "category": "Algorithmic Category",
  "difficulty": "Beginner | Intermediate | Advanced",
  "code_snippet": "Clean, syntactically valid code in the requested language",
  "language": "python or cpp",
  "time_options": ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
  "space_options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
  "correct_time": "Exact Big-O (e.g. O(n))",
  "correct_space": "Exact Big-O (e.g. O(n))",
  "explanation": "Clear, rigorous mathematical 2-3 sentence proof explaining why the time and space complexities are correct."
}"""

    user_prompt = f"Create a UNIQUE {diff} complexity challenge in {lang} covering '{cat}' (Seed concept: {seed_topic}). Ensure correct_time is present in time_options, and correct_space is present in space_options."

    # 1. Try Gemini first if key available
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [
                    {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{user_prompt}"}]}
                ],
                "generationConfig": {
                    "temperature": 0.85,
                    "response_mime_type": "application/json"
                }
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw_text)
                    return _format_ai_response(parsed, cat, diff, lang)
        except Exception as e:
            logger.warning(f"Gemini quiz generation failed: {e}")

    # 2. Try OpenAI if available
    if settings.OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.85,
                "response_format": {"type": "json_object"}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    return _format_ai_response(parsed, cat, diff, lang)
        except Exception as e:
            logger.warning(f"OpenAI quiz generation failed: {e}")

    # 3. Try Mistral if available
    if settings.MISTRAL_API_KEY:
        try:
            url = "https://api.mistral.ai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "mistral-small-latest",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.85,
                "response_format": {"type": "json_object"}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    return _format_ai_response(parsed, cat, diff, lang)
        except Exception as e:
            logger.warning(f"Mistral quiz generation failed: {e}")

    return None


def _format_ai_response(content: Dict[str, Any], cat: str, diff: str, lang: str) -> QuizQuestionItem:
    qid = f"dyn_ai_{uuid.uuid4().hex[:8]}"
    time_opts = content.get("time_options", ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"])
    space_opts = content.get("space_options", ["O(1)", "O(log n)", "O(n)", "O(n²)"])
    c_time = content.get("correct_time", "O(n)")
    c_space = content.get("correct_space", "O(1)")

    if c_time not in time_opts:
        time_opts.append(c_time)
    if c_space not in space_opts:
        space_opts.append(c_space)

    item = QuizQuestionItem(
        id=qid,
        title=content.get("title", f"Dynamic {cat} Challenge"),
        category=content.get("category", cat),
        difficulty=content.get("difficulty", diff),
        code_snippet=content.get("code_snippet", ""),
        language=content.get("language", lang),
        time_options=time_opts,
        space_options=space_opts,
        correct_time=c_time,
        correct_space=c_space,
        explanation=content.get("explanation", ""),
        source="ai"
    )
    DYNAMIC_QUESTIONS_CACHE[qid] = item
    return item


# ==============================================================================
# COMBINATORIAL PROCEDURAL GRAMMAR ENGINE (Infinite, Deterministic, 0 Cost)
# ==============================================================================
PROCEDURAL_ARCHETYPES = [
    # 1. Harmonic Sieve Divisor Step
    "harmonic_sieve",
    # 2. Square Root Bound
    "sqrt_bound",
    # 3. Cube Root Bound
    "cbrt_bound",
    # 4. Logarithmic Strided Halving
    "log_halving",
    # 5. Logarithmic Strided Multiplier
    "log_multiplying",
    # 6. Dependent Triangular Summation
    "triangular_nested",
    # 7. Independent Quadratic Nested
    "independent_quadratic",
    # 8. Independent Cubic Nested
    "independent_cubic",
    # 9. Multiplied Linearithmic
    "linearithmic_multiplier",
    # 10. Master Theorem Case 2: Divide & Conquer
    "master_theorem_nlogn",
    # 11. Master Theorem Case 1: Branching
    "master_theorem_quadratic",
    # 12. Binary Search Recurrence
    "binary_search_rec",
    # 13. Exponential 2^n Tree Recursion
    "exp_2n_tree",
    # 14. Exponential 3^n Tree Recursion
    "exp_3n_tree",
    # 15. Amortized Monotonic Stack
    "monotonic_stack",
    # 16. Dynamic Sliding Window
    "sliding_window",
    # 17. 2D Matrix Memory Allocation
    "matrix_allocation",
    # 18. String Slicing Quadratic Heap Allocation Trap
    "string_slicing_trap",
    # 19. Bit Manipulation Kernighan
    "bit_kernighan",
    # 20. Log-Squared Doubly Multiplied Loop
    "log_squared"
]


def generate_procedural_question(
    category: Optional[str] = None, 
    difficulty: Optional[str] = None, 
    language: str = "python",
    exclude_ids: Optional[List[str]] = None
) -> QuizQuestionItem:
    """Procedural generator for infinite unique questions across 20 algorithmic archetypes."""
    qid = f"proc_{uuid.uuid4().hex[:8]}"
    lang = "cpp" if language == "cpp" else "python"

    # Select an archetype not in exclude_ids signature
    exclude_set = set(exclude_ids or [])
    available_archetypes = [a for a in PROCEDURAL_ARCHETYPES if a not in exclude_set]
    if not available_archetypes:
        available_archetypes = PROCEDURAL_ARCHETYPES
    chosen_archetype = random.choice(available_archetypes)

    # Randomized variable & function identifiers for variety
    v_data = random.choice(["records", "stream", "buffer", "sequence", "payload", "items", "dataset"])
    v_idx = random.choice(["ptr", "cursor", "step", "idx", "offset"])
    v_count = random.choice(["tally", "ops", "accumulator", "metric", "counter"])
    k_stride = random.choice([2, 3, 4, 5, 8])
    base_mult = random.choice([2, 3, 5])

    if chosen_archetype == "harmonic_sieve":
        title = f"Harmonic Sieve Traversal (Step by {v_idx})"
        cat = "Harmonic Series & Math"
        diff = "Advanced"
        code_py = f"""def count_multiples(n):\n    {v_count} = 0\n    for {v_idx} in range(1, n + 1):\n        for j in range({v_idx}, n + 1, {v_idx}):\n            {v_count} += 1\n    return {v_count}"""
        code_cpp = f"""int countMultiples(int n) {{\n    int {v_count} = 0;\n    for (int {v_idx} = 1; {v_idx} <= n; {v_idx}++) {{\n        for (int j = {v_idx}; j <= n; j += {v_idx}) {{\n            {v_count}++;\n        }}\n    }}\n    return {v_count};\n}}"""
        c_time = "O(n log n)"
        c_space = "O(1)"
        exp = f"For each {v_idx}, the inner loop runs n/{v_idx} times. The sum n(1/1 + 1/2 + 1/3 + ... + 1/n) = n * H_n = O(n log n). Memory allocation is constant O(1)."

    elif chosen_archetype == "sqrt_bound":
        title = f"Bounded Quadratic Condition Loop"
        cat = "Mathematical Bounds"
        diff = "Beginner"
        code_py = f"""def check_threshold(n):\n    {v_idx} = 1\n    {v_count} = 0\n    while {v_idx} * {v_idx} <= n:\n        {v_count} += {v_idx}\n        {v_idx} += 1\n    return {v_count}"""
        code_cpp = f"""long long checkThreshold(long long n) {{\n    long long {v_idx} = 1, {v_count} = 0;\n    while ({v_idx} * {v_idx} <= n) {{\n        {v_count} += {v_idx};\n        {v_idx}++;\n    }}\n    return {v_count};\n}}"""
        c_time = "O(√n)"
        c_space = "O(1)"
        exp = f"The loop terminates when {v_idx}² > n, meaning {v_idx} reaches ⌈√n⌉. Exactly √n iterations are executed with O(1) scalar auxiliary space."

    elif chosen_archetype == "cbrt_bound":
        title = "Cube Root Bounded Cubic Traversal"
        cat = "Mathematical Bounds"
        diff = "Intermediate"
        code_py = f"""def cubic_search(n):\n    val = 1\n    steps = 0\n    while val * val * val <= n:\n        steps += 1\n        val += 1\n    return steps"""
        code_cpp = f"""int cubicSearch(int n) {{\n    int val = 1, steps = 0;\n    while (val * val * val <= n) {{\n        steps++;\n        val++;\n    }}\n    return steps;\n}}"""
        c_time = "O(∛n)"
        c_space = "O(1)"
        exp = "The condition val³ <= n halts once val exceeds ∛n (n^(1/3)). The total operations scale as O(∛n) with O(1) space."

    elif chosen_archetype == "log_halving":
        title = f"Logarithmic Division Halving (/{k_stride})"
        cat = "Divide & Conquer"
        diff = "Beginner"
        code_py = f"""def count_reductions(n):\n    {v_count} = 0\n    while n > 1:\n        n //= {k_stride}\n        {v_count} += 1\n    return {v_count}"""
        code_cpp = f"""int countReductions(int n) {{\n    int {v_count} = 0;\n    while (n > 1) {{\n        n /= {k_stride};\n        {v_count}++;\n    }}\n    return {v_count};\n}}"""
        c_time = "O(log n)"
        c_space = "O(1)"
        exp = f"The variable n is divided by {k_stride} in every cycle. The sequence reaches 1 in log_{k_stride}(n) = O(log n) total iterations with O(1) memory."

    elif chosen_archetype == "log_multiplying":
        title = f"Exponential Stride Doubler (*{k_stride})"
        cat = "Logarithmic Loops"
        diff = "Beginner"
        code_py = f"""def stride_multiplication(n):\n    {v_idx} = 1\n    {v_count} = 0\n    while {v_idx} < n:\n        {v_count} += 1\n        {v_idx} *= {k_stride}\n    return {v_count}"""
        code_cpp = f"""int strideMultiplication(int n) {{\n    int {v_idx} = 1, {v_count} = 0;\n    while ({v_idx} < n) {{\n        {v_count}++;\n        {v_idx} *= {k_stride};\n    }}\n    return {v_count};\n}}"""
        c_time = "O(log n)"
        c_space = "O(1)"
        exp = f"Starting at 1, {v_idx} scales as {k_stride}^0, {k_stride}^1, {k_stride}^2, ... until exceeding n. This takes log_{k_stride}(n) = O(log n) iterations."

    elif chosen_archetype == "triangular_nested":
        title = "Dependent Triangular Nested Progression"
        cat = "Loops & Summations"
        diff = "Intermediate"
        code_py = f"""def triangular_accumulator({v_data}):\n    n = len({v_data})\n    total = 0\n    for i in range(n):\n        for j in range(i, n):\n            total += {v_data}[i] ^ {v_data}[j]\n    return total"""
        code_cpp = f"""long long triangularAccumulator(const std::vector<int>& {v_data}) {{\n    int n = {v_data}.size();\n    long long total = 0;\n    for (int i = 0; i < n; i++) {{\n        for (int j = i; j < n; j++) {{\n            total += {v_data}[i] ^ {v_data}[j];\n        }}\n    }}\n    return total;\n}}"""
        c_time = "O(n²)"
        c_space = "O(1)"
        exp = "The inner loop runs (n - i) times. Summing from i = 0 to n-1 gives n + (n-1) + ... + 1 = n(n+1)/2 = O(n²) total iterations with O(1) space."

    elif chosen_archetype == "independent_quadratic":
        title = "Pairwise Independent Cross-Product"
        cat = "Nested Loops"
        diff = "Beginner"
        code_py = f"""def cross_compare(a, b):\n    n = len(a)\n    m = len(b)\n    matches = 0\n    for x in a:\n        for y in b:\n            if x == y:\n                matches += 1\n    return matches"""
        code_cpp = f"""int crossCompare(const std::vector<int>& a, const std::vector<int>& b) {{\n    int matches = 0;\n    for (int x : a) {{\n        for (int y : b) {{\n            if (x == y) matches++;\n        }}\n    }}\n    return matches;\n}}"""
        c_time = "O(n²)"
        c_space = "O(1)"
        exp = "For arrays of equal size n, two independent uncoupled iterations run n * n = O(n²) total comparisons with O(1) scalar auxiliary memory."

    elif chosen_archetype == "independent_cubic":
        title = "3-Level Nested Tensor Verification"
        cat = "Nested Complexity"
        diff = "Intermediate"
        code_py = f"""def check_triplets(n):\n    count = 0\n    for i in range(n):\n        for j in range(n):\n            for k in range(n):\n                count += (i + j + k) % 2\n    return count"""
        code_cpp = f"""int checkTriplets(int n) {{\n    int count = 0;\n    for (int i = 0; i < n; i++) {{\n        for (int j = 0; j < n; j++) {{\n            for (int k = 0; k < n; k++) {{\n                count += (i + j + k) % 2;\n            }}\n        }}\n    }}\n    return count;\n}}"""
        c_time = "O(n³)"
        c_space = "O(1)"
        exp = "Three fully nested loops running from 0 to n-1 yield n * n * n = n³ total statement executions. Space remains constant O(1)."

    elif chosen_archetype == "linearithmic_multiplier":
        title = f"Multiplied Linearithmic Iteration (*{k_stride})"
        cat = "Nested Complexity"
        diff = "Intermediate"
        code_py = f"""def process_log_blocks(n):\n    {v_count} = 0\n    for i in range(n):\n        j = 1\n        while j < n:\n            {v_count} += i ^ j\n            j *= {k_stride}\n    return {v_count}"""
        code_cpp = f"""int processLogBlocks(int n) {{\n    int {v_count} = 0;\n    for (int i = 0; i < n; i++) {{\n        int j = 1;\n        while (j < n) {{\n            {v_count} += i ^ j;\n            j *= {k_stride};\n        }}\n    }}\n    return {v_count};\n}}"""
        c_time = "O(n log n)"
        c_space = "O(1)"
        exp = f"The outer loop executes n times. Inside, j multiplies by {k_stride} per step, taking log_{k_stride}(n) cycles. Multiplying gives O(n log n) time and O(1) space."

    elif chosen_archetype == "master_theorem_nlogn":
        title = "Master Theorem Divide & Conquer (Case 2)"
        cat = "Recurrence & Master Theorem"
        diff = "Advanced"
        code_py = f"""# Recurrence: T(n) = 2T(n/2) + O(n)\ndef divide_and_conquer(arr):\n    if len(arr) <= 1:\n        return arr\n    mid = len(arr) // 2\n    left = divide_and_conquer(arr[:mid])\n    right = divide_and_conquer(arr[mid:])\n    return linear_combine(left, right)  # O(n) work"""
        code_cpp = f"""// T(n) = 2T(n/2) + O(n)\nvoid solveRecurrence(vector<int>& arr, int l, int r) {{\n    if (l >= r) return;\n    int mid = l + (r - l) / 2;\n    solveRecurrence(arr, l, mid);\n    solveRecurrence(arr, mid + 1, r);\n    linearCombine(arr, l, mid, r); // O(n)\n}}"""
        c_time = "O(n log n)"
        c_space = "O(n)"
        exp = "By Master Theorem: a=2, b=2, d=1. log_b(a) = log_2(2) = 1 = d. This is Case 2: T(n) = Θ(n^d * log n) = O(n log n). Slicing/combining allocates O(n) auxiliary memory."

    elif chosen_archetype == "master_theorem_quadratic":
        title = "Quad-Branching Divide & Conquer (Case 1)"
        cat = "Recurrence & Master Theorem"
        diff = "Advanced"
        code_py = f"""# Recurrence: T(n) = 4T(n/2) + O(n)\ndef quad_branch(n):\n    if n <= 1:\n        return 1\n    work = 0\n    for _ in range(n): work += 1  # O(n) root work\n    return (quad_branch(n // 2) + quad_branch(n // 2) +\n            quad_branch(n // 2) + quad_branch(n // 2))"""
        code_cpp = f"""// T(n) = 4T(n/2) + O(n)\nint quadBranch(int n) {{\n    if (n <= 1) return 1;\n    int work = 0;\n    for (int i = 0; i < n; i++) work++; // O(n)\n    return quadBranch(n/2) + quadBranch(n/2) + quadBranch(n/2) + quadBranch(n/2);\n}}"""
        c_time = "O(n²)"
        c_space = "O(log n)"
        exp = "By Master Theorem: a=4, b=2, d=1. log_b(a) = log_2(4) = 2 > d (1). By Case 1, subproblem leaves dominate: T(n) = Θ(n^(log_b(a))) = O(n²). Recursion depth is log₂(n)."

    elif chosen_archetype == "binary_search_rec":
        title = "Logarithmic Halving Recurrence"
        cat = "Divide & Conquer"
        diff = "Beginner"
        code_py = f"""# Recurrence: T(n) = T(n/2) + O(1)\ndef find_peak(arr, low, high):\n    if low >= high:\n        return low\n    mid = (low + high) // 2\n    if arr[mid] < arr[mid + 1]:\n        return find_peak(arr, mid + 1, high)\n    return find_peak(arr, low, mid)"""
        code_cpp = f"""int findPeak(const vector<int>& arr, int low, int high) {{\n    if (low >= high) return low;\n    int mid = low + (high - low) / 2;\n    if (arr[mid] < arr[mid + 1]) return findPeak(arr, mid + 1, high);\n    return findPeak(arr, low, mid);\n}}"""
        c_time = "O(log n)"
        c_space = "O(log n)"
        exp = "With a=1, b=2, d=0: log_2(1) = 0 = d. The relation evaluates to O(log n) time. Call stack depth is log₂(n), consuming O(log n) recursion stack space."

    elif chosen_archetype == "exp_2n_tree":
        title = "Dual Branching Tree Recursion (Fibonacci Style)"
        cat = "Recursion"
        diff = "Intermediate"
        code_py = f"""def count_arrangements(n):\n    if n <= 1:\n        return 1\n    return count_arrangements(n - 1) + count_arrangements(n - 2)"""
        code_cpp = f"""int countArrangements(int n) {{\n    if (n <= 1) return 1;\n    return countArrangements(n - 1) + countArrangements(n - 2);\n}}"""
        c_time = "O(2^n)"
        c_space = "O(n)"
        exp = "Each node branches into 2 subcalls without memoization, generating a binary recursion tree with 2^n total invocations. Maximum stack depth is n, so space is O(n)."

    elif chosen_archetype == "exp_3n_tree":
        title = "Ternary Tree Exponential Expansion"
        cat = "Recursion"
        diff = "Advanced"
        code_py = f"""def ternary_permute(n):\n    if n <= 0:\n        return 1\n    return (ternary_permute(n - 1) +\n            ternary_permute(n - 1) +\n            ternary_permute(n - 1))"""
        code_cpp = f"""int ternaryPermute(int n) {{\n    if (n <= 0) return 1;\n    return ternaryPermute(n - 1) + ternaryPermute(n - 1) + ternaryPermute(n - 1);\n}}"""
        c_time = "O(3^n)"
        c_space = "O(n)"
        exp = "Every invocation branches into 3 recursive calls of depth n. The recursion tree has 3^n total leaves, requiring O(3^n) operations and O(n) call stack space."

    elif chosen_archetype == "monotonic_stack":
        title = "Amortized Monotonic Stack Reduction"
        cat = "Amortized Analysis"
        diff = "Advanced"
        code_py = f"""def find_span({v_data}):\n    n = len({v_data})\n    stack = []\n    spans = [0] * n\n    for i in range(n):\n        while stack and {v_data}[stack[-1]] <= {v_data}[i]:\n            stack.pop()\n        spans[i] = i - stack[-1] if stack else i + 1\n        stack.append(i)\n    return spans"""
        code_cpp = f"""vector<int> findSpan(const vector<int>& {v_data}) {{\n    int n = {v_data}.size();\n    stack<int> s;\n    vector<int> spans(n, 0);\n    for (int i = 0; i < n; i++) {{\n        while (!s.empty() && {v_data}[s.top()] <= {v_data}[i]) s.pop();\n        spans[i] = s.empty() ? (i + 1) : (i - s.top());\n        s.push(i);\n    }}\n    return spans;\n}}"""
        c_time = "O(n)"
        c_space = "O(n)"
        exp = "Although there is an inner while loop, each index is pushed once and popped at most once throughout the entire execution. The amortized cost per iteration is O(1), giving O(n) total time and O(n) auxiliary stack space."

    elif chosen_archetype == "sliding_window":
        title = "Two-Pointer Dynamic Sliding Window"
        cat = "Two Pointers & Sliding Window"
        diff = "Intermediate"
        code_py = f"""def max_valid_subarray({v_data}, limit):\n    left = 0\n    current_sum = 0\n    max_len = 0\n    for right in range(len({v_data})):\n        current_sum += {v_data}[right]\n        while current_sum > limit and left <= right:\n            current_sum -= {v_data}[left]\n            left += 1\n        max_len = max(max_len, right - left + 1)\n    return max_len"""
        code_cpp = f"""int maxValidSubarray(const vector<int>& {v_data}, int limit) {{\n    int left = 0, currentSum = 0, maxLen = 0;\n    for (int right = 0; right < (int){v_data}.size(); right++) {{\n        currentSum += {v_data}[right];\n        while (currentSum > limit && left <= right) {{\n            currentSum -= {v_data}[left++];\n        }}\n        maxLen = max(maxLen, right - left + 1);\n    }}\n    return maxLen;\n}}"""
        c_time = "O(n)"
        c_space = "O(1)"
        exp = "Both left and right pointers only move forward from 0 to n. The total pointer advancements across the entire array are at most 2n, yielding linear O(n) time and O(1) auxiliary space."

    elif chosen_archetype == "matrix_allocation":
        title = "Quadratic Dynamic 2D Matrix Memory Grid"
        cat = "Memory Allocation"
        diff = "Beginner"
        code_py = f"""def build_distance_grid(n):\n    grid = []\n    for i in range(n):\n        row = [abs(i - j) for j in range(n)]\n        grid.append(row)\n    return grid"""
        code_cpp = f"""vector<vector<int>> buildDistanceGrid(int n) {{\n    vector<vector<int>> grid(n, vector<int>(n, 0));\n    for (int i = 0; i < n; i++) {{\n        for (int j = 0; j < n; j++) {{\n            grid[i][j] = abs(i - j);\n        }}\n    }}\n    return grid;\n}}"""
        c_time = "O(n²)"
        c_space = "O(n²)"
        exp = "Allocating and filling an n x n 2D grid populates exactly n² distinct elements, requiring O(n²) time and O(n²) auxiliary heap memory."

    elif chosen_archetype == "string_slicing_trap":
        title = "String Slicing Subarray Immutability Trap"
        cat = "Memory Allocation & Strings"
        diff = "Intermediate"
        code_py = f"""def accumulate_prefixes(s):\n    # Python strings are immutable\n    result = []\n    curr = ""\n    for char in s:\n        curr = curr + char  # Allocates new string of size len(curr)\n        result.append(curr)\n    return result"""
        code_cpp = f"""vector<string> accumulatePrefixes(const string& s) {{\n    vector<string> result;\n    string curr = "";\n    for (char c : s) {{\n        curr += c;\n        result.push_back(curr); // Copies string of size len(curr)\n    }}\n    return result;\n}}"""
        c_time = "O(n²)"
        c_space = "O(n²)"
        exp = "Prefix copying allocates strings of length 1, 2, ..., n. The cumulative characters copied are 1 + 2 + ... + n = n(n+1)/2 = O(n²) time and O(n²) space."

    elif chosen_archetype == "bit_kernighan":
        title = "Brian Kernighan's Bit Manipulation Count"
        cat = "Bit Manipulation"
        diff = "Beginner"
        code_py = f"""def count_set_bits(n):\n    count = 0\n    while n > 0:\n        n &= (n - 1)  # Clears lowest set bit\n        count += 1\n    return count"""
        code_cpp = f"""int countSetBits(unsigned int n) {{\n    int count = 0;\n    while (n > 0) {{\n        n &= (n - 1);\n        count++;\n    }}\n    return count;\n}}"""
        c_time = "O(log n)"
        c_space = "O(1)"
        exp = "Each iteration clears one set bit of n. Since an integer has at most ⌊log₂(n)⌋ + 1 bits, the while loop executes in at most O(log n) steps with O(1) space."

    else:  # log_squared
        title = "Doubly Multiplied Log-Squared Loop"
        cat = "Logarithmic Complexity"
        diff = "Advanced"
        code_py = f"""def log_squared_counter(n):\n    total = 0\n    i = 1\n    while i < n:\n        j = 1\n        while j < n:\n            total += 1\n            j *= {base_mult}\n        i *= {base_mult}\n    return total"""
        code_cpp = f"""int logSquaredCounter(int n) {{\n    int total = 0;\n    for (int i = 1; i < n; i *= {base_mult}) {{\n        for (int j = 1; j < n; j *= {base_mult}) {{\n            total++;\n        }}\n    }}\n    return total;\n}}"""
        c_time = "O(log² n)"
        c_space = "O(1)"
        exp = f"Both loops multiply their indices by {base_mult} at each step. Outer runs log_{base_mult}(n) times, inner runs log_{base_mult}(n) times. Total iterations = (log n)² = O(log² n) with O(1) space."

    code = code_cpp if lang == "cpp" else code_py

    time_options_pool = ["O(1)", "O(log n)", "O(√n)", "O(∛n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2^n)", "O(3^n)", "O(log² n)"]
    space_options_pool = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"]

    # Select 4-5 options ensuring correct answer is included
    distractor_time = [opt for opt in time_options_pool if opt != c_time]
    random.shuffle(distractor_time)
    final_time_opts = distractor_time[:4] + [c_time]
    random.shuffle(final_time_opts)

    distractor_space = [opt for opt in space_options_pool if opt != c_space]
    random.shuffle(distractor_space)
    final_space_opts = distractor_space[:3] + [c_space]
    random.shuffle(final_space_opts)

    item = QuizQuestionItem(
        id=qid,
        title=title,
        category=cat,
        difficulty=diff,
        code_snippet=code,
        language=lang,
        time_options=final_time_opts,
        space_options=final_space_opts,
        correct_time=c_time,
        correct_space=c_space,
        explanation=exp,
        source="procedural"
    )
    DYNAMIC_QUESTIONS_CACHE[qid] = item
    return item


@router.get("/questions", response_model=List[QuizQuestionItem])
async def list_quiz_questions(category: Optional[str] = None):
    if category and category != "all":
        return [q for q in QUIZ_BANK if q.category.lower() == category.lower()]
    return QUIZ_BANK


@router.post("/generate", response_model=QuizQuestionItem)
async def generate_dynamic_question(payload: QuizGenerateRequest):
    """Generates an infinite dynamic unique question using Multi-LLM AI or procedural grammar engine."""
    exclude = payload.exclude_ids or []
    
    # 1. Attempt AI Generation (Gemini / OpenAI / Mistral)
    ai_question = await generate_with_ai(payload.category, payload.difficulty, payload.language or "python", exclude)
    if ai_question and ai_question.id not in exclude:
        return ai_question

    # 2. Fall back to Procedural Combinatorial Engine (Infinite variations)
    return generate_procedural_question(payload.category, payload.difficulty, payload.language or "python", exclude)


@router.get("/random", response_model=QuizQuestionItem)
async def get_random_quiz_question():
    """Returns a unique dynamic question every time."""
    ai_question = await generate_with_ai(None, None, "python")
    if ai_question:
        return ai_question
    return generate_procedural_question()


@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_quiz_answer(payload: QuizSubmitRequest):
    # Lookup in dynamic cache or static bank
    question = DYNAMIC_QUESTIONS_CACHE.get(payload.question_id)
    if not question:
        question = next((q for q in QUIZ_BANK if q.id == payload.question_id), None)
        
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{payload.question_id}' not found."
        )

    is_time_correct = payload.selected_time.strip() == question.correct_time.strip()
    is_space_correct = payload.selected_space.strip() == question.correct_space.strip()
    is_fully_correct = is_time_correct and is_space_correct

    score_delta = 100 if is_fully_correct else (50 if (is_time_correct or is_space_correct) else 0)

    return QuizSubmitResponse(
        is_time_correct=is_time_correct,
        is_space_correct=is_space_correct,
        is_fully_correct=is_fully_correct,
        correct_time=question.correct_time,
        correct_space=question.correct_space,
        explanation=question.explanation,
        score_delta=score_delta
    )

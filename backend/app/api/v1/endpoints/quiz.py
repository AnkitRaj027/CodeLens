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


class QuizGenerateRequest(BaseModel):
    category: Optional[str] = None
    difficulty: Optional[str] = None
    language: Optional[str] = "python"


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

# Built-in base pool
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
        explanation="The inner loop runs 0 + 1 + 2 + ... + (n-1) times, which evaluates to n(n-1)/2 = O(n²) total iterations. Only scalar integer variables are allocated, giving O(1) auxiliary space."
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
        explanation="Each function invocation spawns 2 recursive branches of depth n without memoization, generating ~2^n total function calls. The maximum recursion call stack depth is n, yielding O(n) space complexity."
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
        explanation="The variable n is halved on every iteration: n, n/2, n/4, ..., 1. The total number of steps is log₂(n) = O(log n). No dynamic heap memory or recursion stack is used (O(1) space)."
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
        explanation="The code allocates an n x n 2D grid containing n² total elements, requiring O(n²) auxiliary heap memory and O(n²) time to construct."
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
        explanation="By Case 2 of Master Theorem, T(n) = 2T(n/2) + O(n) where a=2, b=2, d=1. Since log₂(2) = 1 = d, the time complexity is O(n log n). The merge step allocates O(n) auxiliary memory for subarray merging."
    )
]

# Register base questions into dynamic cache
for q in QUIZ_BANK:
    DYNAMIC_QUESTIONS_CACHE[q.id] = q


async def generate_with_ai(category: Optional[str], difficulty: Optional[str], language: str) -> Optional[QuizQuestionItem]:
    """Generates a novel algorithmic challenge via Mistral AI."""
    if not settings.MISTRAL_API_KEY:
        return None

    cat = category or random.choice(["Two Pointers", "Divide & Conquer", "Dynamic Programming", "Sliding Window", "Graph Traversal", "Bit Manipulation", "Nested Loops", "Trees & Recursion"])
    diff = difficulty or random.choice(["Beginner", "Intermediate", "Advanced"])
    lang = language if language in ["python", "cpp"] else "python"

    system_prompt = """You are an expert DSA Interviewer and Algorithm Professor.
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
  "explanation": "Clear, mathematical 2-3 sentence proof explaining why the time and space complexities are correct."
}"""

    user_prompt = f"Create a UNIQUE {diff} complexity challenge in {lang} covering the topic '{cat}'. Ensure correct_time is present in time_options, and correct_space is present in space_options."

    payload = {
        "model": "mistral-small-latest",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.7,  # Moderate creativity
        "max_tokens": 1000,
        "response_format": {"type": "json_object"}
    }

    headers = {
        "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post("https://api.mistral.ai/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = json.loads(data["choices"][0]["message"]["content"])
                
                # Assign unique ID
                qid = f"dyn_{uuid.uuid4().hex[:8]}"
                item = QuizQuestionItem(
                    id=qid,
                    title=content.get("title", f"Dynamic {cat} Challenge"),
                    category=content.get("category", cat),
                    difficulty=content.get("difficulty", diff),
                    code_snippet=content.get("code_snippet", ""),
                    language=content.get("language", lang),
                    time_options=content.get("time_options", ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"]),
                    space_options=content.get("space_options", ["O(1)", "O(log n)", "O(n)", "O(n²)"]),
                    correct_time=content.get("correct_time", "O(n)"),
                    correct_space=content.get("correct_space", "O(1)"),
                    explanation=content.get("explanation", "")
                )
                DYNAMIC_QUESTIONS_CACHE[qid] = item
                return item
    except Exception as e:
        logger.warning(f"AI question generation failed: {e}")
        return None


def generate_procedural_question(category: Optional[str] = None, difficulty: Optional[str] = None, language: str = "python") -> QuizQuestionItem:
    """Procedural generator for offline unique questions."""
    qid = f"proc_{uuid.uuid4().hex[:8]}"
    var_a = random.choice(["items", "records", "nodes", "elements", "values", "data"])
    step = random.choice([2, 3, 4])
    mult = random.choice([2, 5, 10])

    templates = [
        # 1. Logarithmic stepped loop
        {
            "title": f"Step Division Traversal (/{step})",
            "category": "Divide & Conquer",
            "difficulty": "Beginner",
            "code_py": f"""def count_intervals(n):\n    steps = 0\n    while n > 0:\n        steps += 1\n        n //= {step}\n    return steps""",
            "code_cpp": f"""int countIntervals(int n) {{\n    int steps = 0;\n    while (n > 0) {{\n        steps++;\n        n /= {step};\n    }}\n    return steps;\n}}""",
            "time": "O(log n)",
            "space": "O(1)",
            "explanation": f"The loop divides the input size by {step} at each iteration, completing in log_{step}(n) = O(log n) total steps with O(1) space."
        },
        # 2. Quadratic pair check
        {
            "title": "Pairwise Difference Filter",
            "category": "Two Pointers & Loops",
            "difficulty": "Intermediate",
            "code_py": f"""def count_close_pairs({var_a}, threshold):\n    count = 0\n    for i in range(len({var_a})):\n        for j in range(i + 1, len({var_a})):\n            if abs({var_a}[i] - {var_a}[j]) <= threshold:\n                count += 1\n    return count""",
            "code_cpp": f"""int countClosePairs(const std::vector<int>& {var_a}, int threshold) {{\n    int count = 0;\n    for (size_t i = 0; i < {var_a}.size(); ++i) {{\n        for (size_t j = i + 1; j < {var_a}.size(); ++j) {{\n            if (std::abs({var_a}[i] - {var_a}[j]) <= threshold) count++;\n        }}\n    }}\n    return count;\n}}""",
            "time": "O(n²)",
            "space": "O(1)",
            "explanation": "Compares every distinct pair of elements across nested loops (n*(n-1)/2 iterations), resulting in O(n²) time complexity."
        },
        # 3. Linear frequency map
        {
            "title": "Frequency Lookup Map",
            "category": "Hash Tables & Memory",
            "difficulty": "Beginner",
            "code_py": f"""def build_frequency_map({var_a}):\n    freq = {{}}\n    for val in {var_a}:\n        freq[val] = freq.get(val, 0) + 1\n    return freq""",
            "code_cpp": f"""std::unordered_map<int, int> buildFrequencyMap(const std::vector<int>& {var_a}) {{\n    std::unordered_map<int, int> freq;\n    for (int val : {var_a}) {{\n        freq[val]++;\n    }}\n    return freq;\n}}""",
            "time": "O(n)",
            "space": "O(n)",
            "explanation": "Iterates through the n elements once in linear O(n) time, allocating up to n keys in the hash table requiring O(n) auxiliary space."
        },
        # 4. Multiplied Linearithmic loop
        {
            "title": "Log-Stepped Nested Multiplier",
            "category": "Nested Complexity",
            "difficulty": "Advanced",
            "code_py": f"""def compute_metric(n):\n    total = 0\n    for i in range(n):\n        j = 1\n        while j < n:\n            total += i + j\n            j *= {mult}\n    return total""",
            "code_cpp": f"""long long computeMetric(int n) {{\n    long long total = 0;\n    for (int i = 0; i < n; i++) {{\n        int j = 1;\n        while (j < n) {{\n            total += i + j;\n            j *= {mult};\n        }}\n    }}\n    return total;\n}}""",
            "time": "O(n log n)",
            "space": "O(1)",
            "explanation": f"The outer loop runs n times, and the inner loop multiplies j by {mult} per iteration (running log_{mult}(n) times), resulting in O(n log n) total time."
        }
    ]

    selected = random.choice(templates)
    lang = "cpp" if language == "cpp" else "python"
    code = selected["code_cpp"] if lang == "cpp" else selected["code_py"]

    item = QuizQuestionItem(
        id=qid,
        title=selected["title"],
        category=selected["category"],
        difficulty=selected["difficulty"],
        code_snippet=code,
        language=lang,
        time_options=["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
        space_options=["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correct_time=selected["time"],
        correct_space=selected["space"],
        explanation=selected["explanation"]
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
    """Generates a dynamic unique question using Mistral AI or procedural engine."""
    ai_question = await generate_with_ai(payload.category, payload.difficulty, payload.language or "python")
    if ai_question:
        return ai_question
    return generate_procedural_question(payload.category, payload.difficulty, payload.language or "python")


@router.get("/random", response_model=QuizQuestionItem)
async def get_random_quiz_question():
    """Returns a unique dynamic question every time."""
    # Attempt AI generation first, fallback to procedural
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

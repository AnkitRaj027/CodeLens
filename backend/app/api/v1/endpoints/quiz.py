import random
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

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


@router.get("/questions", response_model=List[QuizQuestionItem])
async def list_quiz_questions(category: Optional[str] = None):
    if category and category != "all":
        return [q for q in QUIZ_BANK if q.category.lower() == category.lower()]
    return QUIZ_BANK


@router.get("/random", response_model=QuizQuestionItem)
async def get_random_quiz_question():
    return random.choice(QUIZ_BANK)


@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_quiz_answer(payload: QuizSubmitRequest):
    question = next((q for q in QUIZ_BANK if q.id == payload.question_id), None)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question '{payload.question_id}' not found."
        )

    is_time_correct = payload.selected_time.strip() == question.correct_time
    is_space_correct = payload.selected_space.strip() == question.correct_space
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

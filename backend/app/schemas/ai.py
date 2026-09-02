from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class AIExplainRequest(BaseModel):
    code: str
    language: str = "python"
    time_complexity: str
    space_complexity: str
    confidence: str
    deterministic_findings: Optional[Dict[str, Any]] = None
    mode: str = "intermediate"  # "beginner", "intermediate", "advanced", "dsa_student"
    question: Optional[str] = None  # Optional specific user question (e.g. "Why is this O(n)?")


class OptimizedAlternative(BaseModel):
    has_optimization: bool
    optimized_code: Optional[str] = None
    optimized_time_complexity: Optional[str] = None
    optimized_space_complexity: Optional[str] = None
    technique: Optional[str] = None  # e.g. "Hash Map Lookup", "Two Pointers"
    tradeoff_explanation: Optional[str] = None


class AIExplainResponse(BaseModel):
    explanation_mode: str
    summary: str
    step_by_step_reasoning: List[str]
    why_this_complexity: str
    what_happens_if_n_doubles: str
    optimization: Optional[OptimizedAlternative] = None
    learning_takeaway: str


class AIChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class AIChatRequest(BaseModel):
    code: str
    language: str = "python"
    time_complexity: str
    space_complexity: str
    confidence: str = "HIGH"
    messages: List[AIChatMessage] = []
    question: str


class AIChatResponse(BaseModel):
    answer: str
    suggested_followups: List[str] = []

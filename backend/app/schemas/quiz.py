from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel


class QuizOption(BaseModel):
    id: str  # "A", "B", "C", "D"
    text: str


class QuizQuestionResponse(BaseModel):
    id: str
    topic_id: str
    difficulty: str
    question_prompt: str
    code_snippet: Optional[str] = None
    language: str
    options: List[QuizOption]
    # Note: correct_option_id is hidden during quiz presentation!


class QuizSubmitRequest(BaseModel):
    question_id: str
    selected_option_id: str
    time_taken_seconds: Optional[int] = 0


class QuizSubmitResponse(BaseModel):
    is_correct: bool
    correct_option_id: str
    detailed_explanation: str
    user_score_update: Optional[Dict[str, Any]] = None


class TopicResponse(BaseModel):
    id: str
    title: str
    category: str
    description: str
    content_blocks: Optional[Dict[str, Any]] = None
    order_index: int
    user_mastery: Optional[int] = 0

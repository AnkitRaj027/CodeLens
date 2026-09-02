from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import AIExplainRequest, AIExplainResponse, AIChatRequest, AIChatResponse
from app.services.ai_service import AIService

router = APIRouter()


@router.post("/explain", response_model=AIExplainResponse)
async def explain_complexity(request: AIExplainRequest):
    """
    Generate a grounded AI pedagogical explanation constrained by deterministic static AST findings.
    Supports Beginner, Intermediate, Advanced, and DSA Student modes.
    """
    if not request.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source code cannot be empty."
        )
    return await AIService.generate_explanation(request)


@router.post("/chat", response_model=AIChatResponse)
async def chat_with_tutor(request: AIChatRequest):
    """
    Interactive multi-turn conversation with the AI DSA Tutor with AST grounding constraint.
    """
    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )
    return await AIService.generate_chat_response(request)

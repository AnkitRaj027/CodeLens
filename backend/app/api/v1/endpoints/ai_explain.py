from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import AIExplainRequest, AIExplainResponse
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

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.api.deps import get_db, get_optional_current_user, get_current_user
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.analysis import (
    StaticAnalysisRequest,
    StaticAnalysisResponse,
    SaveAnalysisRequest,
    AnalysisResponse
)
from app.services.analysis_service import AnalysisService

router = APIRouter()


@router.post("/static", response_model=StaticAnalysisResponse)
async def analyze_static_code(request: StaticAnalysisRequest):
    """
    Deterministically analyze source code for Time and Space Complexity using AST parsing.
    """
    if not request.code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source code cannot be empty."
        )
    return AnalysisService.analyze_code(request)


@router.post("/save", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
async def save_analysis(
    analysis_in: SaveAnalysisRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Save an analysis session to user history.
    """
    new_analysis = Analysis(
        user_id=current_user.id if current_user else None,
        title=analysis_in.title or "Untitled Analysis",
        language=analysis_in.language,
        source_code=analysis_in.source_code,
        time_complexity=analysis_in.time_complexity,
        space_complexity=analysis_in.space_complexity,
        auxiliary_space=analysis_in.auxiliary_space,
        recursion_stack=analysis_in.recursion_stack,
        confidence=analysis_in.confidence,
        confidence_reason=analysis_in.confidence_reason,
        deterministic_findings=analysis_in.deterministic_findings,
        line_by_line_analysis=analysis_in.line_by_line_analysis,
        ast_tree_data=analysis_in.ast_tree_data,
        ai_explanation=analysis_in.ai_explanation,
        optimized_version=analysis_in.optimized_version
    )
    db.add(new_analysis)
    await db.commit()
    await db.refresh(new_analysis)
    return AnalysisResponse.model_validate(new_analysis)

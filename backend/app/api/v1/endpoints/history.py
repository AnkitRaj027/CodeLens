from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.api.deps import get_optional_current_user
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.analysis import AnalysisResponse, SaveAnalysisRequest

router = APIRouter()


@router.get("/", response_model=List[AnalysisResponse])
async def list_analyses(
    language: Optional[str] = None,
    time_complexity: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    query = select(Analysis).order_by(desc(Analysis.created_at)).limit(limit)
    
    if current_user:
        query = query.where(Analysis.user_id == current_user.id)
    
    if language:
        query = query.where(Analysis.language == language.lower())
    if time_complexity:
        query = query.where(Analysis.time_complexity == time_complexity)
    if search:
        query = query.where(Analysis.title.ilike(f"%{search}%") | Analysis.source_code.ilike(f"%{search}%"))

    result = await db.execute(query)
    analyses = result.scalars().all()
    return analyses


@router.get("/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
):
    query = select(Analysis).where(Analysis.id == analysis_id)
    result = await db.execute(query)
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found."
        )
    return analysis


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db),
):
    query = select(Analysis).where(Analysis.id == analysis_id)
    result = await db.execute(query)
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis record not found."
        )
    
    await db.delete(analysis)
    await db.commit()
    return None

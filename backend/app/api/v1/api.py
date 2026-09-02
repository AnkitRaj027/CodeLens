from fastapi import APIRouter
from app.api.v1.endpoints import auth, analyze, ai_explain, history, curriculum, quiz

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["Complexity Analysis"])
api_router.include_router(ai_explain.router, prefix="/ai", tags=["Grounded AI Pedagogical Assistant"])
api_router.include_router(history.router, prefix="/history", tags=["Analysis History Workbench"])
api_router.include_router(curriculum.router, prefix="/curriculum", tags=["Curriculum & Topics"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["Interactive Quiz & Practice Arena"])

from fastapi import APIRouter
from app.api.v1.endpoints import auth, analyze

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["Complexity Analysis"])

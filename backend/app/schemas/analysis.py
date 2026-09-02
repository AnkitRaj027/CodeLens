from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class LineFinding(BaseModel):
    line_number: int
    code: str
    complexity: str
    role: str  # e.g., "OUTER_LOOP", "INNER_LOOP", "RECURSION_CALL", "CONSTANT_BODY", "ALLOCATION"
    explanation: str


class ASTNodeVisual(BaseModel):
    id: str
    name: str
    type: str
    complexity: Optional[str] = None
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    children: List["ASTNodeVisual"] = []


ASTNodeVisual.model_rebuild()


class DeterministicSummary(BaseModel):
    total_loops: int = 0
    max_loop_nesting_depth: int = 0
    has_recursion: bool = False
    recursive_functions: List[str] = []
    recursion_depth_estimate: Optional[str] = None
    allocated_structures: List[Dict[str, Any]] = []
    function_calls: List[str] = []


class StaticAnalysisRequest(BaseModel):
    code: str = Field(..., max_length=100000, description="Source code to analyze")
    language: str = Field("python", description="Language: python or cpp")


class StaticAnalysisResponse(BaseModel):
    time_complexity: str
    space_complexity: str
    auxiliary_space: str
    recursion_stack: str
    confidence: str  # HIGH, MEDIUM, LOW
    confidence_reason: str
    deterministic_summary: DeterministicSummary
    line_findings: List[LineFinding]
    ast_tree: ASTNodeVisual
    summary_explanation: str


class SaveAnalysisRequest(BaseModel):
    title: Optional[str] = "Untitled Analysis"
    language: str
    source_code: str
    time_complexity: str
    space_complexity: str
    auxiliary_space: Optional[str] = None
    recursion_stack: Optional[str] = None
    confidence: str
    confidence_reason: Optional[str] = None
    deterministic_findings: Optional[Dict[str, Any]] = None
    line_by_line_analysis: Optional[List[Dict[str, Any]]] = None
    ast_tree_data: Optional[Dict[str, Any]] = None
    ai_explanation: Optional[Dict[str, Any]] = None
    optimized_version: Optional[Dict[str, Any]] = None


class AnalysisResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    language: str
    source_code: str
    time_complexity: str
    space_complexity: str
    auxiliary_space: Optional[str] = None
    recursion_stack: Optional[str] = None
    confidence: str
    confidence_reason: Optional[str] = None
    deterministic_findings: Optional[Dict[str, Any]] = None
    line_by_line_analysis: Optional[List[Dict[str, Any]]] = None
    ast_tree_data: Optional[Dict[str, Any]] = None
    ai_explanation: Optional[Dict[str, Any]] = None
    optimized_version: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

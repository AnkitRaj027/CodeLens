import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), default="Untitled Analysis")
    language = Column(String(50), nullable=False, default="python")
    source_code = Column(Text, nullable=False)
    
    # Complexity metrics
    time_complexity = Column(String(50), nullable=False)
    space_complexity = Column(String(50), nullable=False)
    auxiliary_space = Column(String(50), nullable=True)
    recursion_stack = Column(String(50), nullable=True)
    confidence = Column(String(20), nullable=False, default="HIGH")  # HIGH, MEDIUM, LOW
    confidence_reason = Column(Text, nullable=True)
    
    # Detailed JSON payloads
    deterministic_findings = Column(JSON, nullable=True)
    line_by_line_analysis = Column(JSON, nullable=True)
    ast_tree_data = Column(JSON, nullable=True)
    ai_explanation = Column(JSON, nullable=True)
    optimized_version = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="analyses")

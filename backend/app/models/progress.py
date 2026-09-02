import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(100), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    mastery_percentage = Column(Integer, default=0)
    analyses_completed = Column(Integer, default=0)
    quizzes_passed = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="learning_progress")
    topic = relationship("Topic", back_populates="progress")

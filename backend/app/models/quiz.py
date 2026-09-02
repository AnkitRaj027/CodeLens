import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(100), primary_key=True)  # e.g., 'time-complexity', 'recursion'
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # 'foundations', 'algorithms', 'data-structures'
    description = Column(Text, nullable=False)
    content_blocks = Column(JSON, nullable=True)
    order_index = Column(Integer, default=0)

    # Relationships
    questions = relationship("QuizQuestion", back_populates="topic", cascade="all, delete-orphan")
    progress = relationship("LearningProgress", back_populates="topic", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    topic_id = Column(String(100), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    difficulty = Column(String(20), nullable=False, default="BEGINNER")  # BEGINNER, INTERMEDIATE, ADVANCED
    question_prompt = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    language = Column(String(50), default="python")
    options = Column(JSON, nullable=False)  # list of {"id": "A", "text": "O(n)"}
    correct_option_id = Column(String(10), nullable=False)
    detailed_explanation = Column(Text, nullable=False)

    # Relationships
    topic = relationship("Topic", back_populates="questions")
    attempts = relationship("QuizAttempt", back_populates="question", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_id = Column(String(10), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    time_taken_seconds = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    question = relationship("QuizQuestion", back_populates="attempts")

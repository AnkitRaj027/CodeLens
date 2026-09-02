import logging
from app.db.base import Base
from app.db.session import engine
import app.models  # Ensure all models are registered

logger = logging.getLogger(__name__)


async def init_db():
    async with engine.begin() as conn:
        logger.info("Creating database tables...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully.")

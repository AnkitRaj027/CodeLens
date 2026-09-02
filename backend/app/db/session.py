import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.engine.url import make_url
from app.core.config import settings


def get_db_url_and_connect_args(raw_url: str):
    u = make_url(raw_url)
    connect_args = {}

    if u.drivername.startswith("postgresql"):
        query = dict(u.query)
        # Render, Neon, Supabase, etc. append ?sslmode=require
        # asyncpg does NOT take 'sslmode' as a parameter; it requires 'ssl'
        sslmode = query.pop("sslmode", None) or query.pop("ssl", None)
        u = u.set(drivername="postgresql+asyncpg", query=query)

        # Enable SSL for remote cloud databases or when sslmode was specified
        if sslmode or (u.host and u.host not in ("localhost", "127.0.0.1")):
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            connect_args["ssl"] = ctx

    elif u.drivername.startswith("sqlite"):
        if not u.drivername.startswith("sqlite+aiosqlite"):
            u = u.set(drivername="sqlite+aiosqlite")
        connect_args["check_same_thread"] = False

    return u, connect_args


_db_url, _connect_args = get_db_url_and_connect_args(settings.DATABASE_URL)

engine = create_async_engine(
    _db_url,
    echo=False,
    future=True,
    connect_args=_connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

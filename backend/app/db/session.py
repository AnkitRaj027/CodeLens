import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.engine.url import make_url
from app.core.config import settings


def get_db_url_and_connect_args(raw_url: str):
    u = make_url(raw_url)
    connect_args = {}

    if u.drivername.startswith("postgresql"):
        query = dict(u.query)
        # Cloud providers (Neon, Render, Supabase) append libpq query flags like
        # ?sslmode=require&channel_binding=prefer which asyncpg does not accept as kwargs.
        ssl_requested = any(k in query for k in ("sslmode", "ssl", "channel_binding"))

        # asyncpg connect() only accepts specific kwargs. Whitelist only supported params.
        valid_asyncpg_params = {
            "server_settings", "command_timeout", "statement_cache_size",
            "max_cached_statement_lifetime", "max_cacheable_statement_size",
            "target_session_attrs"
        }
        filtered_query = {k: v for k, v in query.items() if k in valid_asyncpg_params}
        u = u.set(drivername="postgresql+asyncpg", query=filtered_query)

        # Enable SSL for remote cloud databases or when ssl was requested
        if ssl_requested or (u.host and u.host not in ("localhost", "127.0.0.1")):
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

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger("app.database")

# Enable SQLite thread-safety option
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=(settings.ENVIRONMENT == "development"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency generator that provides a transactional database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database tables and ensure directories exist.
    """
    logger.info("Initializing database and creating tables...")
    settings.ensure_directories()
    # Import models so Base.metadata knows about them
    from app.models import user, chat, evidence, complaint, nch_guideline  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialization complete.")

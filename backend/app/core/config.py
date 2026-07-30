import os
from pathlib import Path
from typing import List


def load_dotenv():
    # Scan for .env file in the workspace root directory
    env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        k, v = parts[0].strip(), parts[1].strip()
                        if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                            v = v[1:-1]
                        os.environ[k] = v
        except Exception:
            pass


# Execute local environment loading
load_dotenv()


class Settings:
    """
    Centralized configuration settings for the AI Consumer Complaint & NCH Guidance System.
    Loads settings from environment variables with sensible defaults for local development.
    """
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "AI Consumer Complaint & NCH Guidance System")
    VERSION: str = os.getenv("VERSION", "1.0.0")
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Base workspace paths (points to repo root: /home/user)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOADS_DIR: Path = DATA_DIR / "uploads"
    GENERATED_DIR: Path = DATA_DIR / "generated"
    VECTOR_STORE_DIR: Path = DATA_DIR / "vector_store"
    NCH_CORPUS_DIR: Path = DATA_DIR / "nch_corpus"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{DATA_DIR}/app.db"
    )

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
        "*",
    ]

    # Security / Auth (Milestone 2)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-dev-only-change-in-prod")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # RAG / AI (Milestones 3, 4, 6)
    LOCAL_EMBEDDING_MODEL: str = os.getenv("LOCAL_EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    LLM_MODE: str = os.getenv("LLM_MODE", "local_mock")  # local_mock, openai, or ollama

    def ensure_directories(self) -> None:
        """Ensure all required persistent data directories exist."""
        for directory in [
            self.DATA_DIR,
            self.UPLOADS_DIR,
            self.GENERATED_DIR,
            self.VECTOR_STORE_DIR,
            self.NCH_CORPUS_DIR,
        ]:
            directory.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_directories()

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.core.exceptions import AppException, app_exception_handler
from app.core.logger import get_logger
from app.api.router import api_router
from app.services.auth_service import AuthService
from app.services.rag_service import RAGService

logger = get_logger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifecycle event handler.
    Initializes database tables, ensures required directories exist, seeds default demo accounts,
    and seeds the RAG NCH guidelines corpus.
    """
    logger.info(f"Starting {settings.PROJECT_NAME} (v{settings.VERSION})...")
    init_db()
    
    # Seed default demo accounts and RAG corpus
    db = SessionLocal()
    try:
        AuthService.seed_default_users(db)
        RAGService.seed_guidelines(db)
    except Exception as e:
        logger.error(f"Error seeding default data: {e}")
    finally:
        db.close()

    yield
    logger.info("Shutting down application...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# AI Consumer Complaint & NCH Guidance System API
An end-to-end legal grievance and consumer protection platform for triage, evidence OCR extraction, RAG-backed NCH guidance, and automated legal complaint & formal notice generation (DOCX / PDF).

### Current Status: **All 10 Milestones Completed (1 to 10)** ✅
- ✅ Milestone 1: Project setup and architecture
- ✅ Milestone 2: Authentication and database
- ✅ Milestone 3: AI chat interface
- ✅ Milestone 4: NLP pipeline
- ✅ Milestone 5: OCR and evidence processing
- ✅ Milestone 6: RAG knowledge engine
- ✅ Milestone 7: Complaint generation
- ✅ Milestone 8: PDF/DOCX generation
- ✅ Milestone 9: NCH guidance module
- ✅ Milestone 10: Testing and deployment
    """,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Custom Exception Handler
app.add_exception_handler(AppException, app_exception_handler)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", summary="Root Status")
def root_status():
    """Returns basic API info and link to documentation."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "milestone": "10 - All Milestones Completed (1 to 10)",
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

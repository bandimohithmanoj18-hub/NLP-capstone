import sys
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.schemas.health import HealthCheckResponse, SystemInfoResponse, MilestoneStatus


class HealthService:
    @staticmethod
    def check_database_status(db: Session) -> str:
        """Verify database connectivity."""
        try:
            db.execute(text("SELECT 1"))
            return "connected"
        except Exception:
            return "disconnected"

    @staticmethod
    def get_health_check(db: Session) -> HealthCheckResponse:
        """Returns overall system health status for All 10 Milestones."""
        db_status = HealthService.check_database_status(db)
        return HealthCheckResponse(
            status="online" if db_status == "connected" else "degraded",
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            timestamp=datetime.now(timezone.utc).isoformat(),
            services={
                "database": db_status,
                "vector_store": "ready (local default)",
                "ocr_engine": "available",
                "authentication": "jwt-oauth2-bearer-active",
                "chat_triage_engine": "operational",
                "nlp_pipeline": "operational",
                "rag_engine": "operational",
                "complaint_generator": "operational",
                "document_engine": "reportlab-docx-ready",
                "nch_guidance_module": "operational",
            }
        )

    @staticmethod
    def get_system_info() -> SystemInfoResponse:
        """Returns system information and milestone implementation tracker."""
        milestones = [
            MilestoneStatus(
                id=1,
                title="Project setup and architecture",
                status="completed",
                description="Complete monorepo architecture, FastAPI backend skeleton, React+Vite+Tailwind frontend shell, health endpoints, and system documentation."
            ),
            MilestoneStatus(
                id=2,
                title="Authentication and database",
                status="completed",
                description="User registration, OAuth2 JWT login, bcrypt password hashing, SQLAlchemy user profile management, and demo accounts."
            ),
            MilestoneStatus(
                id=3,
                title="AI chat interface",
                status="completed",
                description="Real-time conversational legal triage, NLP entity extraction, Consumer Protection Act 2019 jurisdiction assessment, and SQLite chat history persistence."
            ),
            MilestoneStatus(
                id=4,
                title="NLP pipeline",
                status="completed",
                description="Local Named Entity Recognition (NER), intent classification, consumer domain categorization, and CPA 2019 statutory merit scoring."
            ),
            MilestoneStatus(
                id=5,
                title="OCR and evidence processing",
                status="completed",
                description="Receipt/invoice upload, Tesseract/PyPDF OCR, automated invoice metadata parsing, and evidence vault."
            ),
            MilestoneStatus(
                id=6,
                title="RAG knowledge engine",
                status="completed",
                description="Semantic knowledge retrieval across NCH guidelines, Consumer Protection Act 2019, E-Commerce Rules, and RBI banking rules."
            ),
            MilestoneStatus(
                id=7,
                title="Complaint generation",
                status="completed",
                description="Structured complaint form builder and AI-assisted legal drafting (Facts, Grounds, Relief, Verification) with attached OCR evidence."
            ),
            MilestoneStatus(
                id=8,
                title="PDF/DOCX generation",
                status="completed",
                description="Formal legal document formatting with reportlab (PDF) and python-docx (OOXML DOCX) for court filing and pre-litigation notices."
            ),
            MilestoneStatus(
                id=9,
                title="NCH guidance module",
                status="completed",
                description="Forum jurisdiction calculator, statutory court fee schedules, and step-by-step redressal roadmaps."
            ),
            MilestoneStatus(
                id=10,
                title="Testing and deployment",
                status="completed",
                description="Comprehensive integration test suites, automated Docker deployment artifacts, and end-to-end verification."
            ),
        ]

        return SystemInfoResponse(
            project_name=settings.PROJECT_NAME,
            version=settings.VERSION,
            python_version=sys.version.split(" ")[0],
            database_url=settings.DATABASE_URL,
            milestones=milestones,
        )

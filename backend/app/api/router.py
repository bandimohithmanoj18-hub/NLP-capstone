from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    chat,
    nlp,
    ocr,
    rag,
    complaints,
    documents,
    nch,
)

api_router = APIRouter()

# Milestone 1: Core Health Check & Architecture Tracker
api_router.include_router(health.router, prefix="/health", tags=["1. System Health (M1)"])

# Milestone 2: Authentication & User Profile Management
api_router.include_router(auth.router, prefix="/auth", tags=["2. Authentication (M2 - Completed)"])

# Milestone 3: AI Chat Interface & Legal Triage
api_router.include_router(chat.router, prefix="/chat", tags=["3. AI Chat Interface (M3 - Completed)"])

# Milestone 4: NLP Pipeline
api_router.include_router(nlp.router, prefix="/nlp", tags=["4. NLP Pipeline (M4 - Completed)"])

# Milestone 5: OCR & Evidence Processing
api_router.include_router(ocr.router, prefix="/ocr", tags=["5. OCR & Evidence (M5 - Completed)"])

# Milestone 6: RAG Knowledge Engine
api_router.include_router(rag.router, prefix="/rag", tags=["6. RAG Knowledge Engine (M6 - Completed)"])

# Milestone 7: Complaint Generation
api_router.include_router(complaints.router, prefix="/complaints", tags=["7. Complaint Generation (M7 - Completed)"])

# Milestone 8: Document Generation (PDF / DOCX)
api_router.include_router(documents.router, prefix="/documents", tags=["8. Document Export (M8 - Completed)"])

# Milestone 9: NCH Guidance Module
api_router.include_router(nch.router, prefix="/nch", tags=["9. NCH Guidance Module (M9 - Completed)"])

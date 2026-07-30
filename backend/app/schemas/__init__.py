"""
Pydantic v2 schemas for API validation and serialization across all 10 milestones.
"""
from app.schemas.health import HealthCheckResponse, SystemInfoResponse
from app.schemas.common import APIResponse
from app.schemas.user import UserBase, UserCreate, UserResponse
from app.schemas.auth import TokenResponse, LoginRequest, RegisterRequest, UserProfileUpdate
from app.schemas.chat import (
    ExtractedTriageEntities,
    ChatSessionCreate,
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionSummaryResponse,
    ChatSessionResponse,
)
from app.schemas.nlp import (
    ExtractedEntity,
    StatutoryPrecedent,
    NLPAnalyzeRequest,
    NLPAnalyzeResponse,
)
from app.schemas.ocr import (
    EvidenceUpdate,
    EvidenceResponse,
    OCRUploadResponse,
)
from app.schemas.rag import (
    RAGQueryRequest,
    RAGGuidelineResult,
    RAGQueryResponse,
    RAGCategoryList,
)
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintResponse,
)
from app.schemas.nch import (
    NCHGuidelineResponse,
    JurisdictionAssessmentRequest,
    CourtFeeTier,
    JurisdictionAssessmentResponse,
    RedressalStep,
)

__all__ = [
    "HealthCheckResponse",
    "SystemInfoResponse",
    "APIResponse",
    "UserBase",
    "UserCreate",
    "UserResponse",
    "TokenResponse",
    "LoginRequest",
    "RegisterRequest",
    "UserProfileUpdate",
    "ExtractedTriageEntities",
    "ChatSessionCreate",
    "ChatMessageCreate",
    "ChatMessageResponse",
    "ChatSessionSummaryResponse",
    "ChatSessionResponse",
    "ExtractedEntity",
    "StatutoryPrecedent",
    "NLPAnalyzeRequest",
    "NLPAnalyzeResponse",
    "EvidenceUpdate",
    "EvidenceResponse",
    "OCRUploadResponse",
    "RAGQueryRequest",
    "RAGGuidelineResult",
    "RAGQueryResponse",
    "RAGCategoryList",
    "ComplaintCreate",
    "ComplaintUpdate",
    "ComplaintResponse",
    "NCHGuidelineResponse",
    "JurisdictionAssessmentRequest",
    "CourtFeeTier",
    "JurisdictionAssessmentResponse",
    "RedressalStep",
]

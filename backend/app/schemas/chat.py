from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, Field


class ExtractedTriageEntities(BaseModel):
    """Structured legal triage metadata extracted from conversation."""
    merchant_name: Optional[str] = None
    claim_amount_inr: Optional[float] = None
    purchase_date: Optional[str] = None
    domain: str = "general"  # e-commerce, banking, telecom, airline, housing, general
    recommended_forum: str = "NCH_HELPLINE"  # NCH_HELPLINE, DISTRICT_COMMISSION, STATE_COMMISSION, NCDRC
    missing_clarifications: List[str] = []
    statutory_provisions: List[str] = []


class ChatSessionCreate(BaseModel):
    """Request schema to create a new chat session."""
    title: Optional[str] = "New Legal Consultation"
    domain_category: Optional[str] = None


class ChatMessageCreate(BaseModel):
    """Request schema to send a chat message."""
    content: str = Field(..., min_length=1, description="User prompt or answer to clarifying question")
    role: str = "user"
    language: Optional[str] = "en"
    api_key: Optional[str] = None
    provider: Optional[str] = "gemini"  # gemini, openai, ollama, gemma


class ChatMessageResponse(BaseModel):
    """Response schema for a single chat message."""
    id: int
    session_id: int
    role: str
    content: str
    extracted_entities_json: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ChatSessionSummaryResponse(BaseModel):
    """Lightweight summary schema for sidebar listing."""
    id: int
    title: str
    domain_category: Optional[str] = None
    created_at: Optional[datetime] = None
    message_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ChatSessionResponse(BaseModel):
    """Full chat session response including message history."""
    id: int
    title: str
    domain_category: Optional[str] = None
    created_at: Optional[datetime] = None
    messages: List[ChatMessageResponse] = []

    model_config = ConfigDict(from_attributes=True)

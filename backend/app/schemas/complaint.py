from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.ocr import EvidenceResponse


class ComplaintCreate(BaseModel):
    """Schema to create or draft a structured legal complaint."""
    title: str = Field(..., min_length=3, description="Complaint title or case subject")
    complainant_name: str
    complainant_address: Optional[str] = None
    complainant_contact: Optional[str] = None
    opposite_party_name: str
    opposite_party_address: Optional[str] = None
    opposite_party_contact: Optional[str] = None
    jurisdiction_forum: str = "DISTRICT_COMMISSION"
    claim_amount: float = 0.0
    facts: Optional[str] = None
    grounds: Optional[str] = None
    relief_sought: Optional[str] = None
    verification_clause: Optional[str] = None
    evidence_ids: List[int] = []


class ComplaintUpdate(BaseModel):
    """Schema to update an existing complaint draft."""
    title: Optional[str] = None
    status: Optional[str] = None  # DRAFT, READY, FILED
    complainant_name: Optional[str] = None
    complainant_address: Optional[str] = None
    complainant_contact: Optional[str] = None
    opposite_party_name: Optional[str] = None
    opposite_party_address: Optional[str] = None
    opposite_party_contact: Optional[str] = None
    jurisdiction_forum: Optional[str] = None
    claim_amount: Optional[float] = None
    facts: Optional[str] = None
    grounds: Optional[str] = None
    relief_sought: Optional[str] = None
    verification_clause: Optional[str] = None
    evidence_ids: Optional[List[int]] = None


class ComplaintResponse(BaseModel):
    """Full complaint response schema."""
    id: int
    user_id: Optional[int] = None
    title: str
    status: str
    complainant_name: str
    complainant_address: Optional[str] = None
    complainant_contact: Optional[str] = None
    opposite_party_name: str
    opposite_party_address: Optional[str] = None
    opposite_party_contact: Optional[str] = None
    jurisdiction_forum: str
    claim_amount: float
    facts: Optional[str] = None
    grounds: Optional[str] = None
    relief_sought: Optional[str] = None
    verification_clause: Optional[str] = None
    generated_docx_path: Optional[str] = None
    generated_pdf_path: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    evidences: List[EvidenceResponse] = []

    model_config = ConfigDict(from_attributes=True)

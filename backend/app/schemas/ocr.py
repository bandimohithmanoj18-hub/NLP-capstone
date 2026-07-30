from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class EvidenceUpdate(BaseModel):
    """Schema to update/edit extracted metadata of an evidence document."""
    extracted_merchant_name: Optional[str] = None
    extracted_invoice_number: Optional[str] = None
    extracted_invoice_date: Optional[str] = None
    extracted_amount: Optional[float] = None
    raw_ocr_text: Optional[str] = None


class EvidenceResponse(BaseModel):
    """Response schema for an uploaded evidence document."""
    id: int
    user_id: Optional[int] = None
    complaint_id: Optional[int] = None
    file_name: str
    file_type: str
    file_size_bytes: int
    raw_ocr_text: Optional[str] = None
    extracted_merchant_name: Optional[str] = None
    extracted_invoice_number: Optional[str] = None
    extracted_invoice_date: Optional[str] = None
    extracted_amount: Optional[float] = None
    confidence_score: float
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OCRUploadResponse(BaseModel):
    """Response returned upon successful file upload and OCR extraction."""
    success: bool = True
    message: str = "Document OCR processing complete."
    evidence: EvidenceResponse

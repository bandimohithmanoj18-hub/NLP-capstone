from typing import Optional
from pydantic import BaseModel, ConfigDict


class EvidenceResponse(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_size_bytes: int
    raw_ocr_text: Optional[str] = None
    extracted_merchant_name: Optional[str] = None
    extracted_invoice_number: Optional[str] = None
    extracted_invoice_date: Optional[str] = None
    extracted_amount: Optional[float] = None
    confidence_score: float

    model_config = ConfigDict(from_attributes=True)

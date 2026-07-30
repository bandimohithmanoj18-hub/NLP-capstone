from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class EvidenceDocument(Base, TimestampMixin):
    __tablename__ = "evidence_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, png, jpg, etc.
    file_size_bytes = Column(Integer, default=0)

    # OCR Extracted Metadata
    raw_ocr_text = Column(Text, nullable=True)
    extracted_merchant_name = Column(String, nullable=True)
    extracted_invoice_number = Column(String, nullable=True)
    extracted_invoice_date = Column(String, nullable=True)
    extracted_amount = Column(Float, nullable=True)
    confidence_score = Column(Float, default=0.0)

    # Relationships
    user = relationship("User", back_populates="evidences")
    complaint = relationship("Complaint", back_populates="evidences")

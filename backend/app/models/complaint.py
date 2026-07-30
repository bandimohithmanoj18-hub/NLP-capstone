from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Complaint(Base, TimestampMixin):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    status = Column(String, default="DRAFT")  # DRAFT, READY, FILED

    # Complaint Parties
    complainant_name = Column(String, nullable=False)
    complainant_address = Column(Text, nullable=True)
    complainant_contact = Column(String, nullable=True)

    opposite_party_name = Column(String, nullable=False)
    opposite_party_address = Column(Text, nullable=True)
    opposite_party_contact = Column(String, nullable=True)

    # Core Legal Content
    jurisdiction_forum = Column(String, default="DISTRICT_COMMISSION")  # DISTRICT, STATE, NCDRC, NCH_HELPLINE
    claim_amount = Column(Float, default=0.0)
    facts = Column(Text, nullable=True)
    grounds = Column(Text, nullable=True)
    relief_sought = Column(Text, nullable=True)
    verification_clause = Column(Text, nullable=True)

    # Generated Files paths
    generated_docx_path = Column(String, nullable=True)
    generated_pdf_path = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="complaints")
    evidences = relationship("EvidenceDocument", back_populates="complaint")

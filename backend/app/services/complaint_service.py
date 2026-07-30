from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.complaint import Complaint
from app.models.evidence import EvidenceDocument
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse
from app.core.logger import get_logger

logger = get_logger("app.services.complaint_service")


class ComplaintService:
    """
    Structured Legal Complaint Generator and AI Legal Drafting Engine.
    Part of **Milestone 7: Complaint generation**.
    """

    @staticmethod
    def create_complaint(
        db: Session,
        create_in: ComplaintCreate,
        user_id: Optional[int] = None,
    ) -> ComplaintResponse:
        # AI-assisted default drafting if any section is empty
        facts = create_in.facts or ComplaintService._generate_default_facts(create_in)
        grounds = create_in.grounds or ComplaintService._generate_default_grounds(create_in)
        relief = create_in.relief_sought or ComplaintService._generate_default_relief(create_in)
        verification = create_in.verification_clause or ComplaintService._generate_default_verification(create_in)

        db_complaint = Complaint(
            user_id=user_id,
            title=create_in.title,
            status="DRAFT",
            complainant_name=create_in.complainant_name,
            complainant_address=create_in.complainant_address or "Tamil Nadu, India",
            complainant_contact=create_in.complainant_contact or "+91 98765 43210",
            opposite_party_name=create_in.opposite_party_name,
            opposite_party_address=create_in.opposite_party_address or "Registered Office, India",
            opposite_party_contact=create_in.opposite_party_contact or "customer-care@oppositeparty.com",
            jurisdiction_forum=create_in.jurisdiction_forum,
            claim_amount=create_in.claim_amount,
            facts=facts,
            grounds=grounds,
            relief_sought=relief,
            verification_clause=verification,
        )
        db.add(db_complaint)
        db.commit()
        db.refresh(db_complaint)

        # Attach evidence documents if IDs provided
        if create_in.evidence_ids:
            for ev_id in create_in.evidence_ids:
                ev = db.query(EvidenceDocument).filter(EvidenceDocument.id == ev_id).first()
                if ev:
                    ev.complaint_id = db_complaint.id
                    db.add(ev)
            db.commit()
            db.refresh(db_complaint)

        logger.info(f"Created legal complaint ID {db_complaint.id}: '{db_complaint.title}' (Forum: {db_complaint.jurisdiction_forum})")
        return ComplaintResponse.model_validate(db_complaint)

    @staticmethod
    def get_user_complaints(db: Session, user_id: Optional[int] = None) -> List[ComplaintResponse]:
        query = db.query(Complaint)
        if user_id is not None:
            query = query.filter(Complaint.user_id == user_id)
        docs = query.order_by(Complaint.created_at.desc()).all()
        return [ComplaintResponse.model_validate(d) for d in docs]

    @staticmethod
    def get_complaint(db: Session, complaint_id: int) -> Optional[ComplaintResponse]:
        doc = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not doc:
            return None
        return ComplaintResponse.model_validate(doc)

    @staticmethod
    def get_complaint_orm(db: Session, complaint_id: int) -> Optional[Complaint]:
        return db.query(Complaint).filter(Complaint.id == complaint_id).first()

    @staticmethod
    def update_complaint(
        db: Session,
        complaint_id: int,
        update_in: ComplaintUpdate,
    ) -> Optional[ComplaintResponse]:
        doc = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not doc:
            return None

        for field, value in update_in.model_dump(exclude_unset=True).items():
            if hasattr(doc, field) and value is not None:
                setattr(doc, field, value)

        db.add(doc)
        db.commit()
        db.refresh(doc)
        return ComplaintResponse.model_validate(doc)

    @staticmethod
    def delete_complaint(db: Session, complaint_id: int) -> bool:
        doc = db.query(Complaint).filter(Complaint.id == complaint_id).first()
        if not doc:
            return False
        db.delete(doc)
        db.commit()
        return True

    @staticmethod
    def _generate_default_facts(create_in: ComplaintCreate) -> str:
        return (
            f"1. That the Complainant ({create_in.complainant_name}) purchased goods/services from the Opposite Party ({create_in.opposite_party_name}) for a valid consideration of ₹{create_in.claim_amount:,.2f}.\n"
            f"2. That the Opposite Party failed to render satisfactory service / delivered defective goods and refused to remedy the deficiency despite repeated communications and customer care tickets.\n"
            f"3. That the conduct of the Opposite Party has caused immense financial distress and mental agony to the Complainant."
        )

    @staticmethod
    def _generate_default_grounds(create_in: ComplaintCreate) -> str:
        return (
            f"A. DEFICIENCY IN SERVICE UNDER SECTION 2(11) OF CPA 2019:\n"
            f"The Opposite Party has failed to maintain the standard of quality and performance undertaken to be performed.\n\n"
            f"B. UNFAIR TRADE PRACTICE UNDER SECTION 2(47) OF CPA 2019:\n"
            f"The Opposite Party has adopted unfair trade practices by denying rightful consumer remedies and refunds.\n\n"
            f"C. JURISDICTION UNDER SECTION 35 OF CPA 2019:\n"
            f"The claim value of ₹{create_in.claim_amount:,.2f} falls within the pecuniary jurisdiction of the {create_in.jurisdiction_forum.replace('_', ' ').title()}."
        )

    @staticmethod
    def _generate_default_relief(create_in: ComplaintCreate) -> str:
        return (
            f"1. Direct the Opposite Party to immediately refund the disputed claim amount of ₹{create_in.claim_amount:,.2f} along with statutory interest @ 18% per annum.\n"
            f"2. Award compensation of ₹25,000/- towards mental agony, harassment, and financial distress.\n"
            f"3. Award litigation costs of ₹10,000/- to the Complainant."
        )

    @staticmethod
    def _generate_default_verification(create_in: ComplaintCreate) -> str:
        return (
            f"I, {create_in.complainant_name}, the Complainant above named, do hereby verify that the contents of paragraphs 1 to 3 of the Facts "
            f"are true to my personal knowledge and belief, and no part of it is false."
        )

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_optional_user
from app.models.user import User
from app.schemas.complaint import ComplaintCreate, ComplaintUpdate, ComplaintResponse
from app.services.complaint_service import ComplaintService

router = APIRouter()


@router.post("/draft", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED, summary="Draft structured legal complaint")
def draft_legal_complaint(
    create_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Synthesizes user grievance, extracted evidence, and RAG legal precedents into a formal
    legal complaint draft (Parties, Jurisdiction, Facts, Grounds, Relief Sought, Verification).
    Part of **Milestone 7: Complaint generation**.
    """
    user_id = current_user.id if current_user else None
    return ComplaintService.create_complaint(db, create_in, user_id=user_id)


@router.get("", response_model=List[ComplaintResponse], summary="List user's legal complaints")
def list_user_complaints(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Returns all legal complaints drafted by the active user.
    Part of **Milestone 7: Complaint generation**.
    """
    user_id = current_user.id if current_user else None
    return ComplaintService.get_user_complaints(db, user_id=user_id)


@router.get("/{complaint_id}", response_model=ComplaintResponse, summary="Get legal complaint details")
def get_complaint_details(complaint_id: int, db: Session = Depends(get_db)):
    """
    Returns full structured complaint draft including attached OCR evidence documents.
    Part of **Milestone 7: Complaint generation**.
    """
    doc = ComplaintService.get_complaint(db, complaint_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Complaint ID {complaint_id} not found.")
    return doc


@router.put("/{complaint_id}", response_model=ComplaintResponse, summary="Update complaint draft")
def update_complaint_details(
    complaint_id: int,
    update_in: ComplaintUpdate,
    db: Session = Depends(get_db),
):
    """
    Updates complaint sections (Facts, Grounds, Relief, Parties, or Status).
    Part of **Milestone 7: Complaint generation**.
    """
    doc = ComplaintService.update_complaint(db, complaint_id, update_in)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Complaint ID {complaint_id} not found.")
    return doc


@router.delete("/{complaint_id}", summary="Delete legal complaint")
def delete_legal_complaint(complaint_id: int, db: Session = Depends(get_db)):
    """
    Deletes a legal complaint draft from the SQLite database.
    Part of **Milestone 7: Complaint generation**.
    """
    success = ComplaintService.delete_complaint(db, complaint_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Complaint ID {complaint_id} not found.")
    return {"success": True, "message": f"Complaint {complaint_id} deleted successfully."}

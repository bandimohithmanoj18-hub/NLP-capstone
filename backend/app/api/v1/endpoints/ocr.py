from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_optional_user
from app.models.user import User
from app.schemas.ocr import EvidenceResponse, EvidenceUpdate, OCRUploadResponse
from app.services.ocr_service import OCRService

router = APIRouter()


@router.post("/upload", response_model=OCRUploadResponse, status_code=status.HTTP_201_CREATED, summary="Upload evidence receipt/invoice for OCR extraction")
def upload_evidence(
    file: UploadFile = File(...),
    complaint_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Uploads a document (PDF, PNG, JPG), extracts raw OCR text, automatically parses invoice amount/date/merchant,
    and attaches to an evidence vault.
    Part of **Milestone 5: OCR and evidence processing**.
    """
    user_id = current_user.id if current_user else None
    evidence = OCRService.process_upload(db, file, user_id=user_id, complaint_id=complaint_id)
    return OCRUploadResponse(success=True, message="Document OCR processing complete.", evidence=evidence)


@router.get("/evidence", response_model=List[EvidenceResponse], summary="List user's uploaded evidence documents")
def list_evidence(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Returns all evidence documents uploaded by the active user (or guest vault).
    Part of **Milestone 5: OCR and evidence processing**.
    """
    user_id = current_user.id if current_user else None
    return OCRService.get_user_evidences(db, user_id=user_id)


@router.get("/evidence/{evidence_id}", response_model=EvidenceResponse, summary="Get evidence OCR details")
def get_evidence_document(evidence_id: int, db: Session = Depends(get_db)):
    """
    Returns extracted text, confidence score, and structured invoice metadata for an evidence item.
    Part of **Milestone 5: OCR and evidence processing**.
    """
    doc = OCRService.get_evidence(db, evidence_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evidence ID {evidence_id} not found.")
    return EvidenceResponse.model_validate(doc)


@router.put("/evidence/{evidence_id}", response_model=EvidenceResponse, summary="Update extracted OCR metadata")
def update_evidence_document(
    evidence_id: int,
    update_in: EvidenceUpdate,
    db: Session = Depends(get_db),
):
    """
    Allows manual edit override of extracted invoice amount, merchant name, or date.
    Part of **Milestone 5: OCR and evidence processing**.
    """
    doc = OCRService.update_evidence(db, evidence_id, update_in)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evidence ID {evidence_id} not found.")
    return doc


@router.delete("/evidence/{evidence_id}", summary="Delete evidence document")
def delete_evidence_document(evidence_id: int, db: Session = Depends(get_db)):
    """
    Deletes an evidence document and removes physical uploaded file.
    Part of **Milestone 5: OCR and evidence processing**.
    """
    success = OCRService.delete_evidence(db, evidence_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Evidence ID {evidence_id} not found.")
    return {"success": True, "message": f"Evidence {evidence_id} deleted successfully."}

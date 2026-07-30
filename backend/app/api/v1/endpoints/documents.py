import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.document_service import DocumentService

router = APIRouter()


@router.post("/export/{complaint_id}", summary="Export DOCX/PDF complaint documents")
def export_complaint_documents(
    complaint_id: int,
    db: Session = Depends(get_db),
):
    """
    Generates formatted modern OOXML `.docx` and high-resolution `.pdf` documents
    for a complaint, ready for formal filing or notice dispatch.
    Part of **Milestone 8: PDF/DOCX generation**.
    """
    try:
        docx_path, pdf_path = DocumentService.generate_complaint_documents(db, complaint_id)
        return {
            "success": True,
            "complaint_id": complaint_id,
            "docx_file": os.path.basename(docx_path),
            "pdf_file": os.path.basename(pdf_path),
            "download_docx_url": f"/api/v1/documents/download/{complaint_id}/docx",
            "download_pdf_url": f"/api/v1/documents/download/{complaint_id}/pdf",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/download/{complaint_id}/{file_type}", summary="Download generated document file")
def download_document_file(
    complaint_id: int,
    file_type: str,
    db: Session = Depends(get_db),
):
    """
    Downloads the generated `.docx` or `.pdf` file for a complaint.
    Part of **Milestone 8: PDF/DOCX generation**.
    """
    if file_type.lower() not in ["docx", "pdf", "notice_docx", "notice_pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Use 'docx', 'pdf', 'notice_docx', or 'notice_pdf'."
        )

    try:
        if file_type.lower() in ["notice_docx", "notice_pdf"]:
            docx_path, pdf_path = DocumentService.generate_legal_notice(db, complaint_id)
            target = docx_path if file_type.lower() == "notice_docx" else pdf_path
        else:
            docx_path, pdf_path = DocumentService.generate_complaint_documents(db, complaint_id)
            target = docx_path if file_type.lower() == "docx" else pdf_path

        media_type = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            if "docx" in file_type.lower()
            else "application/pdf"
        )
        return FileResponse(
            path=target,
            filename=os.path.basename(target),
            media_type=media_type,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/notice/{complaint_id}", summary="Generate pre-litigation Legal Notice DOCX/PDF")
def generate_pre_litigation_notice(
    complaint_id: int,
    db: Session = Depends(get_db),
):
    """
    Generates a formal Pre-Litigation Legal Notice addressed to the Opposite Party.
    Part of **Milestone 8: PDF/DOCX generation**.
    """
    try:
        docx_path, pdf_path = DocumentService.generate_legal_notice(db, complaint_id)
        return {
            "success": True,
            "complaint_id": complaint_id,
            "notice_docx_file": os.path.basename(docx_path),
            "notice_pdf_file": os.path.basename(pdf_path),
            "download_docx_url": f"/api/v1/documents/download/{complaint_id}/notice_docx",
            "download_pdf_url": f"/api/v1/documents/download/{complaint_id}/notice_pdf",
            "message": "Pre-litigation legal notice generated successfully.",
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

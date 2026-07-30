import os
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_document_generation_docx_and_pdf():
    """Verify exporting OOXML (.docx) and ReportLab (.pdf) legal complaint documents."""
    # First create a complaint
    create_payload = {
        "title": "Document Generation Test Case",
        "complainant_name": "Anita Verma",
        "opposite_party_name": "Flipkart Internet Pvt. Ltd.",
        "jurisdiction_forum": "DISTRICT_COMMISSION",
        "claim_amount": 35000.0,
    }
    complaint_res = client.post("/api/v1/complaints/draft", json=create_payload)
    complaint_id = complaint_res.json()["id"]

    # Export documents
    export_res = client.post(f"/api/v1/documents/export/{complaint_id}")
    assert export_res.status_code == 200
    data = export_res.json()
    assert data["success"] is True
    assert ".docx" in data["docx_file"]
    assert ".pdf" in data["pdf_file"]

    # Verify download endpoints return HTTP 200 FileResponse
    docx_dl = client.get(f"/api/v1/documents/download/{complaint_id}/docx")
    assert docx_dl.status_code == 200
    assert len(docx_dl.content) > 500  # valid OOXML archive size

    pdf_dl = client.get(f"/api/v1/documents/download/{complaint_id}/pdf")
    assert pdf_dl.status_code == 200
    assert pdf_dl.content.startswith(b"%PDF-")  # valid PDF signature


def test_generate_pre_litigation_notice():
    """Verify generating a formal Pre-Litigation Legal Notice addressed to the Opposite Party."""
    create_payload = {
        "title": "Notice Generation Test Case",
        "complainant_name": "Rajesh Kumar",
        "opposite_party_name": "HDFC Bank Ltd.",
        "jurisdiction_forum": "DISTRICT_COMMISSION",
        "claim_amount": 75000.0,
    }
    complaint_res = client.post("/api/v1/complaints/draft", json=create_payload)
    complaint_id = complaint_res.json()["id"]

    notice_res = client.post(f"/api/v1/documents/notice/{complaint_id}")
    assert notice_res.status_code == 200
    data = notice_res.json()
    assert data["success"] is True
    assert "notice_docx_file" in data
    assert "notice_pdf_file" in data

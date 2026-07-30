import io
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_ocr_upload_and_parse():
    """Verify uploading an evidence receipt file extracts text and structured invoice metadata."""
    dummy_pdf = b"%PDF-1.4 mock amazon invoice rs. 45000 date 15/06/2026"
    files = {"file": ("amazon_invoice.pdf", io.BytesIO(dummy_pdf), "application/pdf")}

    response = client.post("/api/v1/ocr/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    evidence = data["evidence"]
    assert evidence["file_name"] == "amazon_invoice.pdf"
    assert evidence["file_type"] == "pdf"
    assert evidence["extracted_amount"] == 45000.0
    assert "Amazon" in (evidence["extracted_merchant_name"] or "")


def test_ocr_evidence_crud():
    """Verify listing, updating, and deleting evidence documents."""
    # Upload
    dummy_pdf = b"%PDF-1.4 mock receipt"
    files = {"file": ("receipt.pdf", io.BytesIO(dummy_pdf), "application/pdf")}
    up_res = client.post("/api/v1/ocr/upload", files=files)
    ev_id = up_res.json()["evidence"]["id"]

    # List
    list_res = client.get("/api/v1/ocr/evidence")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Update metadata override
    update_res = client.put(
        f"/api/v1/ocr/evidence/{ev_id}",
        json={"extracted_amount": 50000.0, "extracted_merchant_name": "Flipkart"},
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["extracted_amount"] == 50000.0
    assert updated["extracted_merchant_name"] == "Flipkart"

    # Delete
    del_res = client.delete(f"/api/v1/ocr/evidence/{ev_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

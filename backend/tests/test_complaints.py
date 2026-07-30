import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_and_manage_complaint():
    """Verify creating, retrieving, updating, and deleting a structured legal complaint."""
    create_payload = {
        "title": "Defective Refrigerator Claim against Amazon",
        "complainant_name": "Rajesh Kumar",
        "complainant_address": "Chennai, Tamil Nadu",
        "complainant_contact": "+91 98765 43210",
        "opposite_party_name": "Amazon Retail India Pvt. Ltd.",
        "opposite_party_address": "Bengaluru, Karnataka",
        "opposite_party_contact": "grievance-officer@amazon.in",
        "jurisdiction_forum": "DISTRICT_COMMISSION",
        "claim_amount": 45000.0,
    }

    # 1. Draft complaint
    post_res = client.post("/api/v1/complaints/draft", json=create_payload)
    assert post_res.status_code == 201
    complaint = post_res.json()
    assert complaint["id"] > 0
    assert complaint["status"] == "DRAFT"
    assert "DEFICIENCY IN SERVICE" in (complaint["grounds"] or "")
    assert "45,000" in (complaint["relief_sought"] or "")

    complaint_id = complaint["id"]

    # 2. List complaints
    list_res = client.get("/api/v1/complaints")
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 3. Update complaint
    update_res = client.put(
        f"/api/v1/complaints/{complaint_id}",
        json={"status": "READY", "title": "Updated Refrigerator Claim"},
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["status"] == "READY"
    assert updated["title"] == "Updated Refrigerator Claim"

    # 4. Delete complaint
    del_res = client.delete(f"/api/v1/complaints/{complaint_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True


def test_complaint_evidence_linking():
    """Verify that evidence documents can be linked and unlinked during complaint updates."""
    # 1. Create a dummy evidence
    import io
    dummy_pdf = b"%PDF-1.4 mock invoice for linking"
    files = {"file": ("linking_receipt.pdf", io.BytesIO(dummy_pdf), "application/pdf")}
    up_res = client.post("/api/v1/ocr/upload", files=files)
    assert up_res.status_code == 201
    ev_id = up_res.json()["evidence"]["id"]

    # 2. Draft complaint with linked evidence
    create_payload = {
        "title": "Evidence Linking Test Case",
        "complainant_name": "Anita Verma",
        "opposite_party_name": "Amazon",
        "jurisdiction_forum": "DISTRICT_COMMISSION",
        "claim_amount": 25000.0,
        "evidence_ids": [ev_id],
    }
    draft_res = client.post("/api/v1/complaints/draft", json=create_payload)
    assert draft_res.status_code == 201
    complaint = draft_res.json()
    assert len(complaint["evidences"]) == 1
    assert complaint["evidences"][0]["id"] == ev_id

    complaint_id = complaint["id"]

    # 3. Update complaint by unlinking the evidence (sending empty list)
    update_res = client.put(
        f"/api/v1/complaints/{complaint_id}",
        json={"evidence_ids": []},
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert len(updated["evidences"]) == 0

    # 4. Clean up complaint
    del_res = client.delete(f"/api/v1/complaints/{complaint_id}")
    assert del_res.status_code == 200


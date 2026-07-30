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

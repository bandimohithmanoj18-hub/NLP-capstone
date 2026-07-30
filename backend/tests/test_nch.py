import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_nch_assess_jurisdiction_district_commission():
    """Verify claim <= ₹50 Lakhs recommends District Commission & calculates court fee."""
    payload = {
        "claim_amount_inr": 45000.0,
        "category": "e-commerce",
        "complainant_state": "Tamil Nadu",
    }
    response = client.post("/api/v1/nch/assess-jurisdiction", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_forum"] == "NCH_HELPLINE_OR_DISTRICT_COMMISSION"
    assert data["statutory_court_fee_inr"] == 0.0
    assert len(data["next_steps"]) >= 3


def test_nch_assess_jurisdiction_state_commission():
    """Verify claim > ₹50 Lakhs up to ₹2 Crores recommends State Commission."""
    payload = {
        "claim_amount_inr": 8000000.0,  # 80 Lakhs
        "category": "housing",
        "complainant_state": "Tamil Nadu",
    }
    response = client.post("/api/v1/nch/assess-jurisdiction", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_forum"] == "STATE_COMMISSION"
    assert data["statutory_court_fee_inr"] == 2000.0


def test_nch_get_court_fees():
    """Verify court fee schedule endpoint returns all statutory fee tiers."""
    response = client.get("/api/v1/nch/court-fees")
    assert response.status_code == 200
    tiers = response.json()
    assert len(tiers) == 7
    assert tiers[0]["fee_inr"] == 0
    assert tiers[-1]["fee_inr"] == 5000


def test_nch_get_redressal_flowchart():
    """Verify step-by-step redressal roadmap from NCH Helpline to E-Daakhil court filing."""
    response = client.get("/api/v1/nch/flowchart")
    assert response.status_code == 200
    steps = response.json()
    assert len(steps) == 4
    assert steps[0]["step_number"] == 1
    assert "NCH" in steps[2]["title"] or "1915" in steps[2]["title"]

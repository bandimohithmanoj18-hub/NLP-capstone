import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_nlp_analyze_ecommerce():
    """Verify NLP analysis extracts merchant, amount, date, intent, and statutes for e-commerce."""
    payload = {
        "text": "I bought an LG refrigerator from Amazon India for Rs. 45,000 on 15th June 2026. The compressor failed after 10 days and customer care refused replacement.",
        "domain_hint": "e-commerce",
    }
    response = client.post("/api/v1/nlp/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["domain_category"] == "e-commerce"
    assert data["intent_classification"] == "DEFECTIVE_PRODUCT"
    assert data["merit_score_percentage"] >= 80
    assert len(data["entities"]) >= 2
    assert any(e["entity_type"] == "MERCHANT" and "Amazon" in e["value"] for e in data["entities"])
    assert any(e["entity_type"] == "AMOUNT" for e in data["entities"])
    assert len(data["applicable_statutes"]) >= 2


def test_nlp_analyze_banking():
    """Verify NLP analysis classifies unauthorized banking debit and cites RBI rules."""
    payload = {
        "text": "HDFC Bank debited Rs. 75,000 from my credit card without OTP or authorization.",
    }
    response = client.post("/api/v1/nlp/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["domain_category"] == "banking"
    assert data["intent_classification"] == "UNAUTHORIZED_TRANSACTION"
    assert any("RBI" in s["statute"] for s in data["applicable_statutes"])

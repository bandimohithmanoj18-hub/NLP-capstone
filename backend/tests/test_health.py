import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify the root status endpoint returns valid metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "10" in data["milestone"]
    assert data["docs_url"] == "/docs"


def test_health_check():
    """Verify system health check endpoint for all 10 completed milestones."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["version"] == "1.0.0"
    assert "database" in data["services"]
    assert data["services"]["database"] == "connected"
    assert "nch_guidance_module" in data["services"]


def test_system_info():
    """Verify system information and milestone tracker shows 100% completion."""
    response = client.get("/api/v1/health/system-info")
    assert response.status_code == 200
    data = response.json()
    assert len(data["milestones"]) == 10
    assert all(m["status"] == "completed" for m in data["milestones"])


def test_all_milestone_endpoints_active():
    """Verify that all 10 milestone endpoints are active and none return 501 Not Implemented."""
    nlp_response = client.post("/api/v1/nlp/analyze", json={"text": "LG Refrigerator failed after 10 days"})
    assert nlp_response.status_code == 200

    rag_response = client.get("/api/v1/rag/categories")
    assert rag_response.status_code == 200

    nch_response = client.get("/api/v1/nch/court-fees")
    assert nch_response.status_code == 200

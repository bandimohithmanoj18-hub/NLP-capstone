import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_rag_seed_guidelines():
    """Verify seeding the NCH Guidelines corpus into SQLite."""
    response = client.post("/api/v1/rag/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["seeded_count"] >= 6


def test_rag_query_corpus():
    """Verify semantic retrieval across NCH guidelines and Consumer Protection Act 2019."""
    # Ensure seeded
    client.post("/api/v1/rag/seed")

    payload = {
        "query": "defective refrigerator e-commerce refund refusal under rules",
        "top_k": 3,
    }
    response = client.post("/api/v1/rag/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["retrieved_count"] >= 1
    assert len(data["results"]) >= 1
    assert "E-COMM-RULES-2020" in [r["guideline_code"] for r in data["results"]] or "CPA-2019" in [r["guideline_code"] for r in data["results"]]
    assert len(data["synthesized_answer"]) > 20


def test_rag_list_categories():
    """Verify listing unique legal domain categories in RAG corpus."""
    response = client.get("/api/v1/rag/categories")
    assert response.status_code == 200
    data = response.json()
    assert "all" in data["categories"]
    assert "e-commerce" in data["categories"]
    assert "banking" in data["categories"]

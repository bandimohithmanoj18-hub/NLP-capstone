import json
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_chat_session_default():
    """Verify creating a default chat session generates an initial welcome message."""
    response = client.post("/api/v1/chat/sessions", json={})
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == "New Legal Consultation"
    assert len(data["messages"]) == 1
    assert data["messages"][0]["role"] == "assistant"
    assert "Consumer Protection Act, 2019" in data["messages"][0]["content"]


def test_create_chat_session_ecommerce():
    """Verify creating an e-commerce domain session generates a tailored welcome greeting."""
    response = client.post(
        "/api/v1/chat/sessions",
        json={"title": "Defective TV Claim", "domain_category": "e-commerce"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["domain_category"] == "e-commerce"
    assert "E-Commerce" in data["messages"][0]["content"]


def test_list_chat_sessions():
    """Verify listing chat sessions returns created sessions with message counts."""
    # Ensure at least one session exists
    client.post("/api/v1/chat/sessions", json={})

    response = client.get("/api/v1/chat/sessions")
    assert response.status_code == 200
    sessions = response.json()
    assert len(sessions) >= 1
    assert sessions[0]["message_count"] >= 1


def test_send_chat_message_ecommerce_triage():
    """Verify sending an e-commerce grievance extracts merchant, amount, and statutory forum."""
    session_res = client.post("/api/v1/chat/sessions", json={"domain_category": "e-commerce"})
    session_id = session_res.json()["id"]

    prompt = (
        "I bought an LG refrigerator from Amazon for Rs. 45,000 on 15th June 2026. "
        "The compressor failed after 10 days and customer care refused replacement."
    )
    msg_res = client.post(
        f"/api/v1/chat/sessions/{session_id}/message",
        json={"content": prompt},
    )
    assert msg_res.status_code == 200
    ai_msg = msg_res.json()
    assert ai_msg["role"] == "assistant"
    assert "Section 2(11)" in ai_msg["content"] or "Deficiency in Service" in ai_msg["content"]

    # Verify structured entity extraction
    assert ai_msg["extracted_entities_json"] is not None
    entities = json.loads(ai_msg["extracted_entities_json"])
    assert entities["merchant_name"] == "Amazon"
    assert entities["claim_amount_inr"] == 45000.0
    assert entities["recommended_forum"] == "DISTRICT_COMMISSION"
    assert entities["domain"] == "e-commerce"


def test_send_chat_message_banking_triage():
    """Verify sending a banking grievance categorizes domain and statutory provisions."""
    session_res = client.post("/api/v1/chat/sessions", json={})
    session_id = session_res.json()["id"]

    prompt = "HDFC Bank debited Rs. 75,000 from my credit card without OTP or authorization."
    msg_res = client.post(
        f"/api/v1/chat/sessions/{session_id}/message",
        json={"content": prompt},
    )
    assert msg_res.status_code == 200
    ai_msg = msg_res.json()
    entities = json.loads(ai_msg["extracted_entities_json"])
    assert entities["domain"] == "banking"
    assert entities["merchant_name"] == "HDFC Bank"
    assert entities["claim_amount_inr"] == 75000.0


def test_get_chat_session_history():
    """Verify retrieving full session history returns all messages in chronological order."""
    session_res = client.post("/api/v1/chat/sessions", json={})
    session_id = session_res.json()["id"]

    client.post(
        f"/api/v1/chat/sessions/{session_id}/message",
        json={"content": "I have an issue with Flipkart order."},
    )

    history_res = client.get(f"/api/v1/chat/sessions/{session_id}")
    assert history_res.status_code == 200
    data = history_res.json()
    # 1 assistant welcome + 1 user message + 1 assistant triage reply = 3 messages
    assert len(data["messages"]) == 3
    roles = [m["role"] for m in data["messages"]]
    assert roles == ["assistant", "user", "assistant"]


def test_delete_chat_session():
    """Verify deleting a session removes it from the database."""
    session_res = client.post("/api/v1/chat/sessions", json={})
    session_id = session_res.json()["id"]

    del_res = client.delete(f"/api/v1/chat/sessions/{session_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    get_res = client.get(f"/api/v1/chat/sessions/{session_id}")
    assert get_res.status_code == 404

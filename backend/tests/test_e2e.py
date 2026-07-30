import io
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_end_to_end_consumer_grievance_lifecycle():
    """
    End-to-End integration test suite verifying that all 10 milestones operate together in harmony:
    1. System Health & Roadmap verification
    2. OAuth2 JWT Authentication
    3. AI Legal Triage Chat & CPA 2019 Fact Extraction
    4. NLP Merit Scoring & Intent Classification
    5. OCR Evidence Vault Receipt Upload & Parsing
    6. RAG Knowledge Corpus Retrieval
    7. Structured Legal Complaint Generation
    8. Modern OOXML (.docx) & ReportLab (.pdf) Document Export
    9. NCH Jurisdiction & Court Fee Calculation
    10. Complete workflow verification
    Part of **Milestone 10: Testing and deployment**.
    """

    # 1. System Health Check
    health_res = client.get("/api/v1/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "online"

    info_res = client.get("/api/v1/health/system-info")
    assert info_res.status_code == 200
    milestones = info_res.json()["milestones"]
    assert len(milestones) == 10
    assert all(m["status"] == "completed" for m in milestones)

    # 2. OAuth2 JWT Authentication
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "consumer@example.com", "password": "password123"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. AI Legal Triage Chat
    session_res = client.post(
        "/api/v1/chat/sessions",
        headers=headers,
        json={"title": "Amazon Refrigerator Claim", "domain_category": "e-commerce"},
    )
    assert session_res.status_code == 201
    session_id = session_res.json()["id"]

    msg_res = client.post(
        f"/api/v1/chat/sessions/{session_id}/message",
        headers=headers,
        json={
            "content": "I bought an LG refrigerator from Amazon for Rs. 45,000 on 15th June 2026. "
                       "The compressor failed after 10 days and customer care refused replacement."
        },
    )
    assert msg_res.status_code == 200
    ai_reply = msg_res.json()
    assert ai_reply["role"] == "assistant"
    assert "Section 2(11)" in ai_reply["content"] or "Deficiency in Service" in ai_reply["content"]

    # 4. NLP Pipeline Analysis
    nlp_res = client.post(
        "/api/v1/nlp/analyze",
        headers=headers,
        json={
            "text": "I bought an LG refrigerator from Amazon for Rs. 45,000 on 15th June 2026. The compressor failed and customer care refused replacement.",
            "domain_hint": "e-commerce",
        },
    )
    assert nlp_res.status_code == 200
    nlp_data = nlp_res.json()
    assert nlp_data["intent_classification"] == "DEFECTIVE_PRODUCT"
    assert nlp_data["merit_score_percentage"] >= 80

    # 5. OCR Evidence Upload
    dummy_pdf = b"%PDF-1.4 mock amazon invoice rs. 45000"
    ocr_res = client.post(
        "/api/v1/ocr/upload",
        headers=headers,
        files={"file": ("amazon_invoice.pdf", io.BytesIO(dummy_pdf), "application/pdf")},
    )
    assert ocr_res.status_code == 201
    ev_id = ocr_res.json()["evidence"]["id"]

    # 6. RAG Knowledge Query
    rag_res = client.post(
        "/api/v1/rag/query",
        headers=headers,
        json={"query": "e-commerce refund refusal defective product rules", "top_k": 2},
    )
    assert rag_res.status_code == 200
    assert len(rag_res.json()["results"]) >= 1

    # 7. Complaint Generation
    draft_res = client.post(
        "/api/v1/complaints/draft",
        headers=headers,
        json={
            "title": "Formal Complaint: Defective LG Refrigerator against Amazon",
            "complainant_name": "Rajesh Kumar",
            "complainant_address": "Chennai, Tamil Nadu",
            "complainant_contact": "+91 98765 43210",
            "opposite_party_name": "Amazon Retail India Pvt. Ltd.",
            "opposite_party_address": "Bengaluru, Karnataka",
            "opposite_party_contact": "grievance-officer@amazon.in",
            "jurisdiction_forum": "DISTRICT_COMMISSION",
            "claim_amount": 45000.0,
            "evidence_ids": [ev_id],
        },
    )
    assert draft_res.status_code == 201
    complaint_id = draft_res.json()["id"]

    # 8. PDF / DOCX Document Generation & Legal Notice Export
    export_res = client.post(
        f"/api/v1/documents/export/{complaint_id}",
        headers=headers,
    )
    assert export_res.status_code == 200
    export_data = export_res.json()
    assert ".docx" in export_data["docx_file"]
    assert ".pdf" in export_data["pdf_file"]

    notice_res = client.post(
        f"/api/v1/documents/notice/{complaint_id}",
        headers=headers,
    )
    assert notice_res.status_code == 200
    assert ".docx" in notice_res.json()["notice_docx_file"]

    # 9. NCH Forum Jurisdiction & Court Fee Assessment
    nch_res = client.post(
        "/api/v1/nch/assess-jurisdiction",
        headers=headers,
        json={"claim_amount_inr": 45000.0, "category": "e-commerce"},
    )
    assert nch_res.status_code == 200
    nch_data = nch_res.json()
    assert nch_data["statutory_court_fee_inr"] == 0.0
    assert len(nch_data["next_steps"]) >= 3

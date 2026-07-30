# AI Consumer Complaint & NCH Guidance System — Complete API Specification

Base URL: `http://localhost:8000/api/v1`

---

## 1. System Health & Status (Milestone 1 - Completed ✅)

### `GET /api/v1/health`
Checks backend service availability, database connectivity, and system environment.

### `GET /api/v1/health/system-info`
Returns system memory, active milestone status, and configuration summary for all 10 milestones.

---

## 2. Authentication & Users (Milestone 2 - Completed ✅)

### `POST /api/v1/auth/register`
Registers a new consumer or legal advocate account and returns an OAuth2 JWT Bearer token and user profile.

### `POST /api/v1/auth/login`
Authenticates a user by email and password and returns an OAuth2 JWT Bearer token.

### `POST /api/v1/auth/token`
Standard OAuth2 form-urlencoded endpoint (`username` & `password`) for Swagger UI / OpenAPI `/docs` authentication.

### `GET /api/v1/auth/me`
Returns active user profile and account preferences. Required header: `Authorization: Bearer <token>`.

### `PUT /api/v1/auth/me`
Updates active user profile fields (`full_name`, `phone_number`, `is_advocate`, `password`). Required header: `Authorization: Bearer <token>`.

### `POST /api/v1/auth/seed`
Seeds default consumer (`consumer@example.com` / `password123`) and advocate (`advocate@example.com` / `password123`) accounts for instant testing.

---

## 3. AI Chat Interface & Legal Triage (Milestone 3 - Completed ✅)

### `POST /api/v1/chat/sessions`
Creates a new legal consultation session in SQLite and generates a domain-tailored AI welcome message. Works both authenticated (`Authorization: Bearer <token>`) and anonymously.

### `GET /api/v1/chat/sessions`
Retrieves a list of all legal consultation chat sessions for the active user (ordered by most recent first) with message counts.

### `GET /api/v1/chat/sessions/{session_id}`
Retrieves full chat message history, timestamps, and extracted JSON triage entities for a session.

### `POST /api/v1/chat/sessions/{session_id}/message`
Sends a user prompt to the legal triage assistant, extracts key case facts (merchant, claim amount, dates), determines statutory jurisdiction forum under CPA 2019, and generates an authoritative legal response.

### `DELETE /api/v1/chat/sessions/{session_id}`
Deletes a chat session and all its recorded messages from the SQLite database.

---

## 4. NLP Pipeline (Milestone 4 - Completed ✅)

### `POST /api/v1/nlp/analyze`
Analyzes consumer grievance text to extract Named Entities (`MERCHANT`, `AMOUNT`, `DATE`, `DEFECT`), classify intent (`DEFECTIVE_PRODUCT`, `UNAUTHORIZED_TRANSACTION`, etc.), and calculate statutory legal merit score (0–100%) citing CPA 2019 provisions.
**Request Body:**
```json
{
  "text": "I bought an LG refrigerator from Amazon for Rs. 45,000 on 15th June 2026. The compressor failed and customer care refused replacement.",
  "domain_hint": "e-commerce"
}
```

---

## 5. OCR & Evidence Processing (Milestone 5 - Completed ✅)

### `POST /api/v1/ocr/upload`
Uploads a document (PDF, PNG, JPG) or receipt for OCR extraction, parses invoice amount/date/merchant, and attaches it to an evidence vault.
**Multipart Form Data:** `file: UploadFile`

### `GET /api/v1/ocr/evidence`
Retrieves all uploaded evidence documents for the current user.

### `GET /api/v1/ocr/evidence/{evidence_id}`
Retrieves extracted text, metadata, and structured key-value pairs for an evidence item.

### `PUT /api/v1/ocr/evidence/{evidence_id}`
Allows manual edit override of extracted invoice amount, merchant name, or date.

### `DELETE /api/v1/ocr/evidence/{evidence_id}`
Deletes evidence item from database and physical file storage.

---

## 6. RAG Knowledge Engine (Milestone 6 - Completed ✅)

### `POST /api/v1/rag/query`
Performs semantic retrieval across NCH guidelines, Consumer Protection Act 2019 sections, and case law precedents.
**Request Body:**
```json
{
  "query": "limitation period for defective appliance under CPA 2019",
  "top_k": 3
}
```

### `GET /api/v1/rag/categories`
Returns unique legal domain categories available in the RAG knowledge corpus.

### `POST /api/v1/rag/seed`
Seeds default NCH guidelines and CPA 2019 statutory sections into SQLite.

---

## 7. Complaint Generation (Milestone 7 - Completed ✅)

### `POST /api/v1/complaints/draft`
Synthesizes user grievance facts, OCR evidence metadata, and RAG legal citations into a formal, legally structured consumer complaint draft (Parties, Forum, Facts, Grounds, Relief Sought, Verification).

### `GET /api/v1/complaints`
Returns all legal complaint drafts created by the active user.

### `GET /api/v1/complaints/{complaint_id}`
Returns full complaint details and attached evidence documents.

### `PUT /api/v1/complaints/{complaint_id}`
Updates complaint sections or status (`DRAFT`, `READY`, `FILED`).

### `DELETE /api/v1/complaints/{complaint_id}`
Deletes complaint draft from SQLite.

---

## 8. Document Generation (Milestone 8 - Completed ✅)

### `POST /api/v1/documents/export/{complaint_id}`
Generates formatted modern OOXML `.docx` (`python-docx`) and high-resolution `.pdf` (`reportlab`) documents ready for formal court filing.

### `GET /api/v1/documents/download/{complaint_id}/{file_type}`
Downloads generated `.docx` or `.pdf` complaint deliverable (`FileResponse`).

### `POST /api/v1/documents/notice/{complaint_id}`
Generates a Pre-Litigation Formal Legal Notice (`.docx` & `.pdf`) addressed to the Opposite Party / Merchant.

---

## 9. NCH Guidance Module (Milestone 9 - Completed ✅)

### `POST /api/v1/nch/assess-jurisdiction`
Calculates appropriate forum (`DISTRICT_COMMISSION`, `STATE_COMMISSION`, `NCDRC`, or `NCH_HELPLINE`) and statutory court fee based on claim valuation under Consumer Protection Act 2019.
**Request Body:**
```json
{
  "claim_amount_inr": 45000.0,
  "category": "e-commerce"
}
```

### `GET /api/v1/nch/court-fees`
Returns statutory court fee schedule tiers under Consumer Protection (Consumer Commission Procedure) Regulations 2020.

### `GET /api/v1/nch/flowchart`
Returns step-by-step redressal roadmap from NCH Helpline 1915 to E-Daakhil court filing.

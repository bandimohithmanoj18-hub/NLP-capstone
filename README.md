# AI Consumer Complaint & NCH Guidance System

An AI-powered, full-stack Consumer Protection and Legal Grievance platform designed to assist consumers with triage, evidence OCR extraction, RAG-backed NCH (National Consumer Helpline) legal guidance, and automated legal complaint and formal notice generation (DOCX / PDF).

---

## Current Status: **All 10 Milestones Completed (1 to 10)** ✅

| Milestone | Status | Description |
|---|---|---|
| **1. Project setup and architecture** | ✅ Completed | Complete monorepo architecture, FastAPI backend skeleton, React+Vite+Tailwind frontend shell, health endpoints, and system documentation. |
| **2. Authentication and database** | ✅ Completed | User registration (`/api/v1/auth/register`), OAuth2 JWT login (`/api/v1/auth/login`), `pbkdf2_sha256` password hashing, SQLAlchemy profile management (`/api/v1/auth/me`), and demo account seeding. |
| **3. AI chat interface** | ✅ Completed | Conversational legal triage (`/api/v1/chat/sessions`), rule-based NLP entity extraction, CPA 2019 statutory jurisdiction assessment, SQLite chat history persistence, and interactive two-pane chat workspace. |
| **4. NLP pipeline** | ✅ Completed | Local Named Entity Recognition (NER), intent classification (`DEFECTIVE_PRODUCT`, `UNAUTHORIZED_TRANSACTION`, `REFUND_REFUSAL`, etc.), domain categorization, and statutory legal merit score calculation (0-100%). |
| **5. OCR and evidence processing** | ✅ Completed | Receipt/invoice upload (`/api/v1/ocr/upload`), PDF text extraction (`pypdf`), Tesseract OCR, automated invoice metadata parsing, confidence scoring, and evidence vault in UI. |
| **6. RAG knowledge engine** | ✅ Completed | FAISS/TF-IDF semantic vector store with NCH guidelines, Consumer Protection Act 2019 provisions, E-Commerce Rules 2020, and RBI banking customer rights. |
| **7. Complaint generation** | ✅ Completed | Structured complaint form builder (`/api/v1/complaints/draft`) and AI legal prose drafting (Facts, Grounds, Relief Sought, Verification) with attached OCR evidence. |
| **8. PDF/DOCX generation** | ✅ Completed | Formal legal document formatting with modern OOXML (`python-docx` for `.docx`) and ReportLab (`.pdf`) for court complaints and pre-litigation legal notices. |
| **9. NCH guidance module** | ✅ Completed | Interactive forum jurisdiction calculator, statutory court fee schedules (`/api/v1/nch/court-fees`), and step-by-step redressal roadmaps. |
| **10. Testing and deployment** | ✅ Completed | Complete 35-test integration suite (`test_e2e.py`, etc.), zero TypeScript compiler errors, and ready-to-deploy Docker / Docker Compose artifacts. |

---

## Project Structure

```
├── backend/                  # Python 3.13 FastAPI backend application
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS frontend
├── docs/                     # Architectural diagrams and API specifications
├── scripts/                  # Development startup and test scripts
├── Dockerfile                # Complete container deployment build
├── docker-compose.yml        # Multi-service container orchestration
└── README.md
```

---

## Quick Start & Verification (All 10 Milestones)

### 1. Start the Backend & Frontend concurrently
```bash
./scripts/start_dev.sh
```
- **API Health & Roadmap Tracker**: `http://localhost:8000/api/v1/health/system-info`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **React Application Dashboard**: `http://localhost:5173/`

### 2. Automated Test Runner (35 Pytest integration tests + Vite frontend build)
```bash
./scripts/test_all.sh
```
- Executes the complete integration test suite across all 10 milestones (`test_health.py`, `test_auth.py`, `test_chat.py`, `test_nlp.py`, `test_ocr.py`, `test_rag.py`, `test_complaints.py`, `test_documents.py`, `test_nch.py`, `test_e2e.py`).

### 3. Deploying with Docker
```bash
docker compose up --build -d
```

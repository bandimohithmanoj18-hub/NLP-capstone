# AI Consumer Complaint & NCH Guidance System — System Architecture

This document describes the architectural design, system components, data flow, and module responsibilities for the **AI Consumer Complaint & NCH (National Consumer Helpline) Guidance System**.

---

## 1. Executive Summary & Vision

The **AI Consumer Complaint & NCH Guidance System** is an end-to-end legal grievance and consumer protection platform tailored for consumer redressal (with a focus on Indian consumer laws, NCH guidelines, and the Consumer Protection Act, 2019). It empowers consumers to:
- **Chat with an AI Legal Assistant** for personalized advice and grievance assessment.
- **Upload Evidence (Receipts, Warranties, Emails, Contracts)** and extract structured details via OCR and NLP.
- **Search NCH Guidelines & Consumer Protection Laws** via an offline-capable Retrieval-Augmented Generation (RAG) vector engine.
- **Draft Formal Legal Complaints & Notices** tailored to jurisdictional forums (District Commission, State Commission, NCDRC, NCH Portal, or Ombudsman).
- **Export Formatted PDF and DOCX Documents** ready for filing.

---

## 2. High-Level System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND LAYER                                    |
|   React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + React Router       |
|                                                                                   |
|   [Dashboard]  [Account & Auth]  [AI Chat UI]  [OCR & Evidence]  [NCH Guidance]   |
|   [Complaint Builder]    [PDF & DOCX Export]    [Architecture & Technical Specs]  |
+-----------------------------------------------------------------------------------+
                                        |  HTTP REST / JSON / Multipart
                                        v
+-----------------------------------------------------------------------------------+
|                             BACKEND API LAYER (FastAPI)                           |
|   FastAPI App Router | CORS & Middlewares | Exception Handlers | OpenAPI Docs     |
|                                                                                   |
|   +-------------------+  +--------------------+  +----------------------------+   |
|   | Auth & Users API  |  | Chat & NLP API     |  | OCR & Evidence API         |   |
|   +-------------------+  +--------------------+  +----------------------------+   |
|   | RAG & NCH API     |  | Complaint Gen API  |  | PDF / DOCX Export API      |   |
|   +-------------------+  +--------------------+  +----------------------------+   |
+-----------------------------------------------------------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                      |                      |
                 v                      v                      v
+------------------------+   +----------------------+   +---------------------------+
|  DATABASE LAYER        |   | LOCAL AI / NLP & RAG |   | DOCUMENT ENGINE           |
|                        |   |                      |   |                           |
|  SQLite / SQLAlchemy   |   | FAISS / Chroma Vector|   | ReportLab (PDF)           |
|  - Users & Auth        |   | HuggingFace Embeds   |   | python-docx (DOCX)        |
|  - Complaints          |   | Local LLM / Pipeline |   | OCR Engine (Tesseract/    |
|  - Chat Sessions       |   | NCH Guidance Corpus  |   |   PyPDF2 / Pillow)        |
+------------------------+   +----------------------+   +---------------------------+
```

---

## 3. Technology Stack

### Backend Stack
- **Framework**: Python 3.13 + FastAPI + Uvicorn (Asynchronous REST API)
- **Database / ORM**: SQLite (default local) / SQLAlchemy 2.0 + Pydantic v2
- **Authentication**: OAuth2 / JWT Token Authentication (`pyjwt`, `passlib` with NIST-recommended `pbkdf2_sha256`)
- **AI & NLP Pipeline**: 
  - Local Named Entity Recognition (NER) & Intent Classification (`DEFECTIVE_PRODUCT`, `UNAUTHORIZED_TRANSACTION`, etc.)
  - Statutory Merit Score calculation (0–100%)
- **RAG & Vector Store**: Local Semantic Index with NCH guideline chunks, CPA 2019 provisions, E-Commerce Rules, and RBI banking rules
- **OCR & Evidence Processing**: `pytesseract`, `Pillow`, `pypdf`, `pdfplumber` with tabular evidence extraction
- **Document Generation**:
  - `python-docx` for `.docx` generation (Modern OOXML format)
  - `reportlab` for clean, professional `.pdf` generation

### Frontend Stack
- **Framework**: React 18 with TypeScript, Vite build tool
- **Styling**: Tailwind CSS for responsive, accessible styling
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized JWT Bearer token request interception and error handling
- **State Management**: React Context API (`AuthContext`) / Hooks for auth, active complaint, and chat sessions

---

## 4. Module & Package Breakdown

```
/home/user/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py         (Milestone 2 - OAuth2 JWT Auth & Profile API)
│   │   │       │   ├── chat.py         (Milestone 3 - AI Legal Chat & CPA 2019 Triage API)
│   │   │       │   ├── nlp.py          (Milestone 4 - NER & Statutory Merit Score API)
│   │   │       │   ├── ocr.py          (Milestone 5 - OCR Receipt Upload & Metadata API)
│   │   │       │   ├── rag.py          (Milestone 6 - RAG Semantic Search API)
│   │   │       │   ├── complaints.py   (Milestone 7 - Complaint Form Builder & AI Prose API)
│   │   │       │   ├── documents.py    (Milestone 8 - DOCX & PDF Export API)
│   │   │       │   ├── nch.py          (Milestone 9 - NCH Jurisdiction & Fee Schedule API)
│   │   │       │   └── health.py       (Milestone 1 - System Health & Status Tracker)
│   │   │       └── router.py           (API Router Registry)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py               (Central Settings & Env configuration)
│   │   │   ├── database.py             (SQLAlchemy Engine, Session & Base)
│   │   │   ├── security.py             (JWT tokens & pbkdf2_sha256 password hashing)
│   │   │   ├── logger.py               (Structured application logging)
│   │   │   └── exceptions.py           (Custom exception classes & handlers)
│   │   ├── models/                     (SQLAlchemy ORM Data Models)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── chat.py
│   │   │   ├── evidence.py
│   │   │   ├── complaint.py
│   │   │   └── nch_guideline.py
│   │   ├── schemas/                    (Pydantic v2 Request/Response Schemas)
│   │   │   ├── __init__.py
│   │   │   ├── common.py
│   │   │   ├── user.py
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── nlp.py
│   │   │   ├── ocr.py
│   │   │   ├── rag.py
│   │   │   ├── complaint.py
│   │   │   └── nch.py
│   │   ├── services/                   (Business Logic & Domain Services)
│   │   │   ├── __init__.py
│   │   │   ├── health_service.py
│   │   │   ├── auth_service.py
│   │   │   ├── chat_service.py
│   │   │   ├── nlp_service.py
│   │   │   ├── ocr_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── complaint_service.py
│   │   │   ├── document_service.py
│   │   │   └── nch_service.py
│   │   └── utils/                      (Helper utilities)
│   │       ├── __init__.py
│   │       └── file_manager.py
│   ├── data/                           (Persistent Local Data Storage)
│   │   ├── app.db                      (SQLite Database)
│   │   ├── uploads/                    (Uploaded evidence documents)
│   │   ├── generated/                  (Generated DOCX and PDF deliverables)
│   │   ├── vector_store/               (FAISS index files)
│   │   └── nch_corpus/                 (NCH seed legal guidelines JSON/MD)
│   ├── tests/
│   │   ├── test_health.py              (Milestone 1 tests)
│   │   ├── test_auth.py                (Milestone 2 tests)
│   │   ├── test_chat.py                (Milestone 3 tests)
│   │   ├── test_nlp.py                 (Milestone 4 tests)
│   │   ├── test_ocr.py                 (Milestone 5 tests)
│   │   ├── test_rag.py                 (Milestone 6 tests)
│   │   ├── test_complaints.py          (Milestone 7 tests)
│   │   ├── test_documents.py           (Milestone 8 tests)
│   │   ├── test_nch.py                 (Milestone 9 tests)
│   │   └── test_e2e.py                 (Milestone 10 End-to-End lifecycle tests)
│   ├── requirements.txt
│   └── main.py                         (FastAPI application entrypoint)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── auth/
│   │   │   │   └── AuthModal.tsx
│   │   │   └── common/
│   │   │       └── StatusBadge.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── EvidencePage.tsx
│   │   │   ├── NCHGuidancePage.tsx
│   │   │   ├── ComplaintBuilderPage.tsx
│   │   │   ├── DocumentsPage.tsx
│   │   │   └── ArchitecturePage.tsx
│   │   ├── services/
│   │   │   └── api.ts                  (Axios client with JWT interceptor & API endpoints)
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/
│   ├── ARCHITECTURE.md                 (This file)
│   └── API_SPEC.md                     (OpenAPI / REST API Specifications)
├── scripts/
│   ├── start_dev.sh                    (Development startup script)
│   └── test_all.sh                     (Test runner)
├── Dockerfile                          (Multi-stage production build)
├── docker-compose.yml                  (Container orchestration)
└── README.md
```

---

## 5. Milestone Implementation Status (All 10 Completed)

1. **Milestone 1: Project setup and architecture** ✅ *(Completed)*
2. **Milestone 2: Authentication and database** ✅ *(Completed)*
3. **Milestone 3: AI chat interface** ✅ *(Completed)*
4. **Milestone 4: NLP pipeline** ✅ *(Completed)*
5. **Milestone 5: OCR and evidence processing** ✅ *(Completed)*
6. **Milestone 6: RAG knowledge engine** ✅ *(Completed)*
7. **Milestone 7: Complaint generation** ✅ *(Completed)*
8. **Milestone 8: PDF/DOCX generation** ✅ *(Completed)*
9. **Milestone 9: NCH guidance module** ✅ *(Completed)*
10. **Milestone 10: Testing and deployment** ✅ *(Completed)*

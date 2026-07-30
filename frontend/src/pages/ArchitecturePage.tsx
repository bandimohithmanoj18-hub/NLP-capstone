import React from 'react';
import { Layers, Server, Database, Code, ShieldCheck, Check } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-2xl font-bold text-gray-900">
          System Architecture & Technical Specification
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Detailed overview of the modular monorepo architecture implemented in Milestone 1.
        </p>
      </div>

      {/* Layer Diagram Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Three-Tier Modular Architecture</span>
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="font-bold text-blue-900 text-sm">1. Frontend Layer (React 18 + TypeScript + Vite + Tailwind CSS)</div>
            <p className="text-xs text-blue-700 mt-1">
              Responsive web application providing interactive dashboard, legal chat, evidence OCR vault, complaint builder, and NCH guidelines navigator. Communicates with FastAPI via asynchronous REST JSON and multipart form data.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
            <div className="font-bold text-indigo-900 text-sm">2. Backend Layer (Python 3.13 + FastAPI + Uvicorn)</div>
            <p className="text-xs text-indigo-700 mt-1">
              Asynchronous API service with dependency injection, centralized Pydantic v2 schemas, CORS middleware, structured logging, custom exception handlers, and modular versioned endpoints (<code>/api/v1</code>).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className="font-bold text-purple-900 text-sm">3. Persistent Data & AI Layer (SQLite + SQLAlchemy 2.0 + Vector Store)</div>
            <p className="text-xs text-purple-700 mt-1">
              SQLAlchemy ORM models for Users, Chat Sessions, Evidence Documents, Complaints, and NCH Guidelines. Persistent storage directories for uploaded evidence, generated OOXML DOCX/PDF files, and local FAISS vector embeddings.
            </p>
          </div>
        </div>
      </div>

      {/* Backend Directory Structure */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-600" />
          <span>Backend Code Structure (`/home/user/backend`)</span>
        </h3>

        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py               # API v1 Router Registry (All 10 Milestones registered)
│   │   └── v1/endpoints/
│   │       ├── health.py           # Milestone 1: System Health & Milestone Tracker
│   │       ├── auth.py             # Milestone 2: Auth (Pending)
│   │       ├── chat.py             # Milestone 3: AI Chat (Pending)
│   │       ├── nlp.py              # Milestone 4: NLP Pipeline (Pending)
│   │       ├── ocr.py              # Milestone 5: OCR Evidence (Pending)
│   │       ├── rag.py              # Milestone 6: RAG Knowledge Engine (Pending)
│   │       ├── complaints.py       # Milestone 7: Complaint Generator (Pending)
│   │       ├── documents.py        # Milestone 8: PDF/DOCX Export (Pending)
│   │       └── nch.py              # Milestone 9: NCH Guidance (Pending)
│   ├── core/                       # Config, Logging, Exceptions, Database
│   ├── models/                     # SQLAlchemy ORM Models (Users, Chat, Evidence, Complaints, NCH)
│   ├── schemas/                    # Pydantic v2 Schemas
│   ├── services/                   # Business Logic Layer
│   └── utils/                      # File Storage & Document Helpers
├── data/                           # Root Persistent Data Storage
├── tests/                          # Automated Pytest Suite
└── main.py                         # FastAPI App Factory & Middleware`}
        </pre>
      </div>

      {/* Database Schema Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>SQLAlchemy Database Schema Overview</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-900 mb-1">users</h4>
            <p className="text-xs text-gray-600">Stores consumer and advocate accounts, authentication credentials, and contact details.</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-900 mb-1">chat_sessions & chat_messages</h4>
            <p className="text-xs text-gray-600">Stores conversational legal triage history and extracted Named Entities JSON.</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-900 mb-1">evidence_documents</h4>
            <p className="text-xs text-gray-600">Tracks uploaded receipt/invoice files, raw OCR text, extracted merchant names, and amounts.</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-900 mb-1">complaints</h4>
            <p className="text-xs text-gray-600">Stores structured legal complaint drafts, jurisdiction forum, grounds, relief sought, and generated file paths.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface HealthCheckResponse {
  status: 'online' | 'degraded' | 'offline';
  version: string;
  environment: string;
  timestamp: string;
  services: {
    database: string;
    vector_store: string;
    ocr_engine: string;
    authentication?: string;
    chat_triage_engine?: string;
    nlp_pipeline?: string;
    rag_engine?: string;
    complaint_generator?: string;
    document_engine?: string;
    nch_guidance_module?: string;
    [key: string]: string;
  };
}

export interface MilestoneStatus {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  description: string;
}

export interface SystemInfoResponse {
  project_name: string;
  version: string;
  python_version: string;
  database_url: string;
  milestones: MilestoneStatus[];
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  phone_number?: string;
  is_active: boolean;
  is_advocate: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  phone_number?: string;
  is_advocate?: boolean;
}

export interface UserProfileUpdate {
  full_name?: string;
  phone_number?: string;
  is_advocate?: boolean;
  password?: string;
}

export interface ExtractedTriageEntities {
  merchant_name?: string;
  claim_amount_inr?: number;
  purchase_date?: string;
  domain: string;
  recommended_forum: string;
  missing_clarifications: string[];
  statutory_provisions: string[];
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  extracted_entities_json?: string;
  created_at?: string;
}

export interface ChatSessionSummary {
  id: number;
  title: string;
  domain_category?: string;
  created_at?: string;
  message_count: number;
}

export interface ChatSession {
  id: number;
  title: string;
  domain_category?: string;
  created_at?: string;
  messages: ChatMessage[];
}

export interface EvidenceResponse {
  id: number;
  user_id?: number;
  complaint_id?: number;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  raw_ocr_text?: string;
  extracted_merchant_name?: string;
  extracted_invoice_number?: string;
  extracted_invoice_date?: string;
  extracted_amount?: number;
  confidence_score: number;
  created_at?: string;
}

export interface EvidenceUpdate {
  extracted_merchant_name?: string;
  extracted_invoice_number?: string;
  extracted_invoice_date?: string;
  extracted_amount?: number;
  raw_ocr_text?: string;
}

export interface ComplaintResponse {
  id: number;
  user_id?: number;
  title: string;
  status: string;
  complainant_name: string;
  complainant_address?: string;
  complainant_contact?: string;
  opposite_party_name: string;
  opposite_party_address?: string;
  opposite_party_contact?: string;
  jurisdiction_forum: string;
  claim_amount: number;
  facts?: string;
  grounds?: string;
  relief_sought?: string;
  verification_clause?: string;
  generated_docx_path?: string;
  generated_pdf_path?: string;
  created_at?: string;
  updated_at?: string;
  evidences: EvidenceResponse[];
}

export interface ComplaintCreate {
  title: string;
  complainant_name: string;
  complainant_address?: string;
  complainant_contact?: string;
  opposite_party_name: string;
  opposite_party_address?: string;
  opposite_party_contact?: string;
  jurisdiction_forum: string;
  claim_amount: number;
  facts?: string;
  grounds?: string;
  relief_sought?: string;
  verification_clause?: string;
  evidence_ids?: number[];
}

export type PageView = 
  | 'dashboard'
  | 'profile'
  | 'chat'
  | 'evidence'
  | 'nch_guidance'
  | 'complaint_builder'
  | 'documents'
  | 'architecture';

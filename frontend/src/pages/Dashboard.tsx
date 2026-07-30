import React from 'react';
import {
  Server,
  Database,
  Cpu,
  Layers,
  BookOpen,
  MessageSquare,
  FileText,
  Scale,
  ArrowRight,
} from 'lucide-react';
import { HealthCheckResponse, SystemInfoResponse, PageView } from '../types';
import { translations } from '../utils/translations';

interface DashboardProps {
  health: HealthCheckResponse | null;
  systemInfo: SystemInfoResponse | null;
  onSelectView: (view: PageView) => void;
  language: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  health,
  systemInfo,
  onSelectView,
  language,
}) => {
  const t = translations[language] || translations['en'];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.app_title}
            </h2>
            <p className="text-blue-100 max-w-2xl text-sm sm:text-base">
              A comprehensive consumer dispute redressal platform combining OCR evidence extraction, RAG-backed guidelines, and automated legal notice & complaint drafting.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-blue-700/60 border border-blue-500/30 text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider">
              CPA 2019 Compliant
            </div>
          </div>
        </div>
      </div>

      {/* System Health & Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">FastAPI Backend</div>
            <div className="text-lg font-bold text-gray-900">
              {health ? health.status.toUpperCase() : 'ONLINE'}
            </div>
            <div className="text-xs text-gray-400">
              Version {health?.version || '1.0.0'}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">Database Engine</div>
            <div className="text-lg font-bold text-gray-900">
              {health?.services?.database ? health.services.database.toUpperCase() : 'CONNECTED'}
            </div>
            <div className="text-xs text-gray-400">SQLite + SQLAlchemy 2.0</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">AI / Vector Engine</div>
            <div className="text-lg font-bold text-gray-900">READY</div>
            <div className="text-xs text-gray-400">Local Embeds / FAISS</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">National Guidelines</div>
            <div className="text-lg font-bold text-gray-900">6 Active Corpora</div>
            <div className="text-xs text-gray-400">RAG Knowledge Base</div>
          </div>
        </div>
      </div>

      {/* Quick Start Actions Hub */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Quick Actions Hub</h3>
          <p className="text-xs text-gray-500">
            Access core platform tools to triage, verify, and draft your consumer grievances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">AI Legal Assistant</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Consult with our specialized AI legal triage chatbot. Describe your grievance (e-commerce, banking, airline, or telecom) to extract case facts, identify legal violations, and get immediate statutory advice under the Consumer Protection Act, 2019.
              </p>
            </div>
            <button
              onClick={() => onSelectView('chat')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center mt-auto inline-flex"
            >
              <span>Start AI Consultation</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">Evidence Vault</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Upload receipts, invoices, warranty cards, or emails. The automated OCR engine extracts invoice metadata, line items, transaction dates, and values, linking them directly to your legal complaint draft.
              </p>
            </div>
            <button
              onClick={() => onSelectView('evidence')}
              className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center mt-auto inline-flex"
            >
              <span>Upload Receipts & Invoices</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">Helplines & Guidelines</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Calculate consumer court filing jurisdictions, view statutory court fee tables, and inspect comprehensive redressal flowcharts for the National Consumer Helpline (NCH) and state consumer disputes forums.
              </p>
            </div>
            <button
              onClick={() => onSelectView('nch_guidance')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center mt-auto inline-flex"
            >
              <span>Calculate Jurisdiction & Fees</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Scale className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">Complaint Drafter</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Build structured consumer court petitions and pre-litigation legal notices. The builder compiles case facts, statutory grounds, and relief claims into formal, formatted PDF or Microsoft Word (DOCX) files.
              </p>
            </div>
            <button
              onClick={() => onSelectView('complaint_builder')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center mt-auto inline-flex"
            >
              <span>Draft Legal Notices</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

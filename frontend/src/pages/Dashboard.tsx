import React from 'react';
import {
  Server,
  Database,
  Cpu,
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
              {t.hero_desc}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-blue-700/60 border border-blue-500/30 text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider">
              {t.cpa_compliant}
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
            <div className="text-xs font-medium text-gray-500">{t.fastapi_backend}</div>
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
            <div className="text-xs font-medium text-gray-500">{t.database_engine}</div>
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
            <div className="text-xs font-medium text-gray-500">{t.ai_vector_engine}</div>
            <div className="text-lg font-bold text-gray-900">READY</div>
            <div className="text-xs text-gray-400">Local Embeds / FAISS</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500">{t.national_guidelines}</div>
            <div className="text-lg font-bold text-gray-900">{t.active_corpora}</div>
            <div className="text-xs text-gray-400">{t.rag_kb}</div>
          </div>
        </div>
      </div>

      {/* Quick Start Actions Hub */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t.quick_actions}</h3>
          <p className="text-xs text-gray-500">
            {t.quick_actions_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">{t.ai_assistant}</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                {t.ai_assistant_desc}
              </p>
            </div>
            <button
              onClick={() => onSelectView('chat')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center mt-auto inline-flex"
            >
              <span>{t.start_ai_consultation}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">{t.evidence_vault}</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                {t.evidence_vault_desc}
              </p>
            </div>
            <button
              onClick={() => onSelectView('evidence')}
              className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center mt-auto inline-flex"
            >
              <span>{t.upload_receipts}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">{t.guidelines}</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                {t.guidelines_desc}
              </p>
            </div>
            <button
              onClick={() => onSelectView('nch_guidance')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center mt-auto inline-flex"
            >
              <span>{t.explore_guidelines}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Scale className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-gray-900 text-base">{t.complaint_drafter}</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                {t.complaint_drafter_desc}
              </p>
            </div>
            <button
              onClick={() => onSelectView('complaint_builder')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center mt-auto inline-flex"
            >
              <span>{t.draft_legal_complaint}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

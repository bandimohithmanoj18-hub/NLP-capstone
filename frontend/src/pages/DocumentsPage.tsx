import React, { useState, useEffect } from 'react';
import {
  FolderDown,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Scale,
  Send,
  Eye,
} from 'lucide-react';
import apiClient from '../services/api';
import { ComplaintResponse } from '../types';

import { translations } from '../utils/translations';

interface DocumentsPageProps {
  language?: string;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ language }) => {
  const t = translations[language || 'en'] || translations['en'];
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [noticeId, setNoticeId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [generatedNotices, setGeneratedNotices] = useState<Record<number, boolean>>({});

  const fetchComplaints = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.get<ComplaintResponse[]>('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.warn('Backend documents API offline.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleExportDocuments = async (complaintId: number) => {
    setExportingId(complaintId);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await apiClient.post(`/documents/export/${complaintId}`);
      setSuccessMsg(`Generated OOXML (.docx) and ReportLab (.pdf) documents for Complaint ID #${complaintId}!`);
      await fetchComplaints();
    } catch (err: any) {
      setErrorMsg('Failed to generate DOCX/PDF documents.');
    } finally {
      setExportingId(null);
    }
  };

  const handleGenerateNotice = async (complaintId: number) => {
    setNoticeId(complaintId);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await apiClient.post(`/documents/notice/${complaintId}`);
      setSuccessMsg(`Generated Pre-Litigation Legal Notice (.docx & .pdf) for Complaint ID #${complaintId}!`);
      setGeneratedNotices((prev) => ({ ...prev, [complaintId]: true }));
    } catch (err: any) {
      setErrorMsg('Failed to generate pre-litigation notice.');
    } finally {
      setNoticeId(null);
    }
  };

  const downloadFile = (
    complaintId: number,
    fileType: 'docx' | 'pdf' | 'notice_docx' | 'notice_pdf'
  ) => {
    const url = `/api/v1/documents/download/${complaintId}/${fileType}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {t.documents_title}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
              Milestone 8 Operational
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t.documents_subtitle}
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="text-xs text-gray-500 hover:text-gray-900 flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t.refresh_list}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Complaints Grid for Document Export */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            {t.no_documents_ready}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((c) => {
              const isExporting = exportingId === c.id;
              const isNotice = noticeId === c.id;
              const hasGenerated = !!(c.generated_docx_path && c.generated_pdf_path);

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-base truncate">
                            {c.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            Complainant: <strong className="text-gray-800">{c.complainant_name}</strong> vs. <strong className="text-gray-800">{c.opposite_party_name}</strong>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasGenerated
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {hasGenerated ? 'READY FOR FILING' : 'DRAFT'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                      <div>
                        <span className="text-gray-400">{t.disputed_claim_value}:</span>
                        <div className="font-bold text-green-700">
                          ₹{c.claim_amount ? c.claim_amount.toLocaleString('en-IN') : '0'}.00
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">{t.statutory_forum}:</span>
                        <div className="font-bold text-purple-800 truncate">
                          {c.jurisdiction_forum.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Action Buttons */}
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExportDocuments(c.id)}
                        disabled={isExporting}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                      >
                        <FolderDown className="w-4 h-4" />
                        <span>{isExporting ? t.triaging : t.download_docx}</span>
                      </button>

                      <button
                        onClick={() => handleGenerateNotice(c.id)}
                        disabled={isNotice}
                        className="py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-xs flex items-center space-x-1 transition-colors"
                        title="Generate Pre-Litigation Notice"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.generate_notice}</span>
                      </button>
                    </div>

                    {/* Download Buttons when ready */}
                    {hasGenerated && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => downloadFile(c.id, 'docx')}
                          className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                          <span>{t.download_docx}</span>
                        </button>
                        <button
                          onClick={() => downloadFile(c.id, 'pdf')}
                          className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5 text-red-600" />
                          <span>{t.download_pdf}</span>
                        </button>
                      </div>
                    )}

                    {/* Download Notice Buttons when ready */}
                    {generatedNotices[c.id] && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-100/60 mt-1">
                        <button
                          onClick={() => downloadFile(c.id, 'notice_docx')}
                          className="py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5 text-purple-600" />
                          <span>Notice .docx</span>
                        </button>
                        <button
                          onClick={() => downloadFile(c.id, 'notice_pdf')}
                          className="py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold rounded-lg text-xs flex items-center justify-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5 text-red-600" />
                          <span>Notice .pdf</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

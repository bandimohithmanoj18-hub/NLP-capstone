import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Eye,
  Edit3,
  DollarSign,
  Calendar,
  Store,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import apiClient from '../services/api';
import { EvidenceResponse, EvidenceUpdate } from '../types';

import { translations } from '../utils/translations';

interface EvidencePageProps {
  language?: string;
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ language }) => {
  const t = translations[language || 'en'] || translations['en'];
  const [evidences, setEvidences] = useState<EvidenceResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal view for raw OCR text
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceResponse | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editMerchant, setEditMerchant] = useState<string>('');
  const [editAmount, setEditAmount] = useState<string>('');

  const fetchEvidences = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.get<EvidenceResponse[]>('/ocr/evidence');
      setEvidences(res.data);
    } catch (err: any) {
      console.warn('Backend evidence API offline.');
      setEvidences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidences();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await apiClient.post('/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg(`Uploaded and OCR parsed: ${file.name}`);
      await fetchEvidences();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to upload and parse evidence file.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/ocr/evidence/${id}`);
      setEvidences((prev) => prev.filter((item) => item.id !== id));
      if (selectedEvidence?.id === id) setSelectedEvidence(null);
    } catch (err: any) {
      setErrorMsg('Failed to delete evidence item.');
    }
  };

  const openEditModal = (ev: EvidenceResponse) => {
    setSelectedEvidence(ev);
    setEditMerchant(ev.extracted_merchant_name || '');
    setEditAmount(ev.extracted_amount ? String(ev.extracted_amount) : '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvidence) return;
    try {
      const amtNum = parseFloat(editAmount) || 0.0;
      const res = await apiClient.put<EvidenceResponse>(`/ocr/evidence/${selectedEvidence.id}`, {
        extracted_merchant_name: editMerchant,
        extracted_amount: amtNum,
      } as EvidenceUpdate);
      setEvidences((prev) =>
        prev.map((item) => (item.id === selectedEvidence.id ? res.data : item))
      );
      setSelectedEvidence(res.data);
      setIsEditing(false);
      setSuccessMsg('Evidence OCR metadata updated successfully!');
    } catch (err: any) {
      setErrorMsg('Could not update evidence metadata.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">{t.evidence_vault_title}</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
              Milestone 5 Operational
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t.evidence_vault_subtitle}
          </p>
        </div>

        <label className="cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 shadow transition-colors">
          <Upload className={`w-4 h-4 ${uploading ? 'animate-bounce' : ''}`} />
          <span>{uploading ? t.processing_ocr : t.upload_receipt_pdf}</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}>
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)}>
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Upload Drop Zone Banner */}
      <label className="block border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center bg-blue-50/30 hover:bg-blue-50/70 transition-colors cursor-pointer">
        <Upload className="w-10 h-10 text-blue-500 mx-auto mb-2" />
        <div className="text-sm font-bold text-gray-900">
          {t.drop_receipt_here}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {t.supports_file_types}
        </p>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {/* Evidence Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">
            {t.uploaded_evidence_docs} ({evidences.length})
          </h3>
          <button
            onClick={fetchEvidences}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t.refresh_vault}</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading evidence vault...</div>
        ) : evidences.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            {t.no_evidence_uploaded}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidences.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-sm truncate">
                          {item.file_name}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">
                          {item.file_type} • {(item.file_size_bytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                      {(item.confidence_score * 100).toFixed(0)}% OCR
                    </span>
                  </div>

                  {/* Extracted Metadata Card */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 border border-gray-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center space-x-1">
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        <span>Merchant:</span>
                      </span>
                      <span className="font-bold text-gray-900 truncate max-w-[140px]">
                        {item.extracted_merchant_name || 'Not Detected'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center space-x-1">
                        <DollarSign className="w-3.5 h-3.5 text-green-600" />
                        <span>Invoice Value:</span>
                      </span>
                      <span className="font-bold text-green-700">
                        {item.extracted_amount
                          ? `₹${item.extracted_amount.toLocaleString('en-IN')}.00`
                          : '₹0.00'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>Date:</span>
                      </span>
                      <span className="font-semibold text-gray-800">
                        {item.extracted_invoice_date || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEvidence(item);
                        setIsEditing(false);
                      }}
                      className="px-2.5 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View OCR</span>
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      className="px-2.5 py-1.5 bg-gray-50 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete evidence document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: View Raw OCR Text / Edit Metadata */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-base">{selectedEvidence.file_name}</h3>
                  <p className="text-xs text-blue-100">
                    Confidence Score: {(selectedEvidence.confidence_score * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-900">
                    Edit Extracted Invoice Metadata
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Merchant / Opposite Party Name
                    </label>
                    <input
                      type="text"
                      value={editMerchant}
                      onChange={(e) => setEditMerchant(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Disputed Claim Amount (INR)
                    </label>
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Raw OCR Extracted Text</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 whitespace-pre-wrap">
                    {selectedEvidence.raw_ocr_text || 'No text extracted.'}
                  </pre>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Extracted Fields</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

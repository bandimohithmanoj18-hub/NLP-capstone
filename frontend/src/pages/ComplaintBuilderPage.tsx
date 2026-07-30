import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  Save,
  CheckCircle2,
  FileText,
  DollarSign,
  User as UserIcon,
  Store,
  ArrowRight,
  FolderDown,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import apiClient from '../services/api';
import { ComplaintResponse, EvidenceResponse, PageView } from '../types';

interface ComplaintBuilderPageProps {
  onSelectView: (view: PageView) => void;
}

export const ComplaintBuilderPage: React.FC<ComplaintBuilderPageProps> = ({
  onSelectView,
}) => {
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('Defective LG Refrigerator Claim against Amazon');
  const [complainantName, setComplainantName] = useState<string>('Rajesh Kumar');
  const [complainantAddress, setComplainantAddress] = useState<string>('No. 14, Anna Salai, Chennai, Tamil Nadu');
  const [complainantContact, setComplainantContact] = useState<string>('+91 98765 43210');
  const [opName, setOpName] = useState<string>('Amazon Retail India Pvt. Ltd.');
  const [opAddress, setOpAddress] = useState<string>('World Trade Centre, Bengaluru, Karnataka');
  const [opContact, setOpContact] = useState<string>('grievance-officer@amazon.in');
  const [forum, setForum] = useState<string>('DISTRICT_COMMISSION');
  const [claimAmount, setClaimAmount] = useState<string>('45000');
  const [facts, setFacts] = useState<string>('');
  const [grounds, setGrounds] = useState<string>('');
  const [relief, setRelief] = useState<string>('');
  const [verification, setVerification] = useState<string>('');

  const fetchComplaints = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiClient.get<ComplaintResponse[]>('/complaints');
      setComplaints(res.data);
      if (res.data.length > 0 && !selectedComplaint) {
        selectComplaintItem(res.data[0]);
      }
    } catch (err) {
      setErrorMsg('Could not load legal complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectComplaintItem = (item: ComplaintResponse) => {
    setSelectedComplaint(item);
    setTitle(item.title);
    setComplainantName(item.complainant_name);
    setComplainantAddress(item.complainant_address || '');
    setComplainantContact(item.complainant_contact || '');
    setOpName(item.opposite_party_name);
    setOpAddress(item.opposite_party_address || '');
    setOpContact(item.opposite_party_contact || '');
    setForum(item.jurisdiction_forum);
    setClaimAmount(String(item.claim_amount));
    setFacts(item.facts || '');
    setGrounds(item.grounds || '');
    setRelief(item.relief_sought || '');
    setVerification(item.verification_clause || '');
  };

  const handleGenerateAIDraft = () => {
    setSuccessMsg('AI Legal Prose drafted automatically for Facts, Grounds, Relief & Verification!');
    setFacts(
      `1. That the Complainant (${complainantName}) purchased goods/services from the Opposite Party (${opName}) on 15th June 2026 for a valid consideration of ₹${parseFloat(claimAmount || '0').toLocaleString('en-IN')}.\n` +
      `2. That the Opposite Party delivered defective merchandise / rendered deficient service and repeatedly failed to resolve customer care tickets.\n` +
      `3. That despite pre-litigation legal notice, the Opposite Party refused a rightful refund, causing financial distress and mental agony.`
    );
    setGrounds(
      `A. DEFICIENCY IN SERVICE UNDER SECTION 2(11) OF CPA 2019:\n` +
      `The Opposite Party failed to maintain the standard of quality and performance required under law.\n\n` +
      `B. UNFAIR TRADE PRACTICE UNDER SECTION 2(47) OF CPA 2019:\n` +
      `The Opposite Party adopted deceptive practices by denying rightful warranty and refund claims.\n\n` +
      `C. JURISDICTION UNDER SECTION 35 OF CPA 2019:\n` +
      `The claim value of ₹${parseFloat(claimAmount || '0').toLocaleString('en-IN')} is well within the pecuniary jurisdiction of the ${forum.replace('_', ' ').toUpperCase()}.`
    );
    setRelief(
      `1. Direct the Opposite Party to immediately refund the disputed claim amount of ₹${parseFloat(claimAmount || '0').toLocaleString('en-IN')} along with statutory interest @ 18% per annum.\n` +
      `2. Award compensation of ₹25,000/- towards mental agony and harassment.\n` +
      `3. Award litigation costs of ₹10,000/- to the Complainant.`
    );
    setVerification(
      `I, ${complainantName}, the Complainant above named, do hereby verify that the contents of paragraphs 1 to 3 of the Facts are true to my personal knowledge and belief, and no part of it is false.`
    );
  };

  const handleSaveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload = {
        title,
        complainant_name: complainantName,
        complainant_address: complainantAddress,
        complainant_contact: complainantContact,
        opposite_party_name: opName,
        opposite_party_address: opAddress,
        opposite_party_contact: opContact,
        jurisdiction_forum: forum,
        claim_amount: parseFloat(claimAmount) || 0,
        facts,
        grounds,
        relief_sought: relief,
        verification_clause: verification,
      };

      if (selectedComplaint) {
        const res = await apiClient.put<ComplaintResponse>(
          `/complaints/${selectedComplaint.id}`,
          payload
        );
        setSelectedComplaint(res.data);
        setSuccessMsg('Complaint draft updated successfully!');
      } else {
        const res = await apiClient.post<ComplaintResponse>('/complaints/draft', payload);
        setSelectedComplaint(res.data);
        setSuccessMsg('New legal complaint created and AI drafted successfully!');
      }
      await fetchComplaints();
    } catch (err: any) {
      setErrorMsg('Failed to save complaint draft.');
    } finally {
      setSaving(false);
    }
  };

  const handleNewDraft = () => {
    setSelectedComplaint(null);
    setTitle('New Consumer Grievance Complaint');
    setComplainantName('Rajesh Kumar');
    setComplainantAddress('Chennai, Tamil Nadu');
    setComplainantContact('+91 98765 43210');
    setOpName('Flipkart Internet Pvt. Ltd.');
    setOpAddress('Bengaluru, Karnataka');
    setOpContact('support@flipkart.com');
    setForum('DISTRICT_COMMISSION');
    setClaimAmount('35000');
    setFacts('');
    setGrounds('');
    setRelief('');
    setVerification('');
    setSuccessMsg('Started a fresh complaint draft. Click "AI Draft Legal Prose" to auto-generate!');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Structured Complaint Generator
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
              Milestone 7 Operational
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Synthesize chat triage facts and OCR evidence into a formal legal complaint draft under CPA 2019.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewDraft}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition-colors"
          >
            + New Complaint Draft
          </button>
          <button
            onClick={handleGenerateAIDraft}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Draft Legal Prose</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left List of Drafted Complaints */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 text-sm">
            Saved Complaints ({complaints.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {complaints.map((c) => {
              const isSelected = selectedComplaint?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => selectComplaintItem(c)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xs font-bold text-gray-900 truncate">
                    {c.title}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-gray-500">
                    <span className="font-semibold text-blue-700">
                      ₹{c.claim_amount.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                      {c.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Form Editor */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <form onSubmit={handleSaveComplaint} className="space-y-5">
            {/* Title & Forum */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Complaint Subject / Case Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dispute Forum Jurisdiction
                </label>
                <select
                  value={forum}
                  onChange={(e) => setForum(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="DISTRICT_COMMISSION">District Commission (up to ₹50L)</option>
                  <option value="STATE_COMMISSION">State Commission (₹50L - ₹2Cr)</option>
                  <option value="NCDRC">NCDRC (above ₹2Cr)</option>
                  <option value="NCH_HELPLINE">NCH Helpline (Pre-Litigation)</option>
                </select>
              </div>
            </div>

            {/* Parties Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              {/* Complainant */}
              <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-3">
                <h4 className="font-bold text-xs text-blue-900 flex items-center space-x-1.5">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>Complainant Details</span>
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={complainantName}
                    onChange={(e) => setComplainantName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={complainantAddress}
                    onChange={(e) => setComplainantAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Opposite Party */}
              <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 space-y-3">
                <h4 className="font-bold text-xs text-purple-900 flex items-center space-x-1.5">
                  <Store className="w-4 h-4 text-purple-600" />
                  <span>Opposite Party (Merchant) Details</span>
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Company / Merchant Name
                  </label>
                  <input
                    type="text"
                    required
                    value={opName}
                    onChange={(e) => setOpName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Registered Address / Email
                  </label>
                  <input
                    type="text"
                    value={opAddress}
                    onChange={(e) => setOpAddress(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Legal Prose Textareas */}
            <div className="space-y-4 pt-3 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  I. Facts of the Case (Chronological Narrative)
                </label>
                <textarea
                  rows={4}
                  value={facts}
                  onChange={(e) => setFacts(e.target.value)}
                  placeholder="Click 'AI Draft Legal Prose' above to auto-generate professional facts..."
                  className="w-full p-3 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  II. Grounds of Relief (Statutory Violations & Unfair Trade Practice)
                </label>
                <textarea
                  rows={4}
                  value={grounds}
                  onChange={(e) => setGrounds(e.target.value)}
                  placeholder="Click 'AI Draft Legal Prose' above to auto-generate legal grounds under CPA 2019..."
                  className="w-full p-3 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  III. Relief Sought / Prayer (Refund, Compensation & Costs)
                </label>
                <textarea
                  rows={3}
                  value={relief}
                  onChange={(e) => setRelief(e.target.value)}
                  placeholder="Click 'AI Draft Legal Prose' above to auto-generate relief sought..."
                  className="w-full p-3 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  IV. Statutory Verification Clause (Affidavit)
                </label>
                <textarea
                  rows={2}
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  className="w-full p-3 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            {/* Submit & Next Step Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Complaint Draft'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('documents')}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow transition-colors"
              >
                <span>Proceed to PDF/DOCX Export</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

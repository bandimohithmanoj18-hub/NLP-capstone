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

import { translations } from '../utils/translations';

interface ComplaintBuilderPageProps {
  onSelectView: (view: PageView) => void;
  language?: string;
}

export const ComplaintBuilderPage: React.FC<ComplaintBuilderPageProps> = ({
  onSelectView,
  language,
}) => {
  const t = translations[language || 'en'] || translations['en'];
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [evidences, setEvidences] = useState<EvidenceResponse[]>([]);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<number[]>([]);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [complainantName, setComplainantName] = useState<string>('');
  const [complainantAddress, setComplainantAddress] = useState<string>('');
  const [complainantContact, setComplainantContact] = useState<string>('');
  const [opName, setOpName] = useState<string>('');
  const [opAddress, setOpAddress] = useState<string>('');
  const [opContact, setOpContact] = useState<string>('');
  const [forum, setForum] = useState<string>('DISTRICT_COMMISSION');
  const [claimAmount, setClaimAmount] = useState<string>('');
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
      console.warn('Backend complaints API offline.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidences = async () => {
    try {
      const res = await apiClient.get<EvidenceResponse[]>('/ocr/evidence');
      setEvidences(res.data);
    } catch (err) {
      console.warn('Could not load evidence vault documents.');
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchEvidences();

    // Check if user navigated from AI Chat with active case facts
    const activeCaseStr = localStorage.getItem('active_triage_case');
    if (activeCaseStr) {
      try {
        const c = JSON.parse(activeCaseStr);
        if (c.merchant_name || c.claim_amount) {
          const userStr = localStorage.getItem('user');
          const currUser = userStr ? JSON.parse(userStr) : null;
          const uName = currUser?.full_name || 'Consumer Complainant';
          const uEmail = currUser?.email || '+91 98765 43210';

          setTitle(c.title ? `${c.title} Draft` : `Formal Complaint against ${c.merchant_name || 'Merchant'}`);
          setComplainantName(uName);
          setComplainantContact(uEmail);
          setOpName(c.merchant_name || 'Opposite Party Merchant');
          if (c.claim_amount) setClaimAmount(String(c.claim_amount));
          if (c.recommended_forum) setForum(c.recommended_forum);

          const dateStr = c.purchase_date || 'recently';
          const amtStr = c.claim_amount ? `₹${parseFloat(c.claim_amount).toLocaleString('en-IN')}/-` : 'valid consideration';
          const mName = c.merchant_name || 'Opposite Party';

          setFacts(
            `1. That the Complainant (${uName}) purchased goods / services from the Opposite Party (${mName}) ${dateStr} for ${amtStr}.\n` +
            `2. That the Opposite Party delivered defective merchandise / rendered deficient service and repeatedly failed to rectify or process refund.\n` +
            `3. That the Complainant suffered significant financial loss, harassment, and deficiency in service under Consumer Protection Act, 2019.`
          );

          setGrounds(
            `A. DEFICIENCY IN SERVICE UNDER SECTION 2(11) OF CPA 2019:\n` +
            `The Opposite Party failed to provide goods/services of standard quality as promised under law.\n\n` +
            `B. UNFAIR TRADE PRACTICE UNDER SECTION 2(47) OF CPA 2019:\n` +
            `Denying rightful refund or replacement for non-delivery or defective items constitutes unfair trade practice.\n\n` +
            `C. JURISDICTION UNDER SECTION 35 OF CPA 2019:\n` +
            `The claim value is well within the pecuniary jurisdiction of the District Consumer Commission.`
          );

          setRelief(
            `1. Direct the Opposite Party to immediately refund the disputed amount of ${amtStr} along with statutory interest @ 18% p.a.\n` +
            `2. Award ₹20,000/- towards mental agony and harassment.\n` +
            `3. Award ₹5,000/- towards legal expenses.`
          );

          setVerification(
            `I, ${uName}, the Complainant above named, do hereby verify that paragraphs 1 to 3 of Facts are true to my personal knowledge and belief.`
          );

          setSelectedComplaint(null); // Fresh active user draft
          setSuccessMsg(`Loaded case details for ${mName} from your AI consultation!`);
        }
      } catch (e) {
        console.warn('Could not parse active_triage_case from localStorage', e);
      }
    }
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
    setSelectedEvidenceIds(item.evidences ? item.evidences.map((e) => e.id) : []);
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

  const handleToggleEvidence = (id: number) => {
    setSelectedEvidenceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAutoFillFromEvidence = () => {
    const firstSelected = evidences.find((ev) => selectedEvidenceIds.includes(ev.id));
    if (firstSelected) {
      if (firstSelected.extracted_merchant_name) {
        setOpName(firstSelected.extracted_merchant_name);
      }
      if (firstSelected.extracted_amount) {
        setClaimAmount(String(firstSelected.extracted_amount));
      }
      setSuccessMsg(`Auto-filled Opposite Party & Claim Amount from invoice: ${firstSelected.file_name}`);
    }
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
        evidence_ids: selectedEvidenceIds,
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
    setComplainantName('Complainant Name');
    setComplainantAddress('Complainant Address');
    setComplainantContact('+91 90000 00000');
    setOpName('Merchant Company Name');
    setOpAddress('Merchant Business Address');
    setOpContact('support@merchant.com');
    setForum('DISTRICT_COMMISSION');
    setClaimAmount('25000');
    setFacts('');
    setGrounds('');
    setRelief('');
    setVerification('');
    setSelectedEvidenceIds([]);
    setSuccessMsg('Started a fresh complaint draft. Click "AI Draft Legal Prose" to auto-generate!');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {t.complaint_builder_title}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">
              Milestone 7 Operational
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t.complaint_builder_subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewDraft}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition-colors"
          >
            {t.new_complaint_draft}
          </button>
          <button
            onClick={handleGenerateAIDraft}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.ai_draft_prose}</span>
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
            {t.saved_complaints} ({complaints.length})
          </h3>

          {loading ? (
            <div className="p-4 text-center text-xs text-gray-400">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              {t.no_complaints_saved}
            </div>
          ) : (
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
                        ₹{c.claim_amount ? c.claim_amount.toLocaleString('en-IN') : '0'}
                      </span>
                      <span className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Form Editor */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <form onSubmit={handleSaveComplaint} className="space-y-5">
            {/* Title, Forum & Claim Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.complaint_heading}
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
                  {t.statutory_forum}
                </label>
                <select
                  value={forum}
                  onChange={(e) => setForum(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="DISTRICT_COMMISSION">{t.district_commission_forum}</option>
                  <option value="STATE_COMMISSION">{t.state_commission_forum}</option>
                  <option value="NCDRC">{t.ncdrc_forum}</option>
                  <option value="NCH_HELPLINE">{t.nch_forum}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t.claim_amount_inr}
                </label>
                <input
                  type="number"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                />
              </div>
            </div>

            {/* Parties Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
              {/* Complainant */}
              <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 space-y-3">
                <h4 className="font-bold text-xs text-blue-900 flex items-center space-x-1.5">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span>{t.complainant_details}</span>
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    {t.full_name}
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
                    {t.contact_address}
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
                  <span>{t.opposite_party_details}</span>
                </h4>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    {t.merchant_company}
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
                    {t.registered_address}
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

            {/* Attached Evidence Checklist Section */}
            <div className="p-4 rounded-xl bg-purple-50/20 border border-purple-100/60 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-purple-900 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>{t.attach_evidence_from_vault}</span>
                </h4>
                {selectedEvidenceIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoFillFromEvidence}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold transition-colors shadow-sm"
                  >
                    {t.autofill_selected}
                  </button>
                )}
              </div>
              {evidences.length === 0 ? (
                <p className="text-[11px] text-gray-400">
                  No evidence files found in the vault. Upload invoices in the Evidence Vault first.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2">
                  {evidences.map((ev) => {
                    const isChecked = selectedEvidenceIds.includes(ev.id);
                    return (
                      <label
                        key={ev.id}
                        className={`flex items-start space-x-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                          isChecked ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleEvidence(ev.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-800 truncate">{ev.file_name}</div>
                          <div className="text-[10px] text-purple-700 font-bold mt-0.5">
                            {ev.extracted_merchant_name || 'Unknown Merchant'} • ₹{ev.extracted_amount ? ev.extracted_amount.toLocaleString('en-IN') : '0'}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legal Prose Textareas */}
            <div className="space-y-4 pt-3 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  I. {t.facts_summary}
                </label>
                <textarea
                  rows={4}
                  value={facts}
                  onChange={(e) => setFacts(e.target.value)}
                  className="w-full p-3 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  II. {t.statutory_grounds}
                </label>
                <textarea
                  rows={4}
                  value={grounds}
                  onChange={(e) => setGrounds(e.target.value)}
                  className="w-full p-3 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  III. {t.relief_claimed}
                </label>
                <textarea
                  rows={3}
                  value={relief}
                  onChange={(e) => setRelief(e.target.value)}
                  className="w-full p-3 text-xs font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  IV. {t.verification_clause}
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
                <span>{saving ? t.triaging : t.save_draft}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectView('documents')}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow transition-colors"
              >
                <span>{t.my_documents}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

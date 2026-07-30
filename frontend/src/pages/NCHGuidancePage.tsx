import React, { useState, useEffect } from 'react';
import {
  Scale,
  Calculator,
  BookOpen,
  Search,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  MapPin,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';
import apiClient from '../services/api';

interface JurisdictionResponse {
  claim_amount_inr: number;
  recommended_forum: string;
  forum_display_name: string;
  statutory_court_fee_inr: number;
  statutory_rule_reference: string;
  territorial_jurisdiction: string;
  next_steps: string[];
}

interface CourtFeeTier {
  min_amount_inr: number;
  max_amount_inr: number;
  fee_inr: number;
  tier_label: string;
}

interface RedressalStep {
  step_number: number;
  title: string;
  forum: string;
  description: string;
  expected_timeline: string;
}

interface RAGResultItem {
  id: number;
  guideline_code: string;
  title: string;
  category: string;
  forum_level: string;
  summary: string;
  full_text: string;
  statutory_reference?: string;
  similarity_score: number;
}

export const NCHGuidancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'flowchart' | 'rag'>('calculator');

  // Calculator State
  const [claimAmount, setClaimAmount] = useState<string>('45000');
  const [category, setCategory] = useState<string>('e-commerce');
  const [assessment, setAssessment] = useState<JurisdictionResponse | null>(null);
  const [loadingCalc, setLoadingCalc] = useState<boolean>(false);

  // Court fees schedule
  const [feeTiers, setFeeTiers] = useState<CourtFeeTier[]>([]);
  // Flowchart steps
  const [flowchartSteps, setFlowchartSteps] = useState<RedressalStep[]>([]);

  // RAG Search State
  const [ragQuery, setRagQuery] = useState<string>('e-commerce refund refusal defective appliance');
  const [ragResults, setRagResults] = useState<RAGResultItem[]>([]);
  const [ragSynth, setRagSynth] = useState<string>('');
  const [loadingRag, setLoadingRag] = useState<boolean>(false);

  const runAssessment = async () => {
    setLoadingCalc(true);
    try {
      const amt = parseFloat(claimAmount) || 0;
      const res = await apiClient.post<JurisdictionResponse>('/nch/assess-jurisdiction', {
        claim_amount_inr: amt,
        category,
      });
      setAssessment(res.data);
    } catch (err) {
      console.error('Failed to run jurisdiction assessment', err);
    } finally {
      setLoadingCalc(false);
    }
  };

  const fetchStaticData = async () => {
    try {
      const [feesRes, flowRes] = await Promise.all([
        apiClient.get<CourtFeeTier[]>('/nch/court-fees'),
        apiClient.get<RedressalStep[]>('/nch/flowchart'),
      ]);
      setFeeTiers(feesRes.data);
      setFlowchartSteps(flowRes.data);
    } catch (err) {
      console.error('Error fetching statutory fee tiers', err);
    }
  };

  const runRagSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ragQuery.trim()) return;
    setLoadingRag(true);
    try {
      const res = await apiClient.post('/rag/query', {
        query: ragQuery,
        top_k: 3,
      });
      setRagResults(res.data.results);
      setRagSynth(res.data.synthesized_answer);
    } catch (err) {
      console.error('RAG query error', err);
    } finally {
      setLoadingRag(false);
    }
  };

  useEffect(() => {
    runAssessment();
    fetchStaticData();
    runRagSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold text-gray-900">
              NCH Guidance & Legal Redressal Module
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Milestone 6 & 9 Operational
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Calculate pecuniary jurisdiction, statutory court fees, and search National Consumer Helpline (1915) guidelines.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'calculator'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Forum & Fee Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('flowchart')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'flowchart'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Redressal Roadmap</span>
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'rag'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>RAG Legal Search</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FORUM & COURT FEE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Claim Valuation Input</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Disputed Claim Amount (INR)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="number"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Include cost of goods + compensation sought.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Consumer Grievance Domain
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="e-commerce">E-Commerce & Online Retail</option>
                <option value="banking">Banking & Electronic Payments</option>
                <option value="airline">Airlines & Transportation</option>
                <option value="telecom">Telecom & Broadband</option>
                <option value="housing">Real Estate & Housing (RERA)</option>
                <option value="general">General Consumer Goods</option>
              </select>
            </div>

            <button
              onClick={runAssessment}
              disabled={loadingCalc}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              {loadingCalc ? 'Calculating...' : 'Calculate Forum & Fee'}
            </button>

            {/* Quick Fee Schedule Table */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-2">
                Statutory Court Fee Schedule (CPA 2020)
              </h4>
              <div className="space-y-1 text-xs">
                {feeTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between py-1 border-b border-gray-50 text-[11px]"
                  >
                    <span className="text-gray-600">{tier.tier_label}</span>
                    <span className="font-bold text-gray-900">
                      ₹{tier.fee_inr.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment Output Panel */}
          <div className="md:col-span-2 space-y-4">
            {assessment ? (
              <>
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase text-blue-200">
                        Recommended Statutory Forum
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mt-1">
                        {assessment.forum_display_name}
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono">
                      {assessment.recommended_forum}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                    <div>
                      <div className="text-xs text-blue-200">
                        Statutory Court Fee Payable
                      </div>
                      <div className="text-2xl font-extrabold text-green-300">
                        {assessment.statutory_court_fee_inr === 0
                          ? 'NIL (₹0.00)'
                          : `₹${assessment.statutory_court_fee_inr.toLocaleString('en-IN')}.00`}
                      </div>
                      <div className="text-[11px] text-blue-200 mt-0.5">
                        {assessment.statutory_rule_reference}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-blue-200">
                        Territorial Jurisdiction
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        {assessment.territorial_jurisdiction}
                      </div>
                      <div className="text-[11px] text-blue-200 mt-0.5">
                        Section 34 / 35 CPA 2019
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Next Steps */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-900 text-base flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>Statutory Pre-Filing Roadmap</span>
                  </h4>
                  <div className="space-y-3">
                    {assessment.next_steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="text-sm text-gray-700 font-medium">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-gray-400">
                Calculating jurisdiction assessment...
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REDRESSAL ROADMAP & FLOWCHART */}
      {activeTab === 'flowchart' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 text-lg">
              Consumer Grievance Redressal Flowchart (CPA 2019)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {flowchartSteps.map((step) => (
                <div
                  key={step.step_number}
                  className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      Step {step.step_number}
                    </span>
                    <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {step.expected_timeline}
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm">
                    {step.title}
                  </h4>
                  <div className="text-xs font-semibold text-blue-700">
                    Forum: {step.forum}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RAG LEGAL SEARCH */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Search NCH Guidelines & Consumer Protection Act 2019 Corpus</span>
            </h3>

            <form onSubmit={runRagSearch} className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  placeholder="e.g. limitation period for defective appliance under CPA 2019..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loadingRag}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
              >
                {loadingRag ? 'Searching...' : 'Search RAG'}
              </button>
            </form>

            {/* Synthesized RAG Guidance */}
            {ragSynth && (
              <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 text-sm text-gray-800 space-y-2 font-sans leading-relaxed">
                <div className="whitespace-pre-wrap">{ragSynth}</div>
              </div>
            )}

            {/* Retrieved Document Citations */}
            <div className="space-y-3 pt-3">
              <h4 className="font-bold text-gray-900 text-sm">
                Retrieved Statutory Citations ({ragResults.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ragResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {item.guideline_code}
                      </span>
                      <span className="text-xs font-semibold text-green-700">
                        {(item.similarity_score * 100).toFixed(0)}% Match
                      </span>
                    </div>
                    <h5 className="font-bold text-gray-900 text-sm">
                      {item.title}
                    </h5>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="text-[11px] text-gray-400 font-mono pt-1 border-t border-gray-100">
                      {item.statutory_reference} • Forum: {item.forum_level}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

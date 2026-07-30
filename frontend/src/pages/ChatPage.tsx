import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Scale,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  BookOpen,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from 'lucide-react';
import {
  ChatSessionSummary,
  ChatSession,
  ChatMessage,
  ExtractedTriageEntities,
  PageView,
} from '../types';
import {
  getChatSessions,
  createChatSession,
  getChatSessionHistory,
  sendChatMessage,
  deleteChatSession,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatPageProps {
  onSelectView: (view: PageView) => void;
  language: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onSelectView, language }) => {
  const { isAuthenticated, user } = useAuth();

  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [listening, setListening] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setErrorMsg(null);
    try {
      const data = await getChatSessions();
      setSessions(data);
      if (data.length > 0 && !activeSession) {
        await loadSessionHistory(data[0].id);
      } else if (data.length === 0) {
        await handleCreateSession('New Legal Consultation', 'e-commerce');
      }
    } catch (err: any) {
      setErrorMsg('Could not load consultation sessions.');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSessionHistory = async (sessionId: number) => {
    setLoadingHistory(true);
    setErrorMsg(null);
    try {
      const data = await getChatSessionHistory(sessionId);
      setActiveSession(data);
    } catch (err: any) {
      setErrorMsg('Could not load session message history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const handleCreateSession = async (title?: string, domain?: string) => {
    setLoadingHistory(true);
    setErrorMsg(null);
    try {
      const newSession = await createChatSession(
        title || 'New Legal Consultation',
        domain || 'e-commerce'
      );
      setActiveSession(newSession);
      const updatedList = await getChatSessions();
      setSessions(updatedList);
    } catch (err: any) {
      setErrorMsg('Failed to start a new consultation session.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteSession = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChatSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (activeSession?.id === sessionId) {
        if (remaining.length > 0) {
          await loadSessionHistory(remaining[0].id);
        } else {
          await handleCreateSession();
        }
      }
    } catch (err: any) {
      setErrorMsg('Could not delete consultation session.');
    }
  };

  const handleSpeakMessage = (msgId: number, content: string) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const plainText = content.replace(/[*#`_\\-]/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);

    const voices = window.speechSynthesis.getVoices();
    let langCode = 'en-IN';
    if (language === 'hi') langCode = 'hi-IN';
    if (language === 'ta') langCode = 'ta-IN';
    if (language === 'te') langCode = 'te-IN';

    const selectedVoice = voices.find((v) => v.lang.startsWith(langCode));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = langCode;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };
    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    let langCode = 'en-IN';
    if (language === 'hi') langCode = 'hi-IN';
    if (language === 'ta') langCode = 'ta-IN';
    if (language === 'te') langCode = 'te-IN';
    recognition.lang = langCode;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputPrompt((prev) => (prev ? prev + ' ' + speechToText : speechToText));
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const promptToSend = customText || inputPrompt;
    if (!promptToSend.trim() || !activeSession || sending) return;

    setSending(true);
    setErrorMsg(null);
    if (!customText) setInputPrompt('');

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      session_id: activeSession.id,
      role: 'user',
      content: promptToSend,
    };
    setActiveSession((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempUserMsg] } : null
    );

    try {
      const aiReply = await sendChatMessage(activeSession.id, promptToSend, language);
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              messages: [
                ...prev.messages.filter((m) => m.id !== tempUserMsg.id),
                tempUserMsg,
                aiReply,
              ],
            }
          : null
      );
      // Refresh sidebar titles if needed
      const updatedList = await getChatSessions();
      setSessions(updatedList);
    } catch (err: any) {
      setErrorMsg('Error generating AI legal triage assessment.');
    } finally {
      setSending(false);
    }
  };

  // Helper to get extracted entities from latest assistant message
  const getLatestEntities = (): ExtractedTriageEntities | null => {
    if (!activeSession || !activeSession.messages.length) return null;
    const assistantMsgs = activeSession.messages.filter(
      (m) => m.role === 'assistant' && m.extracted_entities_json
    );
    if (!assistantMsgs.length) return null;
    try {
      const lastMsg = assistantMsgs[assistantMsgs.length - 1];
      return lastMsg.extracted_entities_json
        ? JSON.parse(lastMsg.extracted_entities_json)
        : null
    } catch (e) {
      return null;
    }
  };

  const latestEntities = getLatestEntities();

  const domainFilters = [
    { id: 'all', label: 'All Domains' },
    { id: 'e-commerce', label: 'E-Commerce' },
    { id: 'banking', label: 'Banking & Finance' },
    { id: 'telecom', label: 'Telecom' },
    { id: 'airline', label: 'Airlines' },
    { id: 'housing', label: 'Housing / RERA' },
  ];

  const quickPrompts = [
    "I bought a refrigerator from an online merchant for Rs. 45,000 on 15th June 2026. The compressor failed after 10 days and customer care refused replacement.",
    "A private bank debited Rs. 75,000 from my credit card without OTP or authorization.",
    "A domestic flight ticket was cancelled without notice and the airline refused ticket refund.",
    "A telecom broadband operator charged Rs. 3,500 extra billing after disconnection request.",
  ];

  const filteredSessions =
    selectedDomainFilter === 'all'
      ? sessions
      : sessions.filter((s) => s.domain_category === selectedDomainFilter);

  const formatForumLabel = (forumCode?: string) => {
    switch (forumCode) {
      case 'DISTRICT_COMMISSION':
        return 'District Commission (up to ₹50 Lakhs)';
      case 'STATE_COMMISSION':
        return 'State Commission (₹50 Lakhs - ₹2 Crores)';
      case 'NCDRC':
        return 'NCDRC (National Commission - above ₹2 Crores)';
      default:
        return 'NCH Helpline / District Forum';
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 1. LEFT PANEL: Consultation Sessions Sidebar */}
      <div className="w-72 bg-gray-50/70 border-r border-gray-200 flex flex-col justify-between">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">Consultations</h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {sessions.length}
            </span>
          </div>
          <button
            onClick={() => handleCreateSession('New Legal Consultation', 'e-commerce')}
            disabled={loadingHistory}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>

          {/* Domain Category Filter Badges */}
          <div className="flex flex-wrap gap-1 mt-3">
            {domainFilters.map((df) => (
              <button
                key={df.id}
                onClick={() => setSelectedDomainFilter(df.id)}
                className={`text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${
                  selectedDomainFilter === df.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>
        </div>

        {/* Saved Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {loadingSessions ? (
            <div className="p-4 text-center text-xs text-gray-400">
              Loading sessions...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400">
              No consultation sessions found.
            </div>
          ) : (
            filteredSessions.map((sess) => {
              const isActive = activeSession?.id === sess.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => loadSessionHistory(sess.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-100/60'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      {sess.title}
                    </div>
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 uppercase">
                        {sess.domain_category || 'general'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {sess.message_count} msgs
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(sess.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-gray-200 bg-white text-[11px] text-gray-500 text-center">
          Persisted in SQLite (`chat_messages`)
        </div>
      </div>

      {/* 2. MAIN PANEL: Conversational Legal Triage Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Workspace Header */}
        <div className="h-14 border-b border-gray-200 px-6 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {activeSession?.title || 'Legal Consultation'}
              </h3>
              <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                <span className="font-semibold text-blue-700 uppercase">
                  {activeSession?.domain_category || 'GENERAL'}
                </span>
                <span>•</span>
                <span>CPA 2019 Statutory Triage</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              <span>Milestone 3 Operational</span>
            </span>
          </div>
        </div>

        {/* Message History Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400 space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading consultation history...</span>
            </div>
          ) : activeSession?.messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No messages yet. Ask a legal question to begin triage.
            </div>
          ) : (
            activeSession?.messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-gray-50 border border-gray-200 text-gray-800 shadow-sm'
                        : 'bg-blue-600 text-white shadow'
                    }`}
                  >
                    {isAssistant && (
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700 mb-2 pb-2 border-b border-gray-200 w-full">
                        <Scale className="w-4 h-4 animate-pulse" />
                        <span>AI Legal Redressal Assistant</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold ml-2">
                          CPA 2019
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSpeakMessage(msg.id, msg.content)}
                          className="ml-auto px-2 py-1 bg-white hover:bg-gray-100 text-gray-600 hover:text-blue-700 rounded-md border border-gray-200/60 shadow-sm flex items-center space-x-1 font-bold text-[10px] transition-colors"
                          title="Read message aloud"
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>Listen</span>
                        </button>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (when session has <= 1 message) */}
        {activeSession && activeSession.messages.length <= 1 && (
          <div className="px-6 py-2 bg-gray-50 border-t border-gray-100">
            <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Suggested Consumer Grievance Scenarios (Click to test triage):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, promptText)}
                  disabled={sending}
                  className="text-left text-xs p-2.5 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 text-gray-700 font-medium transition-colors line-clamp-2"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {errorMsg && (
            <div className="mb-2 p-2 rounded bg-red-50 text-red-700 text-xs border border-red-200">
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Describe your consumer grievance (merchant name, purchase date, invoice amount, what went wrong)..."
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={sending}
            />
            <button
              type="button"
              onClick={startVoiceDictation}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                listening
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-600'
              }`}
              title="Dictate query using voice"
            >
              {listening ? <MicOff className="w-4 h-4 text-red-600 animate-pulse" /> : <Mic className="w-4 h-4 text-gray-500" />}
            </button>
            <button
              type="submit"
              disabled={sending || !inputPrompt.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 transition-colors shadow-md"
            >
              <span>{sending ? 'Triaging...' : 'Send'}</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* 3. RIGHT PANEL: Live Case Fact Sheet & Statutory Triage */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <div className="flex items-center space-x-2 text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm">Case Fact Sheet</h3>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Extracted automatically from chat via rule-based triage NLP.
            </p>
          </div>

          {/* Extracted Facts Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-3.5 space-y-3 shadow-sm">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase">
                Opposite Party (Merchant)
              </div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">
                {latestEntities?.merchant_name || 'Not identified yet'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase">
                Disputed Claim Value
              </div>
              <div className="text-sm font-bold text-blue-600 mt-0.5">
                {latestEntities?.claim_amount_inr
                  ? `₹${latestEntities.claim_amount_inr.toLocaleString('en-IN')}.00`
                  : 'Not identified yet'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase">
                Transaction / Purchase Date
              </div>
              <div className="text-sm font-semibold text-gray-800 mt-0.5">
                {latestEntities?.purchase_date || 'Not identified yet'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase">
                Statutory Dispute Forum
              </div>
              <div className="text-xs font-bold text-purple-800 mt-0.5 p-2 rounded bg-purple-50 border border-purple-200">
                {formatForumLabel(latestEntities?.recommended_forum)}
              </div>
            </div>
          </div>

          {/* Clarification Checklist */}
          <div className="bg-white rounded-xl border border-gray-200 p-3.5 space-y-2 shadow-sm">
            <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Missing Clarifications:</span>
            </h4>
            {latestEntities && latestEntities.missing_clarifications.length > 0 ? (
              <ul className="space-y-1.5">
                {latestEntities.missing_clarifications.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-green-700 font-semibold flex items-center space-x-1 p-2 bg-green-50 rounded">
                <CheckCircle2 className="w-4 h-4" />
                <span>All primary facts identified!</span>
              </div>
            )}
          </div>

          {/* Statutory Provisions Citing */}
          {latestEntities && latestEntities.statutory_provisions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-3.5 space-y-2 shadow-sm">
              <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Statutory Authority:</span>
              </h4>
              <ul className="space-y-1">
                {latestEntities.statutory_provisions.map((prov, idx) => (
                  <li key={idx} className="text-[11px] text-gray-700 bg-gray-50 p-1.5 rounded border border-gray-100 font-mono">
                    {prov}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons to next milestones */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onSelectView('complaint_builder')}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-between shadow transition-all"
          >
            <span>Proceed to Complaint Builder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectView('evidence')}
            className="w-full py-2 px-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold rounded-xl flex items-center justify-between transition-all"
          >
            <span>Attach Evidence Vault OCR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

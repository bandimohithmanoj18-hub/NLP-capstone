import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Scale, Server, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginDemo, loading, error, clearError } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdvocate, setIsAdvocate] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Server URL config state
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('custom_api_url') || '');
  const [urlSaved, setUrlSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveServerUrl = () => {
    if (serverUrl.trim()) {
      localStorage.setItem('custom_api_url', serverUrl.trim());
    } else {
      localStorage.removeItem('custom_api_url');
    }
    setUrlSaved(true);
    setTimeout(() => setUrlSaved(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    try {
      if (activeTab === 'login') {
        await login({ email, password });
      } else if (activeTab === 'register') {
        await register({
          email,
          password,
          full_name: fullName,
          phone_number: phone,
          is_advocate: isAdvocate,
        });
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Authentication error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2.5">
            <Scale className="w-6 h-6" />
            <h3 className="font-bold text-lg">AI Consumer Redressal Account</h3>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            Access secure evidence vaults, saved complaints, and NCH triage history.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => {
              setActiveTab('login');
              clearError();
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              clearError();
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {(formError || error) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {activeTab === 'register' && (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isAdvocate"
                  checked={isAdvocate}
                  onChange={(e) => setIsAdvocate(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="isAdvocate" className="text-xs text-gray-700 font-medium cursor-pointer">
                  I am a Legal Advocate / Legal Practitioner
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-lg shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                ⚡ Instant Demo Sign In (No Backend Required)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  loginDemo('consumer');
                  onClose();
                }}
                className="py-2 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-medium rounded-lg border border-blue-200/60 transition-colors flex items-center justify-center space-x-1"
              >
                <span>Demo Consumer</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  loginDemo('advocate');
                  onClose();
                }}
                className="py-2 px-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-medium rounded-lg border border-purple-200/60 transition-colors flex items-center justify-center space-x-1"
              >
                <span>Demo Advocate</span>
              </button>
            </div>
          </div>

          {/* Custom Backend URL Configuration */}
          <div className="pt-1 border-t border-gray-100 text-left">
            <button
              type="button"
              onClick={() => setShowServerConfig(!showServerConfig)}
              className="text-[11px] text-gray-500 hover:text-blue-600 flex items-center space-x-1 transition-colors"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{showServerConfig ? 'Hide Server Configuration' : 'Connect Live Backend (Render / Railway)'}</span>
            </button>
            {showServerConfig && (
              <div className="mt-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                <label className="block text-[10px] font-semibold text-gray-600">
                  Backend API URL (FastAPI)
                </label>
                <div className="flex space-x-1.5">
                  <input
                    type="url"
                    placeholder="https://nlp-capstone-api.onrender.com"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveServerUrl}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white text-xs font-semibold rounded transition-colors flex items-center space-x-1"
                  >
                    {urlSaved ? <Check className="w-3.5 h-3.5 text-green-400" /> : null}
                    <span>{urlSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Enter your hosted backend URL. Leave blank to use relative <code>/api/v1</code> or Vercel standalone demo mode.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

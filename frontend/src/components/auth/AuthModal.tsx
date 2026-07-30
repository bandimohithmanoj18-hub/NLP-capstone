import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Scale, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    login,
    register,
    loginAsDemoConsumer,
    loginAsDemoAdvocate,
    loading,
    error,
    clearError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'demo'>('demo');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isAdvocate, setIsAdvocate] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleDemoConsumer = async () => {
    setFormError(null);
    clearError();
    try {
      await loginAsDemoConsumer();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to login as demo consumer');
    }
  };

  const handleDemoAdvocate = async () => {
    setFormError(null);
    clearError();
    try {
      await loginAsDemoAdvocate();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to login as demo advocate');
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
              setActiveTab('demo');
              clearError();
            }}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'demo'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1" />
            Demo Accounts
          </button>
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

          {activeTab === 'demo' ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-600">
                Click a demo account below to test authenticated OAuth2 JWT login instantly without registration:
              </p>
              <button
                onClick={handleDemoConsumer}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-100/50 transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-bold text-blue-900">
                    Rajesh Kumar (Demo Consumer)
                  </div>
                  <div className="text-xs text-blue-700">consumer@example.com</div>
                  <div className="text-[11px] text-blue-600 mt-0.5">
                    Standard Consumer Grievance Role
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </button>

              <button
                onClick={handleDemoAdvocate}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-100/50 transition-colors text-left"
              >
                <div>
                  <div className="text-sm font-bold text-purple-900">
                    Adv. Priya Sharma (Demo Legal Advocate)
                  </div>
                  <div className="text-xs text-purple-700">advocate@example.com</div>
                  <div className="text-[11px] text-purple-600 mt-0.5">
                    Legal Practitioner & Advocate Role
                  </div>
                </div>
                <Scale className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          ) : (
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="consumer@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    min-length={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {activeTab === 'register' && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="advocate-check"
                    checked={isAdvocate}
                    onChange={(e) => setIsAdvocate(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="advocate-check"
                    className="text-xs text-gray-700 font-medium"
                  >
                    I am a Legal Advocate / Legal Practitioner
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-md mt-2"
              >
                {loading
                  ? 'Processing...'
                  : activeTab === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

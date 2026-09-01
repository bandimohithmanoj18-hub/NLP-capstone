import React from 'react';
import { Scale, CheckCircle2, AlertCircle, RefreshCw, User as UserIcon, LogOut, LogIn } from 'lucide-react';
import { HealthCheckResponse, PageView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';

interface NavbarProps {
  health: HealthCheckResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectView: (view: PageView) => void;
  onOpenAuthModal: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  loading,
  onRefresh,
  onSelectView,
  onOpenAuthModal,
  language,
  onLanguageChange,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const t = translations[language] || translations['en'];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Title */}
          <div
            onClick={() => onSelectView('dashboard')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white shadow-sm">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                {t.app_title}
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Selector Dropdown */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 space-x-1 shadow-sm">
              <span className="text-xs text-gray-400">🌐</span>
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
              </select>
            </div>

            {/* Health Status Indicator */}
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 space-x-2 shadow-sm">
              {health && health.status === 'online' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-xs font-medium text-gray-700">
                {t.api_status}: <strong className="text-gray-900">{health ? health.status.toUpperCase() : 'CHECKING...'}</strong>
              </span>
              <button
                onClick={onRefresh}
                disabled={loading}
                title="Refresh system health"
                className="text-gray-400 hover:text-gray-600 ml-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Auth User Pill */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onSelectView('profile')}
                  className="flex items-center space-x-2 bg-blue-50 border border-blue-200 hover:bg-blue-100/60 transition-colors px-3 py-1.5 rounded-full text-xs font-semibold text-blue-900"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[9px] uppercase ml-1">
                    {user.is_advocate ? 'Advocate' : 'Consumer'}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.sign_in}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

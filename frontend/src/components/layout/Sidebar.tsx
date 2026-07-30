import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BookOpen,
  Scale,
  FolderDown,
  Layers,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { PageView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';

interface SidebarProps {
  currentView: PageView;
  onSelectView: (view: PageView) => void;
  language: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, language }) => {
  const { isAuthenticated, user } = useAuth();
  const t = translations[language] || translations['en'];

  const navItems = [
    {
      id: 'dashboard' as PageView,
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'profile' as PageView,
      label: t.my_profile,
      icon: UserIcon,
    },
    {
      id: 'chat' as PageView,
      label: t.ai_assistant,
      icon: MessageSquare,
    },
    {
      id: 'evidence' as PageView,
      label: t.evidence_vault,
      icon: FileText,
    },
    {
      id: 'nch_guidance' as PageView,
      label: t.guidelines,
      icon: BookOpen,
    },
    {
      id: 'complaint_builder' as PageView,
      label: t.complaint_drafter,
      icon: Scale,
    },
    {
      id: 'documents' as PageView,
      label: t.my_documents,
      icon: FolderDown,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-sm">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {t.nav_modules}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Auth State & Architecture Summary Footer */}
      <div className="mt-8 pt-4 border-t border-gray-100 text-xs text-gray-500 space-y-2">
        {isAuthenticated && user ? (
          <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
            <div className="flex items-center space-x-1.5 text-blue-800 font-semibold mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.session_authenticated}</span>
            </div>
            <div className="text-[11px] text-blue-600 truncate">
              {user.email}
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <div className="font-semibold text-gray-700 mb-0.5">{t.guest_mode}</div>
            <div className="text-[11px] text-gray-500">
              {t.guest_text}
            </div>
          </div>
        )}
        <div className="font-bold text-gray-700">{t.ai_legal_portal}</div>
        <p className="text-gray-500 leading-relaxed text-[11px]">
          {t.statutory_triage_text}
        </p>
      </div>
    </aside>
  );
};

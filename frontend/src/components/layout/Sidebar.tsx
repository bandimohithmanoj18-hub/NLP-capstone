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

interface SidebarProps {
  currentView: PageView;
  onSelectView: (view: PageView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const { isAuthenticated, user } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as PageView,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'profile' as PageView,
      label: 'My Profile',
      icon: UserIcon,
    },
    {
      id: 'chat' as PageView,
      label: 'AI Legal Assistant',
      icon: MessageSquare,
    },
    {
      id: 'evidence' as PageView,
      label: 'Evidence Vault',
      icon: FileText,
    },
    {
      id: 'nch_guidance' as PageView,
      label: 'Helplines & Guidelines',
      icon: BookOpen,
    },
    {
      id: 'complaint_builder' as PageView,
      label: 'Complaint Drafter',
      icon: Scale,
    },
    {
      id: 'documents' as PageView,
      label: 'My Documents',
      icon: FolderDown,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Navigation & Modules
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
                  ? 'bg-blue-50 text-blue-700'
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
              <span>Session Authenticated</span>
            </div>
            <div className="text-[11px] text-blue-600 truncate">
              {user.email}
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
            <div className="font-semibold text-gray-700 mb-0.5">Guest Mode</div>
            <div className="text-[11px] text-gray-500">
              Sign in for saved evidence & complaints.
            </div>
          </div>
        )}
        <div className="font-semibold text-gray-700">AI Legal Portal</div>
        <p className="text-gray-500 leading-relaxed text-[11px]">
          Providing automated legal guidance and triaging under the Consumer Protection Act, 2019.
        </p>
      </div>
    </aside>
  );
};

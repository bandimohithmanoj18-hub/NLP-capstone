import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { HealthCheckResponse, PageView } from '../../types';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: PageView;
  onSelectView: (view: PageView) => void;
  health: HealthCheckResponse | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenAuthModal: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentView,
  onSelectView,
  health,
  loading,
  onRefresh,
  onOpenAuthModal,
  language,
  onLanguageChange,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        health={health}
        loading={loading}
        onRefresh={onRefresh}
        onSelectView={onSelectView}
        onOpenAuthModal={onOpenAuthModal}
        language={language}
        onLanguageChange={onLanguageChange}
      />
      <div className="flex-1 flex">
        <Sidebar currentView={currentView} onSelectView={onSelectView} language={language} />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

import React from 'react';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageView } from '../types';

interface PlaceholderPageProps {
  title: string;
  milestoneNumber: number;
  milestoneTitle: string;
  description: string;
  features: string[];
  onSelectView: (view: PageView) => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  milestoneNumber,
  milestoneTitle,
  description,
  features,
  onSelectView,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          Scheduled for Milestone {milestoneNumber}: {milestoneTitle}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{description}</p>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Planned Features for Milestone {milestoneNumber}:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Current Status: Architecture and database schema defined in Milestone 1.
          </span>
          <button
            onClick={() => onSelectView('dashboard')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

interface StatusBadgeProps {
  status: 'completed' | 'in_progress' | 'pending' | 'online' | 'degraded' | 'offline' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'online':
      case 'connected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
      case 'offline':
      case 'disconnected':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getLabel = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          status.toLowerCase() === 'completed' || status.toLowerCase() === 'online'
            ? 'bg-green-600'
            : status.toLowerCase() === 'in_progress'
            ? 'bg-yellow-600'
            : 'bg-gray-400'
        }`}
      />
      {getLabel()}
    </span>
  );
};

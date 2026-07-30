import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500">
      <p>
        AI Consumer Complaint & NCH Guidance System &copy; {new Date().getFullYear()}. Designed for National Consumer Helpline (NCH) & Indian Consumer Protection Act, 2019.
      </p>
    </footer>
  );
};

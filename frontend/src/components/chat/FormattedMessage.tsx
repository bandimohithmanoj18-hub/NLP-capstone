import React from 'react';

interface FormattedMessageProps {
  content: string;
  isAssistant?: boolean;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, isAssistant }) => {
  if (!isAssistant) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  // Parse markdown lines into clean, polished UI elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="space-y-1.5 my-2.5 pl-1">
          {currentList.map((item, idx) => {
            // Clean up list bullet text
            const formattedItem = item
              .replace(/^[-*•]\s*/, '')
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/`([^`]+)`/g, '$1');

            return (
              <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-700 leading-relaxed">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2.5 flex-shrink-0" />
                <span>{renderInlineStyles(item.replace(/^[-*•]\s*/, ''))}</span>
              </li>
            );
          })}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInlineStyles = (text: string) => {
    // Process **bold**, *italic*, `code`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={i} className="text-gray-600 italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold border border-blue-100">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(<hr key={`hr-${index}`} className="my-3 border-gray-200" />);
      return;
    }

    // Main Heading (e.g. ### ⚖️ AI Legal Triage Assessment)
    if (trimmed.startsWith('### ')) {
      flushList();
      const title = trimmed.replace(/^###\s*/, '').replace(/[*#]/g, '').trim();
      elements.push(
        <div key={`h3-${index}`} className="pb-1.5 mb-2 border-b border-blue-100/60">
          <h3 className="text-sm sm:text-base font-bold text-blue-900 flex items-center space-x-1.5">
            <span>{title}</span>
          </h3>
        </div>
      );
      return;
    }

    // Sub Heading (e.g. #### 📋 Extracted Case Facts)
    if (trimmed.startsWith('#### ')) {
      flushList();
      const title = trimmed.replace(/^####\s*/, '').replace(/[*#]/g, '').trim();
      elements.push(
        <h4 key={`h4-${index}`} className="text-xs sm:text-sm font-bold text-gray-900 mt-3 mb-1.5 uppercase tracking-wide">
          {title}
        </h4>
      );
      return;
    }

    // List item (e.g. - Opposite Party: Amazon or - ❓ Exact merchant name)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed);
      return;
    }

    // Ordered list item (e.g. 1. Statutory Right)
    if (/^\d+\.\s/.test(trimmed)) {
      flushList();
      const cleanNum = trimmed.match(/^(\d+)\.\s/)?.[1] || '•';
      const content = trimmed.replace(/^\d+\.\s*/, '');
      elements.push(
        <div key={`ol-${index}`} className="flex items-start my-1.5 text-xs sm:text-sm text-gray-700">
          <span className="font-bold text-blue-600 mr-2 flex-shrink-0">{cleanNum}.</span>
          <div className="leading-relaxed">{renderInlineStyles(content)}</div>
        </div>
      );
      return;
    }

    // Callout / Tip / Advice line
    if (trimmed.startsWith('💡') || trimmed.startsWith('Tip:')) {
      flushList();
      elements.push(
        <div key={`tip-${index}`} className="mt-3 p-2.5 rounded-lg bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-start space-x-2">
          <span className="text-sm">💡</span>
          <div className="leading-relaxed">{renderInlineStyles(trimmed.replace(/^💡\s*/, ''))}</div>
        </div>
      );
      return;
    }

    // Standard paragraph line
    if (trimmed.length > 0) {
      flushList();
      elements.push(
        <p key={`p-${index}`} className="text-xs sm:text-sm text-gray-800 my-1 leading-relaxed">
          {renderInlineStyles(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
};

export default FormattedMessage;

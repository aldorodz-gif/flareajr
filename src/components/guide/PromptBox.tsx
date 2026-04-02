import { useState, useCallback } from 'react';

interface PromptBoxProps {
  children: React.ReactNode;
  label?: string;
}

const PromptBox = ({ children, label }: PromptBoxProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const el = document.createElement('div');
    el.innerHTML = typeof children === 'string' ? children : '';
    // Get text from the pre element rendered below
    const preEl = document.querySelector(`[data-prompt-id="${label}"] pre`);
    const text = preEl?.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, [label, children]);

  return (
    <div>
      {label && (
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[2px] my-2" style={{ color: '#6366F1' }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: 'linear-gradient(90deg, #8B8FE8, #D97FAA)' }} />
          {label}
          <span className="h-px flex-1 ml-2.5" style={{ background: 'rgba(14,30,58,.08)' }} />
        </div>
      )}
      <div data-prompt-id={label} className="relative p-5 mb-4 border" style={{ background: '#1E293B', borderColor: 'rgba(99,102,241,.25)' }}>
        <button
          onClick={handleCopy}
          className={`absolute top-3 right-3 text-[11px] font-semibold px-3 py-1.5 tracking-wide z-10 transition-all duration-150 ${copied ? 'animate-copy-burst' : ''}`}
          style={{
            background: copied ? 'linear-gradient(135deg, #5BBFA0, #4AAA8A)' : 'linear-gradient(135deg, #8B8FE8, #9B78C8)',
            color: '#fff',
            border: 'none',
          }}
        >
          {copied ? 'COPIED ✓' : 'COPY'}
        </button>
        <pre className="text-[13px] leading-[1.85] whitespace-pre-wrap break-words pr-24 font-sans" style={{ color: '#E2E8F0' }}>
          {children}
        </pre>
      </div>
    </div>
  );
};

export default PromptBox;

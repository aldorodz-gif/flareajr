import { useState, useCallback } from 'react';

interface PromptBoxProps {
  children: React.ReactNode;
  label?: string;
}

const PromptBox = ({ children, label }: PromptBoxProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const preEl = document.querySelector(`[data-prompt-id="${label}"] pre`);
    const text = preEl?.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }, [label]);

  return (
    <div>
      {label && (
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[2px] my-2 text-muted-foreground">
          <span className="inline-block w-3.5 h-0.5 bg-border" />
          {label}
          <span className="h-px flex-1 ml-2.5 bg-border" />
        </div>
      )}
      <div data-prompt-id={label} className="relative p-5 mb-4 rounded-lg bg-background border border-border">
        <button
          onClick={handleCopy}
          className={`absolute top-3 right-3 text-[11px] font-semibold px-3 py-1.5 tracking-wide z-10 transition-all duration-150 rounded-md bg-secondary text-secondary-foreground hover:opacity-90 ${copied ? 'animate-copy-burst' : ''}`}
        >
          {copied ? 'COPIED ✓' : 'COPY'}
        </button>
        <pre className="text-[13px] leading-[1.85] whitespace-pre-wrap break-words pr-24 font-sans text-foreground">
          {children}
        </pre>
      </div>
    </div>
  );
};

export default PromptBox;

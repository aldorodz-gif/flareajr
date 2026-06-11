import { ReactNode } from 'react';

interface AiToolCardProps {
  icon: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Shared wrapper for tool sections. Solid dark surface, single 1px border, no badges.
 */
const AiToolCard = ({ icon, title, subtitle, children }: AiToolCardProps) => {
  return (
    <div
      className="rounded-lg"
      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
    >
      <div className="px-6 py-5" style={{ borderBottom: '1px solid #E2E8F0' }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[18px] leading-none">{icon}</span>
          <div>
            <p className="text-[16px] font-semibold tracking-tight" style={{ color: '#0F172A' }}>{title}</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#64748B' }}>{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export default AiToolCard;

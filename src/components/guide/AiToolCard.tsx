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
      style={{ background: '#18181B', border: '1px solid #27272A' }}
    >
      <div className="px-6 py-5" style={{ borderBottom: '1px solid #27272A' }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[18px] leading-none">{icon}</span>
          <div>
            <p className="text-[16px] font-semibold tracking-tight" style={{ color: '#FAFAFA' }}>{title}</p>
            <p className="text-[12px] mt-0.5" style={{ color: '#71717A' }}>{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export default AiToolCard;

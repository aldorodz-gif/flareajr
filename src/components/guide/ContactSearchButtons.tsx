import { useState } from 'react';
import { Search, ChevronDown, Linkedin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContactSearchButtonsProps {
  companyName: string;
  compact?: boolean;
}

export default function ContactSearchButtons({ companyName, compact }: ContactSearchButtonsProps) {
  const [open, setOpen] = useState(false);
  const encoded = encodeURIComponent(companyName);

  const zoomInfoUrl = `https://app.zoominfo.com/#/apps/search/v2/companies?query=${encoded}`;
  const linkedInUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encoded}`;

  return (
    <div className="inline-flex items-center rounded-md overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
      <a
        href={zoomInfoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-slate-50"
        style={{ color: '#64748B', background: '#FFFFFF' }}
        title="Find contacts on ZoomInfo"
      >
        <Search size={12} />
        {compact ? 'Find' : 'Find Contacts'}
      </a>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center justify-center px-1.5 py-1.5 transition-colors hover:bg-slate-50"
            style={{ color: '#94A3B8', background: '#FFFFFF', borderLeft: '1px solid #E2E8F0' }}
            aria-label="More search options"
          >
            <ChevronDown size={12} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          <DropdownMenuItem asChild>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Linkedin size={14} style={{ color: '#0A66C2' }} />
              <span className="text-[12px]">Search LinkedIn</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

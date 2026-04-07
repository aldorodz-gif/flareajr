import { useState } from 'react';

export interface CadenceStep {
  touchNum: number;
  day: number;
  channel: 'email' | 'call' | 'linkedin' | 'voicemail';
  purpose: string;
  tone: string;
}

export interface CadenceType {
  id: string;
  icon: string;
  title: string;
  desc: string;
  touches: number;
  duration: string;
  steps: CadenceStep[];
}

export const CADENCE_TYPES: CadenceType[] = [
  {
    id: 'cold',
    icon: '🧊',
    title: 'Cold Outbound',
    desc: 'Net-new prospect, no prior relationship. Signal-led first touch.',
    touches: 5,
    duration: '14 days',
    steps: [
      { touchNum: 1, day: 1, channel: 'email', purpose: 'Signal-based intro — reference what you found', tone: 'Curious, specific' },
      { touchNum: 2, day: 3, channel: 'call', purpose: 'Follow up on email — mention what you sent', tone: 'Brief, human' },
      { touchNum: 3, day: 5, channel: 'email', purpose: 'Add value — share a relevant insight or case study', tone: 'Helpful, no pitch' },
      { touchNum: 4, day: 9, channel: 'linkedin', purpose: 'Connect request with personal note', tone: 'Warm, referencing prior touches' },
      { touchNum: 5, day: 14, channel: 'email', purpose: 'Breakup email — leave the door open', tone: 'Respectful, direct' },
    ],
  },
  {
    id: 'strategic',
    icon: '🎯',
    title: 'Strategic Accounts',
    desc: 'High-value target worth a longer, multi-channel investment.',
    touches: 7,
    duration: '28 days',
    steps: [
      { touchNum: 1, day: 1, channel: 'linkedin', purpose: 'Engage with their content — comment or share', tone: 'Genuine interest' },
      { touchNum: 2, day: 3, channel: 'email', purpose: 'Signal-based intro — tie to their initiative', tone: 'Researched, specific' },
      { touchNum: 3, day: 5, channel: 'call', purpose: 'Warm call — reference your email and LinkedIn', tone: 'Familiar, brief' },
      { touchNum: 4, day: 10, channel: 'email', purpose: 'Value drop — industry insight or benchmark', tone: 'Peer-level expertise' },
      { touchNum: 5, day: 14, channel: 'voicemail', purpose: 'Short voicemail — reference the value you shared', tone: 'Confident, unhurried' },
      { touchNum: 6, day: 21, channel: 'email', purpose: 'Case study relevant to their vertical', tone: 'Proof, not pitch' },
      { touchNum: 7, day: 28, channel: 'call', purpose: 'Final ask — direct and clear', tone: 'Respectful close' },
    ],
  },
  {
    id: 'inbound',
    icon: '📥',
    title: 'Inbound Follow-Up',
    desc: 'They came to you — respond fast and keep momentum.',
    touches: 3,
    duration: '5 days',
    steps: [
      { touchNum: 1, day: 0, channel: 'email', purpose: 'Immediate response — acknowledge what they asked for', tone: 'Fast, specific, helpful' },
      { touchNum: 2, day: 1, channel: 'call', purpose: 'Same-day call — build on their interest', tone: 'Energetic, prepared' },
      { touchNum: 3, day: 5, channel: 'email', purpose: 'Follow up with next steps or proposal', tone: 'Clear, action-oriented' },
    ],
  },
  {
    id: 'reengage',
    icon: '🔄',
    title: 'Re-engagement',
    desc: 'Past conversation went cold. Reignite with a new angle.',
    touches: 4,
    duration: '21 days',
    steps: [
      { touchNum: 1, day: 1, channel: 'email', purpose: 'New signal or trigger — reason to reconnect', tone: 'Fresh, not apologetic' },
      { touchNum: 2, day: 5, channel: 'linkedin', purpose: 'Engage with recent activity — show you\'re paying attention', tone: 'Casual, genuine' },
      { touchNum: 3, day: 10, channel: 'email', purpose: 'Share something valuable — new case study or market shift', tone: 'Giving, not asking' },
      { touchNum: 4, day: 21, channel: 'call', purpose: 'Direct outreach — tie everything together', tone: 'Confident, warm' },
    ],
  },
];

const channelIcon: Record<string, string> = {
  email: '✉️',
  call: '📞',
  linkedin: '💼',
  voicemail: '🎙️',
};

const channelColor: Record<string, string> = {
  email: '#fb923c',
  call: '#5BBFA0',
  linkedin: '#6366F1',
  voicemail: '#8B8FE8',
};

interface CadenceSelectorProps {
  onSelect: (cadence: CadenceType) => void;
}

const CadenceSelector = ({ onSelect }: CadenceSelectorProps) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="rounded-xl p-5 mb-6" style={{ background: '#FAF7F2', border: '1px solid hsl(var(--border))' }}>
        <p className="text-[14px] leading-relaxed text-foreground">
          <strong>Choose your cadence.</strong> Each type is pre-built with the right number of touches, timing, and channels. Pick the one that fits your prospect — then customize.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CADENCE_TYPES.map(c => {
          const isHovered = hoveredId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              onMouseEnter={() => setHoveredId(c.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="text-left rounded-xl border p-5 transition-all duration-200 group"
              style={{
                background: isHovered ? '#2F4858' : 'hsl(var(--card))',
                borderColor: isHovered ? '#fb923c' : 'hsl(var(--border))',
                boxShadow: isHovered ? '0 4px 20px rgba(251,146,60,.15)' : 'none',
                transform: isHovered ? 'translateY(-2px)' : 'none',
              }}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-[28px]">{c.icon}</span>
                <div className="flex-1">
                  <h4
                    className="text-[16px] font-bold transition-colors"
                    style={{ color: isHovered ? '#FAF7F2' : 'hsl(var(--foreground))' }}
                  >
                    {c.title}
                  </h4>
                  <p
                    className="text-[12px] leading-[1.5] mt-0.5 transition-colors"
                    style={{ color: isHovered ? 'rgba(250,247,242,.7)' : 'hsl(var(--muted-foreground))' }}
                  >
                    {c.desc}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: isHovered ? 'rgba(251,146,60,.2)' : 'rgba(251,146,60,.1)',
                    color: isHovered ? '#fb923c' : '#2F4858',
                    border: `1px solid ${isHovered ? 'rgba(251,146,60,.4)' : 'rgba(251,146,60,.2)'}`,
                  }}
                >
                  {c.touches} touches
                </span>
                <span
                  className="text-[12px] px-2.5 py-1 rounded-full"
                  style={{
                    background: isHovered ? 'rgba(250,247,242,.1)' : 'rgba(47,72,88,.06)',
                    color: isHovered ? 'rgba(250,247,242,.8)' : 'hsl(var(--muted-foreground))',
                    border: `1px solid ${isHovered ? 'rgba(250,247,242,.15)' : 'hsl(var(--border))'}`,
                  }}
                >
                  {c.duration}
                </span>
              </div>

              {/* Channel preview */}
              <div className="flex items-center gap-1.5">
                {c.steps.map((s, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[13px]"
                    style={{
                      background: isHovered ? 'rgba(250,247,242,.1)' : 'rgba(47,72,88,.04)',
                      border: `1px solid ${isHovered ? 'rgba(250,247,242,.1)' : 'hsl(var(--border))'}`,
                    }}
                    title={`Day ${s.day}: ${s.channel}`}
                  >
                    {channelIcon[s.channel]}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CadenceSelector;

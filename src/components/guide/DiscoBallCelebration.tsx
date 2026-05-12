import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  variant: 'disco' | 'inperson';
  company: string;
  onClose: () => void;
}

const DiscoBallCelebration = ({ open, variant, company, onClose }: Props) => {
  const [phase, setPhase] = useState<'drop' | 'spin' | 'fade'>('drop');

  useEffect(() => {
    if (!open) return;
    setPhase('drop');
    const t1 = setTimeout(() => setPhase('spin'), 900);
    const t2 = setTimeout(() => setPhase('fade'), 3200);
    const t3 = setTimeout(() => onClose(), 3900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [open, onClose]);

  if (!open) return null;

  const isDisco = variant === 'disco';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center cursor-pointer"
      style={{
        background: phase === 'fade'
          ? 'rgba(8,12,28,0)'
          : 'radial-gradient(circle at 50% 30%, rgba(168,85,247,.55), rgba(8,12,28,.92))',
        transition: 'background 700ms ease',
      }}
    >
      {/* Confetti / sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => {
          const left = (i * 53) % 100;
          const delay = (i % 10) * 0.08;
          const colors = ['#ec4899', '#2dd4bf', '#a855f7', '#fde047', '#f97316'];
          return (
            <span
              key={i}
              className="absolute block rounded-sm"
              style={{
                left: `${left}%`,
                top: '-20px',
                width: 8,
                height: 14,
                background: colors[i % colors.length],
                animation: `discoConfetti 3s ${delay}s ease-in forwards`,
                opacity: 0.9,
              }}
            />
          );
        })}
      </div>

      <div className="text-center px-6">
        {isDisco ? (
          <div
            className="mx-auto mb-6"
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #fff 0%, #c4b5fd 30%, #7c3aed 70%, #312e81 100%)',
              boxShadow: '0 0 80px 20px rgba(168,85,247,.6), inset -10px -20px 40px rgba(0,0,0,.5)',
              transform: phase === 'drop' ? 'translateY(-300px) rotate(0deg)' : 'translateY(0) rotate(720deg)',
              transition: 'transform 900ms cubic-bezier(.34,1.56,.64,1)',
              animation: phase === 'spin' ? 'discoSpin 2s linear infinite' : undefined,
              backgroundImage:
                'radial-gradient(circle at 35% 30%, #fff 0%, transparent 25%), conic-gradient(from 0deg, #ec4899, #a855f7, #2dd4bf, #ec4899)',
            }}
          />
        ) : (
          <div
            className="mx-auto mb-6 text-[120px]"
            style={{
              transform: phase === 'drop' ? 'scale(0.2) rotate(-30deg)' : 'scale(1) rotate(0deg)',
              transition: 'transform 700ms cubic-bezier(.34,1.56,.64,1)',
              filter: 'drop-shadow(0 10px 30px rgba(45,212,191,.6))',
            }}
          >
            🤝
          </div>
        )}

        <div
          className="text-white font-extrabold text-[32px] md:text-[44px] tracking-tight"
          style={{
            opacity: phase === 'drop' ? 0 : 1,
            transform: phase === 'drop' ? 'translateY(20px)' : 'translateY(0)',
            transition: 'all 600ms ease',
            textShadow: '0 4px 20px rgba(0,0,0,.5)',
          }}
        >
          {isDisco ? '🪩 Disco Call Booked!' : '🤝 In-Person Meeting!'}
        </div>
        <div
          className="text-white/90 text-[16px] md:text-[18px] mt-2 font-semibold"
          style={{ opacity: phase === 'drop' ? 0 : 1, transition: 'opacity 800ms ease 200ms' }}
        >
          {company} is on the calendar.
        </div>
        <div className="text-white/60 text-[12px] mt-4" style={{ opacity: phase === 'drop' ? 0 : 1, transition: 'opacity 800ms ease 400ms' }}>
          tap anywhere to dismiss
        </div>
      </div>

      <style>{`
        @keyframes discoSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes discoConfetti {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default DiscoBallCelebration;

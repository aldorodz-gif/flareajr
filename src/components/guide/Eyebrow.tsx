interface EyebrowProps {
  children: React.ReactNode;
  gradient?: string;
}

const Eyebrow = ({ children, gradient = 'linear-gradient(90deg, #8B8FE8, #D97FAA)' }: EyebrowProps) => (
  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[2.5px] mb-2" style={{ color: '#6366F1' }}>
    <span className="inline-block w-[18px] h-0.5" style={{ background: gradient }} />
    {children}
  </div>
);

export default Eyebrow;

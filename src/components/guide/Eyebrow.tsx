interface EyebrowProps {
  children: React.ReactNode;
  gradient?: string;
}

const Eyebrow = ({ children, gradient = 'linear-gradient(90deg, #8B8FE8, #D97FAA)' }: EyebrowProps) => (
  <p className="text-[10px] font-semibold uppercase tracking-[2.5px] mb-2" style={{ color: '#9B78C8' }}>
    {children}
  </p>
);

export default Eyebrow;
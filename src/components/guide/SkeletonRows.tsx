interface SkeletonRowsProps {
  count?: number;
  height?: number;
}

/**
 * Stack of skeleton rows with shimmer used for tab loading states.
 */
const SkeletonRows = ({ count = 5, height = 72 }: SkeletonRowsProps) => (
  <div className="flex flex-col" style={{ gap: 8 }} aria-busy="true" aria-live="polite">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flare-skeleton"
        style={{ width: '100%', height, borderRadius: 6 }}
      />
    ))}
  </div>
);

export default SkeletonRows;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

/**
 * Standard page header used at the top of every tab.
 * Title: Inter 22px / 600 / -0.03em / #0F172A
 * Subtitle: 14px / #64748B
 * Followed by 24px of space.
 */
const PageHeader = ({ title, subtitle, right }: PageHeaderProps) => (
  <header style={{ marginBottom: 24 }}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: '#0F172A',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ marginTop: 4, fontSize: 14, color: '#64748B' }}>{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  </header>
);

export default PageHeader;

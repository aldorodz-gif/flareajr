/**
 * Canonical vertical definitions used across the entire platform.
 * Any tab that needs a vertical dropdown should import from here.
 */
export const VERTICAL_CATEGORIES: Record<string, string[]> = {
  'Relocation & Mobility': [
    'Corporate relocation programs',
    'Global mobility teams',
    'Talent acquisition & new hire relocation',
    'Executive relocation',
    'RMC partners & relocation management companies',
    'Mergers & acquisitions employee moves',
    'Internal transfers & rotational leadership programs',
  ],
  'Project Teams & Consultants': [
    'Management consulting firms',
    'IT implementation teams',
    'ERP & system rollout teams',
    'Training & enablement teams',
    'Audit & advisory teams',
    'Engineering consulting firms',
    'Staffing & professional services firms',
    'Client site deployment teams',
  ],
  'Government & Defense Contractors': [
    'Federal contractors',
    'Defense contractors',
    'Aerospace & aviation contractors',
    'Intelligence & cybersecurity firms',
    'Military support contractors',
    'Base & facility support vendors',
    'Program & project management offices',
    'Public sector consulting firms',
  ],
  'Tech': [
    'Software companies scaling teams',
    'Data center development & operations',
    'IT services & managed service providers',
    'Cybersecurity firms',
    'Hardware deployment teams',
    'Telecom & network infrastructure companies',
    'AI & engineering teams on project-based work',
    'Startup expansions & new office launches',
  ],
  'Healthcare': [
    'Travel nurses & clinicians',
    'Hospital systems & health networks',
    'Medical device companies',
    'Pharmaceutical companies',
    'Healthcare consulting firms',
    'Clinical trial teams',
    'Healthcare IT & EMR implementation teams',
    'Lab & diagnostics companies',
  ],
  'Construction & Field Services': [
    'General contractors',
    'Subcontractors & specialty trades',
    'Engineering & design-build firms',
    'Infrastructure & civil construction',
    'Utility & energy crews',
    'Renewable energy projects (solar, wind, battery storage)',
    'Oil & gas field teams',
    'Commissioning & installation crews',
    'Property restoration & disaster recovery teams',
  ],
  'Intern Programs': [
    'Corporate intern housing programs',
    'Summer associate programs (consulting, finance, legal)',
    'Engineering & tech intern cohorts',
    'Government & defense intern programs',
    'Healthcare residency & fellowship housing',
    'University-partnered corporate programs',
    'Apprenticeship & trade programs',
    'Large-scale seasonal workforce programs',
  ],
};

/** Top-level vertical names for simple dropdowns */
export const VERTICAL_NAMES = Object.keys(VERTICAL_CATEGORIES);

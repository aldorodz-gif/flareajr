// Vertical-specific discovery questions for "What to Ask" drawer.
// Keyed by canonical NCH vertical names used across the app.

export interface DiscoveryPlaybook {
  framing: string;
  questions: string[];
  listenFor: string;
  crossSell: string;
}

export const DISCOVERY_QUESTIONS: Record<string, DiscoveryPlaybook> = {
  'Construction & Field Services': {
    framing:
      "You're talking to someone who thinks about crew and timelines — not housing. Make it about their operational problem.",
    questions: [
      "What's your current crew headcount and where are most of them traveling from?",
      'How far out is your mobilization window — are people already on site?',
      'Do you have a preferred vendor or are crews figuring out housing themselves?',
      'Who handles crew logistics — you or someone on the ops side?',
      'Have you had situations where housing fell through mid-project?',
      "What's your average project duration for a crew this size?",
    ],
    listenFor: 'Who owns the decision, urgency of timeline, past pain with vendors.',
    crossSell: 'Rotating crews → Hotels. Relocating supervisors → Destination Services.',
  },
  Construction: {
    framing:
      "You're talking to someone who thinks about crew and timelines — not housing. Make it about their operational problem.",
    questions: [
      "What's your current crew headcount and where are most of them traveling from?",
      'How far out is your mobilization window — are people already on site?',
      'Do you have a preferred vendor or are crews figuring out housing themselves?',
      'Who handles crew logistics — you or someone on the ops side?',
      'Have you had situations where housing fell through mid-project?',
      "What's your average project duration for a crew this size?",
    ],
    listenFor: 'Who owns the decision, urgency of timeline, past pain with vendors.',
    crossSell: 'Rotating crews → Hotels. Relocating supervisors → Destination Services.',
  },
  Healthcare: {
    framing:
      "You're talking to someone who owns clinician fill rates and candidate experience — frame housing as a recruiting and retention lever.",
    questions: [
      'How many travel clinicians or fellows do you place in a typical month?',
      'What does the housing experience look like for them today?',
      'Are coordinators sourcing apartments themselves, or is it outsourced?',
      'How do candidates react when you describe the relocation package today?',
      'Have you ever lost a hire over housing or relocation friction?',
      'How do you handle 13-week assignments vs longer-term physician moves?',
    ],
    listenFor: 'Coordinator burnout, lost candidates, inconsistent quality across sites.',
    crossSell: 'Short stints → Hotels. Permanent physician moves → Destination Services + Travel.',
  },
  Tech: {
    framing:
      "You're talking to mobility, people ops, or a program manager — connect housing to employee experience and program velocity.",
    questions: [
      'How are you handling housing for new hires relocating into the area?',
      'Is your intern or rotational program centralized, or do interns find their own housing?',
      'For project teams deploying 3+ months, who owns accommodations?',
      'How do you measure success on the relocation experience today?',
      'What feedback have you gotten from employees on the first 30 days?',
      'Where are the gaps between mobility policy and what actually happens?',
    ],
    listenFor: 'Policy gaps, intern season pressure, candidate-experience scores.',
    crossSell: 'Exec relos → Destination Services. Site visits → Hotels + Travel.',
  },
  'Government & Defense Contractors': {
    framing:
      "You're talking to a program manager or site lead — housing is a contract-readiness and cleared-personnel staging problem.",
    questions: [
      'How are you staging housing for cleared personnel ramping into the program?',
      "What's your current vendor setup — preferred, ad hoc, or per diem?",
      'How do you handle housing during contract transitions or recompetes?',
      'Who at your company owns housing for the program — ops, HR, or PMO?',
      'Have you had personnel show up without a place to stay?',
      'Are there any compliance or background requirements for housing vendors?',
    ],
    listenFor: 'Contract milestone urgency, compliance hurdles, vendor consolidation goals.',
    crossSell: 'Short rotations → Hotels. PCS-style moves → Destination Services.',
  },
  Defense: {
    framing:
      "You're talking to a program manager or site lead — housing is a contract-readiness and cleared-personnel staging problem.",
    questions: [
      'How are you staging housing for cleared personnel ramping into the program?',
      "What's your current vendor setup — preferred, ad hoc, or per diem?",
      'How do you handle housing during contract transitions or recompetes?',
      'Who at your company owns housing for the program — ops, HR, or PMO?',
      'Have you had personnel show up without a place to stay?',
    ],
    listenFor: 'Contract milestone urgency, compliance hurdles, vendor consolidation.',
    crossSell: 'Short rotations → Hotels. PCS-style moves → Destination Services.',
  },
  'Relocation & Mobility': {
    framing:
      "You're talking to a mobility leader — housing is the most visible piece of the employee experience they own.",
    questions: [
      'How many relocations are you running this year vs last?',
      "What's your current temporary housing setup — RMC, direct vendor, or self-source?",
      'Where is policy strongest, and where do exceptions keep coming up?',
      'How do you measure relocating-employee satisfaction today?',
      'How are you handling group moves vs one-off executive relos?',
      'What would change if you had one consistent housing partner across markets?',
    ],
    listenFor: 'Exception volume, employee NPS, RMC frustrations, exec escalations.',
    crossSell: 'Group moves → Hotels overflow. Exec moves → Destination Services + Travel.',
  },
  Relocation: {
    framing:
      "You're talking to a mobility leader — housing is the most visible piece of the employee experience they own.",
    questions: [
      'How many relocations are you running this year vs last?',
      "What's your current temporary housing setup — RMC, direct vendor, or self-source?",
      'How do you measure relocating-employee satisfaction today?',
      'How are you handling group moves vs one-off executive relos?',
    ],
    listenFor: 'Exception volume, employee NPS, exec escalations.',
    crossSell: 'Group moves → Hotels overflow. Exec moves → Destination Services + Travel.',
  },
  'Project Teams & Consultants': {
    framing:
      "You're talking to an engagement or delivery leader — housing is about getting consultants productive on day one.",
    questions: [
      'How long are your typical client engagements requiring on-site presence?',
      'Who books housing today — the consultant, an admin, or a central team?',
      'How consistent is the housing experience across different client cities?',
      'What happens when an engagement extends or a team rotates?',
      'Are clients reimbursing housing or is it absorbed?',
      'How much time is your ops team spending on housing logistics each week?',
    ],
    listenFor: 'Inconsistency across cities, billable-time leakage, rotating teams.',
    crossSell: 'Short trips → Hotels + Travel. Long engagements → Temporary Housing.',
  },
  Consult: {
    framing:
      "You're talking to an engagement or delivery leader — housing is about getting consultants productive on day one.",
    questions: [
      'How long are your typical client engagements requiring on-site presence?',
      'Who books housing today — the consultant, an admin, or a central team?',
      'How consistent is the housing experience across different client cities?',
      'What happens when an engagement extends or a team rotates?',
    ],
    listenFor: 'Inconsistency across cities, billable-time leakage, rotating teams.',
    crossSell: 'Short trips → Hotels + Travel. Long engagements → Temporary Housing.',
  },
  Govt: {
    framing:
      "You're talking to a program or contracts lead — housing is a contract-readiness problem.",
    questions: [
      'How are you staging housing for personnel ramping into the program?',
      'How do you handle housing during contract transitions or recompetes?',
      'Who owns housing for the program — ops, HR, or PMO?',
    ],
    listenFor: 'Contract milestone urgency, vendor consolidation goals.',
    crossSell: 'Short rotations → Hotels. PCS moves → Destination Services.',
  },
  'Intern Programs': {
    framing:
      "You're talking to a university recruiting or program lead — intern housing is a brand and retention story.",
    questions: [
      'How many interns are you bringing in this summer and across which cities?',
      'How are you handling housing today — stipend, master lease, or self-source?',
      'What feedback have past interns given on housing?',
      'Who owns intern housing logistics — recruiting, HR, or facilities?',
      'How do you handle interns who arrive on different start dates?',
      'Has housing ever been a reason an intern declined or dropped?',
    ],
    listenFor: 'Cohort size growth, brand-experience priorities, coordinator overload.',
    crossSell: 'Short program visits → Hotels. Family interns → Destination Services.',
  },
  Interns: {
    framing:
      "You're talking to a university recruiting or program lead — intern housing is a brand and retention story.",
    questions: [
      'How many interns are you bringing in this summer and across which cities?',
      'How are you handling housing today — stipend, master lease, or self-source?',
      'Who owns intern housing logistics — recruiting, HR, or facilities?',
      'How do you handle interns who arrive on different start dates?',
    ],
    listenFor: 'Cohort size growth, brand experience, coordinator overload.',
    crossSell: 'Short program visits → Hotels. Family interns → Destination Services.',
  },
};

const DEFAULT_PLAYBOOK: DiscoveryPlaybook = {
  framing:
    "Anchor the conversation on the signal — make it about their operational problem, not your housing pitch.",
  questions: [
    'What triggered this initiative on your side, and what are the timelines?',
    'How are you currently handling people movement and accommodations?',
    'Who internally owns the housing or logistics piece today?',
    'Where has the current setup broken down before?',
    'What would success look like for you in the next 90 days?',
  ],
  listenFor: 'Decision owner, urgency, prior vendor pain, budget signal.',
  crossSell: 'Short stays → Hotels. Permanent moves → Destination Services + Travel.',
};

export function getDiscoveryPlaybook(vertical: string): DiscoveryPlaybook {
  if (!vertical) return DEFAULT_PLAYBOOK;
  if (DISCOVERY_QUESTIONS[vertical]) return DISCOVERY_QUESTIONS[vertical];
  // loose match
  const key = Object.keys(DISCOVERY_QUESTIONS).find((k) =>
    vertical.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(vertical.toLowerCase()),
  );
  return key ? DISCOVERY_QUESTIONS[key] : DEFAULT_PLAYBOOK;
}

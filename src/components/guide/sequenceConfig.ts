// 5-touch outbound cadence: front-loaded, ~21 days end-to-end.
export const SEQUENCE_STEPS = [
  { day: 1,  task_type: 'email_1_intro',   label: 'Email 1 · Intro',     reason: 'Tailored opener tied to the trigger signal' },
  { day: 3,  task_type: 'email_2_value',   label: 'Email 2 · Value',     reason: 'Re-anchor on signal + add one proof point' },
  { day: 7,  task_type: 'email_3_angle',   label: 'Email 3 · New angle', reason: 'Different angle: ops, cost, or exec relocation hook' },
  { day: 14, task_type: 'email_4_social',  label: 'Email 4 · Social',    reason: 'Peer / industry pattern reference' },
  { day: 21, task_type: 'email_5_breakup', label: 'Email 5 · Close',     reason: 'Close the loop — short, low pressure' },
] as const;

export type SequenceStep = typeof SEQUENCE_STEPS[number];

export const dueDateForDay = (dayOffset: number): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + (dayOffset - 1)); // Day 1 = today
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

export const ROLES = {
  FOUNDER: 'Founder',
  DEVELOPER: 'Developer',
  DESIGNER: 'Designer',
  STUDENT: 'Student',
  RECRUITER: 'Recruiter / HR',
  INVESTOR: 'Investor',
  FREELANCER: 'Freelancer',
  BUSINESS: 'Business',
};

export const INTENT_TYPES = {
  FIND_COFOUNDER: 'Find Co-founder',
  FIND_JOB: 'Find Job',
  HIRE: 'Hire Talent',
  JOIN_STARTUP: 'Join Startup',
  INTERNSHIP: 'Internship',
  INVESTOR: 'Raise / Invest',
  FREELANCER: 'Freelance / Contract',
  NETWORK: 'Strategic Network',
};

export const OPPORTUNITY_TYPES = {
  JOB: 'Job',
  INTERNSHIP: 'Internship',
  COFOUNDER: 'Co-founder',
  FREELANCE: 'Freelance',
  MENTORSHIP: 'Mentorship',
  PARTNERSHIP: 'Partnership',
  INVESTMENT: 'Investment',
  PROJECT: 'Project',
  COLLABORATION: 'Collaboration',
};

export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  BLOCKED: 'blocked',
};

export const CONNECTION_PURPOSES = [
  'Co-founder Discussion',
  'Hiring / Join Team',
  'Project Collaboration',
  'Investment / Pitch',
  'Mentorship / Advice',
  'Partnership',
];

export const COMMITMENT_OPTIONS = [
  'Full-time',
  'Part-time',
  'Project-based',
  'Flexible / Advisory',
];

export const REMOTE_OPTIONS = [
  'Remote only',
  'Hybrid',
  'In-person only',
  'Any',
];

export const OUTCOME_TYPES = [
  { id: 'meeting', label: 'Meeting Scheduled', icon: 'calendar', points: 20 },
  { id: 'hired', label: 'Hired / Joined Startup', icon: 'briefcase', points: 50 },
  { id: 'cofounder', label: 'Co-founder Partnership Formed', icon: 'sparkles', points: 100 },
  { id: 'project', label: 'Project Started', icon: 'code', points: 30 },
  { id: 'mentorship', label: 'Valuable Advisory / Mentorship', icon: 'lightbulb', points: 20 },
  { id: 'declined_friendly', label: 'Explored, but Not a Fit Now', icon: 'check', points: 5 },
];

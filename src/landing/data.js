import { ROLES, INTENT_TYPES, OUTCOME_TYPES } from '../core/types.js';
import { INITIAL_USERS } from '../core/storage.js';

/** Clay palette shared by DOM and 3D. */
export const PALETTE = {
  paper: '#F8FAFC',
  ink: '#0F172A',
  accent: '#6366F1',
  lilac: '#818CF8',
  peach: '#F472B6',
  mint: '#10B981',
  sky: '#38BDF8',
  butter: '#FBBF24',
  rose: '#FB7185',
};

const ROLE_COLORS = {
  [ROLES.FOUNDER]: PALETTE.peach,
  [ROLES.DEVELOPER]: PALETTE.sky,
  [ROLES.DESIGNER]: PALETTE.rose,
  [ROLES.RECRUITER]: PALETTE.mint,
  [ROLES.INVESTOR]: PALETTE.butter,
};

export const roleColor = (role) => ROLE_COLORS[role] || PALETTE.lilac;

export const initials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** The demo network shown in the 3D constellation (real seed data from the app). */
export const NETWORK = INITIAL_USERS;

/** Anonymous visitor used as the "current user" for the live Ask demo. */
export const VISITOR = {
  id: 'visitor',
  name: 'You',
  skills: [],
  proofOfWork: [],
  intent: {},
  location: '',
  remotePreference: 'Any',
};

/** Mirrors the weights in engines/matchingEngine.js. */
export const FACTORS = [
  { key: 'skills', label: 'Skills compatibility', max: 35, color: PALETTE.sky },
  { key: 'intent', label: 'Intent compatibility', max: 25, color: PALETTE.peach },
  { key: 'commitment', label: 'Availability & commitment', max: 15, color: PALETTE.mint },
  { key: 'industry', label: 'Industry fit', max: 10, color: PALETTE.butter },
  { key: 'location', label: 'Location / remote fit', max: 5, color: PALETTE.rose },
  { key: 'experience', label: 'Experience', max: 5, color: PALETTE.lilac },
  { key: 'proofOfWork', label: 'Proof of work', max: 5, color: '#FFC7A8' },
];

export const PROMPTS = [
  'Find me a Flutter developer in India for an early-stage fintech startup, part-time',
  'An angel investor for fintech, flexible, in Singapore',
  'A UI/UX designer with Figma skills for a remote fintech app',
  'Go and Kubernetes engineer for a cloud startup in Berlin',
];

export const INTENTS = Object.values(INTENT_TYPES);

/** Outcome ladder sorted by points (from core/types.js). */
export const OUTCOME_LADDER = [...OUTCOME_TYPES].sort((a, b) => a.points - b.points);

export const SECTIONS = ['Ask', 'Manifesto', 'Anatomy', 'Outcomes', 'Declare'];

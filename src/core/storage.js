import { ROLES, INTENT_TYPES, OPPORTUNITY_TYPES, CONNECTION_STATUS } from './types.js';
import { hydrateState, STATE_VERSION } from './state.js';

const STORAGE_KEY = 'proviqra_app_state_v1';

export const INITIAL_USERS = [
  {
    id: 'user_1',
    name: 'Aaditya Sharma',
    username: 'aaditya_founder',
    email: 'aaditya@neofin.io',
    role: ROLES.FOUNDER,
    headline: 'Founder @ NeoFin | Building next-gen B2B cross-border payments',
    bio: 'Ex-fintech product lead at Stripe. Bootstrapped working prototype with 10 beta businesses. Actively seeking a technical co-founder / founding Flutter & backend engineer in India to build V1.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    location: 'Bengaluru, India',
    remotePreference: 'Hybrid / Remote',
    collegeCompany: 'IIT Bombay / Ex-Stripe',
    experienceYears: 6,
    verified: true,
    skills: [
      { name: 'Product Strategy', category: 'Business', level: 'Expert', years: 6 },
      { name: 'Fintech Payments', category: 'Domain', level: 'Expert', years: 5 },
      { name: 'System Design', category: 'Engineering', level: 'Intermediate', years: 4 },
      { name: 'Fundraising', category: 'Business', level: 'Advanced', years: 3 }
    ],
    proofOfWork: [
      { title: 'NeoFin B2B Prototype', url: 'https://neofin-preview.dev', type: 'Product Demo' },
      { title: 'Cross-Border Rails Whitepaper', url: 'https://aaditya.blog/rails', type: 'Research' }
    ],
    intent: {
      type: INTENT_TYPES.FIND_COFOUNDER,
      roleNeeded: 'Flutter & Backend Developer',
      industry: 'Fintech',
      skillsNeeded: ['Flutter', 'Riverpod', 'Node.js', 'PostgreSQL', 'Fintech'],
      remote: 'Remote only',
      commitment: 'Part-time',
      compensation: 'Equity (10-25%) + Stipend',
      description: 'Find a Flutter + Backend developer in India interested in early-stage fintech, willing to start part-time with equity.',
      active: true
    }
  },
  {
    id: 'user_2',
    name: 'Rohan Verma',
    username: 'rohan_dev',
    email: 'rohan@vermadev.com',
    role: ROLES.DEVELOPER,
    headline: 'Senior Flutter & Fullstack Engineer | Fintech Enthusiast',
    bio: 'Fullstack builder with 5+ years building scalable mobile apps. Shipped 3 production Flutter apps using Riverpod & Supabase. Passionate about financial rails and clean architecture.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Mumbai, India',
    remotePreference: 'Remote only',
    collegeCompany: 'BITS Pilani / Razorpay alumnus',
    experienceYears: 5,
    verified: true,
    skills: [
      { name: 'Flutter', category: 'Engineering', level: 'Expert', years: 5 },
      { name: 'Riverpod', category: 'Engineering', level: 'Expert', years: 4 },
      { name: 'Node.js', category: 'Engineering', level: 'Advanced', years: 5 },
      { name: 'PostgreSQL', category: 'Engineering', level: 'Advanced', years: 4 },
      { name: 'Fintech', category: 'Domain', level: 'Intermediate', years: 3 },
      { name: 'Python', category: 'Engineering', level: 'Advanced', years: 3 }
    ],
    proofOfWork: [
      { title: 'Fintech Core Flutter SDK', url: 'https://github.com/rohan-verma/fintech-flutter-core', type: 'GitHub' },
      { title: 'SplitLedger App (50k DAU)', url: 'https://splitledger.app', type: 'App' }
    ],
    intent: {
      type: INTENT_TYPES.JOIN_STARTUP,
      roleNeeded: 'Early-stage Startup / Co-founder',
      industry: 'Fintech',
      skillsNeeded: ['Product Strategy', 'Fintech Payments'],
      remote: 'Remote only',
      commitment: 'Part-time',
      compensation: 'Equity + Part-time stipend',
      description: 'Looking to join an early-stage fintech startup part-time as founding mobile/fullstack engineer with equity.',
      active: true
    }
  },
  {
    id: 'user_3',
    name: 'Sarah Jenkins',
    username: 'sarah_talent',
    email: 'sarah@seedpulse.vc',
    role: ROLES.RECRUITER,
    headline: 'Head of Talent @ SeedPulse Capital | Hiring Founding Engineers',
    bio: 'Partnering with 25+ seed-stage founders to place founding engineers, lead designers, and CTOs. Fast-track intro to funded companies.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    location: 'San Francisco, CA',
    remotePreference: 'Any',
    collegeCompany: 'SeedPulse VC',
    experienceYears: 8,
    verified: true,
    skills: [
      { name: 'Technical Sourcing', category: 'HR', level: 'Expert', years: 8 },
      { name: 'Executive Search', category: 'HR', level: 'Expert', years: 7 },
      { name: 'Compensation Benchmarking', category: 'HR', level: 'Advanced', years: 6 }
    ],
    proofOfWork: [
      { title: 'Seed Talent Playbook', url: 'https://seedpulse.vc/talent-report', type: 'Publication' }
    ],
    intent: {
      type: INTENT_TYPES.HIRE,
      roleNeeded: 'Senior Fullstack Engineers & Founders',
      industry: 'SaaS / AI / Fintech',
      skillsNeeded: ['Flutter', 'Python', 'React', 'Go'],
      remote: 'Any',
      commitment: 'Full-time',
      compensation: '$120k - $190k + Equity',
      description: 'Sourcing high-caliber engineers for Seed and Series-A venture-backed companies.',
      active: true
    }
  },
  {
    id: 'user_4',
    name: 'Elena Rostova',
    username: 'elena_angel',
    email: 'elena@horizonangels.com',
    role: ROLES.INVESTOR,
    headline: 'Partner @ Horizon Angels | $50k-$250k Pre-Seed / Seed Checks',
    bio: 'Former 2x founder (exited). Investing in technical founders tackling fintech infrastructure, applied AI, and developer tools. High conviction, fast decisions.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    location: 'Singapore',
    remotePreference: 'Any',
    collegeCompany: 'Horizon Angels',
    experienceYears: 11,
    verified: true,
    skills: [
      { name: 'Pre-Seed Investing', category: 'Finance', level: 'Expert', years: 10 },
      { name: 'GTM Scaling', category: 'Business', level: 'Expert', years: 9 },
      { name: 'Fintech Rails', category: 'Domain', level: 'Advanced', years: 7 }
    ],
    proofOfWork: [
      { title: 'Portfolio: 18 Investments', url: 'https://horizonangels.com/portfolio', type: 'Portfolio' }
    ],
    intent: {
      type: INTENT_TYPES.INVESTOR,
      roleNeeded: 'Fintech & AI Founders with Working Prototype',
      industry: 'Fintech',
      skillsNeeded: ['Product Strategy', 'Fintech Payments', 'System Design'],
      remote: 'Any',
      commitment: 'Flexible / Advisory',
      compensation: 'Angel Investment ($100k-$250k)',
      description: 'Looking to meet early-stage fintech founders in Asia & US with high technical depth.',
      active: true
    }
  },
  {
    id: 'user_5',
    name: 'Priyah Nair',
    username: 'priyah_design',
    email: 'priyah@designcraft.co',
    role: ROLES.DESIGNER,
    headline: 'Senior UI/UX Product Designer | Mobile Design Systems Specialist',
    bio: 'Crafting pixel-perfect, accessible user interfaces with clean contrast and seamless micro-interactions. Experience with Figma, design tokens, and user research for mobile apps.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    location: 'Bengaluru, India',
    remotePreference: 'Remote only',
    collegeCompany: 'National Institute of Design',
    experienceYears: 4,
    verified: true,
    skills: [
      { name: 'UI/UX Design', category: 'Design', level: 'Expert', years: 4 },
      { name: 'Figma & Design Systems', category: 'Design', level: 'Expert', years: 4 },
      { name: 'Mobile Interaction Design', category: 'Design', level: 'Advanced', years: 4 },
      { name: 'Fintech UX', category: 'Domain', level: 'Intermediate', years: 2 }
    ],
    proofOfWork: [
      { title: 'Fintech Design System 2.0', url: 'https://figma.com/@priyah/fintech-tokens', type: 'Design' },
      { title: 'Dribbble Top Showcase', url: 'https://dribbble.com/priyah-nair', type: 'Portfolio' }
    ],
    intent: {
      type: INTENT_TYPES.FREELANCER,
      roleNeeded: 'Startups Needing Design Direction or Co-founder',
      industry: 'Fintech / SaaS',
      skillsNeeded: ['Product Strategy', 'Flutter'],
      remote: 'Remote only',
      commitment: 'Part-time',
      compensation: 'Contract rate or Equity',
      description: 'Available for high-impact mobile UX sprints or early-stage co-founder design role.',
      active: true
    }
  },
  {
    id: 'user_6',
    name: 'Marcus Vance',
    username: 'marcus_cloud',
    email: 'marcus@cloudmesh.dev',
    role: ROLES.FOUNDER,
    headline: 'Founder & CTO @ CloudMesh | Distributed Systems & Observability',
    bio: 'Second-time enterprise SaaS founder. Building zero-overhead distributed tracing. Looking for commercial co-founder / Head of Developer Marketing.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'Berlin, Germany',
    remotePreference: 'Remote only',
    collegeCompany: 'TU Munich / Ex-Datadog',
    experienceYears: 9,
    verified: true,
    skills: [
      { name: 'Go / Rust', category: 'Engineering', level: 'Expert', years: 8 },
      { name: 'Kubernetes & Cloud', category: 'Engineering', level: 'Expert', years: 7 },
      { name: 'Enterprise Architecture', category: 'Engineering', level: 'Expert', years: 9 }
    ],
    proofOfWork: [
      { title: 'CloudMesh Engine on GitHub', url: 'https://github.com/cloudmesh/engine', type: 'GitHub' }
    ],
    intent: {
      type: INTENT_TYPES.FIND_COFOUNDER,
      roleNeeded: 'Head of Growth / Co-founder GTM',
      industry: 'Developer Tools',
      skillsNeeded: ['Developer Marketing', 'Enterprise Sales'],
      remote: 'Remote only',
      commitment: 'Full-time',
      compensation: '20% Equity + Co-founder status',
      description: 'Seeking co-founder with proven enterprise developer marketing and sales experience.',
      active: true
    }
  }
];

export const INITIAL_OPPORTUNITIES = [
  {
    id: 'opp_1',
    createdBy: 'user_1',
    organization: 'NeoFin Rails',
    type: OPPORTUNITY_TYPES.COFOUNDER,
    title: 'Founding Flutter & Fullstack Engineer (Fintech)',
    description: 'Lead mobile app development for NeoFin. Clean architecture, Riverpod, high security, cross-border payment flows.',
    skills: ['Flutter', 'Riverpod', 'Node.js', 'PostgreSQL', 'Fintech'],
    location: 'Bengaluru / Remote',
    remote: 'Remote only',
    commitment: 'Part-time or Full-time',
    compensation: '12-25% Equity + Initial Stipend',
    status: 'Active',
    createdAt: '2 days ago'
  },
  {
    id: 'opp_2',
    createdBy: 'user_4',
    organization: 'Horizon Angels',
    type: OPPORTUNITY_TYPES.INVESTMENT,
    title: 'Fintech & Applied AI Pre-Seed Funding ($100k - $250k)',
    description: 'Direct investment checks for technical founders with working MVPs and early pilot validation.',
    skills: ['Fintech Payments', 'Product Strategy', 'System Design'],
    location: 'Global / Remote',
    remote: 'Any',
    commitment: 'Advisory / Capital',
    compensation: '$100k - $250k Safe Note',
    status: 'Active',
    createdAt: '3 days ago'
  },
  {
    id: 'opp_3',
    createdBy: 'user_5',
    organization: 'DesignCraft Studio',
    type: OPPORTUNITY_TYPES.FREELANCE,
    title: 'Mobile MVP Design System & High-Fidelity UI Sprint',
    description: '2-week comprehensive design sprint: user journeys, dark/light design system tokens, Figma handoff.',
    skills: ['UI/UX Design', 'Figma & Design Systems', 'Mobile Interaction Design'],
    location: 'Remote',
    remote: 'Remote only',
    commitment: 'Project-based',
    compensation: 'Competitive sprint rate',
    status: 'Active',
    createdAt: '5 days ago'
  },
  {
    id: 'opp_4',
    createdBy: 'user_3',
    organization: 'SeedPulse Venture Network',
    type: OPPORTUNITY_TYPES.JOB,
    title: 'Senior Backend Engineer (Python / AI Pipelines)',
    description: 'Founding engineer role at a seed-stage AI automation startup backed by SeedPulse.',
    skills: ['Python', 'PostgreSQL', 'System Design'],
    location: 'Remote / US & India',
    remote: 'Remote only',
    commitment: 'Full-time',
    compensation: '$140k-$170k + 1.5% Equity',
    status: 'Active',
    createdAt: '1 week ago'
  }
];

export const INITIAL_CONNECTIONS = [
  {
    id: 'conn_1',
    senderId: 'user_3',
    receiverId: 'user_1',
    status: CONNECTION_STATUS.PENDING,
    purpose: 'Hiring / Join Team',
    message: 'Hi Aaditya! We love the NeoFin project thesis and have 2 candidates interested in founding roles.',
    createdAt: '2026-09-13T14:30:00Z'
  },
  {
    id: 'conn_2',
    senderId: 'user_6',
    receiverId: 'user_1',
    status: CONNECTION_STATUS.ACCEPTED,
    purpose: 'Partnership',
    message: 'Hey Aaditya, let us connect on payment telemetry integrations for CloudMesh customers.',
    createdAt: '2026-09-12T10:00:00Z',
    conversationId: 'conv_1'
  }
];

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv_1',
    connectionId: 'conn_2',
    participants: ['user_1', 'user_6'],
    outcomeLogged: null,
    messages: [
      {
        id: 'msg_1',
        senderId: 'user_6',
        text: 'Hey Aaditya, let us connect on payment telemetry integrations for CloudMesh customers.',
        createdAt: '2026-09-12T10:00:00Z',
        read: true
      },
      {
        id: 'msg_2',
        senderId: 'user_1',
        text: 'Hi Marcus! Great to connect. We are looking into observability for cross-border transaction latency.',
        createdAt: '2026-09-12T10:15:00Z',
        read: true
      }
    ]
  }
];

export const INITIAL_OUTCOMES = [
  {
    id: 'out_1',
    conversationId: 'conv_sample',
    title: 'Co-founder Partnership Formed',
    outcomeType: 'cofounder',
    users: ['user_1', 'user_x'],
    date: '2026-09-10',
    notes: 'Signed co-founder agreement for NeoFin prototype.'
  }
];

// Helper to load or initialize state
export function createDefaultState(theme = 'dark') {
  return {
    version: STATE_VERSION,
    currentUserId: 'user_1', // Start as Aaditya
    users: INITIAL_USERS,
    opportunities: INITIAL_OPPORTUNITIES,
    connections: INITIAL_CONNECTIONS,
    conversations: INITIAL_CONVERSATIONS,
    outcomes: INITIAL_OUTCOMES,
    blocks: [], // [{ blockerId, blockedId }]
    reports: [],
    theme
  };
}

export function loadAppState() {
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem('proviqra_theme');
  } catch (e) {
    // storage unavailable (private mode / disabled) — continue with defaults
  }
  const theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';
  const defaults = createDefaultState(theme);

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const state = hydrateState(JSON.parse(saved), defaults);
      state.theme = theme;
      return state;
    }
  } catch (e) {
    console.warn('Saved state was unreadable; starting from demo defaults.', e);
  }

  saveAppState(defaults);
  return defaults;
}

/** Wipe local demo data and return a fresh state (used by the recovery screen). */
export function resetAppState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  return loadAppState();
}

export function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save app state to localStorage', e);
  }
}

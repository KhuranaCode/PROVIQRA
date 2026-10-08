import { calculateMatchScore } from './matchingEngine.js';

/**
 * Natural-Language "Ask" Engine (Blueprint Page 7)
 * Parses freeform natural language query e.g.:
 * "Find me a Flutter developer in India who wants to join an early-stage fintech startup part-time"
 * Extracts structured criteria -> applies hard filters -> ranks candidates -> generates structured explanation.
 */

export function parseNaturalLanguageQuery(queryText) {
  const text = (queryText || '').toLowerCase();

  // Known roles
  const roleKeywords = {
    'developer': 'Developer',
    'engineer': 'Developer',
    'frontend': 'Developer',
    'backend': 'Developer',
    'fullstack': 'Developer',
    'flutter': 'Developer',
    'designer': 'Designer',
    'ui/ux': 'Designer',
    'founder': 'Founder',
    'co-founder': 'Founder',
    'investor': 'Investor',
    'angel': 'Investor',
    'recruiter': 'Recruiter / HR',
    'freelancer': 'Freelancer'
  };

  // Known skills
  const skillKeywords = [
    'flutter', 'riverpod', 'node.js', 'node', 'python', 'postgresql', 
    'fintech', 'ai', 'system design', 'product strategy', 'figma', 
    'ui/ux design', 'go', 'kubernetes', 'cloud'
  ];

  // Locations
  const locationKeywords = ['india', 'bengaluru', 'mumbai', 'san francisco', 'berlin', 'singapore', 'us', 'remote'];

  // Commitments
  const commitmentKeywords = {
    'part-time': 'Part-time',
    'part time': 'Part-time',
    'full-time': 'Full-time',
    'full time': 'Full-time',
    'project': 'Project-based',
    'freelance': 'Project-based',
    'flexible': 'Flexible / Advisory'
  };

  // Extract detected attributes
  let extractedRole = null;
  for (const [key, val] of Object.entries(roleKeywords)) {
    if (text.includes(key)) {
      extractedRole = val;
      break;
    }
  }

  const extractedSkills = skillKeywords.filter(skill => text.includes(skill));

  let extractedLocation = null;
  for (const loc of locationKeywords) {
    if (text.includes(loc)) {
      extractedLocation = loc;
      break;
    }
  }

  let extractedCommitment = null;
  for (const [key, val] of Object.entries(commitmentKeywords)) {
    if (text.includes(key)) {
      extractedCommitment = val;
      break;
    }
  }

  let extractedIndustry = null;
  if (text.includes('fintech') || text.includes('finance') || text.includes('payments')) {
    extractedIndustry = 'Fintech';
  } else if (text.includes('ai') || text.includes('ml')) {
    extractedIndustry = 'AI / ML';
  } else if (text.includes('saas') || text.includes('cloud')) {
    extractedIndustry = 'Cloud / SaaS';
  }

  const isCoFounderIntent = text.includes('co-founder') || text.includes('cofounder') || text.includes('early-stage') || text.includes('startup');

  return {
    originalQuery: queryText,
    criteria: {
      role: extractedRole,
      skills: extractedSkills,
      location: extractedLocation,
      commitment: extractedCommitment,
      industry: extractedIndustry,
      isCoFounderIntent
    }
  };
}

export function executeNaturalLanguageSearch(queryText, currentUser, allUsers) {
  const parsed = parseNaturalLanguageQuery(queryText);
  const { criteria } = parsed;

  const validCandidates = (allUsers || []).filter(u => u.id !== currentUser.id);

  const results = validCandidates.map(candidate => {
    // Check match against structured query
    let queryPoints = 0;
    const matchedCriteria = [];

    // Role check
    if (criteria.role) {
      if (candidate.role.toLowerCase().includes(criteria.role.toLowerCase())) {
        queryPoints += 30;
        matchedCriteria.push(`Role: ${candidate.role}`);
      }
    }

    // Skills check
    if (criteria.skills.length > 0) {
      const candidateSkillNames = (candidate.skills || []).map(s => s.name.toLowerCase());
      const hits = criteria.skills.filter(reqSkill => 
        candidateSkillNames.some(cs => cs.includes(reqSkill) || reqSkill.includes(cs))
      );
      if (hits.length > 0) {
        queryPoints += Math.min(35, hits.length * 15);
        matchedCriteria.push(`Skills: ${hits.map(s => s.toUpperCase()).join(', ')}`);
      }
    }

    // Location check
    if (criteria.location) {
      const candLoc = (candidate.location || '').toLowerCase();
      const candRemote = (candidate.remotePreference || '').toLowerCase();
      if (candLoc.includes(criteria.location) || candRemote.includes('remote')) {
        queryPoints += 15;
        matchedCriteria.push(`Location/Remote: ${candidate.location}`);
      }
    }

    // Commitment check
    if (criteria.commitment) {
      const candComm = candidate.intent?.commitment || '';
      if (candComm.toLowerCase().includes(criteria.commitment.toLowerCase())) {
        queryPoints += 10;
        matchedCriteria.push(`Commitment: ${candComm}`);
      }
    }

    // Industry / Intent check
    if (criteria.industry) {
      const candInd = candidate.intent?.industry || '';
      if (candInd.toLowerCase().includes(criteria.industry.toLowerCase())) {
        queryPoints += 10;
        matchedCriteria.push(`Industry: ${candInd}`);
      }
    }

    // Base scoring using the standard 100-pt engine
    const baseScore = calculateMatchScore(currentUser, candidate);
    const finalScore = Math.min(99, Math.max(30, Math.round((queryPoints * 0.6) + ((baseScore?.score || 50) * 0.4))));

    return {
      candidate,
      score: finalScore,
      parsedQuery: parsed,
      matchedCriteria,
      explanation: generateNaturalLanguageExplanation(candidate, parsed, finalScore)
    };
  });

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return {
    parsed,
    results
  };
}

function generateNaturalLanguageExplanation(candidate, parsed, score) {
  const { criteria } = parsed;
  const reasons = [];

  if (criteria.skills.length > 0) {
    const matched = (candidate.skills || []).filter(s => 
      criteria.skills.some(req => s.name.toLowerCase().includes(req))
    ).map(s => s.name);
    if (matched.length > 0) {
      reasons.push(`verified expertise in ${matched.join(' & ')}`);
    }
  }

  if (candidate.intent?.commitment) {
    reasons.push(`available for ${candidate.intent.commitment.toLowerCase()} collaboration`);
  }

  if (candidate.location) {
    reasons.push(`located in ${candidate.location}`);
  }

  return `${score}% Match for your prompt: Candidate has ${reasons.join(', ')}.`;
}

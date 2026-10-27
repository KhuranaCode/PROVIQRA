import { calculateMatchScore } from './matchingEngine.js';

/**
 * Natural-Language "Ask" Engine (Blueprint Page 7)
 * Parses freeform natural language query e.g.:
 * "Find me a Flutter developer in India who wants to join an early-stage fintech startup part-time"
 * Extracts structured criteria -> applies hard filters -> ranks candidates -> generates structured explanation.
 *
 * Robustness notes:
 * - Keyword detection uses word-boundary matching so short tokens like "ai", "go" or "us"
 *   do not fire inside unrelated words ("available", "good", "discuss").
 * - Ambiguous "us" (the country) only matches in place-like phrasing ("the US", "USA", "United States", "America").
 * - When no criteria can be extracted, parsed.noCriteriaDetected is set so the UI can be honest
 *   instead of presenting generic rankings as if the query was understood.
 */

function matchesKeyword(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function findFirst(text, keywords) {
  return keywords.find((kw) => matchesKeyword(text, kw)) || null;
}

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

  // Locations ("us" handled separately: the bare pronoun is too ambiguous)
  const locationKeywords = ['india', 'bengaluru', 'mumbai', 'san francisco', 'berlin', 'singapore', 'remote'];

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
    if (matchesKeyword(text, key)) {
      extractedRole = val;
      break;
    }
  }

  const extractedSkills = skillKeywords.filter((skill) => matchesKeyword(text, skill));

  let extractedLocation = findFirst(text, locationKeywords);
  if (!extractedLocation && /\b(the us|usa|united states|america)\b/i.test(text)) {
    extractedLocation = 'us';
  }

  let extractedCommitment = null;
  for (const [key, val] of Object.entries(commitmentKeywords)) {
    if (matchesKeyword(text, key)) {
      extractedCommitment = val;
      break;
    }
  }

  let extractedIndustry = null;
  if (['fintech', 'finance', 'payments'].some((kw) => matchesKeyword(text, kw))) {
    extractedIndustry = 'Fintech';
  } else if (['ai', 'ml', 'machine learning'].some((kw) => matchesKeyword(text, kw))) {
    extractedIndustry = 'AI / ML';
  } else if (['saas', 'cloud'].some((kw) => matchesKeyword(text, kw))) {
    extractedIndustry = 'Cloud / SaaS';
  }

  const isCoFounderIntent =
    matchesKeyword(text, 'co-founder') ||
    matchesKeyword(text, 'cofounder') ||
    matchesKeyword(text, 'early-stage') ||
    matchesKeyword(text, 'startup');

  const criteria = {
    role: extractedRole,
    skills: extractedSkills,
    location: extractedLocation,
    commitment: extractedCommitment,
    industry: extractedIndustry,
    isCoFounderIntent
  };

  const noCriteriaDetected =
    !extractedRole &&
    extractedSkills.length === 0 &&
    !extractedLocation &&
    !extractedCommitment &&
    !extractedIndustry &&
    !isCoFounderIntent;

  return {
    originalQuery: queryText,
    criteria,
    noCriteriaDetected
  };
}

export function executeNaturalLanguageSearch(queryText, currentUser, allUsers) {
  const parsed = parseNaturalLanguageQuery(queryText);
  const { criteria } = parsed;

  const validCandidates = (allUsers || []).filter((u) => u && u.id !== currentUser?.id);

  const results = validCandidates.map((candidate) => {
    // Check match against structured query
    let queryPoints = 0;
    const matchedCriteria = [];

    // Role check
    const candidateRole = (candidate.role || '').toLowerCase();
    if (criteria.role && candidateRole) {
      if (candidateRole.includes(criteria.role.toLowerCase())) {
        queryPoints += 30;
        matchedCriteria.push(`Role: ${candidate.role}`);
      }
    }

    // Skills check
    if (criteria.skills.length > 0) {
      const candidateSkillNames = (candidate.skills || []).map((s) => (s.name || '').toLowerCase());
      const hits = criteria.skills.filter((reqSkill) =>
        candidateSkillNames.some((cs) => cs.includes(reqSkill) || reqSkill.includes(cs))
      );
      if (hits.length > 0) {
        queryPoints += Math.min(35, hits.length * 15);
        matchedCriteria.push(`Skills: ${hits.map((s) => s.toUpperCase()).join(', ')}`);
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
    const matched = (candidate.skills || []).filter((s) =>
      criteria.skills.some((req) => (s.name || '').toLowerCase().includes(req))
    ).map((s) => s.name);
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

  if (parsed.noCriteriaDetected) {
    if (reasons.length === 0) {
      return `${score}% general compatibility: ranked by overall profile only (query not understood).`;
    }
    return `${score}% general compatibility: ${reasons.join('; ')}.`;
  }

  if (reasons.length === 0) {
    return `${score}% Match for your prompt: no specific criteria matched; ranked by general profile compatibility.`;
  }

  return `${score}% Match for your prompt: ${reasons.join('; ')}.`;
}

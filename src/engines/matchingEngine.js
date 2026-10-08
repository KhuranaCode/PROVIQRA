/**
 * Matching Engine - V1 Rule-Based Scoring (Blueprint Page 7)
 * Total Score = 100 points:
 * - Skills compatibility: 35 points
 * - Intent compatibility: 25 points
 * - Availability / commitment: 15 points
 * - Industry: 10 points
 * - Location / remote fit: 5 points
 * - Experience: 5 points
 * - Interests / Proof of Work: 5 points
 */

export function calculateMatchScore(currentUser, candidateUser) {
  if (!currentUser || !candidateUser || currentUser.id === candidateUser.id) {
    return null;
  }

  let totalScore = 0;
  const breakdown = {
    skills: 0,
    intent: 0,
    commitment: 0,
    industry: 0,
    location: 0,
    experience: 0,
    proofOfWork: 0
  };

  const positiveReasons = [];
  const missingGaps = [];

  const myIntent = currentUser.intent || {};
  const candidateIntent = candidateUser.intent || {};

  // 1. Skills Compatibility (Max 35 points)
  const skillsNeeded = (myIntent.skillsNeeded || []).map(s => s.toLowerCase());
  const candidateSkills = (candidateUser.skills || []).map(s => s.name.toLowerCase());
  
  if (skillsNeeded.length > 0) {
    const matchedSkills = skillsNeeded.filter(skill => 
      candidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))
    );
    const ratio = matchedSkills.length / skillsNeeded.length;
    breakdown.skills = Math.round(ratio * 35);
    totalScore += breakdown.skills;

    if (matchedSkills.length > 0) {
      positiveReasons.push(`Skills match: ${matchedSkills.slice(0, 3).map(capitalize).join(', ')}`);
    }

    const missing = skillsNeeded.filter(skill => !matchedSkills.includes(skill));
    if (missing.length > 0) {
      missingGaps.push(`Missing: deeper ${missing.slice(0, 2).map(capitalize).join(', ')} experience`);
    }
  } else {
    // If no explicit skills needed, base on general profile skill depth
    breakdown.skills = 25;
    totalScore += breakdown.skills;
  }

  // 2. Intent Compatibility (Max 25 points)
  const myType = myIntent.type || '';
  const candType = candidateIntent.type || '';

  let intentScore = 15;
  // Reciprocal intent pairings
  if (
    (myType.includes('Co-founder') && (candType.includes('Startup') || candType.includes('Co-founder'))) ||
    (myType.includes('Hire') && candType.includes('Job')) ||
    (myType.includes('Job') && (candType.includes('Hire') || candType.includes('Co-founder'))) ||
    (myType.includes('Invest') && (candType.includes('Co-founder') || candType.includes('Startup'))) ||
    (myType.includes('Freelance') && (candType.includes('Hire') || candType.includes('Co-founder')))
  ) {
    intentScore = 25;
    positiveReasons.push(`Complementary intent: ${candType}`);
  } else if (myType === candType) {
    intentScore = 20;
    positiveReasons.push(`Shared professional focus: ${candType}`);
  }
  breakdown.intent = intentScore;
  totalScore += intentScore;

  // 3. Availability / Commitment (Max 15 points)
  const myCommitment = myIntent.commitment || 'Part-time';
  const candCommitment = candidateIntent.commitment || 'Part-time';

  if (myCommitment === candCommitment || candCommitment.includes('Flexible') || myCommitment.includes('Flexible')) {
    breakdown.commitment = 15;
    totalScore += 15;
    positiveReasons.push(`${candCommitment} availability aligns`);
  } else {
    breakdown.commitment = 7;
    totalScore += 7;
    missingGaps.push(`Commitment difference: prefers ${candCommitment}`);
  }

  // 4. Industry Fit (Max 10 points)
  const myIndustry = (myIntent.industry || '').toLowerCase();
  const candIndustry = (candidateIntent.industry || '').toLowerCase();

  if (myIndustry && candIndustry && (myIndustry.includes(candIndustry) || candIndustry.includes(myIndustry))) {
    breakdown.industry = 10;
    totalScore += 10;
    positiveReasons.push(`${candidateIntent.industry} industry fit`);
  } else if (myIndustry && candIndustry) {
    breakdown.industry = 5;
    totalScore += 5;
  } else {
    breakdown.industry = 7;
    totalScore += 7;
  }

  // 5. Location / Remote Fit (Max 5 points)
  const myRemote = currentUser.remotePreference || 'Remote only';
  const candRemote = candidateUser.remotePreference || 'Remote only';
  const myLoc = (currentUser.location || '').toLowerCase();
  const candLoc = (candidateUser.location || '').toLowerCase();

  if (candRemote.toLowerCase().includes('remote') || myRemote.toLowerCase().includes('remote') || candRemote === 'Any' || myRemote === 'Any') {
    breakdown.location = 5;
    totalScore += 5;
    positiveReasons.push('Remote preference matches');
  } else if (myLoc.includes('india') && candLoc.includes('india')) {
    breakdown.location = 5;
    totalScore += 5;
    positiveReasons.push('Regional timezone match');
  } else {
    breakdown.location = 2;
    totalScore += 2;
  }

  // 6. Experience Fit (Max 5 points)
  const expYears = candidateUser.experienceYears || 0;
  if (expYears >= 4) {
    breakdown.experience = 5;
    totalScore += 5;
    positiveReasons.push(`${expYears}+ years solid experience`);
  } else if (expYears >= 2) {
    breakdown.experience = 4;
    totalScore += 4;
  } else {
    breakdown.experience = 3;
    totalScore += 3;
  }

  // 7. Interests & Proof of Work (Max 5 points)
  const proofCount = (candidateUser.proofOfWork || []).length;
  if (proofCount >= 2) {
    breakdown.proofOfWork = 5;
    totalScore += 5;
    positiveReasons.push('Verified proof of work (GitHub / Apps)');
  } else if (proofCount >= 1) {
    breakdown.proofOfWork = 4;
    totalScore += 4;
  } else {
    breakdown.proofOfWork = 2;
    totalScore += 2;
  }

  // Clamp score between 0 and 100
  const finalPercentage = Math.min(100, Math.max(10, totalScore));

  return {
    candidateId: candidateUser.id,
    candidate: candidateUser,
    score: finalPercentage,
    breakdown,
    reasons: positiveReasons,
    gaps: missingGaps,
    summaryText: `${finalPercentage}% MATCH — ${positiveReasons.slice(0, 3).join(', ')}.${missingGaps.length > 0 ? ` ${missingGaps[0]}.` : ''}`
  };
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

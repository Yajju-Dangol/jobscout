import { Job, UserProfile } from '../types';

export function calculateJobSimilarity(job: Job, profile: UserProfile): {
  similarity: number;
  vector_score: number;
  keyword_score: number;
  matchedSkills: string[];
  missingSkills: string[];
} {
  const profileSkillsLower = profile.skills.map(s => s.toLowerCase().trim());
  const jobSkills = job.required_skills.map(s => s.trim());
  
  const matchedSkills = jobSkills.filter(s => 
    profileSkillsLower.some(ps => ps.includes(s.toLowerCase()) || s.toLowerCase().includes(ps))
  );

  const missingSkills = jobSkills.filter(s => 
    !profileSkillsLower.some(ps => ps.includes(s.toLowerCase()) || s.toLowerCase().includes(ps))
  );

  // Technical skill match ratio (40% weight)
  const skillRatio = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) : 0.6;
  const keyword_score = Math.min(100, Math.round(skillRatio * 100));

  // Resume semantic text analysis (50% weight)
  const resumeLower = (profile.resumeText || '').toLowerCase();
  const jobDescLower = (job.description || '').toLowerCase();
  
  let textHits = 0;
  jobSkills.forEach(s => {
    if (resumeLower.includes(s.toLowerCase())) {
      textHits += 1;
    }
  });

  // Check if candidate skills are in job description
  let candidateMatchesInDesc = 0;
  profileSkillsLower.forEach(ps => {
    if (jobDescLower.includes(ps)) {
      candidateMatchesInDesc += 1;
    }
  });

  // Title alignment bonus (10% weight)
  let titleBonus = 0;
  const targetTitle = (profile.targetJobTitle || profile.currentTitle || '').toLowerCase();
  if (targetTitle && job.title.toLowerCase().includes(targetTitle)) {
    titleBonus = 12;
  } else if (targetTitle && targetTitle.split(' ').some(w => w.length > 3 && job.title.toLowerCase().includes(w))) {
    titleBonus = 7;
  }

  const textRatio = jobSkills.length > 0 ? (textHits / jobSkills.length) : 0.5;
  const candidateRatio = profileSkillsLower.length > 0 ? (candidateMatchesInDesc / profileSkillsLower.length) : 0.5;
  
  // Vector score representation (35 - 98%)
  const vector_score = Math.min(99, Math.max(35, Math.round((textRatio * 0.6 + candidateRatio * 0.4) * 85 + titleBonus + 10)));
  const totalSimilarity = Math.min(99, Math.max(35, Math.round(keyword_score * 0.40 + vector_score * 0.50 + titleBonus)));

  return {
    similarity: totalSimilarity,
    vector_score,
    keyword_score,
    matchedSkills,
    missingSkills
  };
}

export function recalculateAllJobs(jobs: Job[], profile: UserProfile): Job[] {
  const scored = jobs.map(job => {
    const calc = calculateJobSimilarity(job, profile);
    return {
      ...job,
      similarity: calc.similarity,
      vector_score: calc.vector_score,
      keyword_score: calc.keyword_score,
      missing_skills: calc.missingSkills
    };
  });

  // Sort by highest similarity
  return scored.sort((a, b) => b.similarity - a.similarity);
}

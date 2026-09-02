import React, { useMemo } from 'react';
import { 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Job, ViewTab } from '../types';

interface AnalyticsOverviewProps {
  profile: UserProfile;
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onNavigate: (tab: ViewTab) => void;
  onRunMatcher: () => void;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  profile,
  jobs,
  onSelectJob,
  onNavigate,
  onRunMatcher
}) => {
  const userSkillsLower = useMemo(() => 
    profile.skills.map(s => s.toLowerCase().trim()), 
    [profile.skills]
  );

  // 1. Overall Profile Match Potential (Average of top matched jobs)
  const topMatchedJobs = useMemo(() => 
    [...jobs].sort((a, b) => b.similarity - a.similarity),
    [jobs]
  );

  const overallStrength = useMemo(() => {
    if (topMatchedJobs.length === 0) return 0;
    const topSlice = topMatchedJobs.slice(0, Math.max(3, Math.floor(topMatchedJobs.length * 0.3)));
    const avg = Math.round(topSlice.reduce((sum, j) => sum + j.similarity, 0) / topSlice.length);
    return Math.min(99, Math.max(1, avg));
  }, [topMatchedJobs]);

  // 2. Skill Coverage Ratio: % of required skills across all matched jobs present in profile
  const { coverageRatio, skillGapFrequency, matchedCount, totalReqCount } = useMemo(() => {
    const gapCountMap: Record<string, { count: number; category: string; jobs: string[] }> = {};
    let matchedSkillsCount = 0;
    let totalSkillsCount = 0;

    jobs.forEach(job => {
      (job.required_skills || []).forEach(skill => {
        totalSkillsCount++;
        const isMatched = userSkillsLower.some(
          us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
        );

        if (isMatched) {
          matchedSkillsCount++;
        } else {
          const key = skill.trim();
          if (!gapCountMap[key]) {
            gapCountMap[key] = { count: 0, category: job.category, jobs: [] };
          }
          gapCountMap[key].count += 1;
          if (gapCountMap[key].jobs.length < 3 && !gapCountMap[key].jobs.includes(job.company)) {
            gapCountMap[key].jobs.push(job.company);
          }
        }
      });
    });

    const ratio = totalSkillsCount > 0 ? Math.round((matchedSkillsCount / totalSkillsCount) * 100) : 75;
    
    // Sort gap skills by frequency
    const gaps = Object.entries(gapCountMap)
      .map(([skill, data]) => ({
        skill,
        count: data.count,
        percentage: Math.round((data.count / Math.max(1, jobs.length)) * 100),
        category: data.category,
        companies: data.jobs
      }))
      .sort((a, b) => b.count - a.count);

    return {
      coverageRatio: ratio,
      skillGapFrequency: gaps,
      matchedCount: matchedSkillsCount,
      totalReqCount: totalSkillsCount
    };
  }, [jobs, userSkillsLower]);

  // 3. Top Missing Skill
  const topMissingSkill = skillGapFrequency[0] || {
    skill: 'Full-Stack Integration',
    percentage: 25,
    count: 1,
    companies: jobs.length > 0 ? [jobs[0].company] : ['Tech Roles']
  };

  // 4. Salary match range estimation from real database jobs
  const salaryRange = useMemo(() => {
    const validSalaries = jobs.filter(j => j.salary && j.salary.includes('$'));
    if (validSalaries.length > 0) {
      return validSalaries[0].salary;
    }
    return profile.minSalary || '$140,000 - $200,000';
  }, [jobs, profile.minSalary]);

  // 5. Match distribution breakdown
  const matchDistribution = useMemo(() => {
    let high = 0;   // >= 85%
    let medium = 0; // 70-84%
    let low = 0;    // < 70%

    jobs.forEach(j => {
      if (j.similarity >= 85) high++;
      else if (j.similarity >= 70) medium++;
      else low++;
    });

    const total = jobs.length || 1;
    return {
      high: { count: high, percent: Math.round((high / total) * 100) },
      medium: { count: medium, percent: Math.round((medium / total) * 100) },
      low: { count: low, percent: Math.round((low / total) * 100) }
    };
  }, [jobs]);

  const topRankedJobs = topMatchedJobs.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto py-2 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f1f] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Career Readiness & Skill Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time compatibility intelligence across <strong className="text-slate-200">{jobs.length} target job postings</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#141414] hover:bg-[#1f1f1f] text-slate-200 hover:text-white border border-[#262626] rounded-xl transition-colors cursor-pointer"
          >
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 1. Top 4 KPI Metrics (Clean & Minimal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Profile Strength */}
        <div className="bg-[#0f0f0f] border border-[#1c1c1c] hover:border-[#2a2a2a] rounded-2xl p-5 shadow-sm transition-colors flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-medium text-slate-400">Profile Match Strength</span>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-tight">
              {overallStrength}%
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {overallStrength >= 85 ? 'Top tier alignment' : overallStrength >= 70 ? 'Strong candidate match' : 'Developing profile fit'}
            </p>
          </div>
        </div>

        {/* Card 2: Skill Coverage */}
        <div className="bg-[#0f0f0f] border border-[#1c1c1c] hover:border-[#2a2a2a] rounded-2xl p-5 shadow-sm transition-colors flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-medium text-slate-400">Skill Coverage</span>
          <div>
            <div className="text-3xl sm:text-4xl font-bold text-white font-mono tracking-tight">
              {coverageRatio}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {matchedCount} of {totalReqCount || 1} required skills met
            </p>
          </div>
        </div>

        {/* Card 3: Top Skill Opportunity */}
        <div className="bg-[#0f0f0f] border border-[#1c1c1c] hover:border-[#2a2a2a] rounded-2xl p-5 shadow-sm transition-colors flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-medium text-slate-400">Top In-Demand Skill</span>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#c8c2ac] font-mono tracking-tight truncate">
              {topMissingSkill.skill}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Appears in {topMissingSkill.percentage}% of matched roles
            </p>
          </div>
        </div>

        {/* Card 4: Market Salary Range */}
        <div className="bg-[#0f0f0f] border border-[#1c1c1c] hover:border-[#2a2a2a] rounded-2xl p-5 shadow-sm transition-colors flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-medium text-slate-400">Market Salary Est.</span>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight truncate">
              {salaryRange}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target: {profile.minSalary || 'Flexible'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Skill Gap Breakdown */}
        <div className="lg:col-span-7 bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
            <div>
              <h3 className="text-base font-bold text-white">Skill Gaps</h3>
              <p className="text-xs text-slate-400">Frequently requested technologies missing from your profile</p>
            </div>

            <button 
              onClick={() => onNavigate('profile')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Edit Skills</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Skill Gap Items */}
          <div className="space-y-4">
            {skillGapFrequency.slice(0, 5).map((item) => (
              <div key={item.skill} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    {item.skill}
                  </span>
                  <span className="font-mono text-xs font-medium text-slate-400">
                    {item.percentage}% of roles
                  </span>
                </div>

                <div className="w-full bg-[#161616] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c8c2ac] rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Adding these skills can significantly increase your match rate.</span>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs font-semibold text-[#c8c2ac] hover:underline cursor-pointer"
            >
              Update profile →
            </button>
          </div>
        </div>

        {/* Right Column: Match Fit Distribution */}
        <div className="lg:col-span-5 bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
            <div>
              <h3 className="text-base font-bold text-white">Match Distribution</h3>
              <p className="text-xs text-slate-400">Score breakdown across all listings</p>
            </div>
          </div>

          {/* Single Segmented Bar */}
          <div className="space-y-5">
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#161616]">
              <div 
                style={{ width: `${matchDistribution.high.percent}%` }}
                className="bg-[#c8c2ac] h-full" 
              />
              <div 
                style={{ width: `${matchDistribution.medium.percent}%` }}
                className="bg-slate-400 h-full" 
              />
              <div 
                style={{ width: `${matchDistribution.low.percent}%` }}
                className="bg-[#2a2a2a] h-full" 
              />
            </div>

            {/* List */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#c8c2ac]" />
                  <span className="text-slate-200 font-medium">High Match (85%+)</span>
                </div>
                <span className="font-mono text-white font-semibold">{matchDistribution.high.count} roles</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#1a1a1a]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-slate-200 font-medium">Good Match (70 - 84%)</span>
                </div>
                <span className="font-mono text-white font-semibold">{matchDistribution.medium.count} roles</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
                  <span className="text-slate-400 font-medium">Partial Match (&lt; 70%)</span>
                </div>
                <span className="font-mono text-slate-400 font-semibold">{matchDistribution.low.count} roles</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('jobs')}
            className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Explore Jobs Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Top Matched Roles */}
      <div className="bg-[#0f0f0f] border border-[#1c1c1c] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1c1c1c]">
          <div>
            <h3 className="text-base font-bold text-white">Top Matched Roles</h3>
            <p className="text-xs text-slate-400">Positions with the highest compatibility scores</p>
          </div>

          <button 
            onClick={() => onNavigate('jobs')}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topRankedJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="bg-[#141414] border border-[#222222] hover:border-[#333333] p-4 rounded-xl flex flex-col justify-between gap-3 group cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-black border border-[#2a2a2a] flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                    {job.companyLogo ? (
                      <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-white">{job.company.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#c8c2ac] transition-colors truncate">
                      {job.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{job.company}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#c8c2ac]/15 text-[#c8c2ac] border border-[#c8c2ac]/30 shrink-0">
                  {job.similarity}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#222222] text-xs">
                <span className="font-mono text-slate-300 text-[11px] font-medium">{job.salary || 'Competitive'}</span>
                <span className="text-slate-400 text-[11px] group-hover:text-white flex items-center gap-0.5">
                  Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

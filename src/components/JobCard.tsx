import React from 'react';
import { 
  ExternalLink, 
  Check, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Job, UserProfile } from '../types';
import { formatPostDate } from '../utils/date';

interface JobCardProps {
  job: Job;
  profile: UserProfile;
  onSelectJob: (job: Job) => void;
  onApply?: (job: Job, e: React.MouseEvent) => void;
  hasRunMatcher?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  profile,
  onSelectJob,
  onApply,
  hasRunMatcher = false
}) => {
  const userSkillsLower = (profile?.skills || []).map((s) => s.toLowerCase().trim());
  const matchedSkills = job.required_skills.filter((s) =>
    userSkillsLower.some((ps) => ps.includes(s.toLowerCase()) || s.toLowerCase().includes(ps))
  );
  const missingSkills = job.required_skills.filter(
    (s) => !userSkillsLower.some((ps) => ps.includes(s.toLowerCase()) || s.toLowerCase().includes(ps))
  );

  return (
    <div
      onClick={() => onSelectJob(job)}
      className="h-full bg-[#090909] border border-[#202020] hover:border-[#383838] hover:bg-[#0c0c0c] p-6 sm:p-7 rounded-2xl flex flex-col justify-between gap-5 transition-all duration-200 relative group cursor-pointer shadow-xl"
    >
      {/* Upper Information Area */}
      <div className="space-y-3">
        {/* Company and Match Score Pill */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {job.companyLogo ? (
              <img
                src={job.companyLogo}
                alt={job.company}
                className="w-4 h-4 rounded object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : null}
            <span className="text-xs sm:text-sm font-semibold text-neutral-400 truncate">
              {job.company}
            </span>
          </div>

          {/* Shown ONLY after clicking Run Quick Matcher */}
          {hasRunMatcher && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#c8c2ac]/15 text-[#c8c2ac] border border-[#c8c2ac]/30 shrink-0">
              {job.similarity}% Match
            </span>
          )}
        </div>

        {/* Job Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#c8c2ac] transition-colors leading-snug break-words">
          {job.title}
        </h3>

        {/* Salary */}
        <p className="text-sm sm:text-base text-[#c8c2ac] font-medium font-mono">
          {job.salary || 'Competitive'}
        </p>

        {/* Location & Meta */}
        <p className="text-xs text-neutral-500 flex flex-wrap items-center gap-1.5">
          <span>{job.location}</span>
          {job.is_remote && (
            <>
              <span>•</span>
              <span className="text-neutral-400">Remote</span>
            </>
          )}
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-neutral-600" />
            {formatPostDate(job.posted_at)}
          </span>
        </p>
      </div>

      {/* Skills Section: Divider + Skills Matching (or Clean Required Skills if matcher hasn't run) */}
      <div className="space-y-3 pt-3.5 border-t border-[#1a1a1a]">
        {hasRunMatcher ? (
          <>
            {/* Matching Skills Header */}
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Check className="size-3.5" /> Matching Skills
              </span>
              <span className="text-xs text-neutral-500">{matchedSkills.length} matched</span>
            </div>

            {/* Matched Skill Badges */}
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.length > 0 ? (
                matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-md bg-[#141414] border border-[#242424] text-xs text-neutral-300 font-medium"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-neutral-500 italic">No exact skill overlap</span>
              )}
            </div>

            {/* Missing Skills */}
            {missingSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
                <span className="text-neutral-500">Missing:</span>
                {missingSkills.slice(0, 3).map((m) => (
                  <span key={m} className="text-amber-300/90 underline underline-offset-2 font-medium">
                    {m}
                  </span>
                ))}
                {missingSkills.length > 3 && (
                  <span className="text-neutral-500 text-[11px]">+{missingSkills.length - 3} more</span>
                )}
              </div>
            )}
          </>
        ) : (
          /* Before Matcher is run: Clean list of required skills without match badges or percentages */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Required Skills</span>
              <span>{job.required_skills.length} listed</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {job.required_skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-md bg-[#141414] border border-[#242424] text-xs text-neutral-400"
                >
                  {skill}
                </span>
              ))}
              {job.required_skills.length > 5 && (
                <span className="px-2 py-1 text-xs text-neutral-600">
                  +{job.required_skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Contract Type & Action Buttons */}
      <div className="pt-3.5 flex items-center justify-between border-t border-[#1a1a1a] gap-2.5 mt-auto">
        <div className="flex items-center gap-1.5">
          {job.contract_time && (
            <span className="text-[11px] uppercase font-semibold text-neutral-500 px-2 py-0.5 rounded bg-[#141414] border border-[#222222]">
              {job.contract_time === 'full_time' ? 'Full-time' : job.contract_time.replace('_', ' ')}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (onApply) onApply(job, e);
            }}
            className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>Apply</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectJob(job);
            }}
            className="text-neutral-400 text-xs font-bold group-hover:text-white flex items-center gap-1 cursor-pointer transition-colors px-3 py-2 hover:bg-[#1a1a1a] rounded-lg active:scale-95"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};


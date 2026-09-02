import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Building2, 
  MapPin, 
  Globe, 
  DollarSign, 
  Clock, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Layers,
  Cpu,
  Zap
} from 'lucide-react';
import { Job, UserProfile } from '../types';
import { formatPostDate } from '../utils/date';

interface JobDetailModalProps {
  job: Job | null;
  profile: UserProfile;
  onClose: () => void;
  onApply?: (job: Job) => void;
  hasRunMatcher?: boolean;
  onRunMatcher?: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  profile,
  onClose,
  onApply,
  hasRunMatcher = false,
  onRunMatcher
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const userSkillsLower = profile.skills.map(s => s.toLowerCase());
  const matchedSkills = job.required_skills.filter(s =>
    userSkillsLower.some(ps => ps.includes(s.toLowerCase()) || s.toLowerCase().includes(ps))
  );
  const missingSkills = job.required_skills.filter(s =>
    !userSkillsLower.some(ps => ps.includes(s.toLowerCase()) || s.toLowerCase().includes(ps))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in">
      {/* Background click overlay */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Pinned Sticky Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 sm:top-5 right-4 sm:right-5 z-40 p-2.5 rounded-xl text-neutral-400 hover:text-white bg-black/90 hover:bg-[#1a1a1a] border border-[#262626] backdrop-blur-md transition-colors cursor-pointer shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-100 pr-14 sm:pr-16">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black border border-[#2a2a2a] overflow-hidden flex items-center justify-center shrink-0">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-xl font-bold text-white">{job.company.charAt(0)}</span>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{job.company}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
                {job.is_remote && (
                  <span className="px-2 py-0.5 rounded-md bg-[#c8c2ac]/10 text-[#c8c2ac] border border-[#c8c2ac]/20 font-medium">
                    Remote
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-white border border-[#2a2a2a] font-mono font-medium">
                  <DollarSign className="w-3 h-3 text-[#c8c2ac]" />
                  {job.salary || 'Competitive'}
                </span>
                {job.contract_time && (
                  <span className="px-2 py-0.5 rounded-md bg-[#161616] text-slate-300 border border-[#262626] font-medium text-[11px] uppercase">
                    {job.contract_time === 'full_time' ? 'Full-time' : job.contract_time.replace('_', ' ')}
                  </span>
                )}
                {job.contract_type && (
                  <span className="px-2 py-0.5 rounded-md bg-[#161616] text-slate-300 border border-[#262626] font-medium text-[11px] uppercase">
                    {job.contract_type}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Posted {formatPostDate(job.posted_at)}
                </span>
              </div>
            </div>
          </div>

        {/* Vector Match Score Breakdown Card */}
        <div className="rounded-2xl bg-[#000000] border border-[#1f1f1f] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c8c2ac] fill-[#c8c2ac]" />
              <h4 className="text-sm font-bold text-white">JobScout Fit Analysis</h4>
            </div>
            {hasRunMatcher ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8c2ac]/15 text-[#c8c2ac] border border-[#c8c2ac]/30 font-mono font-bold text-sm">
                <span>{job.similarity}% Overall Match</span>
              </div>
            ) : onRunMatcher ? (
              <button
                onClick={() => onRunMatcher()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black hover:bg-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Zap className="w-3 h-3 fill-black text-black" />
                <span>Run Quick Matcher</span>
              </button>
            ) : null}
          </div>

          {hasRunMatcher ? (
            <>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Semantic Cosine Score</span>
                  <div className="text-lg font-mono font-bold text-white">
                    {job.vector_score}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Technical Skill Coverage</span>
                  <div className="text-lg font-mono font-bold text-[#c8c2ac]">
                    {job.keyword_score}%
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="space-y-1.5 pt-2 border-t border-[#1f1f1f]">
                <span className="text-xs font-semibold text-slate-300">Why this role matches you:</span>
                <ul className="space-y-1 text-xs text-slate-400">
                  {job.match_reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#c8c2ac] shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-center space-y-2">
              <p className="text-xs text-slate-400">
                Match percentages are uncalculated. Click &ldquo;Run Quick Matcher&rdquo; to analyze your fit.
              </p>
            </div>
          )}
        </div>

        {/* Skills Matched vs Missing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Matched */}
          <div className="p-4 rounded-xl bg-[#000000] border border-[#1f1f1f] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#c8c2ac]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched Requirements ({matchedSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {matchedSkills.length > 0 ? (
                matchedSkills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 rounded-lg bg-[#c8c2ac]/10 border border-[#c8c2ac]/30 text-[#c8c2ac] text-xs font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">None detected directly</span>
              )}
            </div>
          </div>

          {/* Missing / Upskill */}
          <div className="p-4 rounded-xl bg-[#000000] border border-[#1f1f1f] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Skill Gaps ({missingSkills.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {missingSkills.length > 0 ? (
                missingSkills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#c8c2ac]">100% Skill Coverage!</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white">About the Position</h4>
          <p className="text-xs text-slate-300 leading-relaxed bg-[#000000] p-4 rounded-xl border border-[#1f1f1f]">
            {job.description}
          </p>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#1f1f1f]">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Direct application on <strong className="text-white">{job.company}</strong>
          </div>

          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg bg-white text-black hover:bg-slate-200 active:scale-95 cursor-pointer"
          >
            <span>Apply on Company Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        </div>
      </div>
    </div>
  );
};

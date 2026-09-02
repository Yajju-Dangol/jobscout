import React from 'react';
import { Job, UserProfile, FilterState } from '../types';
import { QuickMatcherHero } from './QuickMatcherHero';
import { FilterBar } from './FilterBar';
import { JobCard } from './JobCard';
import { Sparkles, Inbox, RefreshCw } from 'lucide-react';

interface JobExplorerDashboardProps {
  jobs: Job[];
  filteredJobs: Job[];
  profile: UserProfile;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onSelectJob: (job: Job) => void;
  onApply: (job: Job, e: React.MouseEvent) => void;
  onRunMatcher: () => void;
  isMatching: boolean;
  onUploadClick: () => void;
  hasRunMatcher?: boolean;
  isLoading?: boolean;
  onFetchJobs?: () => void;
}

export const JobExplorerDashboard: React.FC<JobExplorerDashboardProps> = ({
  jobs,
  filteredJobs,
  profile,
  filters,
  onFilterChange,
  onResetFilters,
  onSelectJob,
  onApply,
  onRunMatcher,
  isMatching,
  onUploadClick,
  hasRunMatcher = false,
  isLoading = false,
  onFetchJobs
}) => {
  const topScore = jobs.length > 0 ? Math.max(...jobs.map((j) => j.similarity)) : 0;
  const avgScore = jobs.length > 0 ? Math.round(jobs.reduce((acc, j) => acc + j.similarity, 0) / jobs.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto py-2">
      {/* 1. Hero Quick Matcher Banner */}
      <QuickMatcherHero
        onRunMatcher={onRunMatcher}
        isMatching={isMatching}
        profile={profile}
        topMatchScore={topScore}
        avgMatchScore={avgScore}
        totalJobs={jobs.length}
        onUploadClick={onUploadClick}
        hasRunMatcher={hasRunMatcher}
      />

      {/* 2. Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalFiltered={filteredJobs.length}
        totalJobs={jobs.length}
      />

      {/* 3. Responsive Multi-Column Grid or Loading / Empty States */}
      {isLoading ? (
        /* Database Fetching Spinner */
        <div className="rounded-2xl bg-[#090909] border border-[#1f1f1f] p-16 sm:p-20 text-center space-y-4 shadow-xl">
          <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#c8c2ac]/10 blur-md animate-pulse" />
            <div className="w-12 h-12 rounded-full border-2 border-[#262626] border-t-[#c8c2ac] animate-spin" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Fetching job openings from database...
            </h3>
          </div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 items-stretch">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              profile={profile}
              onSelectJob={onSelectJob}
              onApply={onApply}
              hasRunMatcher={hasRunMatcher}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#000000] border border-[#1f1f1f] flex items-center justify-center text-slate-400 mx-auto">
            <Inbox className="w-7 h-7 text-[#c8c2ac]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {jobs.length === 0 ? "No job openings found in database" : "No job openings match your current filter criteria"}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {jobs.length === 0
                ? "The database doesn't have any jobs indexed yet. Click below to fetch and scrape curated roles."
                : "Try adjusting your search query, lowering the minimum similarity threshold, or toggling remote filters."}
            </p>
          </div>
          {jobs.length === 0 && onFetchJobs ? (
            <button
              onClick={onFetchJobs}
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-semibold shadow-md transition-all cursor-pointer font-bold inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Fetch Jobs from Feeds</span>
            </button>
          ) : (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-slate-200 text-xs font-semibold shadow-md transition-all cursor-pointer font-bold"
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

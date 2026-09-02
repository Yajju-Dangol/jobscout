import React, { useState } from 'react';
import { Sparkles, RefreshCw, Award, Flame, Cpu, CheckCircle, Zap } from 'lucide-react';
import { triggerConfetti } from '../lib/confetti';
import { UserProfile } from '../types';
import { JobScoutLogo } from './JobScoutLogo';

interface QuickMatcherHeroProps {
  onRunMatcher: () => void;
  isMatching: boolean;
  profile: UserProfile;
  topMatchScore: number;
  avgMatchScore: number;
  totalJobs: number;
  onUploadClick: () => void;
  hasRunMatcher?: boolean;
}

export const QuickMatcherHero: React.FC<QuickMatcherHeroProps> = ({
  onRunMatcher,
  isMatching,
  profile,
  topMatchScore,
  avgMatchScore,
  totalJobs,
  onUploadClick,
  hasRunMatcher = false
}) => {
  const [lastRunSuccess, setLastRunSuccess] = useState(false);

  const handleRun = () => {
    onRunMatcher();
    setTimeout(() => {
      setLastRunSuccess(true);
      triggerConfetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.35 },
        colors: ['#8b5cf6', '#6366f1', '#10b981', '#ffffff']
      });
      setTimeout(() => setLastRunSuccess(false), 4000);
    }, 900);
  };

  return (
    <section className="relative rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] p-6 sm:p-8 overflow-hidden shadow-2xl">
      {/* Subtle refined ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8c2ac]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#c8c2ac] text-xs font-semibold">
          <JobScoutLogo className="w-3.5 h-3.5 text-[#c8c2ac]" />
          <span>AI Vector Compatibility Engine</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
          Discover High-Compatibility Tech Roles
        </h1>

        {/* Skills alignment snippet */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-xs text-slate-500 font-medium">Profile Skills:</span>
          {profile.skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#000000] text-slate-300 border border-[#1f1f1f] uppercase"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 6 && (
            <span className="text-[10px] text-[#c8c2ac] font-bold">
              +{profile.skills.length - 6} more
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleRun}
            disabled={isMatching}
            className="group relative px-7 py-3 bg-white hover:bg-slate-200 rounded-xl font-bold text-xs sm:text-sm text-black overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
          >
            <span className="relative flex items-center gap-2">
              {isMatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Calculating Vector Similarities...</span>
                </>
              ) : (
                <>
                  <JobScoutLogo className="w-4 h-4 text-black" />
                  <span>Run Quick Matcher</span>
                </>
              )}
            </span>
          </button>
        </div>

        {lastRunSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-[#c8c2ac] font-medium animate-fade-in pt-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Scores recalculated across all active roles!</span>
          </div>
        )}
      </div>
    </section>
  );
};

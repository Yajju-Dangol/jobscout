import React from 'react';
import { Sparkles, Upload, Briefcase, User, BarChart2, Bell } from 'lucide-react';
import { ViewTab, UserProfile } from '../types';
import { JobScoutLogo } from './JobScoutLogo';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  profile: UserProfile;
  totalJobs: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  totalJobs
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Nav items */}
        <div className="flex items-center gap-6 sm:gap-8">
          <div 
            onClick={() => onSelectTab('jobs')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
              <JobScoutLogo className="w-7 h-7 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              JobScout
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => onSelectTab('jobs')}
              className={`flex items-center gap-1.5 transition-colors py-5 border-b-2 font-semibold text-sm ${
                currentTab === 'jobs'
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <span>Jobs</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {totalJobs}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('overview')}
              className={`transition-colors py-5 border-b-2 font-semibold text-sm ${
                currentTab === 'overview'
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Analytics
            </button>

            <button
              onClick={() => onSelectTab('profile')}
              className={`transition-colors py-5 border-b-2 font-semibold text-sm ${
                currentTab === 'profile'
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Upload Resume CTA */}
          <button
            onClick={() => onSelectTab('upload')}
            className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Resume</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* User Initial Avatar Pill */}
          <button
            onClick={() => onSelectTab('profile')}
            title="User Profile"
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            {profile.fullName.charAt(0) || 'U'}
          </button>
        </div>
      </div>
    </header>
  );
};


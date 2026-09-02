import React from 'react';
import { 
  Search, 
  UploadCloud, 
  Menu, 
  ChevronRight, 
  Command 
} from 'lucide-react';
import { ViewTab, UserProfile } from '../types';
import { JobScoutLogo } from './JobScoutLogo';

interface TopHeaderProps {
  currentTab: ViewTab;
  profile?: UserProfile;
  totalJobs?: number;
  onOpenCommand: () => void;
  onRunMatcher?: () => void;
  isMatching?: boolean;
  onNavigate: (tab: ViewTab) => void;
  onToggleMobileMenu: () => void;
  onSignOut?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenCommand,
  onNavigate,
  onToggleMobileMenu
}) => {
  const getBreadcrumbLabel = () => {
    switch (currentTab) {
      case 'jobs':
        return { section: 'Candidate Hub', current: 'Jobs' };
      case 'overview':
        return { section: 'Intelligence', current: 'Analytics' };
      case 'profile':
        return { section: 'Settings', current: 'Profile' };
      case 'upload':
        return { section: 'Onboarding', current: 'Upload Resume' };
    }
  };

  const breadcrumb = getBreadcrumbLabel();

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#000000]/90 backdrop-blur-md border-b border-[#1f1f1f] px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-slate-400 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <JobScoutLogo className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="text-slate-400 font-semibold hidden sm:inline">JobScout</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-700 hidden sm:inline shrink-0" />
          <span className="text-slate-400 font-medium hidden lg:inline truncate">{breadcrumb.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-700 hidden lg:inline shrink-0" />
          <span className="text-white font-bold tracking-tight truncate max-w-[120px] sm:max-w-none">{breadcrumb.current}</span>
        </div>
      </div>

      {/* Center: Search / Command Palette Trigger Bar */}
      <div className="flex-1 max-w-xl min-w-0 mx-1 sm:mx-4">
        <button
          onClick={onOpenCommand}
          className="w-full flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#333333] hover:bg-[#141414] text-slate-400 text-xs shadow-inner transition-all group cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 overflow-hidden">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
            <span className="text-slate-400 group-hover:text-slate-200 transition-colors whitespace-nowrap truncate text-xs text-left">
              Search jobs, skills, companies...
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-[#000000] border border-[#222222] px-1.5 py-0.5 rounded shrink-0 ml-2">
            <Command className="w-3 h-3 text-slate-400" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Upload Resume Action */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Upload Resume Shortcut */}
        <button
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-200 text-black rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Upload Resume</span>
          <span className="sm:hidden text-xs">Upload</span>
        </button>
      </div>
    </header>
  );
};


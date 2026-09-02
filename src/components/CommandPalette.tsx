import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  TrendingUp, 
  User, 
  UploadCloud, 
  Sparkles, 
  ExternalLink, 
  X, 
  ArrowRight,
  Zap,
  Layers,
  MapPin
} from 'lucide-react';
import { Job, ViewTab, UserProfile } from '../types';
import { JobScoutLogo } from './JobScoutLogo';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onNavigate: (tab: ViewTab) => void;
  onRunMatcher: () => void;
  hasRunMatcher?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  jobs,
  onSelectJob,
  onNavigate,
  onRunMatcher,
  hasRunMatcher = false
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Esc and Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredJobs = query.trim()
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(query.toLowerCase()) ||
          j.company.toLowerCase().includes(query.toLowerCase()) ||
          j.required_skills.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : jobs.slice(0, 4);

  const quickActions = [
    {
      label: 'Run AI Quick Matcher',
      sub: 'Re-rank all live listings',
      icon: (props: any) => <JobScoutLogo className="w-4 h-4 text-[#c8c2ac]" />,
      action: () => {
        onRunMatcher();
        onClose();
      }
    },
    {
      label: 'Go to Match Analytics',
      sub: 'View skill gaps & distribution',
      icon: TrendingUp,
      action: () => {
        onNavigate('overview');
        onClose();
      }
    },
    {
      label: 'Edit Career Profile & Skills',
      sub: 'Update target role and tech stack',
      icon: User,
      action: () => {
        onNavigate('profile');
        onClose();
      }
    },
    {
      label: 'Upload New Resume PDF',
      sub: 'Re-parse career accomplishments',
      icon: UploadCloud,
      action: () => {
        onNavigate('upload');
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-fade-in"
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in divide-y divide-[#1f1f1f]">
        {/* Search Header */}
        <div className="p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, job title, skill, or company..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Actions */}
          {!query && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block">
                Quick Commands
              </span>
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={action.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1a1a1a] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white group-hover:text-[#c8c2ac] transition-colors">
                          {action.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {action.sub}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Matched Jobs */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block">
              {query ? 'Matching Listings' : 'Top Compatible Roles'}
            </span>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => {
                    onSelectJob(job);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black border border-[#2a2a2a] flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-white">{job.company.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-[#c8c2ac] transition-colors truncate">
                          {job.title}
                        </span>
                        {hasRunMatcher && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#c8c2ac]/20 text-[#c8c2ac]">
                            {job.similarity}%
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {job.company} • {job.location} • {job.salary}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-white shrink-0">
                    View →
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching jobs found for &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#000000] flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono text-[10px]">ESC to close</span>
        </div>
      </div>
    </div>
  );
};

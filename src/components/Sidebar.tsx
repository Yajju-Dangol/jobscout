import React from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  User, 
  UploadCloud, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  LogOut
} from 'lucide-react';
import { ViewTab, UserProfile } from '../types';
import { JobScoutLogo } from './JobScoutLogo';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  profile: UserProfile;
  totalJobs: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
  onSignOut?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  totalJobs,
  collapsed,
  onToggleCollapse,
  onOpenSettings,
  onSignOut,
  mobileOpen,
  onCloseMobile
}) => {
  const navItems: {
    id: ViewTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { 
      id: 'jobs', 
      label: 'Jobs', 
      icon: Briefcase
    },
    { 
      id: 'overview', 
      label: 'Analytics', 
      icon: TrendingUp
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User 
    },
    { 
      id: 'upload', 
      label: 'Upload Resume', 
      icon: UploadCloud 
    }
  ];

  const handleTabClick = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between bg-[#0f0f0f] border-r border-[#1f1f1f] text-slate-300 transition-all duration-300 ease-in-out select-none
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Top Header / Brand Logo */}
        <div>
          <div className={`h-16 flex items-center border-b border-[#1f1f1f] px-4 relative ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div 
              onClick={() => handleTabClick('jobs')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Brand Icon */}
              <div className="w-8 h-8 flex items-center justify-center text-white group-hover:scale-105 transition-transform shrink-0">
                <JobScoutLogo className="w-7 h-7 text-white" />
              </div>
              
              {!collapsed && (
                <div className="flex items-center">
                  <span className="text-base font-bold text-white tracking-tight">
                    JobScout
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse / Expand Button */}
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className={`hidden md:flex items-center justify-center transition-colors cursor-pointer ${
                collapsed
                  ? 'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-slate-300 hover:text-white shadow-lg z-50'
                  : 'p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4 space-y-1">
            {!collapsed && (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Platform
              </div>
            )}

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group cursor-pointer
                      ${isActive 
                        ? 'bg-[#1a1a1a] text-white border border-[#2a2a2a] shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-[#141414]'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    {/* Active Accent Light Pill */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#c8c2ac] rounded-r-full shadow-[0_0_8px_rgba(200,194,172,0.6)]" />
                    )}

                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#c8c2ac]' : 'text-slate-400 group-hover:text-white'}`} />

                    {!collapsed && (
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                    )}

                    {!collapsed && item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.badgeColor || 'bg-[#1a1a1a] text-slate-300 border-[#2a2a2a]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Section: Preferences & Profile Card */}
        <div>
          {/* Preferences Section */}
          <div className="px-3 py-3 border-t border-[#1f1f1f]">
            {!collapsed && (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Preferences
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={onOpenSettings}
                title={collapsed ? 'Settings' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#141414] transition-all cursor-pointer ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                {!collapsed && <span className="flex-1 text-left">Settings & Alerts</span>}
              </button>

              {onSignOut && (
                <button
                  onClick={onSignOut}
                  title={collapsed ? 'Sign Out' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer ${
                    collapsed ? 'justify-center' : ''
                  }`}
                >
                  <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
                  {!collapsed && <span className="flex-1 text-left">Sign Out</span>}
                </button>
              )}
            </div>
          </div>

          {/* Profile Card */}
          <div className="p-3 border-t border-[#1f1f1f] bg-[#0a0a0a]">
            {/* User Profile Info Card */}
            <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#141414] transition-colors cursor-pointer group ${collapsed ? 'justify-center' : ''}`}>
              <button
                onClick={() => handleTabClick('profile')}
                className="relative w-8 h-8 rounded-full bg-[#c8c2ac] flex items-center justify-center text-black font-bold text-xs shrink-0 shadow-md border border-[#c8c2ac]/40"
              >
                {(profile.fullName || 'User').charAt(0).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#c8c2ac] border-2 border-[#0f0f0f]" />
              </button>

              {!collapsed && (
                <div 
                  onClick={() => handleTabClick('profile')}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-bold text-white truncate group-hover:text-[#c8c2ac] transition-colors">
                    {profile.fullName || 'Google Candidate'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {profile.currentTitle || profile.email || 'Profile'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
